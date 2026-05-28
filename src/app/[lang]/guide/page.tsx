import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0;

export default async function GuidePage({ 
 params: { lang }, 
 searchParams 
}: { 
 params: { lang: string }, 
 searchParams: { page?: string } 
}) {
 const currentPage = parseInt(searchParams.page || '1');
 const pageSize = 8;
 const from = (currentPage - 1) * pageSize;
 const to = from + pageSize - 1;

 const supabase = createClient();
 
 let currentLang = lang;
 
 // Check if current language has any published posts in guide
 const { count: postsCount } = await supabase
 .from('posts')
 .select('*', { count: 'exact', head: true })
 .eq('lang', lang)
 .eq('section', 'guide')
 .eq('is_published', true);
 
 if (postsCount === 0 && lang !== 'en') {
 currentLang = 'en';
 }

 // Fetch posts in 'guide' section using the new column
 const { data: posts, count } = await supabase
 .from('posts')
 .select('*, categories(*)', { count: 'exact' })
 .eq('lang', currentLang)
 .eq('section', 'guide')
 .eq('is_published', true)
 .order('created_at', { ascending: false })
 .range(from, to);

 const totalPages = Math.ceil((count || 0) / pageSize);

 return (
 <div className="min-h-screen bg-white">
 <main className="max-w-7xl mx-auto px-4 py-16">
 <header className="mb-20 border-b-4 border-black pb-12">
 <SectionHeader title="Expert Blueprints"lang={lang} />
 <p className="text-2xl md:text-3xl font-black text-[#ef4444] leading-tight mt-6 tracking-tight max-w-4xl">
 Master the tools. Build the future. Step by step.
 </p>
 </header>

 <div className="space-y-16 mb-24">
 {posts && posts.length > 0 ? posts.map((post, index) => (
 <article key={post.id} className="group flex flex-col md:flex-row gap-12 items-start">
 <div className="md:w-1/2 relative">
 <div className="absolute -top-6 -left-6 w-20 h-20 bg-black text-white flex items-center justify-center font-black text-4xl border-4 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10">
 {index + 1 + (currentPage - 1) * pageSize}
 </div>
 <div className="relative aspect-video border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
 <Image fill src={post.featured_image} alt={post.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} />
 </div>
 </div>
 <div className="md:w-1/2 pt-4">
 <span className="text-[10px] font-black uppercase text-black/50 tracking-[0.3em] mb-4 block">LEVEL: ADVANCED</span>
 <h2 className="group-hover:text-[#ef4444] transition-colors text-3xl md:text-4xl font-black leading-tight mb-6 tracking-tight transition-colors">
 <Link href={`/${lang}/${post.categories?.slug || 'guide'}/${post.slug}`}>
 <span className="group-hover:text-[#ef4444] transition-colors">{post.title}</span>
 </Link>
 </h2>
 <p className="text-lg md:text-xl font-bold text-black/70 leading-relaxed mb-8">
 {post.excerpt}
 </p>
 <div className="flex gap-6">
 <Link 
 href={`/${lang}/${post.categories?.slug || 'guide'}/${post.slug}`}
 className="group inline-block bg-black text-white px-10 py-4 border-4 border-black font-black uppercase text-xs transition-colors"
 >
 <span className="group-hover:text-[#ef4444] transition-colors">Start Tutorial</span>
 </Link>
 <button className="group hidden sm:inline-block border-4 border-black px-6 py-4 font-black uppercase text-xs transition-colors">
 <span className="group-hover:text-[#ef4444] transition-colors">Save for Later</span>
 </button>
 </div>
 </div>
 </article>
 )) : (
 <div className="py-32 text-center border-8 border-black bg-slate-50">
 <h3 className="text-5xl font-black text-black tracking-tighter uppercase italic">Blueprint Vault Locked</h3>
 <p className="font-bold text-black/50 mt-4 text-xl uppercase">New technical documentation is currently being synthesized.</p>
 </div>
 )}
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex justify-center items-center gap-4 font-black pt-12 border-t-4 border-slate-100">
 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
 <Link
 key={page}
 href={`/${lang}/guide?page=${page}`}
 className={`group w-12 h-12 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
 currentPage === page 
 ? 'bg-[#ef4444] text-black' 
 : 'bg-white text-black'
 }`}
 >
 <span className={currentPage === page ? '' : 'group-hover:text-[#ef4444] transition-colors'}>{page}</span>
 </Link>
 ))}
 </div>
 )}
 </main>
 </div>
 );
}
