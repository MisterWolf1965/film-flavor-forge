import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RequestSchema = z.object({
  code: z.string().min(1, "Missing TikTok authorization code"),
  redirectUri: z.string().url("A valid redirect URI is required"),
});

type ApiResponse = {
  ok: boolean;
  error?: string;
  displayName?: string;
  tiktokUserId?: string;
  expiresAt?: string;
  diagnostics?: Record<string, unknown>;
};

function respond(payload: ApiResponse) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respond({ ok: false, error: "Method not allowed" });
  }

  try {
    const parsed = RequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return respond({
        ok: false,
        error: parsed.error.issues[0]?.message || "Invalid request",
        diagnostics: { stage: "validate_request" },
      });
    }

    const { code, redirectUri } = parsed.data;
    const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
    const clientSecret = Deno.env.get("TIKTOK_CLIENT_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!clientKey || !clientSecret || !supabaseUrl || !serviceRoleKey) {
      return respond({
        ok: false,
        error: "TikTok backend is not configured correctly",
        diagnostics: { stage: "missing_env" },
      });
    }

    const tokenBody = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: tokenBody.toString(),
    });

    const tokenData = await tokenRes.json().catch(() => null);

    if (!tokenRes.ok || tokenData?.error) {
      return respond({
        ok: false,
        error: tokenData?.error_description || tokenData?.message || tokenData?.error || "Failed to exchange TikTok code",
        diagnostics: {
          stage: "exchange_code",
          status: tokenRes.status,
          payload: tokenData,
        },
      });
    }

    const accessToken = tokenData?.access_token;
    const openId = tokenData?.open_id;
    const expiresIn = Number(tokenData?.expires_in || 0);

    if (!accessToken || !openId) {
      return respond({
        ok: false,
        error: "TikTok token response was missing access token or user id",
        diagnostics: { stage: "parse_token_response", payload: tokenData },
      });
    }

    const userRes = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const userData = await userRes.json().catch(() => null);
    if (!userRes.ok || userData?.error?.code) {
      return respond({
        ok: false,
        error: userData?.error?.message || "Failed to fetch TikTok user info",
        diagnostics: {
          stage: "fetch_user_info",
          status: userRes.status,
          payload: userData,
        },
      });
    }

    const tiktokUserId = userData?.data?.user?.open_id || openId;
    const displayName = userData?.data?.user?.display_name || "TikTok user";
    const expiresAt = expiresIn > 0
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error: deleteError } = await supabase
      .from("tiktok_credentials")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      return respond({
        ok: false,
        error: `Failed to clear existing TikTok credentials: ${deleteError.message}`,
        diagnostics: { stage: "delete_old_credentials" },
      });
    }

    const { error: insertError } = await supabase.from("tiktok_credentials").insert({
      access_token: accessToken,
      tiktok_user_id: tiktokUserId,
      token_expires_at: expiresAt,
    });

    if (insertError) {
      return respond({
        ok: false,
        error: `Failed to save TikTok credentials: ${insertError.message}`,
        diagnostics: { stage: "save_credentials" },
      });
    }

    return respond({
      ok: true,
      displayName,
      tiktokUserId,
      expiresAt: expiresAt || undefined,
    });
  } catch (error) {
    console.error("tiktok-oauth-callback error", error);
    return respond({
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      diagnostics: { stage: "unexpected_error" },
    });
  }
});
