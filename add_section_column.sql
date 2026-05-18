-- 1. Thêm cột section vào bảng posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'news';
CREATE INDEX IF NOT EXISTS idx_posts_section ON posts(section);

-- 2. Thêm các cột phục vụ migration từ bảng events sang posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS event_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS registration_link TEXT;

-- 3. Cập nhật section cho các bài viết hiện tại dựa trên category
-- Lưu ý: Câu lệnh này giả định các slug category trùng với tên section mong muốn
UPDATE posts 
SET section = c.slug 
FROM categories c 
WHERE posts.category_id = c.id 
AND c.slug IN ('news', 'compare', 'guide');

-- 4. Migrate dữ liệu từ bảng events sang posts (nếu cần)
-- INSERT INTO posts (title, slug, content, excerpt, featured_image, lang, is_published, section, event_date, location, registration_link, created_at)
-- SELECT title, slug, '', '', '', lang, true, 'events', event_date, location, registration_link, created_at
-- FROM events;
