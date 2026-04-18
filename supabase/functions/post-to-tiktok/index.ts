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

  const isPng = imageBytes[0] === 0x89 && imageBytes[1] === 0x50 && imageBytes[2] === 0x4e && imageBytes[3] === 0x47;

  if (isPng) {
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

/**
 * UPDATED: Added rigorous error handling for TikTok's creator info endpoint
 */
async function fetchCreatorInfo(accessToken: string) {
  try {
    const creatorRes = await fetch("https://open.tiktokapis.com/v2/post/publish/creator_info/query/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({}),
    });

    if (!creatorRes.ok) return null;
    const data = await creatorRes.json();
    return data;
  } catch (e) {
    console.error("TikTok Creator Info Check Failed:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const caption = body.caption || "Micro short film moment";
    let imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls : body.imageUrl ? [body.imageUrl] : [];

    if (imageUrls.length === 0) throw new Error("No images provided");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 1. Image Processing
    const publicUrls = await Promise.all(imageUrls.map((url) => uploadAsJpeg(supabase, url)));

    // 2. Fetch Token
    const { data: creds } = await supabase.from("tiktok_credentials").select("*").maybeSingle();
    if (!creds) throw new Error("TikTok credentials missing.");

    // 3. Privacy / Mode
    // Unaudited / sandbox apps MUST use SELF_ONLY privacy.
    // Once your app is audited by TikTok, set TIKTOK_APP_AUDITED=true to enable PUBLIC_TO_EVERYONE.
    const audited = (Deno.env.get("TIKTOK_APP_AUDITED") || "").toLowerCase() === "true";

    let privacyLevel = "SELF_ONLY";
    if (audited) {
      const creatorResult = await fetchCreatorInfo(creds.access_token);
      const options = creatorResult?.data?.privacy_level_options as string[] | undefined;
      if (options?.includes("PUBLIC_TO_EVERYONE")) {
        privacyLevel = "PUBLIC_TO_EVERYONE";
      }
    }

    // 4. Construct Payload
    // Unaudited apps MUST use MEDIA_UPLOAD (inbox draft) — DIRECT_POST is rejected
    // with "integration guidelines" error even when privacy_level=SELF_ONLY.
    // Audited apps can use DIRECT_POST + PUBLIC_TO_EVERYONE.
    const normalizedCaption = normalizeText(caption);
    const useDirectPost = audited;

    const postData: Record<string, unknown> = {
      source_info: {
        source: "PULL_FROM_URL",
        photo_images: publicUrls,
        photo_cover_index: 0,
      },
      media_type: "PHOTO",
      post_mode: useDirectPost ? "DIRECT_POST" : "MEDIA_UPLOAD",
    };

    if (useDirectPost) {
      postData.post_info = {
        title: normalizedCaption.slice(0, TIKTOK_TITLE_MAX_LENGTH) || "New Post",
        description: normalizedCaption.slice(0, TIKTOK_DESCRIPTION_MAX_LENGTH),
        privacy_level: privacyLevel,
      };
    }

    const endpoint = useDirectPost
      ? "https://open.tiktokapis.com/v2/post/publish/content/init/"
      : "https://open.tiktokapis.com/v2/post/publish/inbox/photo/init/";

    console.log(`Submitting via ${postData.post_mode} (audited=${audited}) to ${endpoint}`);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(postData),
    });

    const result = await res.json();

    if (result.error?.code && result.error.code !== "ok") {
      const hint = !audited
        ? " (Hint: TikTok app is in sandbox mode — posts will be drafts/private. Get your app audited and set TIKTOK_APP_AUDITED=true to publish publicly.)"
        : "";
      throw new Error(`TikTok API Error: ${result.error.message}${hint}`);
    }

    return new Response(JSON.stringify({ ok: true, publishId: result.data?.publish_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Final Error:", e.message);
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
