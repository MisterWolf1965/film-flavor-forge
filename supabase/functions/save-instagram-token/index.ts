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
    const { accessToken, igAccountId } = await req.json();

    if (!accessToken || !igAccountId) {
      return new Response(
        JSON.stringify({ error: "accessToken and igAccountId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify the token works by making a test API call
    const testRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}?fields=id,username&access_token=${accessToken}`
    );
    const testData = await testRes.json();
    if (testData.error) {
      return new Response(
        JSON.stringify({ error: `Invalid token: ${testData.error.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete old credentials and insert new
    await supabase.from("instagram_credentials").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days

    const { error: insertError } = await supabase.from("instagram_credentials").insert({
      access_token: accessToken,
      instagram_account_id: igAccountId,
      token_expires_at: expiresAt,
    });

    if (insertError) throw new Error(`DB insert failed: ${insertError.message}`);

    return new Response(
      JSON.stringify({ success: true, username: testData.username }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("save-instagram-token error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
