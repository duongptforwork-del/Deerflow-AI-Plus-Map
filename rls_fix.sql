-- RLS SECURITY FIXES FOR ADMIN OPERATIONS (CUSTOM AUTH)
-- Execute this in the Supabase SQL Editor to resolve "new row violates row-level security policy" errors.

-- 1. FIX CATEGORIES TABLE
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for categories" ON categories;
DROP POLICY IF EXISTS "Admin CRUD for categories" ON categories;

CREATE POLICY "Enable all access for anon" ON categories 
FOR ALL TO anon 
USING (true) 
WITH CHECK (true);

-- 2. FIX POSTS TABLE
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public access for posts" ON posts;
DROP POLICY IF EXISTS "Admin CRUD for posts" ON posts;

CREATE POLICY "Enable all access for anon" ON posts 
FOR ALL TO anon 
USING (true) 
WITH CHECK (true);

-- 3. FIX STORAGE BUCKET: article-images
-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy: Allow Public Read
CREATE POLICY "Public Select article-images"
ON storage.objects FOR SELECT TO anon
USING ( bucket_id = 'article-images' );

-- Policy: Allow Anon Insert (Required for client-side uploads with custom auth)
CREATE POLICY "Anon Insert article-images"
ON storage.objects FOR INSERT TO anon
WITH CHECK ( bucket_id = 'article-images' );

-- Policy: Allow Anon Update
CREATE POLICY "Anon Update article-images"
ON storage.objects FOR UPDATE TO anon
USING ( bucket_id = 'article-images' );

-- Policy: Allow Anon Delete
CREATE POLICY "Anon Delete article-images"
ON storage.objects FOR DELETE TO anon
USING ( bucket_id = 'article-images' );
