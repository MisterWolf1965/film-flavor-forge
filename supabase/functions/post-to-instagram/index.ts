import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, caption } = await req.json();

    if (!imageUrl || !caption) {
      return new Response(
        JSON.stringify({ error: "imageUrl and caption are required" }),
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

    // Step 0: Upload image to storage to get a publicly accessible URL
    let publicImageUrl = imageUrl;

    if (imageUrl.startsWith("data:")) {
      // Base64 data URL — decode and upload
      console.log("Uploading base64 image to storage...");
      const base64Data = imageUrl.split(",")[1];
      const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const fileName = `ig-${Date.now()}.png`;

      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error: uploadError } = await supabase.storage
        .from("instagram-images")
        .upload(fileName, binaryData, { contentType: "image/png", upsert: true });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from("instagram-images")
        .getPublicUrl(fileName);
      publicImageUrl = urlData.publicUrl;
      console.log("Uploaded to:", publicImageUrl);
    } else if (!imageUrl.startsWith("http")) {
      throw new Error("Invalid image URL format");
    } else {
      // External URL — fetch and re-upload to ensure it's directly accessible
      console.log("Fetching external image and re-uploading...");
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error("Failed to fetch image from URL");
      const imgBlob = await imgRes.arrayBuffer();
      const fileName = `ig-${Date.now()}.jpg`;

      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error: uploadError } = await supabase.storage
        .from("instagram-images")
        .upload(fileName, new Uint8Array(imgBlob), { contentType: "image/jpeg", upsert: true });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: urlData } = supabase.storage
        .from("instagram-images")
        .getPublicUrl(fileName);
      publicImageUrl = urlData.publicUrl;
      console.log("Re-uploaded to:", publicImageUrl);
    }

    // Step 1: Create media container
    console.log("Creating Instagram media container...");
    const containerRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: publicImageUrl,
          caption,
          media_type: "IMAGE",
          access_token: accessToken,
        }),
      }
    );

    const containerData = await containerRes.json();
    if (containerData.error) {
      console.error("Container creation error:", JSON.stringify(containerData.error));
      throw new Error(containerData.error.message || "Failed to create media container");
    }

    const creationId = containerData.id;
    console.log("Media container created:", creationId);

    // Step 2: Wait for container to be ready
    let ready = false;
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const statusRes = await fetch(
        `https://graph.facebook.com/v19.0/${creationId}?fields=status_code&access_token=${accessToken}`
      );
      const statusData = await statusRes.json();
      console.log("Container status:", statusData.status_code);
      if (statusData.status_code === "FINISHED") {
        ready = true;
        break;
      }
      if (statusData.status_code === "ERROR") {
        throw new Error("Media processing failed on Instagram's side");
      }
    }

    if (!ready) {
      throw new Error("Media container not ready after 30s timeout");
    }

    // Step 3: Publish
    console.log("Publishing to Instagram...");
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishRes.json();
    if (publishData.error) {
      console.error("Publish error:", JSON.stringify(publishData.error));
      throw new Error(publishData.error.message || "Failed to publish");
    }

    console.log("Published successfully! Post ID:", publishData.id);

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
