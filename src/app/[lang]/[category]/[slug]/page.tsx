import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export const revalidate = 0;

export async function generateStaticParams() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, lang, section');
    
  return posts?.map((post: any) => ({ 
    lang: post.lang,
    category: post.section || 'news',
    slug: post.slug 
  })) || [];
}

export async function generateMetadata({ params: { lang, category, slug } }: { params: { lang: string; category: string; slug: string } }) {
  const supabase = createClient();
  
  let { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('lang', lang)
    .single();

  if (!post && lang !== 'en') {
    const { data: fallbackPost } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('lang', 'en')
      .single();
    if (fallbackPost) {
      post = fallbackPost;
    }
  }

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

export default async function PostDetailPage({ params: { lang, category, slug } }: { params: { lang: string; category: string; slug: string } }) {
  const supabase = createClient();

  let { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('lang', lang)
    .single();

  if (!post && lang !== 'en') {
    const { data: fallbackPost } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('lang', 'en')
      .single();
    if (fallbackPost) {
      post = fallbackPost;
    }
  }

  if (!post) return notFound();

  // Strict Redirect to Section-based URL
  const actualCategory = post.section || 'news';
  if (category !== actualCategory) {
    permanentRedirect(`/${lang}/${actualCategory}/${slug}`);
  }

  // Fetch related posts from the same section
  const { data: relatedPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('lang', post.lang)
    .eq('section', post.section)
    .eq('is_published', true)
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-black selection:bg-[#ef4444] selection:text-white">
      <main className="max-w-4xl mx-auto px-4 py-20">
        <article>
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#ef4444] text-white px-4 py-1 font-black text-xs uppercase tracking-widest border-2 border-black skew-x-[-10deg]">
                {post.section?.toUpperCase() || 'INTELLIGENCE'}
              </span>
              <span className="font-black text-xs uppercase tracking-tighter text-slate-500">
                {new Date(post.created_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-black leading-tight mb-8 tracking-tight">
              {post.title}
            </h1>
            
            <p className="text-lg md:text-xl font-bold leading-relaxed text-slate-700 border-l-8 border-black pl-8 py-2 mb-12">
              {post.excerpt}
            </p>
          </header>

          <div className="aspect-video w-full border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden mb-16">
            <Image fill src={post.featured_image} alt={post.title} className="w-full h-full object-cover transition-all duration-700" />
          </div>

          <div className="article-content max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {post.content && !post.content.includes('\n\n') 
                ? post.content.replace(/\n/g, '\n\n') 
                : post.content}
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
                    <Image fill src={rPost.featured_image} alt={rPost.title} className="w-full h-full object-cover transition-all" />
                  </div>
                  <h3 className="text-xl font-black leading-none group-hover:text-[#ef4444] transition-colors">{rPost.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
