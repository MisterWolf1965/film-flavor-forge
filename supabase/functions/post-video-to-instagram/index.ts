import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getCredentials(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("instagram_credentials")
    .select("access_token, instagram_account_id, token_expires_at")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch credentials: ${error.message}`);
  if (!data) throw new Error("Instagram not connected.");
  if (data.token_expires_at && new Date(data.token_expires_at) < new Date()) {
    throw new Error("Instagram token expired. Please reconnect.");
  }
  return { accessToken: data.access_token, igAccountId: data.instagram_account_id };
}

async function waitForContainer(containerId: string, accessToken: string): Promise<void> {
  // Reels can take longer to process than photos.
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${containerId}?fields=status_code,status&access_token=${accessToken}`
    );
    const data = await res.json();
    console.log(`Reel container ${containerId} status:`, data.status_code, data.status);
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") {
      throw new Error(`Reel processing failed: ${data.status || "unknown"}`);
    }
  }
  throw new Error("Reel container not ready after 120s timeout");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const videoUrl: string | undefined = body.videoUrl;
    const caption: string = body.caption || "Test reel from CINE.MACHINE";

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: "videoUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { accessToken, igAccountId } = await getCredentials(supabase);

    console.log("Creating REELS container for", videoUrl);
    const containerRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "REELS",
          video_url: videoUrl,
          caption,
          access_token: accessToken,
        }),
      }
    );
    const containerData = await containerRes.json();
    if (containerData.error) throw new Error(containerData.error.message);

    await waitForContainer(containerData.id, accessToken);

    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: containerData.id, access_token: accessToken }),
      }
    );
    const publishData = await publishRes.json();
    if (publishData.error) throw new Error(publishData.error.message);

    console.log("Published Reel! Post ID:", publishData.id);
    return new Response(
      JSON.stringify({ success: true, postId: publishData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("post-video-to-instagram error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});