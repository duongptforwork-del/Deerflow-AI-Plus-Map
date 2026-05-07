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
  const { lang: rawLang } = params;
  const lang = rawLang === 'vn' ? 'vi' : rawLang;

  // Simple check for valid lang
  if (lang !== 'vi' && lang !== 'en') {
    notFound();
  }

  // Fetch posts from Supabase
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, categories(name)')
    .eq('lang', lang)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    // Return empty array to avoid crash during build/dev
    return <AdminDashboard posts={[]} lang={lang} />;
  }

  return (
    <AdminDashboard posts={posts || []} lang={lang} />
  );
}
