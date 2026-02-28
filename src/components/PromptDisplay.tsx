import type { GeneratedContent } from "@/lib/cinematic-data";

interface PromptDisplayProps {
  content: GeneratedContent;
}

export function PromptDisplay({ content }: PromptDisplayProps) {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="p-4 rounded-lg bg-card film-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{content.style.icon}</span>
          <span className="font-mono text-xs text-primary font-bold uppercase tracking-widest">
            {content.style.label}
          </span>
        </div>
        <p className="font-mono text-sm text-foreground leading-relaxed">{content.prompt}</p>
      </div>

      {content.imageUrl && (
        <div className="rounded-lg overflow-hidden film-border">
          <img
            src={content.imageUrl}
            alt={content.prompt}
            className="w-full aspect-video object-cover"
          />
        </div>
      )}

      <div className="p-4 rounded-lg bg-secondary/50 film-border">
        <div className="font-mono text-xs text-primary mb-2 uppercase tracking-widest">Social Copy</div>
        <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
          {content.socialDescription}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {content.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px]">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
