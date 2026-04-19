
## Diagnosis

The new network details change the diagnosis:

- The client request to `post-to-tiktok` is now small (`Content-Length: 693`), so the old oversized-payload problem is no longer the active failure.
- The edge function itself returns JSON (`content-type: application/json`, body ~82 bytes), so the browser is not failing to parse HTML anymore.
- The actual HTML parse error is happening inside `supabase/functions/post-to-tiktok/index.ts` at:
  - `const result = await res.json();`
- The TikTok upstream endpoint is returning HTML, and the function is trying to parse it as JSON. That is why the UI still shows:
  - `Unexpected token '<', "<html> <h"... is not valid JSON`

## What to change

### 1. Harden `post-to-tiktok` response parsing
Update `supabase/functions/post-to-tiktok/index.ts` so it never blindly calls `res.json()`.

Implementation:
- Read `content-type` first.
- Read the response as text.
- If the response is JSON, parse it safely.
- If it is HTML or plain text, return a structured JSON error to the app with diagnostics:
  - upstream status
  - upstream content type
  - endpoint used
  - post mode used
  - first part of the response body
  - whether images were hosted URLs

This will replace the vague parse error with the real TikTok failure reason.

### 2. Align the TikTok payload with the documented shape
The current payload likely still does not match what TikTok expects for photo posting.

I will revise the payload rules in `post-to-tiktok/index.ts`:
- keep `source_info.photo_images` and `photo_cover_index`
- keep sandbox flow on the inbox/media-upload route
- remove fields TikTok may reject in the chosen mode
- use only fields confirmed for that mode
- if direct-post is used later, keep only supported `post_info` fields

Important detail from project memory:
- TikTok payload support is strict
- unsupported fields such as `description` can trigger API errors
- `title` length noted in memory differs from the current constant, so I will normalize to the documented/working limit and supported fields only

### 3. Add explicit upstream diagnostics instead of generic failure
Extend the function to return responses like:

```text
{
  ok: false,
  error: "TikTok upstream returned non-JSON response",
  diagnostics: {
    status,
    contentType,
    endpoint,
    postMode,
    responsePreview
  }
}
```

This makes future debugging immediate and prevents another blind error loop.

### 4. Preserve the small-payload fix
Keep the generation-time upload / hosted-URL flow already introduced:
- `generate-image` continues returning hosted image URLs
- `post-to-tiktok` continues skipping re-upload for hosted URLs
- `post-to-instagram` can stay as-is unless I also mirror the same safe upstream parsing there for consistency

## Expected outcome

After this change:
- the app will no longer surface the misleading HTML parse error
- we’ll see the real TikTok rejection reason in the UI/logs
- sandbox photo posting will either work, or fail with a precise actionable message
- no regression to large request bodies

## Files to update

- `supabase/functions/post-to-tiktok/index.ts`
- optionally `supabase/functions/post-to-instagram/index.ts` for the same safe upstream parsing pattern

## No backend schema changes needed

- No table changes
- No auth changes
- No storage changes

## Verification after implementation

1. Test TikTok upload with an AI-generated card
2. Test TikTok upload with a placeholder card
3. Confirm the edge function returns structured JSON in both success and failure cases
4. Confirm the UI shows the real upstream error instead of `Unexpected token '<'`
