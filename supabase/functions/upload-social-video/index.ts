import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-app-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_TYPES = ["video/mp4", "video/quicktime"];

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
    return new Response(null, { headers: corsHeaders });
  }

  const unauthorized = checkAppSecret(req);
  if (unauthorized) return unauthorized;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing file in form data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: `Unsupported file type: ${file.type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (file.size > MAX_BYTES) {
      return new Response(JSON.stringify({ error: "File exceeds 100 MB limit" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
    const fileName = `vid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from("social-videos")
      .upload(fileName, bytes, { contentType: file.type, upsert: false });
    if (error) throw error;

    const { data: pub } = supabase.storage.from("social-videos").getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ publicUrl: pub.publicUrl, fileName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("upload-social-video error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});