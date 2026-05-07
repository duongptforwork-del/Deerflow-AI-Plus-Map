import React from 'react';
import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export default async function CategoryPage({ params }: { params: { lang: string, slug: string } }) {
  const { lang, slug } = params;
  const supabase = createClient();

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!category) {
    notFound();
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('category_id', category.id)
    .eq('lang', lang)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen text-black">
      <main className="max-w-7xl mx-auto px-4 py-16">
        <header className="mb-20 border-l-[12px] border-[#ef4444] pl-8">
          <span className="text-[#ef4444] text-xs font-black uppercase tracking-widest mb-4 inline-block italic">Category Archives</span>
          <h1 className="font-display text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.8]">{category.name}</h1>
          {category.description && <p className="text-slate-700 text-2xl mt-8 max-w-3xl font-bold leading-tight">{category.description}</p>}
        </header>

        <SectionHeader title={`Latest in ${category.name}`} lang={lang} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {(posts || []).map((post) => (
            <article key={post.id} className="group flex flex-col bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="aspect-[16/10] border-b-4 border-black overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                <img src={post.featured_image || '/placeholder.png'} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8">
                <div className="text-[10px] font-black uppercase mb-4 opacity-50">
                  {new Date(post.created_at).toLocaleDateString()}
                </div>
                <h2 className="text-3xl font-black leading-none mb-6 group-hover:text-[#ef4444] tracking-tighter">
                  <Link href={`/${lang}/news/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-base font-bold text-slate-700 line-clamp-3 mb-8 leading-tight">
                  {post.excerpt}
                </p>
                <Link 
                  href={`/${lang}/news/${post.slug}`}
                  className="inline-block border-4 border-black px-6 py-3 bg-black text-white font-black text-xs uppercase hover:bg-white hover:text-black transition-all text-center w-full"
                >
                  View Full Report
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
