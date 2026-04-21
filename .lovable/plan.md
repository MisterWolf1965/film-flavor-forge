
## What the new TikTok status means

TikTok is no longer rejecting the URL ownership. It is successfully receiving the verified-domain URLs and then failing during its media validation step with:

```text
file_format_check_failed
```

For this AI-generated upload, the source image is:

```text
gen-1776754605421-5amh50j1.png
```

The current code stores AI-generated images as PNG files and, because they are already public hosted URLs, `post-to-tiktok` passes them through unchanged before wrapping them in the verified-domain proxy. The existing PNG-to-JPEG conversion only runs for base64 `data:` images, not for already-hosted storage URLs.

So the likely fix is: before sending any image to TikTok, normalize it into a TikTok-safe JPEG file, then proxy that JPEG through the verified domain.

## Plan

### 1. Add TikTok-specific image normalization in `post-to-tiktok`

Update `supabase/functions/post-to-tiktok/index.ts` so every image is converted into a fresh JPEG public URL before being sent to TikTok.

The updated flow will be:

```text
input image URL/data URL
→ fetch or decode bytes
→ validate it is an image
→ decode with ImageScript
→ convert to RGB JPEG
→ upload as .jpg with content-type image/jpeg
→ wrap the JPEG URL through tiktok-image-proxy
→ submit to TikTok
```

This fixes the current gap where hosted `.png` AI images bypass conversion.

### 2. Replace `ensureJpegPublicUrl` with a stronger implementation

Current behavior:

```text
data URL PNG → converts to JPEG
hosted URL PNG → returns as-is
```

New behavior:

```text
data URL PNG/JPEG/WebP if decodable → upload normalized JPEG
hosted URL PNG/JPEG/WebP if decodable → fetch, decode, upload normalized JPEG
```

Implementation details:
- For hosted URLs, fetch the image server-side.
- Reject non-image content types early.
- Decode the image with `imagescript`.
- Encode to JPEG at around quality `90`.
- Upload to the existing public `instagram-images` bucket with a `tt-...jpg` filename.
- Return the newly uploaded JPEG public URL.

### 3. Keep the verified-domain proxy

After normalization, still wrap the JPEG storage URL through:

```text
https://film-flavor-forge.lovable.app/functions/v1/tiktok-image-proxy?src=...
```

This keeps the URL ownership fix intact while also satisfying TikTok’s media format validation.

### 4. Add diagnostics to confirm what TikTok receives

In `post-to-tiktok`, log useful non-secret diagnostics:

```text
original image URL host/path
detected source content-type
normalized JPEG storage URL
number of images submitted
postMode
publishId
```

Do not log access tokens or secrets.

### 5. Optionally harden the proxy response headers

Update `supabase/functions/tiktok-image-proxy/index.ts` to make TikTok’s crawler see the image more clearly:

- Preserve `Content-Type: image/jpeg` for normalized TikTok images.
- Add `Content-Length` when available.
- Add a simple `HEAD` handler that returns image headers without streaming the full body, in case TikTok probes URLs before fetching them.

### 6. Improve the UI failure message slightly

Update `src/components/GalleryCard.tsx` so if TikTok returns:

```text
file_format_check_failed
```

the toast says something more actionable:

```text
TikTok rejected the image format. I’m converting uploads to JPEG and retrying should fix this.
```

After the normalization fix, this toast should no longer appear, but it will be clearer if TikTok rejects another file.

## Files to update

- `supabase/functions/post-to-tiktok/index.ts`
- `supabase/functions/tiktok-image-proxy/index.ts`
- `src/components/GalleryCard.tsx`

## Verification after implementation

1. Post the AI-generated image again.
2. Confirm the `post-to-tiktok` logs show `.jpg` normalized images, not `.png`.
3. Confirm the payload still uses `film-flavor-forge.lovable.app/functions/v1/tiktok-image-proxy`.
4. Confirm `tiktok-publish-status` no longer returns `file_format_check_failed`.
5. Since the app is still in sandbox, confirm the result appears as a TikTok draft/inbox item rather than a public profile post.

## Expected outcome

TikTok should accept the AI-generated images because it receives verified-domain URLs pointing to normalized JPEG files instead of raw AI-generated PNGs.
