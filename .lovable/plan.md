

## Plan: Title overlay on first slide + TikTok posting

### 1. Add title overlay to the first carousel slide (GalleryCard.tsx)

The first image in the carousel (hero image) will get a text overlay showing the skit narrative as the title. This will be a semi-transparent dark gradient at the bottom of the image with the style label and narrative text on top.

**Changes to `src/components/GalleryCard.tsx`:**
- Wrap the first carousel item's image in a relative container
- Add an absolute-positioned overlay with a bottom gradient containing:
  - Style icon + label (e.g. "🎞️ 70s Mean Streets")
  - Skit narrative as the title text
- Apply the same overlay when there's only a single image

### 2. Add TikTok posting support

TikTok's Content Posting API allows uploading photos/videos. The flow:

**New edge function `supabase/functions/post-to-tiktok/index.ts`:**
- Accept `imageUrls` and `caption`
- Use TikTok's Photo Upload API:
  1. `POST /v2/post/publish/content/init/` with `post_info` and `source_info` containing the image URLs
  2. TikTok handles the rest (no polling needed for photo posts)
- Read TikTok access token from a `tiktok_credentials` table

**New database migration:**
- Create `tiktok_credentials` table (same pattern as `instagram_credentials`): `id`, `access_token`, `tiktok_user_id`, `token_expires_at`, `created_at`, `updated_at`
- RLS: no public policies (service_role only)

**New edge function `supabase/functions/save-tiktok-token/index.ts`:**
- Same pattern as `save-instagram-token`: accepts token + user ID, verifies against TikTok API, stores in DB

**New component `src/components/TikTokConnect.tsx`:**
- Manual token input form (same pattern as InstagramConnect)
- Status display showing connection state

**Update `src/components/GalleryCard.tsx`:**
- Add TikTok icon button next to Instagram button
- Call `post-to-tiktok` edge function with all images + caption

**Update `src/pages/Index.tsx`:**
- Add TikTokConnect component next to InstagramConnect

### Files modified
- `src/components/GalleryCard.tsx` — title overlay + TikTok button
- `supabase/functions/post-to-tiktok/index.ts` (new)
- `supabase/functions/save-tiktok-token/index.ts` (new)
- `src/components/TikTokConnect.tsx` (new)
- `src/pages/Index.tsx` — add TikTok connect
- New migration for `tiktok_credentials` table

