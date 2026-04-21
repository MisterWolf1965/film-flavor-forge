
## What happened

Yes — from the app/backend side, this looks like TikTok accepted the request.

The important clues are:

- Network status is `200`
- Response size is only ~86 B, which matches the function's success response shape:
  ```json
  { "ok": true, "publishId": "...", "postMode": "MEDIA_UPLOAD" }
  ```
- The UI showed “Posted to TikTok”, which only happens when the function did **not** return an error.

But because the app is still in **sandbox**, this does **not** mean a public TikTok post appears on your profile. In sandbox / `MEDIA_UPLOAD` mode, TikTok only creates a draft-like upload for the connected TikTok account. It should appear inside the TikTok mobile app flow/inbox/notifications for the same account, not as a published post.

## Likely reasons you do not see it on the phone

### 1. It is sandbox `MEDIA_UPLOAD`, not public posting
The backend logs show:

```text
postMode: MEDIA_UPLOAD
audited=false
```

That means TikTok accepted an upload initialization, but the user still has to complete/post it inside TikTok.

### 2. The UI success message is too generic
Right now the app says:

```text
Posted to TikTok!
```

That is misleading in sandbox. It should say something like:

```text
Sent to TikTok as a draft. Open the TikTok app inbox/notifications to finish posting.
```

### 3. We are not checking TikTok publish status after `publish_id`
The current function returns success immediately after TikTok gives a `publish_id`. TikTok also provides a status-check endpoint for content publishing. We should poll/query that status so the UI can show whether TikTok is still processing, failed later, or created the draft successfully.

### 4. The mobile app must be signed into the same TikTok account
The connected TikTok account appears to be the one stored in the credentials table. If the phone is logged into a different TikTok account, the upload/draft will not appear there.

## Plan

### 1. Improve the success response from `post-to-tiktok`
Update `supabase/functions/post-to-tiktok/index.ts` so success responses include clearer mode-specific fields:

```json
{
  "ok": true,
  "publishId": "...",
  "postMode": "MEDIA_UPLOAD",
  "audited": false,
  "message": "Sent to TikTok as a draft. Open the TikTok app inbox/notifications to finish posting."
}
```

For production / audited mode:

```json
{
  "ok": true,
  "publishId": "...",
  "postMode": "DIRECT_POST",
  "audited": true,
  "message": "Submitted to TikTok for publishing."
}
```

### 2. Add a TikTok publish status function
Add a new backend function:

```text
supabase/functions/tiktok-publish-status/index.ts
```

It will:

- Accept a `publishId`
- Read the stored TikTok access token
- Call TikTok's publish status endpoint
- Return structured status data to the client

Example response:

```json
{
  "ok": true,
  "publishId": "...",
  "status": "...",
  "raw": { "...": "TikTok response" }
}
```

This gives us a way to debug cases where TikTok accepts the upload init but does not surface it on the phone.

### 3. Update the TikTok button UI message
Update `src/components/GalleryCard.tsx`:

- If `postMode === "MEDIA_UPLOAD"`:
  - Show: “Sent to TikTok draft inbox. Open TikTok on the connected account to finish.”
- If `postMode === "DIRECT_POST"`:
  - Show: “Submitted to TikTok.”
- If `publishId` exists:
  - Include it in the console log for debugging.
- If status polling is available:
  - Optionally call `tiktok-publish-status` after a short delay and log/show the result.

### 4. Keep the image proxy in place
The latest logs show image URLs are now correctly wrapped through:

```text
https://film-flavor-forge.lovable.app/functions/v1/tiktok-image-proxy?src=...
```

So the previous `url_ownership_unverified` issue appears fixed. No changes needed there unless status checks reveal TikTok still cannot fetch the images.

## What you should check manually now

Before code changes, check these:

1. Open TikTok on the phone.
2. Make sure you are logged into the same TikTok account that was connected through the app.
3. Check:
   - Inbox
   - System notifications
   - Drafts
   - Upload/post creation screen
4. Do not expect it on the public profile while sandbox mode is active.

## Files to update

- `supabase/functions/post-to-tiktok/index.ts`
- `supabase/functions/tiktok-publish-status/index.ts` new
- `src/components/GalleryCard.tsx`

## Verification after implementation

1. Click TikTok post on a placeholder card.
2. Confirm the toast says it was sent as a draft, not publicly posted.
3. Confirm the response includes `publishId` and `postMode: MEDIA_UPLOAD`.
4. Query publish status using the new function.
5. Check TikTok mobile app with the same connected account.
