import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIKTOK_TITLE_MAX_LENGTH = 150;
// 10 MB chunks — TikTok requires single chunk OR chunks of >= 5 MB
const CHUNK_SIZE = 10 * 1024 * 1024;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

async function fetchMediaBytes(
  mediaUrl: string
): Promise<{ bytes: Uint8Array; contentType: string; kind: "video" | "image" }> {
  const res = await fetch(mediaUrl);
  if (!res.ok) throw new Error(`Failed to fetch media (HTTP ${res.status})`);
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (contentType.startsWith("video/")) return { bytes, contentType, kind: "video" };
  if (contentType.startsWith("image/")) return { bytes, contentType, kind: "image" };
  // Fallback: sniff from extension
  const lower = mediaUrl.toLowerCase().split("?")[0];
  if (/\.(mp4|mov|webm|m4v)$/.test(lower)) return { bytes, contentType: "video/mp4", kind: "video" };
  if (/\.(jpg|jpeg|png|webp|gif)$/.test(lower)) {
    const guessed = lower.endsWith(".png") ? "image/png" : "image/jpeg";
    return { bytes, contentType: guessed, kind: "image" };
  }
  throw new Error(`Source URL is not a video or image (${contentType})`);
}

async function uploadVideoChunks(uploadUrl: string, bytes: Uint8Array, contentType: string) {
  const total = bytes.byteLength;
  // Single chunk if small enough
  if (total <= CHUNK_SIZE) {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(total),
        "Content-Range": `bytes 0-${total - 1}/${total}`,
      },
      body: bytes,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Video upload failed (HTTP ${res.status}): ${text.slice(0, 300)}`);
    }
    return;
  }
  // Multi-chunk
  let start = 0;
  while (start < total) {
    const end = Math.min(start + CHUNK_SIZE, total);
    const chunk = bytes.slice(start, end);
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(chunk.byteLength),
        "Content-Range": `bytes ${start}-${end - 1}/${total}`,
      },
      body: chunk,
    });
    if (!res.ok && res.status !== 206) {
      const text = await res.text().catch(() => "");
      throw new Error(`Video chunk ${start}-${end} failed (HTTP ${res.status}): ${text.slice(0, 200)}`);
    }
    start = end;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const videoUrl: string | undefined = body.videoUrl;
    const caption: string = body.caption || "Test video from CINE.MACHINE";

    if (!videoUrl) throw new Error("videoUrl is required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: creds } = await supabase
      .from("tiktok_credentials")
      .select("*")
      .maybeSingle();
    if (!creds) throw new Error("TikTok credentials missing.");

    const audited = (Deno.env.get("TIKTOK_APP_AUDITED") || "").toLowerCase() === "true";
    const useDirectPost = audited;
    const postMode = useDirectPost ? "DIRECT_POST" : "MEDIA_UPLOAD";
    const title = normalizeText(caption).slice(0, TIKTOK_TITLE_MAX_LENGTH) || "New Video";

    // 1. Fetch the video bytes
    console.log("Fetching video:", videoUrl);
    const { bytes, contentType } = await fetchVideoBytes(videoUrl);
    const totalBytes = bytes.byteLength;
    const chunkSize = totalBytes <= CHUNK_SIZE ? totalBytes : CHUNK_SIZE;
    const totalChunkCount = Math.ceil(totalBytes / chunkSize);
    console.log(`Video: ${totalBytes} bytes, ${totalChunkCount} chunk(s)`);

    // 2. Init upload
    const initPayload: Record<string, unknown> = {
      post_mode: postMode,
      media_type: "VIDEO",
      source_info: {
        source: "FILE_UPLOAD",
        video_size: totalBytes,
        chunk_size: chunkSize,
        total_chunk_count: totalChunkCount,
      },
    };
    if (useDirectPost) {
      initPayload.post_info = {
        title,
        privacy_level: "SELF_ONLY",
        disable_comment: false,
        disable_duet: false,
        disable_stitch: false,
      };
    }

    console.log("Init payload:", JSON.stringify(initPayload));
    const initRes = await fetch("https://open.tiktokapis.com/v2/post/publish/inbox/video/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(initPayload),
    });
    const initJson = await initRes.json();
    if (initJson.error?.code && initJson.error.code !== "ok") {
      throw new Error(`TikTok init error: ${initJson.error.message}`);
    }
    const uploadUrl: string | undefined = initJson.data?.upload_url;
    const publishId: string | undefined = initJson.data?.publish_id;
    if (!uploadUrl) throw new Error("TikTok did not return an upload_url");

    // 3. Upload bytes
    await uploadVideoChunks(uploadUrl, bytes, contentType);

    const sandboxNote = !audited
      ? " (Sandbox mode — appears as a private draft in your TikTok inbox.)"
      : "";
    console.log(`TikTok video uploaded, publishId=${publishId}`);

    return new Response(
      JSON.stringify({
        ok: true,
        publishId,
        postMode,
        message: `Video sent to TikTok.${sandboxNote}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("post-video-to-tiktok error:", message);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});