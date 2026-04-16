import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIKTOK_TITLE_MAX_LENGTH = 90;
const TIKTOK_DESCRIPTION_MAX_LENGTH = 4000;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

async function uploadAsJpeg(supabase: ReturnType<typeof createClient>, imageUrl: string): Promise<string> {
  let imageBytes: Uint8Array;

  if (imageUrl.startsWith("data:")) {
    const base64Data = imageUrl.split(",")[1];
    imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
  } else if (imageUrl.startsWith("http")) {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error("Failed to fetch image from URL");
    imageBytes = new Uint8Array(await imgRes.arrayBuffer());
  } else {
    throw new Error("Invalid image URL format");
  }

  // PNG Check and conversion
  const isPng = imageBytes[0] === 0x89 && imageBytes[1] === 0x50 && imageBytes[2] === 0x4e && imageBytes[3] === 0x47;

  if (isPng) {
    console.log("Image is PNG — converting to JPEG before TikTok upload...");
    const { Image } = await import("https://deno.land/x/imagescript@1.3.0/mod.ts");
    const img = await Image.decode(imageBytes);
    const jpegBytes = await img.encodeJPEG(85);
    imageBytes = new Uint8Array(jpegBytes);
  }

  const fileName = `tt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage
    .from("instagram-images")
    .upload(fileName, imageBytes, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  return supabase.storage.from("instagram-images").getPublicUrl(fileName).data.publicUrl;
}

async function fetchCreatorInfo(accessToken: string) {
  const creatorRes = await fetch("https://open.tiktokapis.com/v2/post/publish/creator_info/query/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({}),
  });

  const creatorInfo = await creatorRes.json();
  // We don't throw here, we just return the error object so the main function can handle it
  return creatorInfo;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const caption = body.caption || "New Post";

    let imageUrls: string[] = [];
    if (body.imageUrls && Array.isArray(body.imageUrls)) {
      imageUrls = body.imageUrls;
    } else if (body.imageUrl) {
      imageUrls = [body.imageUrl];
    }

    if (imageUrls.length === 0) {
      throw new Error("No images provided");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Convert and Upload to Storage
    const publicUrls = await Promise.all(imageUrls.map((url) => uploadAsJpeg(supabase, url)));

    // 2. Get TikTok Credentials
    const { data: creds, error: credError } = await supabase
      .from("tiktok_credentials")
      .select("access_token, tiktok_user_id, token_expires_at")
      .limit(1)
      .maybeSingle();

    if (credError || !creds) throw new Error("TikTok not connected or credentials missing.");

    const accessToken = creds.access_token;

    // 3. Fetch Creator Info safely
    let creatorData = null;
    let canDirectPost = false;
    let privacyLevel = "SELF_ONLY"; // Default for sandbox/dev mode

    const creatorResult = await fetchCreatorInfo(accessToken);
    if (creatorResult?.data) {
      creatorData = creatorResult.data;
      canDirectPost = true; // If we got data, we likely have the right scopes

      const privacyOptions = creatorData.privacy_level_options || [];
      if (privacyOptions.includes("PUBLIC_TO_EVERYONE")) privacyLevel = "PUBLIC_TO_EVERYONE";
      else if (privacyOptions.length > 0) privacyLevel = privacyOptions[0];
    }

    // 4. Prepare Payload for PHOTO mode
    const normalizedCaption = normalizeText(caption);
    const titleText = normalizedCaption.slice(0, TIKTOK_TITLE_MAX_LENGTH) || "Upload";
    const descriptionText = normalizedCaption.slice(0, TIKTOK_DESCRIPTION_MAX_LENGTH);

    const postData = {
      post_info: {
        title: titleText,
        description: descriptionText,
        privacy_level: privacyLevel,
      },
      source_info: {
        source: "PULL_FROM_URL",
        photo_images: publicUrls,
        photo_cover_index: 0,
      },
      // If creator info failed, we MUST use MEDIA_UPLOAD (Inbox method)
      post_mode: canDirectPost ? "DIRECT_POST" : "MEDIA_UPLOAD",
      media_type: "PHOTO",
    };

    console.log("Sending to TikTok with mode:", postData.post_mode);

    // 5. Submit to TikTok
    const res = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(postData),
    });

    const result = await res.json();

    if (result.error?.code) {
      return new Response(JSON.stringify({ ok: false, error: `TikTok API Error: ${result.error.message}` }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, publishId: result.data?.publish_id, mode: postData.post_mode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("TikTok Edge Function Error:", e);
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
