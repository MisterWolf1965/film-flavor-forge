
## Diagnosis

From the edge function logs, two attempts were just made and both went to TikTok with images on hosts TikTok does not consider verified:

- AI-generated card → `https://hbnpvglyoteuxrvliyxt.supabase.co/storage/v1/object/public/instagram-images/...`
- Placeholder card → `https://picsum.photos/seed/.../...`

You verified `film-flavor-forge.lovable.app` on TikTok, but neither `supabase.co` nor `picsum.photos` is on that domain — so TikTok still rejects with `url_ownership_unverified`. Audit/production status doesn't change this rule; even production apps must serve `PULL_FROM_URL` images from a verified host.

The only reliable fix without DNS changes is to **proxy every image through your verified domain** so TikTok fetches from `https://film-flavor-forge.lovable.app/...`.

## Plan

### 1. New edge function: `tiktok-image-proxy`
- Path: `supabase/functions/tiktok-image-proxy/index.ts`
- Public (no JWT) — needs a config block in `supabase/config.toml` with `verify_jwt = false`.
- `GET /functions/v1/tiktok-image-proxy?src=<encoded-url>`
- Server-side fetches `src`, streams bytes back with proper `Content-Type` and a long cache header.
- Allowlist hosts to prevent abuse:
  - `picsum.photos`
  - `hbnpvglyoteuxrvliyxt.supabase.co`
- Reject anything else with 400.

### 2. Update `post-to-tiktok`
- Add constant `VERIFIED_DOMAIN = "https://film-flavor-forge.lovable.app"`.
- Keep base64 → Supabase Storage upload for AI images (so we always have a stable source URL).
- Remove the "skip when already hosted" pass-through for the TikTok submission step.
- Right before building the payload, wrap every image URL:
  ```
  `${VERIFIED_DOMAIN}/functions/v1/tiktok-image-proxy?src=${encodeURIComponent(originalUrl)}`
  ```
- Submit the wrapped URLs in `source_info.photo_images`.
- Keep `readUpstream` safe parser and structured diagnostics.

### 3. No other changes
- No DB / auth / client / Instagram changes.
- Existing TikTok verification files in `public/` stay.

## Why this works
- TikTok sees only `film-flavor-forge.lovable.app` URLs — matches the verified domain.
- Proxy fetches the real bytes from `picsum.photos` or Supabase Storage server-side.
- Works in both sandbox and production once audit is approved.

## Heads-up
- App is still in sandbox (`audited=false`), so successful posts will land as **drafts in the TikTok inbox**, not public. Once audited and `TIKTOK_APP_AUDITED=true` is set, they go public via `DIRECT_POST` — no other code changes needed.
- The verified host must be the **published** `film-flavor-forge.lovable.app`, not the preview URL.

## Files
- `supabase/functions/tiktok-image-proxy/index.ts` (new)
- `supabase/config.toml` (add `[functions.tiktok-image-proxy] verify_jwt = false`)
- `supabase/functions/post-to-tiktok/index.ts` (wrap URLs through proxy)

## Verification
1. Open `https://film-flavor-forge.lovable.app/functions/v1/tiktok-image-proxy?src=https%3A%2F%2Fpicsum.photos%2F800%2F450` in a browser → should return an image.
2. Click "Post to TikTok" on a placeholder card → expect `ok: true` with `publish_id`.
3. Click "Post to TikTok" on an AI-generated card → expect the same.
4. Open TikTok app inbox → both photo drafts should appear.
