-- Create storage bucket for instagram images
INSERT INTO storage.buckets (id, name, public) VALUES ('instagram-images', 'instagram-images', true);

-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'instagram-images');

-- Allow authenticated and anon insert (edge function uses service role anyway)
CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'instagram-images');