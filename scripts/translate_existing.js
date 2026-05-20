import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const targetLangs = ['vi', 'ko', 'ja', 'fr'];
const languageNames = {
  vi: 'Vietnamese',
  en: 'English',
  ko: 'Korean',
  ja: 'Japanese',
  fr: 'French'
};

async function translatePost(post, targetLang) {
  const targetLanguageName = languageNames[targetLang];
  console.log(`Translating "${post.title}" to ${targetLanguageName}...`);
  
  const systemPrompt = `You are a professional translator and SEO expert. Translate the following blog post data into ${targetLanguageName}. 
Maintain the Markdown formatting exactly (including all headings, links, and image syntaxes like ![alt](url)).
Do not add any additional notes or conversational text. Return a pure JSON object.`;

  const userPrompt = `
Here is the post data:
{
  "title": ${JSON.stringify(post.title)},
  "excerpt": ${JSON.stringify(post.excerpt || '')},
  "content": ${JSON.stringify(post.content)}
}

Translate it to ${targetLanguageName} and output as a valid JSON object with keys "title", "excerpt", and "content".
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const translatedData = JSON.parse(response.choices[0].message.content);
  return translatedData;
}

async function run() {
  // Fetch all english posts
  const { data: posts } = await supabase.from('posts').select('*').eq('lang', 'en');
  
  for (const post of posts) {
    for (const lang of targetLangs) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', post.slug)
        .eq('lang', lang);
        
      if (!existing || existing.length === 0) {
        try {
          const translated = await translatePost(post, lang);
          const newPost = {
            ...post,
            id: undefined, // let DB generate
            created_at: undefined,
            updated_at: undefined,
            lang: lang,
            title: translated.title,
            excerpt: translated.excerpt,
            content: translated.content
          };
          
          await supabase.from('posts').insert([newPost]);
          console.log(`Saved ${lang} version for ${post.slug}`);
        } catch (e) {
          console.error(`Error translating to ${lang}:`, e);
        }
      } else {
        console.log(`Post ${post.slug} already exists in ${lang}`);
      }
    }
  }
}

run();
