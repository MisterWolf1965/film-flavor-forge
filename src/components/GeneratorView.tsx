import { useState, useCallback } from "react";
import { Clapperboard, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GenerationProgress } from "./GenerationProgress";
import { PromptDisplay } from "./PromptDisplay";
import { generatePrompt, STYLES, type GeneratedContent } from "@/lib/cinematic-data";
import { supabase } from "@/integrations/supabase/client";

interface GeneratorViewProps {
  onPublish: (content: GeneratedContent) => void;
}

export function GeneratorView({ onPublish }: GeneratorViewProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setGenerated(null);

    // Step 0: Pick random style & generate prompt
    setCurrentStep(0);
    await new Promise((r) => setTimeout(r, 800));
    const style = STYLES[Math.floor(Math.random() * STYLES.length)];
    const result = generatePrompt(style);

    // Step 1: Generate image with AI
    setCurrentStep(1);
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

    // Step 2: Meta description
    setCurrentStep(2);
    await new Promise((r) => setTimeout(r, 600));

    // Step 3: Send to platform
    setCurrentStep(3);
    await new Promise((r) => setTimeout(r, 400));

    const content: GeneratedContent = {
      ...result,
      id: crypto.randomUUID(),
      imageUrl,
      createdAt: new Date(),
    };

    setGenerated(content);
    setCurrentStep(4);
    setIsGenerating(false);
  }, []);

  const handlePublish = () => {
    if (generated) {
      onPublish(generated);
      setGenerated(null);
      setCurrentStep(-1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-mono font-bold text-gradient-gold tracking-tight">
          CINE.MACHINE
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          Random cinematic prompts for micro short films
        </p>
      </div>

      {/* Progress Bar - always visible */}
      <GenerationProgress currentStep={currentStep} isActive={isGenerating || currentStep >= 0} />

      {/* Result */}
      {generated && (
        <div className="space-y-4">
          <PromptDisplay content={generated} />
          <div className="flex justify-center">
            <Button
              onClick={handlePublish}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-mono text-sm px-8 py-5"
            >
              <Clapperboard className="w-4 h-4 mr-2" />
              Send to Platform
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
