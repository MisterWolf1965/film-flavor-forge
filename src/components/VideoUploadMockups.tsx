import { useRef, useState } from "react";
import { Upload, Loader2, Instagram, Music, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Platform = "instagram" | "tiktok";

interface MockupState {
  file: File | null;
  previewUrl: string | null;
  uploading: boolean;
  posting: boolean;
  publicUrl: string | null;
  caption: string;
}

const initialState: MockupState = {
  file: null,
  previewUrl: null,
  uploading: false,
  posting: false,
  publicUrl: null,
  caption: "",
};

function useMockup() {
  const [state, setState] = useState<MockupState>(initialState);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    setState(initialState);
    if (inputRef.current) inputRef.current.value = "";
  };

  const pickFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast({ title: "Invalid file", description: "Please select an mp4 video.", variant: "destructive" });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 100 MB.", variant: "destructive" });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setState((s) => ({ ...s, file, previewUrl, uploading: true, publicUrl: null }));

    try {
      const ext = file.name.split(".").pop() || "mp4";
      const fileName = `vid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("social-videos")
        .upload(fileName, file, { contentType: file.type, upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("social-videos").getPublicUrl(fileName);
      setState((s) => ({ ...s, publicUrl: data.publicUrl, uploading: false }));
      toast({ title: "Video uploaded", description: "Ready to post." });
    } catch (e) {
      setState((s) => ({ ...s, uploading: false }));
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return { state, setState, inputRef, reset, pickFile };
}

function MockupFrame({
  platform,
  aspect,
  label,
}: {
  platform: Platform;
  aspect: string;
  label: string;
}) {
  const { state, setState, inputRef, reset, pickFile } = useMockup();

  const Icon = platform === "instagram" ? Instagram : Music;
  const isReady = !!state.publicUrl && !state.uploading;

  const handlePost = async () => {
    if (!state.publicUrl) return;
    setState((s) => ({ ...s, posting: true }));
    try {
      const fnName = platform === "instagram" ? "post-video-to-instagram" : "post-video-to-tiktok";
      const { data, error } = await supabase.functions.invoke(fnName, {
        body: {
          videoUrl: state.publicUrl,
          caption: state.caption || `Test ${platform} video`,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.ok === false) throw new Error(data.error || "Post failed");
      toast({
        title: `${label} post sent`,
        description: data?.message || "Submitted successfully.",
      });
    } catch (e) {
      toast({
        title: `${label} post failed`,
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setState((s) => ({ ...s, posting: false }));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
          <Icon className="w-3 h-3" /> {label} · {aspect}
        </span>
        {state.file && (
          <button
            onClick={reset}
            className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="w-3 h-3" /> clear
          </button>
        )}
      </div>

      <div
        className="relative w-full overflow-hidden rounded-md border border-border bg-muted/30"
        style={{ aspectRatio: aspect.replace(":", " / ") }}
      >
        {state.previewUrl ? (
          <video
            src={state.previewUrl}
            controls
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Upload className="w-6 h-6" />
            <span className="text-xs font-mono">Click to upload mp4</span>
            <span className="text-[10px] font-mono opacity-60">{aspect}</span>
          </button>
        )}
        {state.uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pickFile(f);
        }}
      />

      <Input
        placeholder="Caption (optional)"
        value={state.caption}
        onChange={(e) => setState((s) => ({ ...s, caption: e.target.value }))}
        className="text-xs font-mono h-7"
      />

      <Button
        onClick={handlePost}
        disabled={!isReady || state.posting}
        size="sm"
        className="text-xs h-8 gap-2 font-mono"
      >
        {state.posting ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Send className="w-3 h-3" />
        )}
        {state.posting ? "Posting..." : `Post to ${label}`}
      </Button>
    </div>
  );
}

export function VideoUploadMockups() {
  return (
    <section className="max-w-2xl mx-auto px-4 pb-10">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
          Test Video Uploads
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <MockupFrame platform="instagram" aspect="4:5" label="Instagram" />
          <MockupFrame platform="tiktok" aspect="9:16" label="TikTok" />
        </div>
      </div>
    </section>
  );
}