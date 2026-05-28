import AdminEditor from '@/components/AdminEditor';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function EditPostPage({ params }: { params: { lang: string, id: string } }) {
 return <AdminEditor isNew={false} postId={params.id} lang={params.lang} />;
}
