---
name: Security model
description: APP_SECRET shared-secret protects all sensitive edge functions and storage uploads
type: feature
---
- All sensitive edge functions require an `x-app-secret` header that matches the runtime `APP_SECRET` secret. Functions covered: `generate-image`, `instagram-status`, `tiktok-status`, `post-to-instagram`, `post-to-tiktok`, `post-video-to-instagram`, `post-video-to-tiktok`, `save-instagram-token`, `save-tiktok-token`, `tiktok-publish-status`, `tiktok-oauth-callback`, `upload-social-video`.
- Public-by-design: `facebook-oauth-callback` (OAuth redirect), `tiktok-image-proxy` (host-allowlisted proxy).
- Frontend uses `invokeSecureFunction` / `postSecureFormData` from `src/integrations/supabase/secureInvoke.ts` which read `import.meta.env.VITE_APP_SECRET`. The user must add `VITE_APP_SECRET` as a workspace **build secret** with the same value as the runtime `APP_SECRET`.
- Credential tables (`instagram_credentials`, `tiktok_credentials`) have no SELECT policy — only edge functions (service role) can read. Status reads route through `instagram-status` / `tiktok-status` edge functions.
- Storage: `instagram-images` and `social-videos` are public-read only. All writes (upload/update/delete) happen server-side via the service role inside edge functions. Client video uploads call `upload-social-video`.
