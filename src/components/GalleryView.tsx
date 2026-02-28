import { GalleryCard } from "./GalleryCard";
import type { GeneratedContent } from "@/lib/cinematic-data";

interface GalleryViewProps {
  items: GeneratedContent[];
}

export function GalleryView({ items }: GalleryViewProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <div className="text-5xl">🎬</div>
        <p className="font-mono text-sm text-muted-foreground">No films yet. Generate your first prompt.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item) => (
        <GalleryCard key={item.id} content={item} />
      ))}
    </div>
  );
}
