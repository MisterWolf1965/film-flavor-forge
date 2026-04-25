-- Lock down credential tables: only service-role (edge functions) can read
DROP POLICY IF EXISTS "Allow read for connection status view (instagram)" ON public.instagram_credentials;
DROP POLICY IF EXISTS "Allow read for connection status view (tiktok)" ON public.tiktok_credentials;

-- Remove public/anon write access to storage buckets
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload social videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update social videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete social videos" ON storage.objects;