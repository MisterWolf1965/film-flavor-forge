import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { useState } from "react";
import type { GeneratedContent } from "@/lib/cinematic-data";

interface GalleryCardProps {
  content: GeneratedContent;
}

export function GalleryCard({ content }: GalleryCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const likes = Math.floor(Math.random() * 500) + 50;

  return (
    <div className="bg-card rounded-lg overflow-hidden film-border animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
          {content.style.icon}
        </div>
        <div>
          <div className="font-mono text-xs font-bold text-foreground">cine.machine</div>
          <div className="text-[10px] text-muted-foreground">{content.style.label}</div>
        </div>
      </div>

      {/* Hero Image from Skit */}
      {content.imageUrl ? (
        <img src={content.imageUrl} alt={content.skit?.narrative || content.prompt} className="w-full aspect-video object-cover" />
      ) : (
        <div className="w-full aspect-video bg-secondary flex items-center justify-center">
          <span className="text-4xl">{content.style.icon}</span>
        </div>
      )}

      {/* Skit Narrative + Scene Prompts */}
      {content.skit && (
        <div className="mx-3 mt-3 p-3 rounded bg-secondary/50 border-l-2 border-primary/40 space-y-3">
          <p className="font-mono text-xs italic text-foreground/90 leading-relaxed">
            🎬 {content.skit.narrative}
          </p>
          <div className="space-y-2">
            {content.skit.scenes.map((scene, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-[10px] font-mono text-primary font-bold shrink-0">S{i + 1}</span>
                <p className="text-[10px] font-mono text-foreground/70 leading-relaxed">{scene}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Storyboard Grid Image */}
      {content.storyboardUrl && (
        <div className="mx-3 mt-3 rounded overflow-hidden film-border">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider px-1 pb-1">Storyboard</p>
          <img src={content.storyboardUrl} alt="Storyboard grid" className="w-full aspect-square object-cover" />
        </div>
      )}


      {/* Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLiked(!liked)} className="transition-transform hover:scale-110">
              <Heart
                className={`w-5 h-5 ${liked ? "fill-accent text-accent" : "text-foreground"}`}
              />
            </button>
            <MessageCircle className="w-5 h-5 text-foreground cursor-pointer hover:text-primary transition-colors" />
            <Share2 className="w-5 h-5 text-foreground cursor-pointer hover:text-primary transition-colors" />
          </div>
          <button onClick={() => setSaved(!saved)} className="transition-transform hover:scale-110">
            <Bookmark className={`w-5 h-5 ${saved ? "fill-primary text-primary" : "text-foreground"}`} />
          </button>
        </div>

        <div className="font-mono text-xs text-foreground font-bold">
          {(liked ? likes + 1 : likes).toLocaleString()} likes
        </div>

        <p className="text-xs text-foreground/80 whitespace-pre-line leading-relaxed">
          {content.socialDescription}
        </p>

        <div className="flex flex-wrap gap-1">
          {content.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[10px] text-primary font-mono">{tag}</span>
          ))}
        </div>

        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {content.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      </div>
    </div>
  );
}
