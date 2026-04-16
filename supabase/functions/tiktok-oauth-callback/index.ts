import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    const redirectUri = "https://film-flavor-forge.lovable.app/auth/callback";

    if (!code) {
      return new Response(JSON.stringify({ error: "Authorization code is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
    const clientSecret = Deno.env.get("TIKTOK_CLIENT_SECRET");

    if (!clientKey || !clientSecret) {
      return new Response(JSON.stringify({ error: "TikTok client credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exchange authorization code for access token
    console.log("Exchanging TikTok auth code for access token...");
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri || "",
      }),
    });

    const tokenData = await tokenRes.json();
    console.log("TikTok token response:", JSON.stringify(tokenData));

    if (tokenData.error || !tokenData.access_token) {
      const errMsg = tokenData.error_description || tokenData.error || "Failed to get access token";
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = tokenData.access_token;
    const openId = tokenData.open_id;
    const expiresIn = tokenData.expires_in || 86400;

    // Fetch user info for display
    const userRes = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userRes.json();
    const displayName = userData.data?.user?.display_name || openId;

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Delete old credentials and insert new
    await supabase.from("tiktok_credentials").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { error: insertError } = await supabase.from("tiktok_credentials").insert({
      access_token: accessToken,
      tiktok_user_id: openId,
      token_expires_at: expiresAt,
    });

    if (insertError) throw new Error(`DB insert failed: ${insertError.message}`);

    return new Response(JSON.stringify({ success: true, displayName, openId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tiktok-oauth-callback error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
