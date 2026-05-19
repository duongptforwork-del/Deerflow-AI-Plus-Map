import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import NewsSection from '@/components/NewsSection';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0;

export default async function HomePage({ params: { lang } }: { params: { lang: string } }) {
  const supabase = createClient();

  // Mapping for translations
  const t = {
    trending: {
      vi: 'XU HƯỚNG', en: 'TRENDING NOW', ko: '실시간 트렌드', ja: 'トレンド', fr: 'TENDANCES NOW'
    }[lang] || 'TRENDING NOW',
    featured: {
      vi: 'NỔI BẬT', en: 'FEATURED', ko: '추천', ja: '注目', fr: 'À LA UNE'
    }[lang] || 'FEATURED',
    read_report: {
      vi: 'XEM CHI TIẾT', en: 'READ REPORT', ko: '상세보기', ja: '詳細を見る', fr: 'LIRE LE RAPPORT'
    }[lang] || 'READ REPORT',
    latest_news: {
      vi: 'Tin Mới Nhất', en: 'Latest News', ko: '최신 뉴스', ja: '最新ニュース', fr: 'Dernières Nouvelles'
    }[lang] || 'Latest News',
    compare_ai: {
      vi: 'So Sánh AI', en: 'Compare AI', ko: 'AI 비교', ja: 'AIの比較', fr: 'Comparer l\'AI'
    }[lang] || 'Compare AI',
    ai_guide: {
      vi: 'Cẩm Nang AI', en: 'AI Guide', ko: 'AI 가이드', ja: 'AIガイド', fr: 'Guide de l\'AI'
    }[lang] || 'AI Guide',
    ai_events: {
      vi: 'Sự Kiện AI', en: 'AI Events', ko: 'AI 이벤트', ja: 'AIイベント', fr: 'Événements AI'
    }[lang] || 'AI Events',
    new: {
      vi: 'MỚI', en: 'NEW', ko: '신규', ja: '新規', fr: 'NOUVEAU'
    }[lang] || 'NEW',
    see_all: {
      vi: 'XEM TẤT CẢ', en: 'SEE ALL', ko: '전체보기', ja: 'すべて見る', fr: 'VOIR TOUT'
    }[lang] || 'SEE ALL',
    no_events: {
      vi: 'Chưa có sự kiện nào sắp tới', en: 'No upcoming events scheduled', ko: '예정된 이벤트가 없습니다', ja: '今後のイベント予定はありません', fr: 'Aucun événement à venir'
    }[lang] || 'No upcoming events scheduled',
    ai_tools_title: {
      vi: "So Sánh Chuyên Sâu", en: "Deep Comparisons", ko: "심층 비교", ja: "ディープ比較", fr: "Comparaisons Approfondies"
    }[lang] || "Deep Comparisons",
    tutorials_title: {
      vi: "Cẩm Nang Hướng Dẫn", en: "AI Learning Guides", ko: "AI 학습 가이드", ja: "AI学習ガイド", fr: "Guides d'Apprentissage AI"
    }[lang] || "AI Learning Guides"
  };

  // Fetching content for different sections
  // "xôi thịt" (dense content) aesthetic: pull latest posts across ALL sections for Hero & Trending
  const [
    { data: heroPosts },
    { data: trendingPosts },
    { data: latestPosts },
    { data: comparePosts },
    { data: guidePosts },
    { data: eventPosts }
  ] = await Promise.all([
    // Hero: Fetch 4 latest posts across ALL sections
    supabase.from('posts').select('*').eq('lang', lang).eq('is_published', true).order('created_at', { ascending: false }).limit(4),
    
    // Trending: 5 latest across ALL sections
    supabase.from('posts').select('*').eq('lang', lang).eq('is_published', true).order('created_at', { ascending: false }).limit(5),
    
    // Latest Posts Grid: Posts 5-8 across ALL sections
    supabase.from('posts').select('*').eq('lang', lang).eq('is_published', true).order('created_at', { ascending: false }).range(4, 7),
    
    // Section Specific queries
    supabase.from('posts').select('*').eq('lang', lang).eq('is_published', true).eq('section', 'compare').order('created_at', { ascending: false }).limit(3),
    supabase.from('posts').select('*').eq('lang', lang).eq('is_published', true).eq('section', 'guide').order('created_at', { ascending: false }).limit(3),
    
    // Events: Now using section 'events'
    supabase.from('posts').select('*').eq('lang', lang).eq('is_published', true).eq('section', 'events').order('created_at', { ascending: false }).limit(4)
  ]);

  const hero = heroPosts?.[0];
  const subHeroes = heroPosts?.slice(1, 4) || [];

  return (
    <div className="min-h-screen text-black">
      {/* Trending Horizontal Scroll */}
      <div className="bg-white border-b-2 border-black overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 px-4 bg-[#ef4444] text-white font-black text-xs flex items-center z-10 skew-x-[-15deg] -ml-4 border-r-2 border-black">
          <span className="skew-x-[15deg] px-2">{t.trending}</span>
        </div>
        <div className="flex whitespace-nowrap py-4 pl-40 animate-[scroll_50s_linear_infinite] hover:[animation-play-state:paused]">
          {(trendingPosts || []).map((post) => (
            <Link key={post.id} href={`/${lang}/${post.section || 'news'}/${post.slug}`} className="mx-8 font-black text-sm uppercase hover:text-[#ef4444] transition-colors">
              • {post.title}
            </Link>
          ))}
          {/* Duplicate for infinite effect */}
          {(trendingPosts || []).map((post) => (
            <Link key={`${post.id}-dup`} href={`/${lang}/${post.section || 'news'}/${post.slug}`} className="mx-8 font-black text-sm uppercase hover:text-[#ef4444] transition-colors">
              • {post.title}
            </Link>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Magazine Header - SEO Optimized H1 */}
        <div className="mb-12 border-b-8 border-black pb-8">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-tight uppercase">
            {{ vi: 'Tin Tức AI', en: 'AI News', ko: 'AI 뉴스', ja: 'AIニュース', fr: 'Nouvelles AI' }[lang] || 'AI News'}{' '}
            <span className="text-[#ef4444]">{
              { vi: 'Hôm Nay', en: 'Today', ko: '오늘', ja: '今日', fr: 'Aujourd\'hui' }[lang] || 'Today'
            }</span>
          </h1>
          <div className="flex justify-between items-center mt-4 font-black uppercase text-sm">
            <div className="flex gap-4">
              <span className="bg-black text-white px-2">Intelligence Cartography</span>
              <span className="hidden md:inline">{
                { 
                  vi: 'Cập Nhật AI Mới Nhất Mỗi Ngày', 
                  en: 'Daily AI Ranking & Best AI Updates',
                  ko: '일일 AI 랭킹 및 최고의 AI 업데이트',
                  ja: '毎日AIランキング＆最高のAIアップデート',
                  fr: 'Classement AI quotidien & meilleures mises à jour AI'
                }[lang] || 'Daily AI Ranking & Best AI Updates'
              }</span>
            </div>
          </div>
        </div>
        
        {/* Hero Section */}
        {hero && (
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Column 1: Main Feature */}
              <div className="lg:col-span-5">
                <div className="relative border-4 border-black group bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all h-full flex flex-col">
                  <div className="aspect-[16/10] relative overflow-hidden border-b-4 border-black">
                    <img 
                      src={hero.featured_image || ''} 
                      alt={hero.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-500" 
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#ef4444] text-white px-3 py-1 font-black text-[10px] uppercase tracking-widest border-2 border-black">
                        {t.featured}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow justify-center">
                    <span className="font-black text-[#ef4444] text-xs uppercase mb-2">
                      {hero.section?.toUpperCase() || 'NEWS'}
                    </span>
                    <h2 className="text-xl lg:text-2xl font-display font-black leading-tight tracking-tight mb-4 group-hover:text-[#ef4444] transition-colors">
                      <Link href={`/${lang}/${hero.section || 'news'}/${hero.slug}`}>{hero.title}</Link>
                    </h2>
                    <p className="text-xs md:text-sm font-bold leading-relaxed mb-6 text-slate-700 line-clamp-3">
                      {hero.excerpt}
                    </p>
                    <Link 
                      href={`/${lang}/${hero.section || 'news'}/${hero.slug}`}
                      className="mt-auto inline-block border-2 border-black px-4 py-2 bg-black text-white font-black uppercase text-xs text-center hover:bg-white hover:text-black transition-all"
                    >
                      {t.read_report}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Column 2: 3 Sub-features */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {subHeroes.map((post) => (
                  <article key={post.id} className="group flex flex-col sm:flex-row border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all h-full overflow-hidden">
                    <div className="w-full sm:w-1/3 aspect-[16/9] sm:aspect-square relative overflow-hidden border-b-4 sm:border-b-0 sm:border-r-4 border-black shrink-0">
                      <img 
                        src={post.featured_image || ''} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-all duration-500" 
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow justify-center">
                      <span className="font-black text-[10px] text-[#ef4444] uppercase mb-1">{post.section?.toUpperCase() || 'News'}</span>
                      <h3 className="text-xl font-black leading-tight tracking-tight mb-2 group-hover:underline">
                        <Link href={`/${lang}/${post.section || 'news'}/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-sm font-bold text-slate-600 line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
                      <div className="mt-auto pt-2 border-t-2 border-black/10 flex justify-between items-center text-[9px] font-black uppercase">
                         <span>{new Date(post.created_at).toLocaleDateString()}</span>
                         <span className="bg-[#ef4444] text-white px-1">{t.new}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Latest Posts Grid - Unified Global Content */}
        <section className="mb-24">
          <SectionHeader title={t.latest_news} lang={lang} href={`/${lang}/news`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(latestPosts || []).map((post) => (
              <article key={post.id} className="group flex flex-col">
                <div className="aspect-square border-4 border-black mb-4 overflow-hidden relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
                  <img 
                    src={post.featured_image || ''} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <span className="font-black text-xs text-[#ef4444] uppercase mb-2">{post.section?.toUpperCase() || 'News'}</span>
                <h3 className="text-xl font-black leading-tight tracking-tight mb-4 group-hover:underline">
                  <Link href={`/${lang}/${post.section || 'news'}/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="text-sm font-bold text-slate-600 line-clamp-3 mb-4 leading-relaxed">{post.excerpt}</p>
                <div className="mt-auto pt-4 border-t-2 border-black/10 flex justify-between items-center text-[10px] font-black uppercase">
                   <span>{new Date(post.created_at).toLocaleDateString()}</span>
                   <span className="bg-black text-white px-2 py-0.5 uppercase">{post.section || 'news'}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Compare & AI Guide */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <section>
            <SectionHeader title={t.compare_ai} lang={lang} href={`/${lang}/compare`} />
            <div className="space-y-8">
              {(comparePosts || []).length > 0 ? comparePosts?.map((post) => (
                <div key={post.id} className="flex gap-6 items-start group">
                  <div className="w-24 h-24 flex-shrink-0 border-2 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                    <img src={post.featured_image || ''} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black leading-tight group-hover:text-[#ef4444]">
                      <Link href={`/${lang}/compare/${post.slug}`}>{post.title}</Link>
                    </h4>
                    <p className="text-xs font-bold text-slate-500 mt-2 line-clamp-2">{post.excerpt}</p>
                  </div>
                </div>
              )) : (
                <div className="p-8 border-2 border-dashed border-black/20 text-center font-bold text-slate-400 uppercase text-xs">
                  Coming Soon
                </div>
              )}
            </div>
          </section>

          <section>
            <SectionHeader title={t.ai_guide} lang={lang} href={`/${lang}/guide`} />
            <div className="space-y-8">
               {(guidePosts || []).length > 0 ? guidePosts?.map((post) => (
                <div key={post.id} className="flex gap-6 items-start group">
                  <div className="w-24 h-24 flex-shrink-0 border-2 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                    <img src={post.featured_image || ''} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black leading-tight group-hover:text-[#ef4444]">
                      <Link href={`/${lang}/guide/${post.slug}`}>{post.title}</Link>
                    </h4>
                    <p className="text-xs font-bold text-slate-500 mt-2 line-clamp-2">{post.excerpt}</p>
                  </div>
                </div>
              )) : (
                <div className="p-8 border-2 border-dashed border-black/20 text-center font-bold text-slate-400 uppercase text-xs">
                  Updating...
                </div>
              )}
            </div>
          </section>
        </div>

        {/* AI Events Section */}
        <section className="mb-24">
          <SectionHeader title={t.ai_events} lang={lang} href={`/${lang}/events`} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(eventPosts || []).length > 0 ? (eventPosts || []).map((post) => (
              <article key={post.id} className="group flex flex-col">
                <div className="aspect-video border-4 border-black mb-4 overflow-hidden relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white">
                  <img 
                    src={post.featured_image || ''} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <h3 className="text-lg font-black leading-tight tracking-tight mb-2 group-hover:underline">
                  <Link href={`/${lang}/events/${post.slug}`}>{post.title}</Link>
                </h3>
                <div className="mt-auto flex justify-between items-center text-[10px] font-black uppercase">
                   <span className="text-slate-500">{new Date(post.created_at).toLocaleDateString()}</span>
                   <span className="bg-[#ef4444] text-white px-2 py-0.5">{t.new}</span>
                </div>
              </article>
            )) : (
              <div className="col-span-full p-12 border-4 border-dashed border-black/10 text-center">
                <p className="font-black text-slate-400 uppercase tracking-widest">{t.no_events}</p>
              </div>
            )}
          </div>
        </section>

        {/* Dynamic Section-based blocks */}
        <NewsSection 
          lang={lang} 
          section="compare" 
          title={t.ai_tools_title} 
          limit={4} 
        />
        
        <NewsSection 
          lang={lang} 
          section="guide" 
          title={t.tutorials_title} 
          limit={4} 
        />
      </main>
    </div>
  );
}
