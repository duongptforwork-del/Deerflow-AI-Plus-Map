import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { ArrowRight } from 'lucide-react';

interface NewsSectionProps {
  section?: string;
  lang: string;
  limit?: number;
  title?: string;
}

export default async function NewsSection({ 
  section = 'news', 
  lang, 
  limit = 4,
  title = "Latest News" 
}: NewsSectionProps) {
  
  const supabase = createClient();

  // Refactored: Removed categories join, filtering by section directly
  let query = supabase
    .from('posts')
    .select('*')
    .eq('lang', lang)
    .eq('section', section)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  const { data: posts, error } = await query;

  if (error) {
    console.error('Error fetching section posts:', error);
    return null;
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="mb-24">
      <div className="flex items-center justify-between mb-10 border-b-4 border-black pb-4">
        <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight flex items-center gap-3">
          {title}
        </h2>
        <Link 
          href={`/${lang}/${section}`}
          className="group flex items-center gap-2 font-black text-sm uppercase hover:text-[#ef4444] transition-colors"
        >
          {( {
            vi: 'Xem Tất Cả', en: 'View All', ko: '전체보기', ja: 'すべて見る', fr: 'Voir Tout'
          }[lang] || 'View All' )} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {posts.map((post) => (
          <article key={post.id} className="group flex flex-col bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-yellow-50 transition-all overflow-hidden">
            <div className="aspect-[16/10] border-b-4 border-black overflow-hidden relative">
              <img 
                src={post.featured_image || 'https://images.unsplash.com/photo-1677442136019-21780ecad995'} 
                alt={post.title} 
                className="w-full h-full object-cover transition-all duration-500" 
              />
              <div className="absolute top-4 left-4">
                <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">
                  {post.section?.toUpperCase() || 'NEWS'}
                </span>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-xl font-black leading-tight tracking-tight mb-3 group-hover:text-[#ef4444] transition-colors line-clamp-2">
                <Link href={`/${lang}/${post.section || 'news'}/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="text-sm font-bold text-black/80 line-clamp-2 mb-4 leading-relaxed">
                {post.excerpt || post.content?.substring(0, 100)}...
              </p>
              <div className="mt-auto pt-4 border-t-2 border-black/10 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-black/50">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <Link 
                  href={`/${lang}/${post.section || 'news'}/${post.slug}`}
                  className="text-xs font-black uppercase underline hover:text-[#ef4444]"
                >
                  {( {
                    vi: 'Đọc Tiếp', en: 'Read More', ko: '자세히 보기', ja: '続きを読む', fr: 'Lire Plus'
                  }[lang] || 'Read More' )}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
