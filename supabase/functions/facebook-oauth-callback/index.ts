import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const appUrl = url.origin.replace("hbnpvglyoteuxrvliyxt.supabase.co/functions/v1/facebook-oauth-callback", "");

  // Build a redirect URL back to the app
  const redirectBase = Deno.env.get("APP_URL") || "https://id-preview--1af35119-4342-493f-8daf-ef2156282097.lovable.app";

  if (error || !code) {
    console.error("OAuth error or no code:", error);
    return Response.redirect(`${redirectBase}/?ig_status=error&reason=${error || "no_code"}`, 302);
  }

  try {
    const appId = Deno.env.get("FB_APP_ID")!;
    const appSecret = Deno.env.get("FB_APP_SECRET")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // The redirect URI must match exactly what was used in the auth request
    const redirectUri = `${supabaseUrl}/functions/v1/facebook-oauth-callback`;

    // Step 1: Exchange code for short-lived token
    console.log("Exchanging code for token...");
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
    );
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error.message);
    console.log("Got short-lived token");

    // Step 2: Exchange for long-lived token (60 days)
    console.log("Exchanging for long-lived token...");
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`
    );
    const longTokenData = await longTokenRes.json();
    if (longTokenData.error) throw new Error(longTokenData.error.message);
    const longLivedToken = longTokenData.access_token;
    const expiresIn = longTokenData.expires_in || 5184000; // default 60 days
    console.log("Got long-lived token, expires in", expiresIn, "seconds");

    // Step 3: Get user's Facebook Pages
    console.log("Fetching pages...");
    const pagesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedToken}`
    );
    const pagesData = await pagesRes.json();
    if (pagesData.error) throw new Error(pagesData.error.message);
    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error("No Facebook Pages found. You need a Facebook Page connected to an Instagram Business account.");
    }

    // Use the page's access token (it's a long-lived page token, never expires)
    const page = pagesData.data[0];
    const pageAccessToken = page.access_token;
    console.log("Using page:", page.name, "ID:", page.id);

    // Step 4: Get Instagram Business Account ID from the page
    console.log("Fetching Instagram Business Account...");
    const igRes = await fetch(
      `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${pageAccessToken}`
    );
    const igData = await igRes.json();
    if (igData.error) throw new Error(igData.error.message);
    if (!igData.instagram_business_account) {
      throw new Error("No Instagram Business Account linked to this Facebook Page. Please connect one in Facebook Page settings.");
    }
    const igAccountId = igData.instagram_business_account.id;
    console.log("Instagram Business Account ID:", igAccountId);

    // Step 5: Get Facebook user ID
    const meRes = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${longLivedToken}`);
    const meData = await meRes.json();
    const fbUserId = meData.id;

    // Step 6: Store in database
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Delete old credentials and insert new (single admin)
    await supabase.from("instagram_credentials").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    const { error: insertError } = await supabase.from("instagram_credentials").insert({
      access_token: pageAccessToken,
      instagram_account_id: igAccountId,
      facebook_user_id: fbUserId,
      token_expires_at: expiresAt,
    });

    if (insertError) throw new Error(`DB insert failed: ${insertError.message}`);
    console.log("Credentials stored successfully!");

    return Response.redirect(`${redirectBase}/?ig_status=connected`, 302);
  } catch (e) {
    console.error("facebook-oauth-callback error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return Response.redirect(`${redirectBase}/?ig_status=error&reason=${encodeURIComponent(msg)}`, 302);
  }
});
