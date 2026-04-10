

## Plan: Carousel at Top + Instagram Carousel Posting + Remove Storyboard

### What changes

1. **GalleryCard.tsx — Move scene images carousel to the top (replacing hero image)**
   - Replace the single hero image (lines 52-59) with a carousel of all available images: the hero image + up to 4 scene images
   - Collect all images into an array (hero first, then scene images), display as a swipeable carousel with dot indicators and navigation arrows
   - Remove the scene images carousel from inside the skit narrative section (lines 76-100)
   - Remove the storyboard section entirely (lines 104-110)

2. **GalleryCard.tsx — Update Instagram posting to send all images for carousel post**
   - Change `handlePostToInstagram` to pass an `imageUrls` array (hero + scene images) instead of a single `imageUrl`

3. **Edge function `post-to-instagram/index.ts` — Support carousel posting**
   - Accept `imageUrls: string[]` in addition to `imageUrl: string` (backward compat)
   - When multiple images: upload each to storage, create individual media containers with `is_carousel_item: true`, then create a carousel container via `POST /{ig-id}/media` with `media_type: "CAROUSEL"` and `children: [id1, id2, ...]`, poll status, then publish

4. **Remove `storyboardUrl` references** from the `GeneratedContent` type if no longer needed

### Technical detail

Instagram carousel API flow:
1. For each image: `POST /{ig-id}/media` with `image_url`, `is_carousel_item: true` → get child container IDs
2. Poll each child until `FINISHED`
3. `POST /{ig-id}/media` with `media_type: "CAROUSEL"`, `children: [id1,id2,...]`, `caption` → carousel container ID
4. Poll carousel container until `FINISHED`
5. `POST /{ig-id}/media_publish` with `creation_id` → published

### Files modified
- `src/components/GalleryCard.tsx`
- `supabase/functions/post-to-instagram/index.ts`
- `src/lib/cinematic-data.ts` (remove `storyboardUrl` from type)

