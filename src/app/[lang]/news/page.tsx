import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import LoadMoreNews from '@/components/news/LoadMoreNews';

export const revalidate = 0;

export default async function NewsPage({ 
  params: { lang }
}: { 
  params: { lang: string }
}) {
  const supabase = createClient();
  
  let currentLang = lang;
  
  // Check if current language has any published posts in news
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('lang', lang)
    .eq('section', 'news')
    .eq('is_published', true);
    
  if (count === 0 && lang !== 'en') {
    currentLang = 'en';
  }

  // 1. Fetch 5 latest for Hero and Top Stories
  const { data: topFive } = await supabase
    .from('posts')
    .select('*, categories(slug, name)')
    .eq('lang', currentLang)
    .eq('section', 'news')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(5);

  const heroPost = topFive?.[0];
  const topStories = topFive?.slice(1) || [];

  // 2. Fetch next 8 for the Latest feed
  const { data: initialLatest } = await supabase
    .from('posts')
    .select('*, categories(slug, name)')
    .eq('lang', currentLang)
    .eq('section', 'news')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(5, 12); // 6th to 13th

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Breaking News Ticker */}
      <div className="bg-black text-white border-y-4 border-black py-2 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee uppercase font-black text-xs tracking-[0.2em]">
          ✦ BREAKING: THE INTELLIGENCE CARTOGRAPHY UPDATED ✦ AI PLUS MAP V2.0 DEPLOYED ✦ NEW SECTION ARCHITECTURE ACTIVE ✦ NO NOISE, JUST MAPS ✦
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero & Top Stories Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
          {/* Main Hero */}
          <div className="lg:col-span-2 group relative bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            {heroPost ? (
              <>
                <div className="aspect-[16/9] border-b-4 border-black overflow-hidden bg-slate-100">
                  <img 
                    src={heroPost.featured_image || '/placeholder.png'} 
                    alt={heroPost.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="p-8">
                  <span className="inline-block bg-[#ef4444] text-white px-4 py-1 text-xs font-black uppercase tracking-widest border-2 border-black mb-6 skew-x-[-10deg]">
                    {heroPost.categories?.name || 'INTELLIGENCE'}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6 tracking-tighter group-hover:text-[#ef4444] transition-colors">
                    <Link href={`/${lang}/${heroPost.categories?.slug || 'news'}/${heroPost.slug}`}>{heroPost.title}</Link>
                  </h1>
                  <p className="text-lg font-bold text-slate-800 leading-relaxed mb-8 line-clamp-3">
                    {heroPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>BY {heroPost.author_name || 'Sếp'}</span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                    <span>{new Date(heroPost.created_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-20 text-center font-black uppercase opacity-20 text-4xl">No Hero Post</div>
            )}
          </div>

          {/* Top Stories List */}
          <div className="flex flex-col">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter border-b-8 border-black pb-4 mb-8">
              Top Stories
            </h3>
            <div className="space-y-8 flex-grow">
              {topStories.map((post) => (
                <div key={post.id} className="group flex gap-6 items-start border-b-2 border-black/10 pb-8 last:border-0">
                  <div className="w-24 h-24 flex-shrink-0 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all bg-white overflow-hidden">
                    <img src={post.featured_image || '/placeholder.png'} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <span className="text-[10px] font-black uppercase text-[#ef4444] mb-1 block tracking-wider">
                      {post.categories?.name || 'TRENDING'}
                    </span>
                    <h4 className="font-black leading-tight text-lg group-hover:text-[#ef4444] transition-colors line-clamp-2">
                      <Link href={`/${lang}/${post.categories?.slug || 'news'}/${post.slug}`}>{post.title}</Link>
                    </h4>
                    <span className="text-[9px] font-bold uppercase text-slate-400 mt-2 block">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {topStories.length === 0 && <div className="text-slate-300 font-black uppercase py-10">Searching for news...</div>}
            </div>
          </div>
        </div>

        {/* Latest Feed Section */}
        <section className="mb-20">
          <div className="flex items-center justify-between border-b-8 border-black mb-12 pb-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Latest Intel</h2>
            <div className="hidden md:flex gap-2">
              <div className="w-3 h-3 bg-black"></div>
              <div className="w-3 h-3 bg-black"></div>
              <div className="w-3 h-3 bg-[#ef4444]"></div>
            </div>
          </div>
          
          <LoadMoreNews 
            initialPosts={initialLatest || []} 
            lang={lang} 
            queryLang={currentLang}
            startOffset={13} 
          />
        </section>

        {/* Newsletter Box */}
        <div className="bg-black border-8 border-white p-12 text-center shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] mb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 font-black text-9xl text-white select-none">MAP</div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-6 italic">Subscribe to the Map</h2>
            <p className="text-slate-400 font-bold text-xl mb-10 max-w-2xl mx-auto uppercase">The most critical AI intelligence delivered daily. No noise, just maps.</p>
            <div className="flex flex-col sm:flex-row gap-0 max-w-xl mx-auto border-4 border-white">
              <input 
                type="email" 
                placeholder="YOUR EMAIL" 
                className="flex-grow bg-transparent text-white p-6 font-black text-sm focus:outline-none placeholder:text-slate-600"
              />
              <button className="bg-white text-black px-12 py-6 font-black uppercase text-sm hover:bg-[#ef4444] hover:text-white transition-all border-l-4 border-white">
                Access Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
