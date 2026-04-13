

## Problem

TikTok OAuth fails because the `redirect_uri` sent during authorization doesn't match what's registered in the TikTok Developer Portal. The app currently uses `window.location.origin` which produces the preview URL, but TikTok requires an exact match with the registered redirect URI.

## Solution

1. **Update `TikTokConnect.tsx`** to use a fixed, known redirect URI that matches what you register in TikTok's developer portal — instead of dynamically using `window.location.origin`.

2. **You need to register the correct redirect URI in your TikTok Developer Portal.** The URI must be your app's published or preview URL. Based on your project, this would be:
   - `https://id-preview--1af35119-4342-493f-8daf-ef2156282097.lovable.app/`

   Go to [TikTok Developer Portal](https://developers.tiktok.com/) → your app → Login Kit → **Redirect URI** → add the exact URL above.

3. **Update the edge function** (`tiktok-oauth-callback`) to also use the same fixed redirect URI when exchanging the code, since TikTok requires the redirect_uri to match in both the authorize and token exchange steps.

## Changes

### `src/components/TikTokConnect.tsx`
- Hardcode the redirect URI to match the registered one in TikTok's portal
- Keep the auto-detection of `code` param from URL on redirect

### `supabase/functions/tiktok-oauth-callback/index.ts`
- Use the same hardcoded redirect URI for the token exchange (instead of accepting it from the client)

## Important note
The redirect URI registered in TikTok's developer portal must match **character for character** — including trailing slashes. If your other app is already using this redirect URI slot, you may need to update TikTok's settings to allow multiple redirect URIs (TikTok supports multiple).

