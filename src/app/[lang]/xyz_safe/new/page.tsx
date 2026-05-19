import AdminEditor from '@/components/AdminEditor';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function NewPostPage({ params }: { params: { lang: string } }) {
  return <AdminEditor isNew={true} lang={params.lang} />;
}
