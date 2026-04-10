

## Plan: Replace 2x2 Grid with Image Carousel

Replace the current 2x2 scene images grid in `GalleryCard.tsx` with a swipeable carousel using the existing `Carousel` UI component.

### Changes

**File: `src/components/GalleryCard.tsx`**
- Import `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext` from `@/components/ui/carousel`
- Replace the `grid grid-cols-2` block (lines 76-90) with a Carousel that displays each scene image as a full-width slide
- Each slide shows the scene image with a scene number badge overlay
- Add prev/next arrow buttons styled to fit the card
- Fallback placeholder for scenes without images

