import { Progress } from "@/components/ui/progress";
import { Package, Send } from "lucide-react";

const STEPS = [
  { label: "Random skit", icon: "🎬" },
  { label: "Generate prompt", icon: "🎲" },
  { label: "Generate image", icon: "🎨" },
  { label: "Meta description", icon: "📝" },
  { label: "Send to Platform", icon: "🚀" },
];

interface GenerationProgressProps {
  currentStep: number;
  isActive: boolean;
  skitStyle?: { label: string; icon: string; description: string; skit: string };
  promptText?: string;
  imageUrl?: string;
  metaDescription?: string;
  tags?: string[];
}

export function GenerationProgress({
  currentStep,
  isActive,
  skitStyle,
  promptText,
  imageUrl,
  metaDescription,
  tags,
}: GenerationProgressProps) {
  const progress =
    currentStep < 0
      ? 0
      : currentStep >= STEPS.length
      ? 100
      : ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-4">
      <Progress value={progress} className="h-1.5 bg-secondary [&>div]:bg-primary" />
      <div className="grid grid-cols-5 gap-2">
        {STEPS.map((step, i) => {
          const isDone = currentStep > i;
          const isCurrent = currentStep === i && isActive;
          return (
            <div
              key={step.label}
              className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${
                isDone ? "opacity-100" : isCurrent ? "opacity-100" : "opacity-40"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary/20 text-primary animate-pulse"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {isDone ? "✓" : step.icon}
              </div>
              <span className="text-[10px] font-mono text-foreground text-center leading-tight">
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step detail panel */}
      {isActive && currentStep >= 0 && (
        <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4 min-h-[120px] flex items-center justify-center animate-fade-in">
          {currentStep === 0 && <StepSkit style={skitStyle} />}
          {currentStep === 1 && <StepPrompt text={promptText} />}
          {currentStep === 2 && <StepImage url={imageUrl} />}
          {currentStep === 3 && <StepMeta description={metaDescription} tags={tags} />}
          {currentStep === 4 && <StepSend />}
        </div>
      )}
    </div>
  );
}

function StepSkit({ style }: { style?: { label: string; icon: string; description: string; skit: string } }) {
  return (
    <div className="w-full space-y-3 animate-fade-in">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Random Skit Selected</p>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-lg animate-pulse">
          {style?.icon || "🎬"}
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-mono text-primary font-medium">{style?.label || "..."}</p>
          <p className="text-[11px] font-mono text-foreground leading-relaxed italic">
            "{style?.skit || "Rolling the dice..."}"
          </p>
        </div>
      </div>
      <div className="flex gap-1.5 pt-1">
        {["🎞️", "☕", "🌃", "🏚️", "🔥", "👾"].map((icon) => (
          <span
            key={icon}
            className={`text-sm transition-all duration-500 ${icon === style?.icon ? "opacity-100 scale-125" : "opacity-20"}`}
          >
            {icon}
          </span>
        ))}
      </div>
    </div>
  );
}

function StepPrompt({ text }: { text?: string }) {
  return (
    <div className="w-full space-y-2 animate-fade-in">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Prompt Generated</p>
      <p className="text-xs font-mono text-foreground leading-relaxed">
        {text || "Generating prompt..."}
      </p>
      <div className="h-0.5 bg-primary/30 rounded-full overflow-hidden">
        <div className="h-full bg-primary animate-[shimmer_1.5s_ease-in-out_infinite] w-1/2 rounded-full" />
      </div>
    </div>
  );
}

function StepImage({ url }: { url?: string }) {
  return (
    <div className="w-full space-y-2 animate-fade-in">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Generating Image</p>
      <div className="relative w-full aspect-video rounded-md overflow-hidden bg-secondary">
        {url ? (
          <img
            src={url}
            alt="Generating..."
            className="w-full h-full object-cover blur-md scale-105 animate-pulse transition-all duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary to-primary/5 animate-pulse" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    </div>
  );
}

function StepMeta({ description, tags }: { description?: string; tags?: string[] }) {
  return (
    <div className="w-full space-y-3 animate-fade-in">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Meta & Tags Generated</p>
      {description && (
        <p className="text-[11px] font-mono text-foreground/80 leading-relaxed line-clamp-3">
          {description}
        </p>
      )}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded animate-scale-in"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function StepSend() {
  return (
    <div className="w-full flex flex-col items-center gap-3 animate-fade-in">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Sending to Platform</p>
      <div className="relative flex items-center justify-center gap-4">
        <div className="animate-[packageSlide_2s_ease-in-out_infinite]">
          <Package className="w-6 h-6 text-primary" />
        </div>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[dotPulse_1.5s_ease-in-out_infinite]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[dotPulse_1.5s_ease-in-out_0.3s_infinite]" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[dotPulse_1.5s_ease-in-out_0.6s_infinite]" />
        </div>
        <Send className="w-5 h-5 text-primary/60" />
      </div>
    </div>
  );
}
