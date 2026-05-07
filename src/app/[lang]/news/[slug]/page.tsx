import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const revalidate = 0;

export async function generateStaticParams() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, lang')
    .eq('section', 'news')
    .limit(50);
    
  return posts?.map((post) => ({ 
    lang: post.lang,
    slug: post.slug 
  })) || [];
}

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export async function generateMetadata({ params: { lang, slug } }: { params: { lang: string; slug: string } }) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('lang', lang)
    .eq('section', 'news')
    .single();

  if (!post) return {};

  return {
    title: `${post.title} | AI Plus Map`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featured_image],
      type: 'article',
    },
  };
}

export default async function NewsDetailPage({ params: { lang, slug } }: { params: { lang: string; slug: string } }) {
  const supabase = createClient();

  const { data: post } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('slug', slug)
    .eq('lang', lang)
    .eq('section', 'news')
    .single();

  if (!post) return notFound();

  // Fetch related posts from the same category or same section if category is null
  let relatedQuery = supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('lang', lang)
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(3);

  if (post.category_id) {
    relatedQuery = relatedQuery.eq('category_id', post.category_id);
  } else {
    relatedQuery = relatedQuery.eq('section', post.section);
  }

  const { data: relatedPosts } = await relatedQuery;

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-black selection:bg-[#ef4444] selection:text-white">
      <Navbar lang={lang} />

      <main className="max-w-4xl mx-auto px-4 py-20">
        <article>
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#ef4444] text-white px-4 py-1 font-black text-xs uppercase tracking-widest border-2 border-black skew-x-[-10deg]">
                {post.categories?.name || 'INTELLIGENCE'}
              </span>
              <span className="font-black text-xs uppercase tracking-tighter text-slate-500">
                {new Date(post.created_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-display font-black leading-tight mb-8 tracking-tight">
              {post.title}
            </h1>
            
            <p className="text-lg md:text-xl font-bold leading-relaxed text-slate-700 border-l-8 border-black pl-8 py-2 mb-12">
              {post.excerpt}
            </p>
          </header>

          <div className="aspect-video w-full border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden mb-16">
            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover transition-all duration-700" />
          </div>

          <div className="prose prose-slate prose-lg max-w-none 
            prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight
            prose-p:font-bold prose-p:leading-relaxed prose-p:text-slate-800
            prose-strong:font-black prose-strong:text-black
            prose-em:italic prose-em:text-[#ef4444]
            prose-img:border-4 prose-img:border-black prose-img:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
            prose-blockquote:border-l-8 prose-blockquote:border-[#ef4444] prose-blockquote:bg-white prose-blockquote:p-8 prose-blockquote:font-black prose-blockquote:italic
            prose-li:font-bold
            ">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {post.content}
            </ReactMarkdown>
          </div>
          
          <div className="mt-20 pt-12 border-t-4 border-black">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border-4 border-black bg-[#ef4444] flex items-center justify-center font-black text-white text-2xl">
                  DF
                </div>
                <div>
                  <p className="font-black text-lg uppercase leading-none">AI Plus Map Team</p>
                  <p className="font-bold text-xs text-slate-500 uppercase mt-1">Research & Analysis Division</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="border-4 border-black px-6 py-2 bg-white font-black uppercase text-sm hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                  Share
                </button>
                <button className="border-4 border-black px-6 py-2 bg-black text-white font-black uppercase text-sm hover:bg-[#ef4444] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="mt-32">
            <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter mb-12 border-b-4 border-black pb-4">
              Keep Reading
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((rPost) => (
                <Link key={rPost.id} href={`/${lang}/${rPost.section || 'news'}/${rPost.slug}`} className="group">
                  <div className="aspect-square border-4 border-black mb-4 overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
                    <img src={rPost.featured_image} alt={rPost.title} className="w-full h-full object-cover   transition-all" />
                  </div>
                  <h3 className="text-xl font-black leading-none group-hover:text-[#ef4444] transition-colors">{rPost.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer lang={lang} />
    </div>
  );
}
