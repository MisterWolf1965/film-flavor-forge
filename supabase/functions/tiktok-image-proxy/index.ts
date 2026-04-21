import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_HOSTS = new Set([
  "picsum.photos",
  "hbnpvglyoteuxrvliyxt.supabase.co",
]);

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildImageHeaders(upstream: Response, contentType: string) {
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return headers;
}

function parseSourceUrl(req: Request): URL {
  const requestUrl = new URL(req.url);
  const src = requestUrl.searchParams.get("src");

  if (!src) throw new Error("Missing src parameter");

  const sourceUrl = new URL(src);
  if (!sourceUrl.protocol.startsWith("http")) {
    throw new Error("Only HTTP(S) image URLs are allowed");
  }

  if (!ALLOWED_HOSTS.has(sourceUrl.hostname)) {
    throw new Error(`Image host is not allowed: ${sourceUrl.hostname}`);
  }

  return sourceUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "GET" && req.method !== "HEAD") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const sourceUrl = parseSourceUrl(req);
    const upstream = await fetch(sourceUrl.toString(), {
      headers: { "User-Agent": "CINE.MACHINE TikTok image proxy" },
    });

    if (!upstream.ok || !upstream.body) {
      return jsonResponse(
        { error: `Failed to fetch image source (HTTP ${upstream.status})` },
        502
      );
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return jsonResponse({ error: "Source URL did not return an image" }, 400);
    }

    const headers = buildImageHeaders(upstream, contentType);

    return new Response(req.method === "HEAD" ? null : upstream.body, {
      status: 200,
      headers,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse({ error: message }, 400);
  }
});
