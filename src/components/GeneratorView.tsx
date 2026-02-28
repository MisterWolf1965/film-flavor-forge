import { useState, useCallback } from "react";
import { Clapperboard, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StyleSelector } from "./StyleSelector";
import { GenerationProgress } from "./GenerationProgress";
import { PromptDisplay } from "./PromptDisplay";
import { generatePrompt, type CinematicStyle, type GeneratedContent } from "@/lib/cinematic-data";

interface GeneratorViewProps {
  onPublish: (content: GeneratedContent) => void;
}

export function GeneratorView({ onPublish }: GeneratorViewProps) {
  const [selectedStyle, setSelectedStyle] = useState<CinematicStyle | null>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!selectedStyle) return;

    setIsGenerating(true);
    setGenerated(null);
    setCurrentStep(0);

    // Step 0: Generate prompt
    await new Promise((r) => setTimeout(r, 800));
    const result = generatePrompt(selectedStyle);

    setCurrentStep(1);
    // Step 1: "Generate" image (simulated)
    await new Promise((r) => setTimeout(r, 1500));

    // Use a placeholder cinematic image
    const imageUrl = `https://picsum.photos/seed/${Date.now()}/800/450`;

    setCurrentStep(2);
    // Step 2: Social copy (already generated)
    await new Promise((r) => setTimeout(r, 600));

    setCurrentStep(3);
    // Step 3: Ready to publish
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
  }, [selectedStyle]);

  const handlePublish = () => {
    if (generated) {
      onPublish(generated);
      setGenerated(null);
      setCurrentStep(-1);
      setSelectedStyle(null);
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

      {/* Style Selector */}
      <div className="space-y-3">
        <h2 className="font-mono text-xs text-primary uppercase tracking-[0.2em]">Choose Your Style</h2>
        <StyleSelector selected={selectedStyle} onSelect={setSelectedStyle} disabled={isGenerating} />
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={!selectedStyle || isGenerating}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-sm px-8 py-5 glow-gold disabled:opacity-30"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          {isGenerating ? "Generating..." : "Generate Prompt"}
        </Button>
      </div>

      {/* Progress */}
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
              Publish to Gallery
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
