import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { FileText, ArrowRight } from 'lucide-react';

interface NewsSectionProps {
  categorySlug?: string;
  lang: string;
  limit?: number;
  title?: string;
}

export default async function NewsSection({ 
  categorySlug, 
  lang, 
  limit = 4,
  title = "Latest News" 
}: NewsSectionProps) {
  
  let query = supabase
    .from('posts')
    .select('*, categories!inner(*)')
    .eq('lang', lang)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error('Error fetching news:', error);
    return null;
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="mb-24">
      <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
        <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
          <FileText className="text-[#ef4444]" />
          {title}
        </h2>
        <Link 
          href={`/${lang}/news${categorySlug ? `?category=${categorySlug}` : ''}`}
          className="group flex items-center gap-2 font-black text-sm uppercase hover:text-[#ef4444] transition-colors"
        >
          View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {posts.map((post) => (
          <article key={post.id} className="group flex flex-col bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all overflow-hidden">
            <div className="aspect-[16/10] border-b-4 border-black overflow-hidden relative">
              <img 
                src={post.featured_image || 'https://images.unsplash.com/photo-1677442136019-21780ecad995'} 
                alt={post.title} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
              />
              <div className="absolute top-4 left-4">
                <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">
                  {post.categories?.name}
                </span>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-xl font-black leading-[1.1] tracking-tight mb-3 group-hover:text-[#ef4444] transition-colors line-clamp-2">
                <Link href={`/${lang}/news/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="text-sm font-bold text-slate-600 line-clamp-2 mb-4 leading-snug">
                {post.excerpt || post.content?.substring(0, 100)}...
              </p>
              <div className="mt-auto pt-4 border-t-2 border-black/5 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <Link 
                  href={`/${lang}/news/${post.slug}`}
                  className="text-xs font-black uppercase underline hover:text-[#ef4444]"
                >
                  Read More
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
