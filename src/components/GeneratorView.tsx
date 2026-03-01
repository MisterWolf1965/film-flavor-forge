import { useEffect, useState } from "react";
import { GenerationProgress } from "./GenerationProgress";

interface GeneratorViewProps {
  autoRunning: boolean;
}

export function GeneratorView({ autoRunning }: GeneratorViewProps) {
  const [currentStep, setCurrentStep] = useState(-1);

  useEffect(() => {
    if (!autoRunning) {
      setCurrentStep(-1);
      return;
    }

    setCurrentStep(0);
    let step = 0;
    const timer = setInterval(() => {
      step = (step + 1) % 4;
      setCurrentStep(step);
    }, 900);

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

      <GenerationProgress currentStep={currentStep} isActive={autoRunning} />
    </div>);

}