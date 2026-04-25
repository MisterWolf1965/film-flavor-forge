import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "x-app-secret, authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};


function checkAppSecret(req: Request): Response | null {
  const expected = Deno.env.get("APP_SECRET");
  if (!expected) {
    return new Response(JSON.stringify({ error: "Server misconfigured: APP_SECRET not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const provided = req.headers.get("x-app-secret");
  if (provided !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const unauthorized = checkAppSecret(req);
  if (unauthorized) return unauthorized;

try {
    const { accessToken, tiktokUserId } = await req.json();

    if (!accessToken || !tiktokUserId) {
      return new Response(
        JSON.stringify({ error: "accessToken and tiktokUserId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify token by fetching user info
    const testRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name",
      {
        headers: { "Authorization": `Bearer ${accessToken}` },
      }
    );
    const testData = await testRes.json();
    if (testData.error?.code) {
      return new Response(
        JSON.stringify({ error: `Invalid token: ${testData.error.message || testData.error.code}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete old and insert new
    await supabase.from("tiktok_credentials").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from("tiktok_credentials").insert({
      access_token: accessToken,
      tiktok_user_id: tiktokUserId,
      token_expires_at: expiresAt,
    });

    if (insertError) throw new Error(`DB insert failed: ${insertError.message}`);

    const displayName = testData.data?.user?.display_name || tiktokUserId;

    return new Response(
      JSON.stringify({ success: true, displayName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("save-tiktok-token error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
