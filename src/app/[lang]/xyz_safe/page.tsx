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

  // Simple check for valid lang
  if (lang !== 'vi' && lang !== 'en') {
    notFound();
  }

  // Fetch posts from Supabase
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*, categories!inner(*)')
    .eq('lang', lang)
    .order('created_at', { ascending: false });

  // Fetch categories for the current language
  const { data: categories, error: catsError } = await supabase
    .from('categories')
    .select('*')
    .eq('lang', lang)
    .order('name');

  if (postsError || catsError) {
    console.error('Supabase error:', postsError || catsError);
  }

  return (
    <AdminDashboard 
      posts={posts || []} 
      categories={categories || []} 
      lang={lang} 
    />
  );
}
