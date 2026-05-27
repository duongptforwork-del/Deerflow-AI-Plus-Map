import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0;

export default async function ComparePage({ 
  params: { lang }, 
  searchParams 
}: { 
  params: { lang: string }, 
  searchParams: { page?: string } 
}) {
  const currentPage = parseInt(searchParams.page || '1');
  const pageSize = 10;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createClient();
  
  let currentLang = lang;
  
  // Check if current language has any published posts in compare
  const { count: postsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('lang', lang)
    .eq('section', 'compare')
    .eq('is_published', true);
    
  if (postsCount === 0 && lang !== 'en') {
    currentLang = 'en';
  }

  // Fetch posts in 'compare' section using the new column
  const { data: posts, count } = await supabase
    .from('posts')
    .select('*, categories(*)', { count: 'exact' })
    .eq('lang', currentLang)
    .eq('section', 'compare')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(from, to);

  const heroPost = posts?.[0];
  const otherPosts = posts?.slice(1) || [];
  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header & Filter Pills */}
        <div className="mb-12">
          <SectionHeader title="Technical Showdown" lang={lang} />
          <div className="flex flex-wrap gap-3 mt-8">
            {['All', 'LLMs', 'Image Gen', 'Video Gen', 'Robotics'].map((filter) => (
              <button key={filter} className="px-6 py-2 border-2 border-black font-black uppercase text-xs bg-white hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5">
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Section */}
        {heroPost ? (
          <article className="group relative bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all mb-16 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="relative lg:w-2/3 aspect-video border-r-0 lg:border-r-4 border-black transition-all overflow-hidden">
                <Image fill src={heroPost.featured_image} alt={heroPost.title} className="w-full h-full object-cover" />
              </div>
              <div className="lg:w-1/3 p-10 flex flex-col justify-center">
                <span className="text-[#ef4444] font-black uppercase tracking-[0.2em] text-[10px] mb-4 block">✦ FEATURED COMPARISON</span>
                <h2 className="text-3xl md:text-4xl font-black leading-tight mb-6 tracking-tight group-hover:text-[#ef4444]">
                  <Link href={`/${lang}/${heroPost.categories?.slug || 'compare'}/${heroPost.slug}`}>{heroPost.title}</Link>
                </h2>
                <p className="text-lg font-bold text-slate-600 leading-relaxed mb-8">
                  {heroPost.excerpt}
                </p>
                <Link 
                  href={`/${lang}/${heroPost.categories?.slug || 'compare'}/${heroPost.slug}`}
                  className="inline-block bg-black text-white px-8 py-3 border-4 border-black font-black uppercase text-xs hover:bg-white hover:text-black transition-all text-center"
                >
                  Read Analysis
                </Link>
              </div>
            </div>
          </article>
        ) : (
          <div className="border-8 border-black bg-white p-20 text-center mb-16">
            <p className="text-3xl font-black tracking-tight">No comparisons found for {lang.toUpperCase()}</p>
          </div>
        )}

        {/* List of Comparisons */}
        {otherPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
            {otherPosts.map((post) => (
              <article key={post.id} className="group flex gap-8 items-center bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                <div className="relative w-40 h-40 flex-shrink-0 border-4 border-black overflow-hidden transition-all">
                  <Image fill src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 mb-2 block">{new Date(post.created_at).toLocaleDateString()}</span>
                  <h3 className="text-xl md:text-2xl font-black leading-tight mb-4 group-hover:text-[#ef4444]">
                    <Link href={`/${lang}/${post.categories?.slug || 'compare'}/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <Link href={`/${lang}/${post.categories?.slug || 'compare'}/${post.slug}`} className="text-xs font-black uppercase border-b-2 border-black hover:text-[#ef4444] hover:border-[#ef4444]">View Breakdown →</Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 font-black">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/${lang}/compare?page=${page}`}
                className={`w-12 h-12 border-4 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 ${
                  currentPage === page 
                    ? 'bg-[#ef4444] text-white' 
                    : 'bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                {page}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
