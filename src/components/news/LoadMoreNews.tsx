'use client';
import Image from 'next/image';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

interface Post {
 id: string;
 title: string;
 slug: string;
 featured_image: string;
 excerpt: string;
 created_at: string;
 section: string;
}

export default function LoadMoreNews({ 
 initialPosts, 
 lang, 
 queryLang,
 startOffset 
}: { 
 initialPosts: Post[]; 
 lang: string; 
 queryLang?: string;
 startOffset: number;
}) {
 const actualQueryLang = queryLang || lang;
 const [posts, setPosts] = useState<Post[]>(initialPosts);
 const [offset, setOffset] = useState(startOffset);
 const [hasMore, setHasMore] = useState(initialPosts.length === 8); // Assuming limit 8
 const [loading, setLoading] = useState(false);
 const supabase = createClient();

 const loadMore = async () => {
 if (loading) return;
 setLoading(true);
 
 const nextOffset = offset + 8;
 const { data } = await supabase
 .from('posts')
 .select('id, title, slug, featured_image, excerpt, created_at, section')
 .eq('lang', actualQueryLang)
 .eq('section', 'news')
 .eq('is_published', true)
 .order('created_at', { ascending: false })
 .range(offset, nextOffset - 1);

 if (data && data.length > 0) {
 setPosts([...posts, ...data]);
 setOffset(nextOffset);
 if (data.length < 8) setHasMore(false);
 } else {
 setHasMore(false);
 }
 setLoading(false);
 };

 return (
 <div className="space-y-12">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 {posts.map((post) => (
 <article key={post.id} className="group flex flex-col">
 <div className="relative aspect-square border-4 border-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
 <Image fill 
 src={post.featured_image || '/placeholder.png'} 
 alt={post.title} 
 className="w-full h-full object-cover"
 onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} />
 </div>
 <span className="text-[10px] font-black uppercase text-[#ef4444] mb-2 block tracking-widest">
 {post.section === 'news' ? 'INTELLIGENCE' : post.section.toUpperCase()}
 </span>
 <h3 className="text-lg md:text-xl font-black leading-tight tracking-tight mb-2">
 <Link href={`/${lang}/${post.section}/${post.slug}`}>
 <span className="group-hover:text-[#ef4444] transition-colors">{post.title}</span>
 </Link>
 </h3>
 </article>
 ))}
 </div>

 {hasMore && (
 <div className="flex justify-center pt-12">
 <button
 onClick={loadMore}
 disabled={loading}
 className="group bg-white border-4 border-black px-12 py-4 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:pointer-events-none"
 >
 <span className="group-hover:text-[#ef4444] transition-colors">
 {loading ? 'Synthesizing...' : 'Load More Intelligence'}
 </span>
 </button>
 </div>
 )}
 </div>
 );
}
