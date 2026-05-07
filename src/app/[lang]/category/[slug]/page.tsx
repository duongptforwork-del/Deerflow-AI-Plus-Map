import React from 'react';
import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export default async function CategoryPage({ params }: { params: { lang: string, slug: string } }) {
  const { lang, slug } = params;
  const supabase = createClient();

  // Fix: Added .eq('lang', lang) to prevent PGRST116 (multiple rows) when slugs are identical across languages
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('lang', lang)
    .single();

  if (catError || !category) {
    notFound();
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('category_id', category.id)
    .eq('lang', lang)
    .eq('section', 'news')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const hasPosts = posts && posts.length > 0;
  const emptyMessage = lang === 'vi' 
    ? 'Hiện tại chưa có bài viết nào trong danh mục này.' 
    : 'No reports found in this category yet.';

  return (
    <div className="min-h-screen text-black">
      <main className="max-w-7xl mx-auto px-4 py-16">
        <header className="mb-20 border-l-[12px] border-[#ef4444] pl-8">
          <span className="text-[#ef4444] text-xs font-black uppercase tracking-widest mb-4 inline-block">Category Archives</span>
          <h1 className="font-display text-4xl lg:text-5xl font-black tracking-tight leading-tight">{category.name}</h1>
          {category.description && <p className="text-slate-700 text-lg md:text-xl mt-8 max-w-3xl font-bold leading-relaxed">{category.description}</p>}
        </header>

        <SectionHeader title={lang === 'vi' ? `Tin mới nhất về ${category.name}` : `Latest in ${category.name}`} lang={lang} />
        
        {hasPosts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.map((post) => (
              <article key={post.id} className="group flex flex-col bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                <div className="aspect-[16/10] border-b-4 border-black overflow-hidden   transition-all duration-500">
                  <img src={post.featured_image || '/placeholder.png'} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-8">
                  <div className="text-[10px] font-black uppercase mb-4 opacity-50">
                    {new Date(post.created_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                  </div>
                  <h2 className="text-2xl font-black leading-tight mb-6 group-hover:text-[#ef4444] tracking-tight">
                    <Link href={`/${lang}/${post.section || 'news'}/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-base font-bold text-slate-700 line-clamp-3 mb-8 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <Link 
                    href={`/${lang}/${post.section || 'news'}/${post.slug}`}
                    className="inline-block border-4 border-black px-6 py-3 bg-black text-white font-black text-xs uppercase hover:bg-white hover:text-black transition-all text-center w-full"
                  >
                    {lang === 'vi' ? 'Xem chi tiết' : 'View Full Report'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-slate-100 border-4 border-dashed border-slate-300 p-20 text-center">
            <p className="text-2xl font-bold text-slate-500 uppercase italic tracking-tight">
              {emptyMessage}
            </p>
            <div className="mt-12">
              <Link 
                href={`/${lang}`}
                className="inline-block border-4 border-black px-12 py-4 bg-white text-black font-black text-sm uppercase hover:bg-black hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-x-1 active:translate-y-1"
              >
                {lang === 'vi' ? 'Quay lại trang chủ' : 'Back to Home'}
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
