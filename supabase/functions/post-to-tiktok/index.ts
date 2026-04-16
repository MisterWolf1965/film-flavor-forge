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

async function uploadAsJpeg(
  supabase: ReturnType<typeof createClient>,
  imageUrl: string
): Promise<string> {
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

  const isPng =
    imageBytes[0] === 0x89 &&
    imageBytes[1] === 0x50 &&
    imageBytes[2] === 0x4e &&
    imageBytes[3] === 0x47;

  if (isPng) {
    console.log("Image is PNG — converting to JPEG before TikTok upload...");
    const { Image } = await import("https://deno.land/x/imagescript@1.3.0/mod.ts");
    const img = await Image.decode(imageBytes);
    const jpegBytes = await img.encodeJPEG(85);
    imageBytes = new Uint8Array(jpegBytes);
    console.log("Converted PNG to JPEG, size:", imageBytes.length);
  }

  const fileName = `tt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage
    .from("instagram-images")
    .upload(fileName, imageBytes, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  return supabase.storage.from("instagram-images").getPublicUrl(fileName).data.publicUrl;
}

async function fetchCreatorInfo(accessToken: string) {
  const creatorRes = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({}),
    }
  );

  const creatorInfo = await creatorRes.json();
  if (creatorInfo.error?.code) {
    throw new Error(`Failed to query TikTok creator info: ${creatorInfo.error.message || creatorInfo.error.code}`);
  }

  return creatorInfo.data ?? {};
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const caption = body.caption;

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Upload all images as real JPEG to storage
    console.log(`Processing ${imageUrls.length} image(s) — converting to JPEG and uploading...`);
    const publicUrls = await Promise.all(
      imageUrls.map((url) => uploadAsJpeg(supabase, url))
    );
    console.log("Public JPEG URLs for TikTok:", publicUrls);

    // Get TikTok credentials
    const { data: creds, error: credError } = await supabase
      .from("tiktok_credentials")
      .select("access_token, tiktok_user_id, token_expires_at")
      .limit(1)
      .maybeSingle();

    if (credError) throw new Error(`Failed to fetch TikTok credentials: ${credError.message}`);
    if (!creds) throw new Error("TikTok not connected. Please add your TikTok credentials first.");
    if (creds.token_expires_at && new Date(creds.token_expires_at) < new Date()) {
      throw new Error("TikTok token expired. Please reconnect.");
    }

    const accessToken = creds.access_token;
    const creatorInfo = await fetchCreatorInfo(accessToken);

    const normalizedCaption = normalizeText(caption);
    const titleText = normalizedCaption.slice(0, TIKTOK_TITLE_MAX_LENGTH);
    const descriptionText = normalizedCaption.slice(0, TIKTOK_DESCRIPTION_MAX_LENGTH);
    const privacyOptions: string[] = Array.isArray(creatorInfo.privacy_level_options)
      ? creatorInfo.privacy_level_options
      : [];
    const preferredPrivacyOrder = [
      "SELF_ONLY",
      "FOLLOWER_OF_CREATOR",
      "MUTUAL_FOLLOW_FRIENDS",
      "PUBLIC_TO_EVERYONE",
    ];
    const privacyLevel = preferredPrivacyOrder.find((option) => privacyOptions.includes(option));

    if (!titleText) {
      throw new Error("TikTok post title is empty after cleanup.");
    }

    console.log(`Posting ${publicUrls.length} JPEG image(s) to TikTok...`);

    const postData = {
      post_info: {
        title: titleText,
        description: descriptionText,
        ...(privacyLevel
          ? {
              privacy_level: privacyLevel,
              disable_comment: Boolean(creatorInfo.comment_disabled),
              auto_add_music: true,
              brand_content_toggle: false,
              brand_organic_toggle: false,
            }
          : {}),
      },
      source_info: {
        source: "PULL_FROM_URL",
        photo_images: publicUrls,
        photo_cover_index: 0,
      },
      post_mode: privacyLevel ? "DIRECT_POST" : "MEDIA_UPLOAD",
      media_type: "PHOTO",
    };

    const res = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/content/init/",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(postData),
      }
    );

    const result = await res.json();
    console.log("TikTok API response:", JSON.stringify(result));

    if (result.error?.code) {
      console.error("TikTok API error details:", JSON.stringify(result));
      console.error("Request payload was:", JSON.stringify(postData));
      return new Response(
        JSON.stringify({ ok: false, error: `TikTok API error: ${result.error.message || result.error.code}`, details: result }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, success: true, publishId: result.data?.publish_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("post-to-tiktok error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
