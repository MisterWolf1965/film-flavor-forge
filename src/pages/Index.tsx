import { useState, useRef, useCallback } from "react";
import { Film, LayoutGrid, Play, Square, RotateCcw, FileImage, Sparkles } from "lucide-react";
import { GeneratorView } from "@/components/GeneratorView";
import { GalleryView } from "@/components/GalleryView";
import { Button } from "@/components/ui/button";
import { STYLES, generatePrompt, type GeneratedContent } from "@/lib/cinematic-data";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MAX_AUTO = 10;

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

  const generateOne = useCallback(async (useAI: boolean = true) => {
    const style = STYLES[Math.floor(Math.random() * STYLES.length)];
    const result = generatePrompt(style);

    let imageUrl: string | undefined;
    if (useAI) {
      try {
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: { prompt: result.imagePrompt }
        });
        if (error) {
          if (error.message?.includes("402") || error.message?.includes("credits")) {
            toast({ title: "AI Credits Exhausted", description: "Please add credits in Settings → Workspace → Usage.", variant: "destructive" });
          } else if (error.message?.includes("429")) {
            toast({ title: "Rate Limited", description: "Too many requests. Please wait a moment.", variant: "destructive" });
          }
          throw error;
        }
        if (data?.error) {
          toast({ title: "Generation Notice", description: data.error, variant: "destructive" });
          if (data?.recoverable) {
            imageUrl = `https://picsum.photos/seed/${Date.now()}/800/450`;
          } else {
            throw new Error(data.error);
          }
        } else {
          imageUrl = data?.imageUrl;
        }
      } catch (err) {
        console.error("Image generation failed, using placeholder:", err);
        imageUrl = `https://picsum.photos/seed/${Date.now()}/800/450`;
      }
    } else {
      imageUrl = `https://picsum.photos/seed/${Date.now()}/800/450`;
    }

    const content: GeneratedContent = {
      ...result,
      id: crypto.randomUUID(),
      imageUrl,
      createdAt: new Date()
    };
    return content;
  }, []);

  const startAuto = useCallback((useAI: boolean = true) => {
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
      const content = await generateOne(useAI);
      setGallery((prev) => [content, ...prev]);
      count++;
      setAutoCount(count);
    };

    runOne();

    intervalRef.current = setInterval(() => {
      runOne();
    }, useAI ? 15000 : 3000);
  }, [autoRunning, generateOne, stopAuto]);

  const handleGenerateSingle = useCallback(async (useAI: boolean) => {
    const content = await generateOne(useAI);
    setGallery((prev) => [content, ...prev]);
    toast({ title: useAI ? "AI Generated" : "Placeholder Generated", description: "Added to gallery." });
  }, [generateOne]);

  const handleReset = () => {
    stopAuto();
    setGallery([]);
    setAutoCount(0);
    toast({ title: "Reset", description: "Gallery cleared and auto-generate stopped." });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-1 p-2">
          <button
            onClick={() => setTab("generate")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs transition-all ${
            tab === "generate" ?
            "bg-primary/10 text-primary" :
            "text-muted-foreground hover:text-foreground"}`
            }>

            <Film className="w-4 h-4" />
            Generate
          </button>
          <button
            onClick={() => setTab("gallery")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs transition-all ${
            tab === "gallery" ?
            "bg-primary/10 text-primary" :
            "text-muted-foreground hover:text-foreground"}`
            }>

            <LayoutGrid className="w-4 h-4" />
            Platform
            {gallery.length > 0 &&
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {gallery.length}
              </span>
            }
          </button>
        </div>
      </nav>

      {/* Controls */}
      <div className="max-w-2xl mx-auto pt-6 py-0 px-0">
        <div className="flex flex-wrap items-center justify-center p-3 rounded-lg border border-border bg-background/50 gap-2">
          {/* Single generate buttons */}
          <Button onClick={() => handleGenerateSingle(false)} variant="outline" size="sm" className="font-mono text-xs gap-2">
            <FileImage className="w-3 h-3" /> Placeholder
          </Button>
          <Button onClick={() => handleGenerateSingle(true)} variant="default" size="sm" className="font-mono text-xs gap-2">
            <Sparkles className="w-3 h-3" /> Generate AI
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Auto controls */}
          {!autoRunning ? (
            <>
              <Button onClick={() => startAuto(false)} variant="outline" size="sm" className="font-mono text-xs gap-2">
                <Play className="w-3 h-3" /> Auto Placeholder
              </Button>
              <Button onClick={() => startAuto(true)} variant="secondary" size="sm" className="font-mono text-xs gap-2">
                <Play className="w-3 h-3" /> Auto AI
              </Button>
            </>
          ) : (
            <Button onClick={stopAuto} variant="destructive" size="sm" className="font-mono text-xs gap-2">
              <Square className="w-3 h-3" /> Stop ({autoCount}/{MAX_AUTO})
            </Button>
          )}
          <Button onClick={handleReset} variant="ghost" size="sm" className="font-mono text-xs gap-2">
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 border border-border rounded-lg my-6 bg-card">
        {tab === "generate" ?
        <GeneratorView autoRunning={autoRunning} /> :

        <GalleryView items={gallery} />
        }
      </main>
    </div>);

};

export default Index;