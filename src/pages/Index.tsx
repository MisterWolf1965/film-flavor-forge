import { useState } from "react";
import { Film, LayoutGrid } from "lucide-react";
import { GeneratorView } from "@/components/GeneratorView";
import { GalleryView } from "@/components/GalleryView";
import type { GeneratedContent } from "@/lib/cinematic-data";

const Index = () => {
  const [tab, setTab] = useState<"generate" | "gallery">("generate");
  const [gallery, setGallery] = useState<GeneratedContent[]>([]);

  const handlePublish = (content: GeneratedContent) => {
    setGallery((prev) => [content, ...prev]);
    setTab("gallery");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-1 p-2">
          <button
            onClick={() => setTab("generate")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs transition-all ${
              tab === "generate"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Film className="w-4 h-4" />
            Generate
          </button>
          <button
            onClick={() => setTab("gallery")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs transition-all ${
              tab === "gallery"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Gallery
            {gallery.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                {gallery.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {tab === "generate" ? (
          <GeneratorView onPublish={handlePublish} />
        ) : (
          <GalleryView items={gallery} />
        )}
      </main>
    </div>
  );
};

export default Index;
