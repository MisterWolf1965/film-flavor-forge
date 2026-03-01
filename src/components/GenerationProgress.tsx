import { Progress } from "@/components/ui/progress";

const STEPS = [
  { label: "Random prompt", icon: "🎲" },
  { label: "Generate image", icon: "🎨" },
  { label: "Meta description", icon: "📝" },
  { label: "Send to Platform", icon: "🚀" },
];

interface GenerationProgressProps {
  currentStep: number; // 0-3, -1 = not started, 4 = done
  isActive: boolean;
}

export function GenerationProgress({ currentStep, isActive }: GenerationProgressProps) {

  const progress = currentStep >= STEPS.length ? 100 : ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-4 animate-fade-up">
      <Progress value={progress} className="h-1.5 bg-secondary [&>div]:bg-primary" />
      <div className="grid grid-cols-4 gap-2">
        {STEPS.map((step, i) => {
          const isDone = currentStep > i;
          const isCurrent = currentStep === i;
          return (
            <div
              key={step.label}
              className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${
                isDone ? "opacity-100" : isCurrent ? "opacity-100" : "opacity-30"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary/20 text-primary animate-pulse-gold"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {isDone ? "✓" : step.icon}
              </div>
              <span className="text-[10px] font-mono text-muted-foreground text-center leading-tight">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
