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
      // Only treat the post as successful when the backend confirms TikTok
      // accepted the init request. Any error/validation/domain failure must
      // surface as a toast.error so we don't claim a draft exists when it
      // doesn't.
      if (!data?.ok || data?.error) {
        throw new Error(data?.error || "TikTok rejected the post.");
      }
      const message = data?.message ||
        (data?.postMode === "MEDIA_UPLOAD"
          ? "Sent to TikTok draft inbox. Open TikTok on the connected account to finish."
          : "Submitted to TikTok.");
      toast.success(message, { duration: 7000 });

      if (data?.publishId) {
        console.log("TikTok publish ID:", data.publishId, "mode:", data.postMode);
        setTimeout(async () => {
          const { data: statusData, error: statusError } = await supabase.functions.invoke("tiktok-publish-status", {
            body: { publishId: data.publishId },
          });

          if (statusError || statusData?.error) {
            console.warn("TikTok publish status check failed:", statusError || statusData?.error);
            return;
          }

          console.log("TikTok publish status:", statusData);
          if (statusData?.failed) {
            const fileFormatMessage =
              "TikTok rejected the image format. Uploads are now converted to JPEG before retrying.";
            toast.error(
              statusData.failReason === "file_format_check_failed"
                ? fileFormatMessage
                : statusData.failReason
                ? `TikTok processing failed: ${statusData.failReason}`
                : "TikTok accepted the upload, but processing failed on TikTok.",
              { duration: 9000 }
            );
          }
        }, 2500);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to post to TikTok");
    } finally {
      setPostingTikTok(false);
    }
  };

  return (
    <div className="flex justify-center animate-fade-up">
      {/* Phone mockup */}
      <div className="relative w-[280px] md:w-[300px]">
        {/* Phone frame */}
        <div className="rounded-[2.5rem] border-[3px] border-foreground/20 bg-background shadow-2xl overflow-hidden">
          {/* Notch */}
          <div className="flex justify-center pt-2 pb-1 bg-background">
            <div className="w-20 h-5 bg-foreground/10 rounded-full" />
          </div>

          {/* Screen content */}
          <div className="bg-background">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                {content.style.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[10px] font-bold text-foreground truncate">cine.machine</div>
                <div className="text-[8px] text-muted-foreground truncate">{content.style.label}</div>
              </div>
            </div>

            {/* Image area */}
            {allImages.length > 1 ? (
              <Carousel className="w-full">
                <CarouselContent className="-ml-0">
                  {allImages.map((img, i) => (
                    <CarouselItem key={i} className="pl-0">
                      <div className="relative">
                        <img src={img} alt={`Slide ${i + 1}`} className="w-full aspect-[4/5] object-cover" />
                        {i === 0 && content.skit && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-[10px]">{content.style.icon}</span>
                              <span className="text-[7px] font-mono text-white/70 uppercase tracking-wider">{content.style.label}</span>
                            </div>
                            <p className="text-[9px] font-mono text-white/90 leading-relaxed line-clamp-2">{content.skit.narrative}</p>
                          </div>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-1 h-6 w-6 bg-background/70 border-0" />
                <CarouselNext className="right-1 h-6 w-6 bg-background/70 border-0" />
              </Carousel>
            ) : allImages.length === 1 ? (
              <div className="relative">
                <img src={allImages[0]} alt={content.prompt} className="w-full aspect-[4/5] object-cover" />
                {content.skit && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[10px]">{content.style.icon}</span>
                      <span className="text-[7px] font-mono text-white/70 uppercase tracking-wider">{content.style.label}</span>
                    </div>
                    <p className="text-[9px] font-mono text-white/90 leading-relaxed line-clamp-2">{content.skit.narrative}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-[4/5] bg-secondary flex items-center justify-center">
                <span className="text-4xl">{content.style.icon}</span>
              </div>
            )}

            {/* Skit scenes */}
            {content.skit && (
              <div className="mx-2 mt-2 p-2 rounded bg-secondary/50 border-l-2 border-primary/40 space-y-1.5">
                <p className="font-mono text-[9px] italic text-foreground/90 leading-relaxed">
                  🎬 {content.skit.narrative}
                </p>
                <div className="space-y-1">
                  {content.skit.scenes.map((scene, i) => (
                    <div key={i} className="flex gap-1.5">
                      <span className="text-[8px] font-mono text-primary font-bold shrink-0">S{i + 1}</span>
                      <p className="text-[8px] font-mono text-foreground/70 leading-relaxed">{scene}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="px-3 py-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setLiked(!liked)} className="transition-transform hover:scale-110">
                    <Heart className={`w-4 h-4 ${liked ? "fill-accent text-accent" : "text-foreground"}`} />
                  </button>
                  <MessageCircle className="w-4 h-4 text-foreground cursor-pointer hover:text-primary transition-colors" />
                  <Share2 className="w-4 h-4 text-foreground cursor-pointer hover:text-primary transition-colors" />
                  <button
                    onClick={handlePostToInstagram}
                    disabled={posting || allImages.length === 0}
                    className="transition-transform hover:scale-110 disabled:opacity-50"
                    title="Post to Instagram"
                  >
                    <Instagram className={`w-4 h-4 ${posting ? "animate-pulse text-primary" : "text-foreground hover:text-primary"} transition-colors`} />
                  </button>
                  <button
                    onClick={handlePostToTikTok}
                    disabled={postingTikTok || allImages.length === 0}
                    className="transition-transform hover:scale-110 disabled:opacity-50"
                    title="Post to TikTok"
                  >
                    <Music className={`w-4 h-4 ${postingTikTok ? "animate-pulse text-primary" : "text-foreground hover:text-primary"} transition-colors`} />
                  </button>
                </div>
                <button onClick={() => setSaved(!saved)} className="transition-transform hover:scale-110">
                  <Bookmark className={`w-4 h-4 ${saved ? "fill-primary text-primary" : "text-foreground"}`} />
                </button>
              </div>

              <div className="font-mono text-[10px] text-foreground font-bold">
                {(liked ? likes + 1 : likes).toLocaleString()} likes
              </div>

              <p className="text-[9px] text-foreground/80 whitespace-pre-line leading-relaxed line-clamp-3">
                {content.socialDescription}
              </p>

              <div className="flex flex-wrap gap-1">
                {content.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-[8px] text-primary font-mono">{tag}</span>
                ))}
              </div>

              <div className="text-[8px] text-muted-foreground uppercase tracking-wider">
                {content.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </div>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-2 pt-1 bg-background">
            <div className="w-24 h-1 bg-foreground/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
