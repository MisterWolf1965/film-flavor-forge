import { Heart, MessageCircle, Share2, Bookmark, Instagram, Music } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedContent } from "@/lib/cinematic-data";

interface GalleryCardProps {
  content: GeneratedContent;
}

export function GalleryCard({ content }: GalleryCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postingTikTok, setPostingTikTok] = useState(false);
  const likes = Math.floor(Math.random() * 500) + 50;

  // Collect all images: hero first, then scene images
  const allImages = useMemo(() => {
    const imgs: string[] = [];
    if (content.imageUrl) imgs.push(content.imageUrl);
    if (content.sceneImages) {
      content.sceneImages.forEach((img) => {
        if (img) imgs.push(img);
      });
    }
    return imgs;
  }, [content.imageUrl, content.sceneImages]);

  const handlePostToInstagram = async () => {
    if (allImages.length === 0) {
      toast.error("No images to post");
      return;
    }
    setPosting(true);
    try {
      const caption = `${content.socialDescription}\n\n${content.tags.join(" ")}`;
      const body = allImages.length > 1
        ? { imageUrls: allImages, caption }
        : { imageUrl: allImages[0], caption };
      const { data, error } = await supabase.functions.invoke("post-to-instagram", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Posted to Instagram! 🎉");
    } catch (e: any) {
      toast.error(e.message || "Failed to post to Instagram");
    } finally {
      setPosting(false);
    }
  };

  const handlePostToTikTok = async () => {
    if (allImages.length === 0) {
      toast.error("No images to post");
      return;
    }
    setPostingTikTok(true);
    try {
      const caption = `${content.socialDescription}\n\n${content.tags.join(" ")}`;
      const { data, error } = await supabase.functions.invoke("post-to-tiktok", {
        body: { imageUrls: allImages, caption },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Posted to TikTok! 🎵");
    } catch (e: any) {
      toast.error(e.message || "Failed to post to TikTok");
    } finally {
      setPostingTikTok(false);
    }
  };

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

      {/* Image Carousel */}
      {allImages.length > 1 ? (
        <Carousel className="w-full">
          <CarouselContent className="-ml-0">
            {allImages.map((img, i) => (
              <CarouselItem key={i} className="pl-0">
                <div className="relative">
                  <img src={img} alt={`Slide ${i + 1}`} className="w-full aspect-video object-cover" />
                  {i === 0 && content.skit && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{content.style.icon}</span>
                        <span className="text-[10px] font-mono text-white/70 uppercase tracking-wider">{content.style.label}</span>
                      </div>
                      <p className="text-xs font-mono text-white/90 leading-relaxed line-clamp-2">{content.skit.narrative}</p>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 h-7 w-7 bg-background/70 border-0" />
          <CarouselNext className="right-2 h-7 w-7 bg-background/70 border-0" />
        </Carousel>
      ) : allImages.length === 1 ? (
        <div className="relative">
          <img src={allImages[0]} alt={content.prompt} className="w-full aspect-video object-cover" />
          {content.skit && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{content.style.icon}</span>
                <span className="text-[10px] font-mono text-white/70 uppercase tracking-wider">{content.style.label}</span>
              </div>
              <p className="text-xs font-mono text-white/90 leading-relaxed line-clamp-2">{content.skit.narrative}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full aspect-video bg-secondary flex items-center justify-center">
          <span className="text-4xl">{content.style.icon}</span>
        </div>
      )}

      {/* Skit Narrative */}
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

      {/* Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLiked(!liked)} className="transition-transform hover:scale-110">
              <Heart className={`w-5 h-5 ${liked ? "fill-accent text-accent" : "text-foreground"}`} />
            </button>
            <MessageCircle className="w-5 h-5 text-foreground cursor-pointer hover:text-primary transition-colors" />
            <Share2 className="w-5 h-5 text-foreground cursor-pointer hover:text-primary transition-colors" />
            <button
              onClick={handlePostToInstagram}
              disabled={posting || allImages.length === 0}
              className="transition-transform hover:scale-110 disabled:opacity-50"
              title="Post to Instagram"
            >
              <Instagram className={`w-5 h-5 ${posting ? "animate-pulse text-primary" : "text-foreground hover:text-primary"} transition-colors`} />
            </button>
            <button
              onClick={handlePostToTikTok}
              disabled={postingTikTok || allImages.length === 0}
              className="transition-transform hover:scale-110 disabled:opacity-50"
              title="Post to TikTok"
            >
              <Music className={`w-5 h-5 ${postingTikTok ? "animate-pulse text-primary" : "text-foreground hover:text-primary"} transition-colors`} />
            </button>
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
