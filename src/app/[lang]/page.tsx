import Image from 'next/image';
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
 }[lang] || 'No upcoming events scheduled'
 };

 let currentLang = lang;
 
 // Check if current language has any published posts
 const { count } = await supabase
 .from('posts')
 .select('*', { count: 'exact', head: true })
 .eq('lang', lang)
 .eq('is_published', true);
 
 if (count === 0 && lang !== 'en') {
 currentLang = 'en';
 }

 // Fetching content for different sections
 //"xôi thịt"(dense content) aesthetic: pull latest posts across ALL sections for Hero & Trending
 const [
 { data: heroPosts },
 { data: trendingPosts },
 { data: latestPosts },
 { data: eventPosts }
 ] = await Promise.all([
 // Hero: Fetch 4 latest posts across ALL sections
 supabase.from('posts').select('*').eq('lang', currentLang).eq('is_published', true).order('created_at', { ascending: false }).limit(4),
 
 // Trending: 5 latest across ALL sections
 supabase.from('posts').select('*').eq('lang', currentLang).eq('is_published', true).order('created_at', { ascending: false }).limit(5),
 
 // Latest Posts Grid: Posts 5-8 across ALL sections
 supabase.from('posts').select('*').eq('lang', currentLang).eq('is_published', true).order('created_at', { ascending: false }).range(4, 7),
 
 // Events: Now using section 'events'
 supabase.from('posts').select('*').eq('lang', currentLang).eq('is_published', true).eq('section', 'events').order('created_at', { ascending: false }).limit(4)
 ]);

 const hero = heroPosts?.[0];
 const subHeroes = heroPosts?.slice(1, 4) || [];

 return (
 <div className="min-h-screen text-black bg-white">
 {/* Trending Horizontal Scroll */}
 <div className="bg-white border-b-4 border-black overflow-hidden relative">
 <div className="absolute left-0 top-0 bottom-0 px-4 bg-[#ef4444] text-black font-black text-xs flex items-center z-10 skew-x-[-15deg] -ml-4 border-r-4 border-black">
 <span className="skew-x-[15deg] px-2">{t.trending}</span>
 </div>
 <div className="flex whitespace-nowrap py-4 pl-40 animate-[scroll_50s_linear_infinite]">
 {(trendingPosts || []).map((post) => (
 <Link key={post.id} href={`/${lang}/${post.section || 'news'}/${post.slug}`} className="group mx-8 font-black text-sm uppercase">
 <span className="group-hover:text-[#ef4444] transition-colors">• {post.title}</span>
 </Link>
 ))}
 {/* Duplicate for infinite effect */}
 {(trendingPosts || []).map((post) => (
 <Link key={`${post.id}-dup`} href={`/${lang}/${post.section || 'news'}/${post.slug}`} className="group mx-8 font-black text-sm uppercase">
 <span className="group-hover:text-[#ef4444] transition-colors">• {post.title}</span>
 </Link>
 ))}
 </div>
 </div>

 <main className="max-w-7xl mx-auto px-4 py-12">
 {/* Magazine Header - SEO Optimized H1 */}
 <div className="mb-12 border-b-4 border-black pb-8">
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
 <div className="relative border-4 border-black group bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-full flex flex-col">
 <div className="aspect-[16/10] relative overflow-hidden border-b-4 border-black">
 <Image fill 
 src={hero.featured_image || '/placeholder.png'} 
 alt={hero.title} 
 className="absolute inset-0 w-full h-full object-cover"
 onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} />
 <div className="absolute top-4 left-4">
 <span className="inline-block skew-x-[-10deg] bg-[#ef4444] text-black px-3 py-1 font-black text-[10px] uppercase tracking-widest border-2 border-black">
 <span className="inline-block skew-x-[10deg]">{t.featured}</span>
 </span>
 </div>
 </div>
 <div className="p-6 flex flex-col flex-grow justify-center">
 <span className="font-black text-[#ef4444] text-xs uppercase mb-2">
 {hero.section?.toUpperCase() || 'NEWS'}
 </span>
 <h2 className="text-xl lg:text-2xl font-display font-black leading-tight tracking-tight mb-4 transition-colors">
 <Link href={`/${lang}/${hero.section || 'news'}/${hero.slug}`}>
 <span className="group-hover:text-[#ef4444] transition-colors">{hero.title}</span>
 </Link>
 </h2>
 <p className="text-xs md:text-sm font-bold leading-relaxed mb-6 text-black/70 line-clamp-3">
 {hero.excerpt}
 </p>
 <Link 
 href={`/${lang}/${hero.section || 'news'}/${hero.slug}`}
 className="mt-auto inline-block border-4 border-black px-4 py-2 bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-xs text-center transition-colors group"
 >
 <span className="group-hover:text-[#ef4444] transition-colors">{t.read_report}</span>
 </Link>
 </div>
 </div>
 </div>

 {/* Column 2: 3 Sub-features */}
 <div className="lg:col-span-7 flex flex-col gap-6">
 {subHeroes.map((post) => (
 <article key={post.id} className="group flex flex-col sm:flex-row border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-full overflow-hidden">
 <div className="w-full sm:w-1/3 aspect-[16/9] sm:aspect-square relative overflow-hidden border-b-4 sm:border-b-0 sm:border-r-4 border-black shrink-0">
 <Image fill 
 src={post.featured_image || '/placeholder.png'} 
 alt={post.title} 
 className="w-full h-full object-cover"
 onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} />
 </div>
 <div className="p-4 flex flex-col flex-grow justify-center">
 <span className="font-black text-[10px] text-[#ef4444] uppercase mb-1">{post.section?.toUpperCase() || 'News'}</span>
 <h3 className="text-xl font-black leading-tight tracking-tight mb-2">
 <Link href={`/${lang}/${post.section || 'news'}/${post.slug}`}>
 <span className="group-hover:text-[#ef4444] transition-colors">{post.title}</span>
 </Link>
 </h3>
 <p className="text-sm font-bold text-black/70 line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
 <div className="mt-auto pt-2 border-t-4 border-black/10 flex justify-between items-center text-[9px] font-black uppercase">
 <span className="text-black/70">{new Date(post.created_at).toLocaleDateString()}</span>
 <span className="inline-block skew-x-[-10deg] border-2 border-black bg-[#ef4444] text-black px-2 py-0.5"><span className="inline-block skew-x-[10deg]">{t.new}</span></span>
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
 <article key={post.id} className="group flex flex-col border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
 <div className="aspect-square border-4 border-black mb-4 overflow-hidden relative bg-white">
 <Image fill 
 src={post.featured_image || '/placeholder.png'} 
 alt={post.title} 
 className="w-full h-full object-cover"
 onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} />
 </div>
 <span className="font-black text-xs text-[#ef4444] uppercase mb-2">{post.section?.toUpperCase() || 'News'}</span>
 <h3 className="text-xl font-black leading-tight tracking-tight mb-4">
 <Link href={`/${lang}/${post.section || 'news'}/${post.slug}`}>
 <span className="group-hover:text-[#ef4444] transition-colors">{post.title}</span>
 </Link>
 </h3>
 <p className="text-sm font-bold text-black/70 line-clamp-3 mb-4 leading-relaxed">{post.excerpt}</p>
 <div className="mt-auto pt-4 border-t-4 border-black/10 flex justify-between items-center text-[10px] font-black uppercase">
 <span className="text-black/70">{new Date(post.created_at).toLocaleDateString()}</span>
 <span className="inline-block skew-x-[-10deg] border-2 border-black bg-black text-white px-2 py-0.5 uppercase"><span className="inline-block skew-x-[10deg]">{post.section || 'news'}</span></span>
 </div>
 </article>
 ))}
 </div>
 </section>

 {/* AI Events Section */}
 <section className="mb-24">
 <SectionHeader title={t.ai_events} lang={lang} href={`/${lang}/events`} />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 {(eventPosts || []).length > 0 ? (eventPosts || []).map((post) => (
 <article key={post.id} className="group flex flex-col border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
 <div className="aspect-video border-4 border-black mb-4 overflow-hidden relative bg-white">
 <Image fill 
 src={post.featured_image || '/placeholder.png'} 
 alt={post.title} 
 className="w-full h-full object-cover"
 onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} />
 </div>
 <h3 className="text-lg font-black leading-tight tracking-tight mb-2">
 <Link href={`/${lang}/events/${post.slug}`}>
 <span className="group-hover:text-[#ef4444] transition-colors">{post.title}</span>
 </Link>
 </h3>
 <div className="mt-auto pt-4 flex justify-between items-center text-[10px] font-black uppercase">
 <span className="text-black/70">{new Date(post.created_at).toLocaleDateString()}</span>
 <span className="inline-block skew-x-[-10deg] border-2 border-black bg-[#ef4444] text-black px-2 py-0.5"><span className="inline-block skew-x-[10deg]">{t.new}</span></span>
 </div>
 </article>
 )) : (
 <div className="col-span-full p-12 border-4 border-dashed border-black/10 text-center">
 <p className="font-black text-black/40 uppercase tracking-widest">{t.no_events}</p>
 </div>
 )}
 </div>
 </section>

 </main>
 </div>
 );
}