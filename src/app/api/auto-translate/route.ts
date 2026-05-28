import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { translateText } from '@/lib/translator';
import { generateSlug } from '@/lib/slug';

export async function POST(req: Request) {
 try {
 const { postId, targetLang = 'vi' } = await req.json();
 const supabase = await createClient();

 // 1. Fetch source post
 const { data: post, error: fetchError } = await supabase
 .from('posts')
 .select('*')
 .eq('id', postId)
 .single();

 if (fetchError || !post) {
 return NextResponse.json({ error: 'Post not found' }, { status: 404 });
 }

 // 2. Translate content
 const [translatedTitle, translatedExcerpt, translatedContent] = await Promise.all([
 translateText(post.title, post.lang, targetLang),
 translateText(post.excerpt, post.lang, targetLang),
 translateText(post.content, post.lang, targetLang),
 ]);

 // 3. Create Translated Post
 const translatedSlug = generateSlug(translatedTitle);
 
 const postData: any = {
 title: translatedTitle,
 slug: translatedSlug,
 excerpt: translatedExcerpt,
 content: translatedContent,
 section: post.section, // Use the section column
 featured_image: post.featured_image,
 is_published: post.is_published,
 author_name: post.author_name,
 lang: targetLang,
 };

 // Include event-specific fields if it's an event
 if (post.section === 'events') {
 postData.event_date = post.event_date;
 postData.location = post.location;
 postData.registration_link = post.registration_link;
 }

 const { data: newPost, error: insertError } = await supabase
 .from('posts')
 .upsert(postData, { onConflict: 'slug,lang' })
 .select()
 .single();

 if (insertError) {
 return NextResponse.json({ error: insertError.message }, { status: 500 });
 }

 return NextResponse.json({ success: true, post: newPost });
 } catch (error: any) {
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
