import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import NewsSection from '@/components/NewsSection';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0;

export default async function HomePage({ params: { lang } }: { params: { lang: string } }) {
  const supabase = createClient();

  // Fetching content for different sections
  const [
    { data: heroPosts },
    { data: trendingPosts },
    { data: latestNews },
    { data: comparePosts },
    { data: guidePosts }
  ] = await Promise.all([
    // Hero (4 posts total)
    supabase.from('posts').select('*, categories!inner(*)').eq('lang', lang).eq('categories.slug', 'news').eq('is_published', true).order('created_at', { ascending: false }).limit(4),
    // Trending (Top 5)
    supabase.from('posts').select('*, categories!inner(*)').eq('lang', lang).eq('categories.slug', 'news').eq('is_published', true).order('created_at', { ascending: false }).limit(5),
    // Latest News (starting from 5th post)
    supabase.from('posts').select('*, categories!inner(*)').eq('lang', lang).eq('categories.slug', 'news').eq('is_published', true).order('created_at', { ascending: false }).range(4, 7),
    // Compare Sections
    supabase.from('posts').select('*, categories!inner(*)').eq('lang', lang).eq('is_published', true).eq('categories.slug', 'compare').order('created_at', { ascending: false }).limit(3),
    // AI Guide
    supabase.from('posts').select('*, categories!inner(*)').eq('lang', lang).eq('is_published', true).eq('categories.slug', 'guide').order('created_at', { ascending: false }).limit(3)
  ]);

  const hero = heroPosts?.[0];
  const subHeroes = heroPosts?.slice(1, 4) || [];

  return (
    <div className="min-h-screen text-black">
      {/* Trending Horizontal Scroll */}
      <div className="bg-white border-b-2 border-black overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 px-4 bg-[#ef4444] text-white font-black text-xs flex items-center z-10 skew-x-[-15deg] -ml-4 border-r-2 border-black">
          <span className="skew-x-[15deg] px-2">TRENDING NOW</span>
        </div>
        <div className="flex whitespace-nowrap py-4 pl-40 animate-[scroll_50s_linear_infinite] hover:[animation-play-state:paused]">
          {(trendingPosts || []).map((post) => (
            <Link key={post.id} href={`/${lang}/${post.categories?.slug || 'news'}/${post.slug}`} className="mx-8 font-black text-sm uppercase hover:text-[#ef4444] transition-colors">
              • {post.title}
            </Link>
          ))}
          {/* Duplicate for infinite effect */}
          {(trendingPosts || []).map((post) => (
            <Link key={`${post.id}-dup`} href={`/${lang}/${post.categories?.slug || 'news'}/${post.slug}`} className="mx-8 font-black text-sm uppercase hover:text-[#ef4444] transition-colors">
              • {post.title}
            </Link>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Magazine Header - SEO Optimized H1 */}
        <div className="mb-12 border-b-8 border-black pb-8">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-tight uppercase">
            AI News <span className="text-[#ef4444]">Today</span>
          </h1>
          <div className="flex justify-between items-center mt-4 font-black uppercase text-sm">
            <div className="flex gap-4">
              <span className="bg-black text-white px-2">Intelligence Cartography</span>
              <span className="hidden md:inline">Daily AI Ranking & Best AI Updates</span>
            </div>
          </div>
        </div>
        
        {/* Hero Section - 2 Columns (1 Big + 3 Horizontal) */}
        {hero && (
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Column 1: Main Feature */}
              <div className="lg:col-span-5">
                <div className="relative border-4 border-black group bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all h-full flex flex-col">
                  <div className="aspect-[16/10] relative overflow-hidden border-b-4 border-black">
                    <img 
                      src={hero.featured_image} 
                      alt={hero.title} 
                      className="absolute inset-0 w-full h-full object-cover   transition-all duration-500" 
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#ef4444] text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest border-2 border-black">
                        FEATURED
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow justify-center">
                    <span className="font-black text-[#ef4444] text-xs uppercase mb-2">
                      {hero.categories?.name || 'Uncategorized'}
                    </span>
                    <h2 className="text-3xl lg:text-4xl font-display font-black leading-tight tracking-tight mb-4 group-hover:text-[#ef4444] transition-colors">
                      <Link href={`/${lang}/${hero.categories?.slug || 'news'}/${hero.slug}`}>{hero.title}</Link>
                    </h2>
                    <p className="text-lg font-bold leading-relaxed mb-6 text-slate-700 line-clamp-3">
                      {hero.excerpt}
                    </p>
                    <Link 
                      href={`/${lang}/${hero.categories?.slug || 'news'}/${hero.slug}`}
                      className="mt-auto inline-block border-2 border-black px-4 py-2 bg-black text-white font-black uppercase text-xs text-center hover:bg-white hover:text-black transition-all"
                    >
                      READ REPORT
                    </Link>
                  </div>
                </div>
              </div>

              {/* Column 2: 3 Sub-features Vertical Stack (3 Rows) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {subHeroes.map((post) => (
                  <article key={post.id} className="group flex flex-col sm:flex-row border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all h-full overflow-hidden">
                    <div className="w-full sm:w-1/3 aspect-[16/9] sm:aspect-square relative overflow-hidden border-b-4 sm:border-b-0 sm:border-r-4 border-black shrink-0">
                      <img 
                        src={post.featured_image} 
                        alt={post.title} 
                        className="w-full h-full object-cover   transition-all duration-500" 
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow justify-center">
                      <span className="font-black text-[10px] text-[#ef4444] uppercase mb-1">{post.categories?.name}</span>
                      <h3 className="text-xl font-black leading-tight tracking-tight mb-2 group-hover:underline">
                        <Link href={`/${lang}/${post.categories?.slug || 'news'}/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-sm font-bold text-slate-600 line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
                      <div className="mt-auto pt-2 border-t-2 border-black/10 flex justify-between items-center text-[9px] font-black uppercase">
                         <span>{new Date(post.created_at).toLocaleDateString()}</span>
                         <span className="bg-[#ef4444] text-white px-1">NEW</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Latest News Grid */}
        <section className="mb-24">
          <SectionHeader title="Latest News" lang={lang} href={`/${lang}/news`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(latestNews || []).map((post) => (
              <article key={post.id} className="group flex flex-col">
                <div className="aspect-square border-4 border-black mb-4 overflow-hidden relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
                  <img 
                    src={post.featured_image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500  " 
                  />
                </div>
                <span className="font-black text-xs text-[#ef4444] uppercase mb-2">{post.categories?.name}</span>
                <h3 className="text-xl font-black leading-tight tracking-tight mb-4 group-hover:underline">
                  <Link href={`/${lang}/${post.categories?.slug || 'news'}/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-sm font-bold text-slate-600 line-clamp-3 mb-4 leading-relaxed">{post.excerpt}</p>
                <div className="mt-auto pt-4 border-t-2 border-black/10 flex justify-between items-center text-[10px] font-black uppercase">
                   <span>{new Date(post.created_at).toLocaleDateString()}</span>
                   <span className="bg-black text-white px-2 py-0.5">NEWS</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Compare & AI Guide - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Compare Section */}
          <section>
            <SectionHeader title="Compare AI" lang={lang} href={`/${lang}/compare`} />
            <div className="space-y-8">
              {(comparePosts || []).length > 0 ? comparePosts?.map((post) => (
                <div key={post.id} className="flex gap-6 items-start group">
                  <div className="w-24 h-24 flex-shrink-0 border-2 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                    <img src={post.featured_image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black leading-tight group-hover:text-[#ef4444]">
                      <Link href={`/${lang}/${post.categories?.slug || 'news'}/${post.slug}`}>{post.title}</Link>
                    </h4>
                    <p className="text-xs font-bold text-slate-500 mt-2 line-clamp-2">{post.excerpt}</p>
                  </div>
                </div>
              )) : (
                <div className="p-8 border-2 border-dashed border-black/20 text-center font-bold text-slate-400">
                  More comparisons coming soon.
                </div>
              )}
            </div>
          </section>

          {/* AI Guide Section */}
          <section>
            <SectionHeader title="AI Guide" lang={lang} href={`/${lang}/guide`} />
            <div className="space-y-8">
               {(guidePosts || []).length > 0 ? guidePosts?.map((post) => (
                <div key={post.id} className="flex gap-6 items-start group">
                  <div className="w-24 h-24 flex-shrink-0 border-2 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                    <img src={post.featured_image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black leading-tight group-hover:text-[#ef4444]">
                      <Link href={`/${lang}/${post.categories?.slug || 'news'}/${post.slug}`}>{post.title}</Link>
                    </h4>
                    <p className="text-xs font-bold text-slate-500 mt-2 line-clamp-2">{post.excerpt}</p>
                  </div>
                </div>
              )) : (
                <div className="p-8 border-2 border-dashed border-black/20 text-center font-bold text-slate-400">
                  New guides are being prepared.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Dynamic Category Sections */}
        <NewsSection 
          lang={lang} 
          categorySlug="ai-tools" 
          title={lang === 'vi' ? "Công Cụ AI Mới" : "Featured AI Tools"} 
          limit={4} 
        />
        
        <NewsSection 
          lang={lang} 
          categorySlug="tutorials" 
          title={lang === 'vi' ? "Hướng Dẫn Chi Tiết" : "Step-by-Step Tutorials"} 
          limit={4} 
        />
      </main>
    </div>
  );
}
