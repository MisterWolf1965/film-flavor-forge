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

async function fetchImageBytes(imageUrl: string): Promise<{ bytes: Uint8Array; contentType: string; source: string }> {
  if (isHostedPublicUrl(imageUrl)) {
    const sourceUrl = new URL(imageUrl);
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "CINE.MACHINE TikTok JPEG normalizer" },
    });
    if (!res.ok) throw new Error(`Failed to fetch image source (HTTP ${res.status})`);

    const contentType = res.headers.get("content-type") || "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      throw new Error(`Source URL did not return an image (${contentType})`);
    }

    return {
      bytes: new Uint8Array(await res.arrayBuffer()),
      contentType,
      source: `${sourceUrl.hostname}${sourceUrl.pathname}`,
    };
  }

  if (!imageUrl.startsWith("data:")) {
    throw new Error("Invalid image URL format");
  }

  const [metadata, base64Data] = imageUrl.split(",");
  const contentType = metadata.match(/^data:([^;]+)/)?.[1] || "image/png";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Data URL did not contain an image (${contentType})`);
  }

  return {
    bytes: Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0)),
    contentType,
    source: "data-url-image",
  };
}

async function normalizeImageToJpegPublicUrl(
  supabase: ReturnType<typeof createClient<any, "public", any>>,
  imageUrl: string
): Promise<{ publicUrl: string; bytes: Uint8Array }> {
  const { Image } = await import("https://deno.land/x/imagescript@1.3.0/mod.ts");
  const source = await fetchImageBytes(imageUrl);
  const img = await Image.decode(source.bytes);
  const jpegBytes = new Uint8Array(await img.encodeJPEG(90));

  const fileName = `tt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage
    .from("instagram-images")
    .upload(fileName, jpegBytes, { contentType: "image/jpeg", upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const publicUrl = supabase.storage.from("instagram-images").getPublicUrl(fileName).data.publicUrl;
  console.log(
    `TikTok normalized image: source=${source.source}, type=${source.contentType}, size=${jpegBytes.byteLength}, jpeg=${publicUrl}`
  );
  return { publicUrl, bytes: jpegBytes };
}

/**
 * Upload normalized JPEG bytes to a TikTok-issued upload_url using a single
 * PUT. TikTok requires the exact byte count and Content-Range header.
 */
async function uploadJpegToTikTok(uploadUrl: string, bytes: Uint8Array) {
  const total = bytes.byteLength;
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(total),
      "Content-Range": `bytes 0-${total - 1}/${total}`,
    },
    body: bytes,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`TikTok JPEG upload failed (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }
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

    // 1. Normalize every image to a fresh TikTok-safe JPEG hosted in our
    // public storage bucket, then wrap each one through the TikTok-verified
    // domain's image proxy so the URL we send to TikTok lives on a domain
    // whose ownership it has verified.
    const normalized = await Promise.all(
      imageUrls.map((url) => normalizeImageToJpegPublicUrl(supabase, url))
    );
    const photoImages = normalized.map((n) => buildVerifiedProxyUrl(n.publicUrl));
    hostedUrlsOnly = imageUrls.every(isHostedPublicUrl);

    // Preflight: confirm the verified-domain proxy actually serves image bytes.
    // If the published host intercepts the proxy path and returns the SPA HTML
    // shell, TikTok's media validation will reject the post — fail fast with a
    // clear, actionable error here instead of pretending we sent a draft.
    try {
      await assertProxyServesImage(photoImages[0]);
    } catch (proxyErr) {
      const message = proxyErr instanceof Error ? proxyErr.message : String(proxyErr);
      console.error("TikTok proxy preflight failed:", message);
      return new Response(
        JSON.stringify({
          ok: false,
          error: message,
          diagnostics: {
            stage: "verified_proxy_preflight",
            verifiedDomain: TIKTOK_VERIFIED_DOMAIN,
            sampleProxyUrl: photoImages[0],
            imageCount: photoImages.length,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // 4. Build payload using PULL_FROM_URL — the only TikTok-supported source
    // for PHOTO posts. The photo_images URLs must live on a verified domain
    // and must respond with raw image bytes (preflighted above).
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
        photo_cover_index: 0,
        photo_images: photoImages,
      },
    };

    if (useDirectPost) {
      postData.post_info = {
        title,
        privacy_level: privacyLevel,
        disable_comment: false,
      };
    }

    endpoint = "https://open.tiktokapis.com/v2/post/publish/content/init/";

    console.log(
      `Submitting via ${postMode} PULL_FROM_URL (audited=${audited}, imageCount=${photoImages.length}) to ${endpoint}`
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
            imageCount: photoImages.length,
            responsePreview: upstream.preview,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = upstream.body as {
      error?: { code?: string; message?: string };
      data?: { publish_id?: string };
    };

    if (result.error?.code && result.error.code !== "ok") {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `TikTok API Error: ${result.error.message}`,
          diagnostics: {
            status: upstream.status,
            errorCode: result.error.code,
            endpoint,
            postMode,
            hostedUrlsOnly,
            imageCount: photoImages.length,
            sandbox: !audited,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sandboxNote = !audited
      ? " (Sandbox mode — visible only as a private draft until the app is audited.)"
      : "";
    const successMessage = useDirectPost
      ? `Submitted to TikTok for publishing.${sandboxNote}`
      : `Sent to TikTok as a draft. Open TikTok on the connected account to finish posting.${sandboxNote}`;

    console.log(`TikTok accepted publishId=${result.data?.publish_id || "none"}, postMode=${postMode}`);

    return new Response(
      JSON.stringify({
        ok: true,
        publishId: result.data?.publish_id,
        postMode,
        audited,
        message: successMessage,
      }),
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
