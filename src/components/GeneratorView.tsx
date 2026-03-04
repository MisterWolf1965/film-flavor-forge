import { useEffect, useState, useMemo } from "react";
import { GenerationProgress } from "./GenerationProgress";
import { STYLES, generatePrompt } from "@/lib/cinematic-data";

const TOTAL_STEPS = 5;
const STEP_DURATION_MS = 3000;

interface GeneratorViewProps {
  autoRunning: boolean;
  generating?: boolean;
}

export function GeneratorView({ autoRunning, generating }: GeneratorViewProps) {
  const isActive = autoRunning || !!generating;
  const [currentStep, setCurrentStep] = useState(-1);

  const sampleData = useMemo(() => {
    if (!isActive) return null;
    const style = STYLES[Math.floor(Math.random() * STYLES.length)];
    return generatePrompt(style);
  }, [isActive, currentStep]);

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(-1);
      return;
    }

    setCurrentStep(0);
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (autoRunning) {
        step = step % TOTAL_STEPS;
      } else if (step >= TOTAL_STEPS) {
        clearInterval(timer);
        return;
      }
      setCurrentStep(step);
    }, STEP_DURATION_MS);

    return () => clearInterval(timer);
  }, [isActive, autoRunning]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl text-gradient-gold tracking-tight md:text-3xl font-medium font-serif letter-spacing:2px text-slate-200">
          Cinematic Social Workflow
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          Random cinematic prompts for micro short films
        </p>
      </div>

      <GenerationProgress
        currentStep={currentStep}
        isActive={autoRunning}
        skitStyle={sampleData ? { label: sampleData.style.label, icon: sampleData.style.icon, description: sampleData.style.description, skit: sampleData.skit } : undefined}
        promptText={sampleData?.prompt}
        imageUrl={`https://picsum.photos/seed/${Date.now()}/800/450`}
        metaDescription={sampleData?.socialDescription}
        tags={sampleData?.tags} />

    </div>);

}