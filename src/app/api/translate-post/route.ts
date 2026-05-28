import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
 try {
 if (!process.env.OPENAI_API_KEY) {
 return NextResponse.json({ 
 error: 'OPENAI_API_KEY is missing! Bạn hãy thêm khóa"OPENAI_API_KEY=your_openai_key"vào file .env.local trong dự án để kích hoạt tính năng dịch tự động nhé!' 
 }, { status: 400 });
 }

 const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY,
 });

 const { title, excerpt, content, targetLang } = await req.json();

 if (!title || !content || !targetLang) {
 return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
 }

 const languageNames: Record<string, string> = {
 vi: 'Vietnamese',
 en: 'English',
 ko: 'Korean',
 ja: 'Japanese',
 fr: 'French'
 };
 const targetLanguageName = languageNames[targetLang] || targetLang;

 const systemPrompt = `You are a professional translator and SEO expert. Translate the following blog post data into ${targetLanguageName}. 
Maintain the Markdown formatting exactly (including all headings, links, and image syntaxes like ![alt](url)).
Do not add any additional notes or conversational text. Return a pure JSON object.`;

 const userPrompt = `
Here is the post data:
{
"title": ${JSON.stringify(title)},
"excerpt": ${JSON.stringify(excerpt || '')},
"content": ${JSON.stringify(content)}
}

Translate it to ${targetLanguageName} and output as a valid JSON object with keys"title","excerpt", and"content".
`;

 const response = await openai.chat.completions.create({
 model: 'gpt-4o-mini', // using gpt-4o-mini for speed and cost efficiency
 messages: [
 { role: 'system', content: systemPrompt },
 { role: 'user', content: userPrompt }
 ],
 response_format: { type: 'json_object' },
 temperature: 0.2,
 });

 const resultString = response.choices[0].message.content;
 if (!resultString) throw new Error("No response from OpenAI");

 const translatedData = JSON.parse(resultString);

 return NextResponse.json(translatedData);

 } catch (error: any) {
 console.error('Translation Error:', error);
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
