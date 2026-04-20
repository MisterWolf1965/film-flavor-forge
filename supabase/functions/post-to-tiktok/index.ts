import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIKTOK_TITLE_MAX_LENGTH = 150;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isHostedPublicUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

async function ensureJpegPublicUrl(
  supabase: ReturnType<typeof createClient>,
  imageUrl: string
): Promise<string> {
  if (isHostedPublicUrl(imageUrl)) return imageUrl;

  if (!imageUrl.startsWith("data:")) {
    throw new Error("Invalid image URL format");
  }

  const base64Data = imageUrl.split(",")[1];
  let imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

  const isPng =
    imageBytes[0] === 0x89 &&
    imageBytes[1] === 0x50 &&
    imageBytes[2] === 0x4e &&
    imageBytes[3] === 0x47;
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

async function fetchCreatorInfo(accessToken: string) {
  try {
    const creatorRes = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({}),
      }
    );
    if (!creatorRes.ok) return null;
    return await creatorRes.json();
  } catch (e) {
    console.error("TikTok Creator Info Check Failed:", e);
    return null;
  }
}

/**
 * Safe upstream reader — never blindly calls res.json().
 * Returns parsed JSON if possible, otherwise a structured non-JSON marker
 * with diagnostics so we can surface the REAL TikTok error to the client.
 */
async function readUpstream(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  const rawText = await res.text();

  if (contentType.includes("application/json")) {
    try {
      return { kind: "json" as const, status: res.status, contentType, body: JSON.parse(rawText) };
    } catch {
      return {
        kind: "non-json" as const,
        status: res.status,
        contentType,
        preview: rawText.slice(0, 500),
      };
    }
  }

  return {
    kind: "non-json" as const,
    status: res.status,
    contentType,
    preview: rawText.slice(0, 500),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let endpoint = "";
  let postMode = "";
  let hostedUrlsOnly = false;

  try {
    const body = await req.json();
    const caption = body.caption || "Micro short film moment";
    const imageUrls: string[] = Array.isArray(body.imageUrls)
      ? body.imageUrls
      : body.imageUrl
      ? [body.imageUrl]
      : [];

    if (imageUrls.length === 0) throw new Error("No images provided");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Resolve image URLs (skip re-upload for hosted)
    const publicUrls = await Promise.all(
      imageUrls.map((url) => ensureJpegPublicUrl(supabase, url))
    );
    hostedUrlsOnly = imageUrls.every(isHostedPublicUrl);

    // 2. Token
    const { data: creds } = await supabase
      .from("tiktok_credentials")
      .select("*")
      .maybeSingle();
    if (!creds) throw new Error("TikTok credentials missing.");

    // 3. Privacy / mode
    const audited = (Deno.env.get("TIKTOK_APP_AUDITED") || "").toLowerCase() === "true";
    let privacyLevel = "SELF_ONLY";
    if (audited) {
      const creatorResult = await fetchCreatorInfo(creds.access_token);
      const options = creatorResult?.data?.privacy_level_options as string[] | undefined;
      if (options?.includes("PUBLIC_TO_EVERYONE")) {
        privacyLevel = "PUBLIC_TO_EVERYONE";
      }
    }

    // 4. Build payload — strict shape per TikTok docs / project memory
    // - inbox/photo/init for sandbox (MEDIA_UPLOAD)
    // - content/init for audited apps (DIRECT_POST)
    // Only include fields confirmed supported. No `description`, no `media_type`,
    // no `post_mode` field inside body (route already implies the mode).
    const normalizedCaption = normalizeText(caption);
    const title =
      normalizedCaption.slice(0, TIKTOK_TITLE_MAX_LENGTH) || "New Post";

    const useDirectPost = audited;
    postMode = useDirectPost ? "DIRECT_POST" : "MEDIA_UPLOAD";

    const postData: Record<string, unknown> = {
      media_type: "PHOTO",
      post_mode: postMode,
      source_info: {
        source: "PULL_FROM_URL",
        photo_images: publicUrls,
        photo_cover_index: 0,
      },
      post_info: {
        title,
        privacy_level: privacyLevel,
        disable_comment: false,
      },
    };

    endpoint = "https://open.tiktokapis.com/v2/post/publish/content/init/";

    console.log(
      `Submitting via ${postMode} (audited=${audited}, hostedUrlsOnly=${hostedUrlsOnly}) to ${endpoint}`
    );
    console.log("Payload:", JSON.stringify(postData));

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(postData),
    });

    const upstream = await readUpstream(res);

    if (upstream.kind === "non-json") {
      console.error("TikTok non-JSON upstream:", upstream);
      return new Response(
        JSON.stringify({
          ok: false,
          error: `TikTok upstream returned non-JSON response (HTTP ${upstream.status})`,
          diagnostics: {
            status: upstream.status,
            contentType: upstream.contentType,
            endpoint,
            postMode,
            hostedUrlsOnly,
            imageCount: publicUrls.length,
            responsePreview: upstream.preview,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = upstream.body as { error?: { code?: string; message?: string }; data?: { publish_id?: string } };

    if (result.error?.code && result.error.code !== "ok") {
      const hint = !audited
        ? " (Hint: TikTok app is in sandbox mode — posts will be drafts/private. Get your app audited and set TIKTOK_APP_AUDITED=true to publish publicly.)"
        : "";
      return new Response(
        JSON.stringify({
          ok: false,
          error: `TikTok API Error: ${result.error.message}${hint}`,
          diagnostics: {
            status: upstream.status,
            errorCode: result.error.code,
            endpoint,
            postMode,
            hostedUrlsOnly,
            imageCount: publicUrls.length,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, publishId: result.data?.publish_id, postMode }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Final Error:", message);
    return new Response(
      JSON.stringify({
        ok: false,
        error: message,
        diagnostics: { endpoint, postMode, hostedUrlsOnly },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
