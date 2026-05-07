-- Add section column to posts table to differentiate between News, Compare, and AI Guide
-- Run this in your Supabase SQL Editor

ALTER TABLE posts ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'news';

-- Optional: Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_posts_section ON posts(section);

-- Update RLS if necessary (though the 'Enable all access for anon' policy should already cover it)
-- This ensures the new column is usable by the 'anon' role used in the admin panel.
