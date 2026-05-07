import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import { createClient } from '@/utils/supabase/server';

export default async function NewsPage({ 
  params: { lang }, 
  searchParams 
}: { 
  params: { lang: string }, 
  searchParams: { page?: string } 
}) {
  const supabase = createClient();
  
  // 1. Fetch Featured Hero (Latest 1)
  const { data: heroPost } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('lang', lang)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // 2. Fetch Top Stories (Next 4)
  const { data: topStories } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('lang', lang)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(1, 4);

  // 3. Fetch Categories and their latest posts (Simulated for this design)
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('lang', lang)
    .limit(4);

  const postsByCategories = await Promise.all(
    (categories || []).map(async (cat) => {
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('lang', lang)
        .eq('category_id', cat.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(4);
      return { ...cat, posts: posts || [] };
    })
  );

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Breaking News Ticker (Simulated) */}
      <div className="bg-black text-white border-y-4 border-black py-2 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee uppercase font-black text-xs tracking-[0.2em]">
          ✦ BREAKING: THE INTELLIGENCE CARTOGRAPHY UPDATED ✦ AI PLUS MAP V2.0 DEPLOYED ✦ NEW CATEGORIES ADDED: PHYSICAL AI, AGENTIC WORKFLOWS ✦
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* 2. Hero & Top Stories Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Main Hero */}
          <div className="lg:col-span-2 group relative bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            {heroPost && (
              <>
                <div className="aspect-[16/9] border-b-4 border-black overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                  <img src={heroPost.featured_image || '/placeholder.png'} alt={heroPost.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                  <span className="inline-block bg-[#ef4444] text-white px-4 py-1 text-xs font-black uppercase tracking-widest border-2 border-black mb-6">
                    {heroPost.categories?.name || 'Uncategorized'}
                  </span>
                  <h1 className="text-5xl font-black leading-[0.9] mb-6 tracking-tighter group-hover:text-[#ef4444] transition-colors">
                    <Link href={`/${lang}/news/${heroPost.slug}`}>{heroPost.title}</Link>
                  </h1>
                  <p className="text-xl font-bold text-slate-800 leading-tight mb-8 line-clamp-3">
                    {heroPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-black uppercase">
                    <span>BY {heroPost.author_name || heroPost.author || 'Sếp'}</span>
                    <span className="w-2 h-2 bg-black rounded-full"></span>
                    <span>{new Date(heroPost.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Top Stories List */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black uppercase italic border-b-4 border-black pb-2 mb-6">Top Stories</h3>
            {(topStories || []).map((post) => (
              <div key={post.id} className="group flex gap-4 items-start border-b-2 border-black pb-6 last:border-0">
                <div className="w-24 h-24 flex-shrink-0 border-2 border-black grayscale group-hover:grayscale-0 transition-all">
                  <img src={post.featured_image || '/placeholder.png'} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#ef4444] mb-1 block">
                    {post.categories?.name}
                  </span>
                  <h4 className="font-black leading-none group-hover:underline decoration-2">
                    <Link href={`/${lang}/news/${post.slug}`}>{post.title}</Link>
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Category Blocks (Mimicking artificialintelligence-news.com) */}
        {postsByCategories.map((catSection) => (
          <section key={catSection.id} className="mb-20">
            <div className="flex justify-between items-end border-b-8 border-black mb-10 pb-4">
              <h2 className="text-6xl font-black uppercase tracking-tighter italic leading-none">{catSection.name}</h2>
              <Link href={`/${lang}/category/${catSection.slug}`} className="font-black uppercase text-sm bg-black text-white px-6 py-2 hover:bg-[#ef4444] transition-colors">
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {catSection.posts.map((post) => (
                <article key={post.id} className="group flex flex-col">
                  <div className="aspect-square border-4 border-black mb-6 grayscale group-hover:grayscale-0 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1">
                    <img src={post.featured_image || '/placeholder.png'} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-black leading-[1.1] tracking-tight group-hover:text-[#ef4444]">
                    <Link href={`/${lang}/news/${post.slug}`}>{post.title}</Link>
                  </h3>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* 4. Newsletter Box */}
        <div className="bg-[#ef4444] border-4 border-black p-12 text-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] mb-20">
          <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-4">Subscribe to the Map</h2>
          <p className="text-black font-bold text-xl mb-8 max-w-2xl mx-auto">Get the most critical AI intelligence delivered to your inbox every morning. No noise, just maps.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input 
              type="email" 
              placeholder="ENTER YOUR EMAIL" 
              className="flex-grow border-4 border-black p-4 font-black text-sm focus:outline-none"
            />
            <button className="bg-black text-white px-10 py-4 font-black uppercase text-sm border-4 border-black hover:bg-white hover:text-black transition-all">
              Join Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
