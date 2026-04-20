
## What you're doing

You're moving the TikTok app out of sandbox into production/audit, and TikTok is asking you to re-verify domain ownership with two new verification files:

- `tiktokR8TQQiEu63fLMkZ1zocYU8K1cAgSQtjF.txt`
- `tiktokTtLGDBkUD07HX3MU7OS6sfCZfdGn4AL9.txt`

These must be served at the root of your verified domain so TikTok can fetch them at:

- `https://film-flavor-forge.lovable.app/tiktokR8TQQiEu63fLMkZ1zocYU8K1cAgSQtjF.txt`
- `https://film-flavor-forge.lovable.app/tiktokTtLGDBkUD07HX3MU7OS6sfCZfdGn4AL9.txt`

I checked `public/` — you already have 3 older TikTok verification files there (`tiktokjeJc...`, `tiktok7oum...`, `tiktokDQaM...`), so this is the same pattern.

## Plan

### 1. Add the two new verification files to `public/`
Copy the uploaded files into the project's `public/` folder so Vite serves them at the domain root after publish:

- `public/tiktokR8TQQiEu63fLMkZ1zocYU8K1cAgSQtjF.txt`
- `public/tiktokTtLGDBkUD07HX3MU7OS6sfCZfdGn4AL9.txt`

Each contains the single verification line TikTok provided.

### 2. Nothing else changes
- No code, edge function, DB, or config changes.
- The previous 3 verification files stay (TikTok sometimes re-checks old ones; harmless to keep).

### 3. After I make the change — what you need to do
1. **Click Publish → Update** in Lovable. Static files in `public/` only go live after a publish.
2. In your browser, open both URLs and confirm each returns the exact one-line verification string:
   - `https://film-flavor-forge.lovable.app/tiktokR8TQQiEu63fLMkZ1zocYU8K1cAgSQtjF.txt`
   - `https://film-flavor-forge.lovable.app/tiktokTtLGDBkUD07HX3MU7OS6sfCZfdGn4AL9.txt`
3. In TikTok Developer Portal, click **Verify** on each domain entry.

### 4. Heads-up about the upstream URL ownership error (separate from this verification)
The earlier `url_ownership_unverified` failure when posting placeholders won't be fixed by these verification files alone. TikTok also requires every image URL submitted via `PULL_FROM_URL` to be hosted on a verified domain. `picsum.photos` and the Supabase Storage host (`hbnpvglyoteuxrvliyxt.supabase.co`) are not your verified domain.

Once you've completed audit/production setup, the two remaining options are still:
- **Proxy images through `film-flavor-forge.lovable.app`** via an edge function (recommended, no DNS changes), or
- **Add the Supabase Storage host as an additional verified URL prefix** in the TikTok portal (only works if TikTok lets you add that host — usually it won't, since you don't own `supabase.co`).

I'll only do the file additions in this step. The proxy work is a separate follow-up once verification + audit are through.

## Files to add
- `public/tiktokR8TQQiEu63fLMkZ1zocYU8K1cAgSQtjF.txt`
- `public/tiktokTtLGDBkUD07HX3MU7OS6sfCZfdGn4AL9.txt`
