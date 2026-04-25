import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchImageBytes(imageUrl: string): Promise<Uint8Array> {
  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid data URL returned from AI");
    return Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
  }

  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch generated image (HTTP ${res.status})`);
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Generated URL did not return an image (${contentType})`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

async function uploadImageAsJpegToStorage(imageUrl: string): Promise<string> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { Image } = await import("https://deno.land/x/imagescript@1.3.0/mod.ts");
  const sourceBytes = await fetchImageBytes(imageUrl);
  const image = await Image.decode(sourceBytes);
  const jpegBytes = new Uint8Array(await image.encodeJPEG(90));
  const fileName = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;

  const { error } = await supabase.storage
    .from("instagram-images")
    .upload(fileName, jpegBytes, { contentType: "image/jpeg", upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  return supabase.storage.from("instagram-images").getPublicUrl(fileName).data.publicUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, scenes } = body;

    // Support both single prompt and storyboard scenes
    const finalPrompt = scenes && scenes.length === 4
      ? `Generate a single image that is a 2x2 cinematic storyboard grid. Each quadrant is a separate scene from a micro short film. Label each quadrant S1, S2, S3, S4 in small text in the corner.\n\nTop-left (S1): ${scenes[0]}\nTop-right (S2): ${scenes[1]}\nBottom-left (S3): ${scenes[2]}\nBottom-right (S4): ${scenes[3]}\n\nMake it look like a professional film storyboard with thin black borders between panels. Cinematic aspect ratio, dramatic lighting, ultra high resolution.`
      : prompt;

    if (!finalPrompt) {
      return new Response(JSON.stringify({ error: "prompt or scenes required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating image for prompt:", finalPrompt.substring(0, 150));

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: finalPrompt,
            },
          ],
          modalities: ["image", "text"],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again later.",
            recoverable: true,
            code: 429,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Please add credits.",
            recoverable: true,
            code: 402,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const rawImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!rawImageUrl) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      throw new Error("No image generated");
    }

    // Convert every generated image to JPEG before storage so downstream
    // callers always receive a public .jpg URL instead of a PNG/data URL.
    let imageUrl = rawImageUrl;
    try {
      imageUrl = await uploadImageAsJpegToStorage(rawImageUrl);
      console.log("Uploaded generated JPEG to storage:", imageUrl);
    } catch (uploadErr) {
      console.error("JPEG storage upload failed, falling back to original image URL:", uploadErr);
      // Fallback: still return original image so generation isn't lost
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
