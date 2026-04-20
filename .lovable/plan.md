

## Diagnosis

The diagnostics from the hardened error handler now reveal the real cause:

> **TikTok upstream returned non-JSON response (HTTP 404)**

The endpoint `https://open.tiktokapis.com/v2/post/publish/inbox/photo/init/` does not exist. TikTok's `inbox/...` route only exists for **video** (`inbox/video/init/`). For **photos**, there is a single unified endpoint: `/v2/post/publish/content/init/` — and the inbox vs. direct-post behavior is controlled by the `post_mode` field in the body, not by the URL.

Confirmed against TikTok's official docs and a working community example:
- Endpoint (always): `POST /v2/post/publish/content/init/`
- Body must include `media_type: "PHOTO"` and `post_mode: "MEDIA_UPLOAD"` (sandbox/draft to inbox) or `"DIRECT_POST"` (audited public post)
- `post_info` is required even in MEDIA_UPLOAD mode (with `title`)
- `source_info.source: "PULL_FROM_URL"` + `photo_images` + `photo_cover_index`

So the previous "remove `media_type` and `post_mode`" decision was wrong for the photo route — those fields are mandatory.

## Fix

Update `supabase/functions/post-to-tiktok/index.ts`:

1. Always POST to `https://open.tiktokapis.com/v2/post/publish/content/init/` (drop the inbox URL branch).
2. Always include in the body:
   - `media_type: "PHOTO"`
   - `post_mode: "MEDIA_UPLOAD"` when unaudited, `"DIRECT_POST"` when audited
3. Keep `post_info` with `title`, `privacy_level`, `disable_comment`. For MEDIA_UPLOAD, `privacy_level` is ignored by TikTok but harmless.
4. Keep `source_info` with `source: "PULL_FROM_URL"`, `photo_images`, `photo_cover_index: 0`.
5. Keep the `readUpstream` safe parser and structured diagnostics (they just proved their worth).
6. Keep the hosted-URL pass-through (no re-upload for already-public URLs).

## Why this works

- Eliminates the 404 — we'll be hitting a real TikTok endpoint.
- Sandbox apps with `MEDIA_UPLOAD + PHOTO` land the post as a **draft in the creator's TikTok inbox** for manual publishing — exactly the documented behavior for unaudited apps.
- Once the app is audited, flipping `TIKTOK_APP_AUDITED=true` switches to `DIRECT_POST` with no other changes.

## Files to update

- `supabase/functions/post-to-tiktok/index.ts`

No DB, auth, storage, or client changes required.

## Verification

1. Click "Post to TikTok" on any card.
2. Expect a success toast with a `publish_id`.
3. Open TikTok mobile app → notifications/inbox → confirm the photo draft appears.
4. If it still fails, the structured diagnostics will now show the **real** TikTok error message instead of an HTTP 404 page.

