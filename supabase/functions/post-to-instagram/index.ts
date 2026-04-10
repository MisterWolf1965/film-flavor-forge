import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function uploadToStorage(
  supabase: ReturnType<typeof createClient>,
  imageUrl: string
): Promise<string> {
  if (imageUrl.startsWith("data:")) {
    const base64Data = imageUrl.split(",")[1];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const fileName = `ig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
    const { error } = await supabase.storage
      .from("instagram-images")
      .upload(fileName, binaryData, { contentType: "image/png", upsert: true });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return supabase.storage.from("instagram-images").getPublicUrl(fileName).data.publicUrl;
  } else if (imageUrl.startsWith("http")) {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error("Failed to fetch image from URL");
    const imgBlob = await imgRes.arrayBuffer();
    const fileName = `ig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await supabase.storage
      .from("instagram-images")
      .upload(fileName, new Uint8Array(imgBlob), { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return supabase.storage.from("instagram-images").getPublicUrl(fileName).data.publicUrl;
  }
  throw new Error("Invalid image URL format");
}

async function waitForContainer(containerId: string, accessToken: string): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    const data = await res.json();
    console.log(`Container ${containerId} status:`, data.status_code);
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") throw new Error("Media processing failed on Instagram's side");
  }
  throw new Error("Media container not ready after 30s timeout");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const caption = body.caption;

    // Support both single image and carousel
    let imageUrls: string[] = [];
    if (body.imageUrls && Array.isArray(body.imageUrls)) {
      imageUrls = body.imageUrls;
    } else if (body.imageUrl) {
      imageUrls = [body.imageUrl];
    }

    if (imageUrls.length === 0 || !caption) {
      return new Response(
        JSON.stringify({ error: "imageUrl(s) and caption are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
    const igAccountId = Deno.env.get("INSTAGRAM_BUSINESS_ACCOUNT_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!accessToken || !igAccountId) {
      throw new Error("Instagram credentials not configured");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Upload all images to storage
    console.log(`Uploading ${imageUrls.length} image(s) to storage...`);
    const publicUrls = await Promise.all(
      imageUrls.map((url) => uploadToStorage(supabase, url))
    );
    console.log("Public URLs:", publicUrls);

    if (publicUrls.length === 1) {
      // Single image post
      console.log("Creating single image container...");
      const containerRes = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}/media`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: publicUrls[0],
            caption,
            media_type: "IMAGE",
            access_token: accessToken,
          }),
        }
      );
      const containerData = await containerRes.json();
      if (containerData.error) throw new Error(containerData.error.message);

      await waitForContainer(containerData.id, accessToken);

      const publishRes = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creation_id: containerData.id, access_token: accessToken }),
        }
      );
      const publishData = await publishRes.json();
      if (publishData.error) throw new Error(publishData.error.message);

      console.log("Published single image! Post ID:", publishData.id);
      return new Response(
        JSON.stringify({ success: true, postId: publishData.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Carousel post
    console.log("Creating carousel child containers...");
    const childIds: string[] = [];
    for (const url of publicUrls) {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}/media`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: url,
            is_carousel_item: true,
            access_token: accessToken,
          }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      childIds.push(data.id);
      console.log("Child container created:", data.id);
    }

    // Wait for all children
    for (const id of childIds) {
      await waitForContainer(id, accessToken);
    }

    // Create carousel container
    console.log("Creating carousel container...");
    const carouselRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "CAROUSEL",
          children: childIds.join(","),
          caption,
          access_token: accessToken,
        }),
      }
    );
    const carouselData = await carouselRes.json();
    if (carouselData.error) throw new Error(carouselData.error.message);
    console.log("Carousel container created:", carouselData.id);

    await waitForContainer(carouselData.id, accessToken);

    // Publish
    console.log("Publishing carousel...");
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: carouselData.id, access_token: accessToken }),
      }
    );
    const publishData = await publishRes.json();
    if (publishData.error) throw new Error(publishData.error.message);

    console.log("Published carousel! Post ID:", publishData.id);
    return new Response(
      JSON.stringify({ success: true, postId: publishData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("post-to-instagram error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
