-- Seed Core Vietnamese Categories
INSERT INTO categories (name, slug, description, type, lang) VALUES
('AI Market Trends', 'ai-market-trends', 'Cập nhật xu hướng thị trường AI mới nhất.', 'post', 'vi'),
('AI Startups & Funding', 'ai-startups-funding', 'Thông tin về các startup AI và các thương vụ gọi vốn.', 'post', 'vi'),
('Generative AI', 'generative-ai', 'Khám phá thế giới của AI tạo hình.', 'post', 'vi'),
('AI Enterprise', 'ai-enterprise', 'Ứng dụng AI trong môi trường doanh nghiệp.', 'post', 'vi')
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  lang = EXCLUDED.lang;

-- Seed Sample Posts for Vietnamese
INSERT INTO posts (title, slug, content, excerpt, featured_image, category_id, author_name, lang, is_published) 
SELECT 
  'Tương lai của NVIDIA: Bản đồ hóa kỷ nguyên tính toán', 
  'nvidia-tuong-lai-tinh-toan', 
  '<p>NVIDIA đang thống trị bối cảnh AI...</p>', 
  'Cách NVIDIA trở thành xương sống của cuộc cách mạng AI tạo hình.', 
  'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa', 
  id, 
  'Jessica', 
  'vi', 
  true 
FROM categories WHERE slug = 'ai-market-trends' AND lang = 'vi' LIMIT 1;
