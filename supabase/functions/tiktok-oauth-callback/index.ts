import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Missing code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const redirectUri = "https://film-flavor-forge.lovable.app/auth/callback";

    const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
    const clientSecret = Deno.env.get("TIKTOK_CLIENT_SECRET");

    if (!clientKey || !clientSecret) {
      return new Response(JSON.stringify({ error: "Missing TikTok env vars" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 🔥 TOKEN EXCHANGE
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const rawText = await tokenRes.text(); // 👈 capture raw response

    let tokenData;
    try {
      tokenData = JSON.parse(rawText);
    } catch {
      return new Response(
        JSON.stringify({
          error: "TikTok returned non-JSON",
          raw: rawText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 🔥 RETURN FULL ERROR TO FRONTEND
    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      return new Response(
        JSON.stringify({
          error: "TikTok token exchange failed",
          details: tokenData,
          status: tokenRes.status,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const accessToken = tokenData.access_token;
    const openId = tokenData.open_id;
    const expiresIn = tokenData.expires_in || 86400;

    // 🔥 USER INFO (also debugged)
    const userRes = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userRaw = await userRes.text();

    let userData;
    try {
      userData = JSON.parse(userRaw);
    } catch {
      return new Response(
        JSON.stringify({
          error: "User fetch failed",
          raw: userRaw,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const displayName = userData?.data?.user?.display_name || openId;

    // 🔥 SUPABASE SAVE
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { error: insertError } = await supabase.from("tiktok_credentials").insert({
      access_token: accessToken,
      tiktok_user_id: openId,
      token_expires_at: expiresAt,
    });

    if (insertError) {
      return new Response(
        JSON.stringify({
          error: "Database insert failed",
          details: insertError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        displayName,
        openId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: "Unexpected error",
        details: e instanceof Error ? e.message : e,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
