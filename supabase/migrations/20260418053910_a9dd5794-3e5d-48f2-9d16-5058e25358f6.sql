-- Lock down base tables: deny direct SELECT for anon/authenticated.
-- Edge functions use service_role which bypasses RLS, so writes still work.
CREATE POLICY "Deny direct select on tiktok_credentials"
  ON public.tiktok_credentials FOR SELECT
  USING (false);

CREATE POLICY "Deny direct select on instagram_credentials"
  ON public.instagram_credentials FOR SELECT
  USING (false);

-- Public-safe views exposing only non-sensitive connection status.
CREATE OR REPLACE VIEW public.tiktok_connection_status
WITH (security_invoker = on) AS
SELECT id, tiktok_user_id, token_expires_at, created_at, updated_at
FROM public.tiktok_credentials;

CREATE OR REPLACE VIEW public.instagram_connection_status
WITH (security_invoker = on) AS
SELECT id, instagram_account_id, facebook_user_id, token_expires_at, created_at, updated_at
FROM public.instagram_credentials;

-- Grant read access on the views to anon and authenticated roles.
GRANT SELECT ON public.tiktok_connection_status TO anon, authenticated;
GRANT SELECT ON public.instagram_connection_status TO anon, authenticated;

-- Allow the views (running as invoker) to read the base tables for these roles
-- via a permissive policy that only the views' restricted column set will use.
-- Since RLS still applies under security_invoker, we add SELECT policies
-- but the views deliberately omit access_token columns.
CREATE POLICY "Allow read for connection status view (tiktok)"
  ON public.tiktok_credentials FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow read for connection status view (instagram)"
  ON public.instagram_credentials FOR SELECT
  TO anon, authenticated
  USING (true);

-- The "Deny direct select" policies above and these "Allow read" policies are
-- both permissive — Postgres OR's them, so the allow wins. To truly prevent
-- direct token reads from the client, we revoke the access_token column.
REVOKE SELECT ON public.tiktok_credentials FROM anon, authenticated;
REVOKE SELECT ON public.instagram_credentials FROM anon, authenticated;
GRANT SELECT (id, tiktok_user_id, token_expires_at, created_at, updated_at)
  ON public.tiktok_credentials TO anon, authenticated;
GRANT SELECT (id, instagram_account_id, facebook_user_id, token_expires_at, created_at, updated_at)
  ON public.instagram_credentials TO anon, authenticated;

-- Drop the redundant deny policies now that column-level grants protect tokens.
DROP POLICY "Deny direct select on tiktok_credentials" ON public.tiktok_credentials;
DROP POLICY "Deny direct select on instagram_credentials" ON public.instagram_credentials;