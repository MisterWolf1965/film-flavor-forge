import { useEffect, useState, useMemo } from "react";
import { GenerationProgress } from "./GenerationProgress";
import { STYLES, generatePrompt } from "@/lib/cinematic-data";

interface GeneratorViewProps {
  autoRunning: boolean;
}

export function GeneratorView({ autoRunning }: GeneratorViewProps) {
  const [currentStep, setCurrentStep] = useState(-1);

  // Generate a sample prompt to display in step panels
  const sampleData = useMemo(() => {
    if (!autoRunning) return null;
    const style = STYLES[Math.floor(Math.random() * STYLES.length)];
    return generatePrompt(style);
  }, [autoRunning, currentStep < 0]); // regenerate when restarted

  useEffect(() => {
    if (!autoRunning) {
      setCurrentStep(-1);
      return;
    }

    setCurrentStep(0);
    let step = 0;
    const timer = setInterval(() => {
      step = (step + 1) % 5;
      setCurrentStep(step);
    }, 3000);

    return () => clearInterval(timer);
  }, [autoRunning]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl text-gradient-gold tracking-tight md:text-3xl font-medium font-sans text-secondary-foreground">
          Cinematic Social Workflow
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          Random cinematic prompts for micro short films
        </p>
      </div>

      <GenerationProgress
        currentStep={currentStep}
        isActive={autoRunning}
        skitStyle={sampleData?.style ? { label: sampleData.style.label, icon: sampleData.style.icon, description: sampleData.style.description, skit: sampleData.skit } : undefined}
        promptText={sampleData?.prompt}
        imageUrl={`https://picsum.photos/seed/${Date.now()}/800/450`}
        metaDescription={sampleData?.socialDescription}
        tags={sampleData?.tags}
      />
    </div>
  );
}
