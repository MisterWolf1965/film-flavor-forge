import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function readUpstream(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  const rawText = await res.text();

  if (!contentType.includes("application/json")) {
    return { kind: "non-json" as const, status: res.status, contentType, preview: rawText.slice(0, 500) };
  }

  try {
    return { kind: "json" as const, status: res.status, contentType, body: JSON.parse(rawText) };
  } catch {
    return { kind: "non-json" as const, status: res.status, contentType, preview: rawText.slice(0, 500) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json();
    const publishId = typeof body.publishId === "string" ? body.publishId.trim() : "";

    if (!publishId) {
      return jsonResponse({ ok: false, error: "publishId is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: creds } = await supabase
      .from("tiktok_credentials")
      .select("access_token")
      .maybeSingle();

    if (!creds?.access_token) {
      return jsonResponse({ ok: false, error: "TikTok credentials missing." }, 200);
    }

    const endpoint = "https://open.tiktokapis.com/v2/post/publish/status/fetch/";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.access_token}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ publish_id: publishId }),
    });

    const upstream = await readUpstream(res);

    if (upstream.kind === "non-json") {
      return jsonResponse({
        ok: false,
        publishId,
        error: `TikTok status returned non-JSON response (HTTP ${upstream.status})`,
        diagnostics: upstream,
      });
    }

    const result = upstream.body as {
      error?: { code?: string; message?: string };
      data?: { status?: string; publish_status?: string; fail_reason?: string };
    };

    if (result.error?.code && result.error.code !== "ok") {
      return jsonResponse({
        ok: false,
        publishId,
        error: `TikTok Status Error: ${result.error.message || result.error.code}`,
        raw: result,
      });
    }

    return jsonResponse({
      ok: true,
      publishId,
      status: result.data?.status || result.data?.publish_status || "unknown",
      raw: result,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse({ ok: false, error: message }, 200);
  }
});