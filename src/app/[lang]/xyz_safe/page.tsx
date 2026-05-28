import { supabase } from '@/lib/supabase';
import AdminDashboard from '@/components/AdminDashboard';
import { notFound } from 'next/navigation';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminPage({
 params
}: {
 params: { lang: string };
}) {
 const { lang } = params;

 if (lang !== 'vi' && lang !== 'en') {
 notFound();
 }

 // Fetch all posts regardless of category
 const { data: posts, error: postsError } = await supabase
 .from('posts')
 .select('*')
 .eq('lang', lang)
 .order('created_at', { ascending: false });

 if (postsError) {
 console.error('Supabase error:', postsError);
 }

 return (
 <AdminDashboard 
 posts={posts || []} 
 lang={lang} 
 />
 );
}
