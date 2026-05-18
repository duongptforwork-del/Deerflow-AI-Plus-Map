-- 1. Migrate legacy events to the new unified posts table
INSERT INTO posts (
  title, 
  slug, 
  content, 
  featured_image, 
  lang, 
  is_published, 
  created_at, 
  section, 
  event_date, 
  location, 
  author_name
)
SELECT 
  title, 
  slug, 
  content, 
  featured_image, 
  lang, 
  is_published, 
  created_at, 
  'events' as section, 
  event_date, 
  location, 
  'System' as author_name
FROM events;

-- 2. Populate section column for existing posts based on category name
-- (Assuming categories are 'News', 'Compare', 'Guide')
UPDATE posts p
SET section = LOWER(c.name)
FROM categories c
WHERE p.category_id = c.id
AND p.section IS NULL;

-- 3. Cleanup: Drop legacy tables and columns
-- WARNING: Run these only after verifying data migration!
-- DROP TABLE events;
-- DROP TABLE categories;
-- ALTER TABLE posts DROP COLUMN category_id;
