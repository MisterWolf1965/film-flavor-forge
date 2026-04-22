
## Diagnosis

The current TikTok photo request is invalid for the API shape now used in `post-to-tiktok`.

The logs show the app is sending:

```json
{
  "media_type": "PHOTO",
  "post_mode": "MEDIA_UPLOAD",
  "source_info": {
    "source": "FILE_UPLOAD",
    "photo_cover_index": 0,
    "photo_count": 5
  }
}
```

For TikTok photo posting, the documented `content/init` payload expects `source_info.source = "PULL_FROM_URL"` with a `photo_images` array. That matches the error you are seeing:

```text
The request source info is empty or incorrect
```

So the current `FILE_UPLOAD` workaround is not accepted for photo posts in this flow.

There is also a second blocker: the previously verified published-domain proxy path served the app HTML instead of raw image bytes, so even the earlier `PULL_FROM_URL` attempt could not succeed reliably.

## Plan

### 1. Restore TikTok photo posting to the compliant request format
Update `supabase/functions/post-to-tiktok/index.ts` to stop sending `FILE_UPLOAD` for `media_type: "PHOTO"`.

New request shape:

```json
{
  "media_type": "PHOTO",
  "post_mode": "MEDIA_UPLOAD",
  "source_info": {
    "source": "PULL_FROM_URL",
    "photo_cover_index": 0,
    "photo_images": ["https://...jpg", "..."]
  }
}
```

Keep the current JPEG normalization step so every generated image is converted to a clean `.jpg` first.

### 2. Remove the dead `FILE_UPLOAD` branch for photos
Simplify the function so it does not:
- request upload URLs
- send binary `PUT` uploads
- treat photo posts like video uploads

That logic is creating an invalid source payload and should be removed for TikTok photo publishing.

### 3. Reintroduce a verified, crawler-safe URL path
Use a TikTok-verifiable public URL for each normalized JPEG. The app already has the root verification file in `public/`, so the remaining work is to make sure the URLs passed to TikTok return raw image bytes instead of the SPA HTML shell.

Implementation target:
- use a dedicated TikTok image proxy URL only if it resolves to actual image bytes on the published domain
- otherwise use a domain/path that TikTok can verify and fetch directly

Because the current published `/functions/v1/...` path is being intercepted by the site shell, this step may require changing how the proxy is exposed, not just changing the TikTok payload.

### 4. Add a hard fail with actionable diagnostics
If the function cannot produce a compliant `photo_images` array on a verified fetchable domain, return a clear error instead of a false-success draft message.

The response should explain whether the failure is:
- invalid TikTok payload shape
- non-image proxy response
- unverified URL source
- sandbox/audit limitation

### 5. Improve the UI message so success means actual acceptance
Update `src/components/GalleryCard.tsx` so the success toast is only shown after TikTok accepts the compliant init request.

If the backend returns a validation/domain error, surface that directly in the toast instead of showing “Sent to TikTok as a draft”.

### 6. Surface sandbox/audit state separately
Keep the sandbox hint, but separate it from transport errors.

Current issue:
- payload/domain problem

Separate optional issue:
- unaudited app means drafts/private only

That avoids implying audit is the reason for the current `source_info` failure.

## Required external dependency

A full fix depends on having a TikTok-verifiable image URL source that serves raw image bytes on the same verified domain family.

Right now:
- the verification file exists at the site root
- but the previously used published proxy path returned HTML instead of the image

If that routing limitation cannot be solved inside the project’s published hosting setup, the reliable fallback is to use a custom verified domain that can serve the normalized JPEGs directly.

## Files to update

- `supabase/functions/post-to-tiktok/index.ts`
- `src/components/GalleryCard.tsx`
- `supabase/functions/tiktok-image-proxy/index.ts` only if the proxy path is kept and can be made to return raw bytes on the published domain

## Verification

1. Post an AI-generated carousel again.
2. Confirm the backend log payload uses:
   ```json
   "source_info": {
     "source": "PULL_FROM_URL",
     "photo_images": [...]
   }
   ```
3. Confirm every URL in `photo_images` opens as a real JPEG response, not HTML.
4. Confirm TikTok returns a real `publish_id` without the `source info is empty or incorrect` error.
5. Confirm the status endpoint no longer reports immediate request validation failure.
6. In sandbox mode, confirm the draft appears in the connected TikTok app inbox.

## Expected outcome

The TikTok request will stop failing at validation time because it will use the API’s expected photo-post format again, and the app will only report success after TikTok accepts a valid `PULL_FROM_URL` photo payload backed by real fetchable JPEG URLs.
