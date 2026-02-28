import { useState, useRef, useCallback } from "react";
import { Film, LayoutGrid, Play, Square, RotateCcw } from "lucide-react";
import { GeneratorView } from "@/components/GeneratorView";
import { GalleryView } from "@/components/GalleryView";
import { Button } from "@/components/ui/button";
import { STYLES, generatePrompt, type GeneratedContent } from "@/lib/cinematic-data";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MAX_AUTO = 20;

const Index = () => {
  const [tab, setTab] = useState<"generate" | "gallery">("generate");
  const [gallery, setGallery] = useState<GeneratedContent[]>([]);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setAutoRunning(false);
  }, []);

  const generateOne = useCallback(async () => {
    const style = STYLES[Math.floor(Math.random() * STYLES.length)];
    const result = generatePrompt(style);
    
    let imageUrl: string | undefined;
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: result.imagePrompt },
      });
      if (error) throw error;
      imageUrl = data?.imageUrl;
    } catch (err) {
      console.error("Image generation failed, using placeholder:", err);
      imageUrl = `https://picsum.photos/seed/${Date.now()}/800/450`;
    }

    const content: GeneratedContent = {
      ...result,
      id: crypto.randomUUID(),
      imageUrl,
      createdAt: new Date(),
    };
    return content;
  }, []);

  const startAuto = useCallback(() => {
    if (autoRunning) return;
    setAutoRunning(true);
    setAutoCount(0);
    let count = 0;

    const runOne = async () => {
      if (count >= MAX_AUTO) {
        stopAuto();
        toast({ title: "Auto-generate complete", description: `Generated ${MAX_AUTO} prompts.` });
        return;
      }
      const content = await generateOne();
      setGallery((prev) => [content, ...prev]);
      count++;
      setAutoCount(count);
    };

    // Generate first one immediately
    runOne();

    intervalRef.current = setInterval(() => {
      runOne();
    }, 15000);
  }, [autoRunning, generateOne, stopAuto]);

  const handleReset = () => {
    stopAuto();
    setGallery([]);
    setAutoCount(0);
    toast({ title: "Reset", description: "Gallery cleared and auto-generate stopped." });
  };

  const handlePublish = (content: GeneratedContent) => {
    setGallery((prev) => [content, ...prev]);
    setTab("gallery");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-1 p-2">
          <button
            onClick={() => setTab("generate")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs transition-all ${
              tab === "generate"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Film className="w-4 h-4" />
            Generate
          </button>
          <button
            onClick={() => setTab("gallery")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs transition-all ${
              tab === "gallery"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Gallery
            {gallery.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {gallery.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Auto-generate controls */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-card border border-border">
          {!autoRunning ? (
            <Button onClick={startAuto} variant="outline" size="sm" className="font-mono text-xs gap-2">
              <Play className="w-3 h-3" /> Start Auto (1/min, max {MAX_AUTO})
            </Button>
          ) : (
            <Button onClick={stopAuto} variant="destructive" size="sm" className="font-mono text-xs gap-2">
              <Square className="w-3 h-3" /> Stop ({autoCount}/{MAX_AUTO})
            </Button>
          )}
          <Button onClick={handleReset} variant="ghost" size="sm" className="font-mono text-xs gap-2">
            <RotateCcw className="w-3 h-3" /> Reset All
          </Button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {tab === "generate" ? (
          <GeneratorView onPublish={handlePublish} />
        ) : (
          <GalleryView items={gallery} />
        )}
      </main>
    </div>
  );
};

export default Index;
