import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const caption = body.caption;

    let imageUrls: string[] = [];
    if (body.imageUrls && Array.isArray(body.imageUrls)) {
      imageUrls = body.imageUrls;
    } else if (body.imageUrl) {
      imageUrls = [body.imageUrl];
    }

    if (imageUrls.length === 0 || !caption) {
      return new Response(
        JSON.stringify({ error: "imageUrl(s) and caption are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get TikTok credentials
    const { data: creds, error: credError } = await supabase
      .from("tiktok_credentials")
      .select("access_token, tiktok_user_id, token_expires_at")
      .limit(1)
      .maybeSingle();

    if (credError) throw new Error(`Failed to fetch TikTok credentials: ${credError.message}`);
    if (!creds) throw new Error("TikTok not connected. Please add your TikTok credentials first.");
    if (creds.token_expires_at && new Date(creds.token_expires_at) < new Date()) {
      throw new Error("TikTok token expired. Please reconnect.");
    }

    const accessToken = creds.access_token;

    // TikTok Content Posting API - Photo post
    console.log(`Posting ${imageUrls.length} image(s) to TikTok...`);

    const postData: Record<string, unknown> = {
      post_info: {
        title: caption.substring(0, 150),
        privacy_level: "SELF_ONLY",
        disable_comment: false,
      },
      source_info: {
        source: "PULL_FROM_URL",
        photo_images: imageUrls,
        photo_cover_index: 0,
      },
      post_mode: "DIRECT_POST",
      media_type: "PHOTO",
    };

    const res = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/content/init/",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(postData),
      }
    );

    const result = await res.json();
    console.log("TikTok API response:", JSON.stringify(result));

    if (result.error?.code) {
      console.error("TikTok API error details:", JSON.stringify(result));
      console.error("Request payload was:", JSON.stringify(postData));
      return new Response(
        JSON.stringify({ ok: false, error: `TikTok API error: ${result.error.message || result.error.code}`, details: result }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, success: true, publishId: result.data?.publish_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("post-to-tiktok error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
