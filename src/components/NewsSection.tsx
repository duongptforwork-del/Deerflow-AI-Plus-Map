import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { ArrowRight } from 'lucide-react';

interface NewsSectionProps {
 section?: string;
 lang: string;
 limit?: number;
 title?: string;
}

export default async function NewsSection({ 
 section = 'news', 
 lang, 
 limit = 4,
 title ="Latest News"
}: NewsSectionProps) {
 
 const supabase = createClient();

 // Refactored: Removed categories join, filtering by section directly
 let query = supabase
 .from('posts')
 .select('*')
 .eq('lang', lang)
 .eq('section', section)
 .eq('is_published', true)
 .order('created_at', { ascending: false })
 .limit(limit);

 const { data: posts, error } = await query;

 if (error) {
 console.error('Error fetching section posts:', error);
 return null;
 }

 if (!posts || posts.length === 0) {
 return null;
 }

 return (
 <section className="mb-24">
 <div className="flex items-center justify-between mb-10 border-b-4 border-black pb-4">
 <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight flex items-center gap-3">
 {title}
 </h2>
 <Link 
 href={`/${lang}/${section}`}
 className="group flex items-center gap-2 font-black text-sm uppercase"
 >
 <span className="group-hover:text-[#ef4444] transition-colors flex items-center gap-2">
 {( {
 vi: 'Xem Tất Cả', en: 'View All', ko: '전체보기', ja: 'すべて見る', fr: 'Voir Tout'
 }[lang] || 'View All' )} <ArrowRight size={16} className=""/>
 </span>
 </Link>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 {posts.map((post) => (
 <article key={post.id} className="group flex flex-col bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
 <div className="aspect-[16/10] border-b-4 border-black overflow-hidden relative">
 <Image fill 
 src={post.featured_image || '/placeholder.png'} 
 alt={post.title} 
 className="w-full h-full object-cover"
 onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} />
 <div className="absolute top-4 left-4">
 <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase">
 {post.section?.toUpperCase() || 'NEWS'}
 </span>
 </div>
 </div>
 <div className="p-5 flex flex-col flex-grow">
 <h3 className="text-xl font-black leading-tight tracking-tight mb-3 line-clamp-2">
 <Link href={`/${lang}/${post.section || 'news'}/${post.slug}`}>
 <span className="group-hover:text-[#ef4444] transition-colors">{post.title}</span>
 </Link>
 </h3>
 <p className="text-sm font-bold text-black/80 line-clamp-2 mb-4 leading-relaxed">
 {post.excerpt || post.content?.substring(0, 100)}...
 </p>
 <div className="mt-auto pt-4 border-t-4 border-black flex justify-between items-center">
 <span className="text-[10px] font-black uppercase text-black/50">
 {new Date(post.created_at).toLocaleDateString()}
 </span>
 <Link 
 href={`/${lang}/${post.section || 'news'}/${post.slug}`}
 className="group text-xs font-black uppercase"
 >
 <span className="group-hover:text-[#ef4444] transition-colors">
 {( {
 vi: 'Đọc Tiếp', en: 'Read More', ko: '자세히 보기', ja: '続きを読む', fr: 'Lire Plus'
 }[lang] || 'Read More' )}
 </span>
 </Link>
 </div>
 </div>
 </article>
 ))}
 </div>
 </section>
 );
}
