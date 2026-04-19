

## Problem

The "Unexpected token '<'" error happens because the request body to `post-to-tiktok` (and `post-to-instagram`) is too large. The app currently passes 5 base64 image data URLs (hero + 4 scenes, ~1–3 MB each = 5–15 MB total) directly in the JSON body. Supabase's edge gateway returns an HTML error page for oversized payloads, which the client tries to parse as JSON and fails on the leading `<`.

The post functions then re-upload those same data URLs to storage anyway — wasted work that also blows past the request limit.

## Fix

Move the storage upload to **generation time**, so generated images are stored once and only short public URLs travel through the rest of the app.

### 1. `supabase/functions/generate-image/index.ts`
- After receiving the base64 image from Lovable AI, upload it to the `instagram-images` bucket (already public) using the service-role key.
- Return `{ imageUrl: <publicUrl> }` instead of the base64 data URL.
- Keep response shape identical so callers don't change.

### 2. `supabase/functions/post-to-tiktok/index.ts`
- Skip re-upload when the incoming `imageUrls` are already `https://…supabase.co/storage/...` URLs from our bucket — pass them straight to TikTok.
- Keep the PNG→JPEG conversion path only for legacy `data:` inputs (defensive fallback).

### 3. `supabase/functions/post-to-instagram/index.ts`
- Same: detect already-hosted public URLs and skip re-upload; only handle `data:` as fallback.

### 4. Client (`GalleryCard.tsx`)
- No changes needed — it already passes `content.imageUrl` / `content.sceneImages`, which will now be public URLs.

## Why this works

- Request body shrinks from ~10 MB to ~1 KB (just five short URLs + caption), well under any gateway limit.
- TikTok and Instagram both require `PULL_FROM_URL` style hosted images anyway, so no behavior change downstream.
- Existing `instagram-images` bucket and storage policies are reused.

## Out of scope

- Security findings (RLS on credentials, anon upload policy, APP_SECRET on edge functions) — flagged in the security panel but not part of this bug.
- TikTok app audit / public posting — separate workflow.

