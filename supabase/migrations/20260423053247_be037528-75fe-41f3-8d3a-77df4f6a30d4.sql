-- Create public bucket for video uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'social-videos',
  'social-videos',
  true,
  104857600,
  ARRAY['video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read access
CREATE POLICY "Social videos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'social-videos');

-- Anyone can upload (single-admin app)
CREATE POLICY "Anyone can upload social videos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'social-videos');

-- Anyone can update/replace
CREATE POLICY "Anyone can update social videos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'social-videos');

-- Anyone can delete
CREATE POLICY "Anyone can delete social videos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'social-videos');