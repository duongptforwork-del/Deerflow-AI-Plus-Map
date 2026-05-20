"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Loader2, Image as ImageIcon, Link as LinkIcon, Save, Languages, ArrowLeft, Type, Bold, Italic, Heading1, Heading2, Heading3 } from 'lucide-react';
import { getAdminSession } from '@/utils/auth';
import { marked } from 'marked';
import TurndownService from 'turndown';

const slugify = (str: string) => {
  return String(str)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

interface AdminEditorProps {
  isNew?: boolean;
  postId?: string;
  lang?: string;
}

export default function AdminEditor({ isNew = true, postId, lang = 'en' }: AdminEditorProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [section, setSection] = useState('news');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredImage, setFeaturedImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [postLang, setPostLang] = useState(lang);
  const [authorName, setAuthorName] = useState('Sếp');
  const [authors, setAuthors] = useState<string[]>(['Sếp', 'AI Plus Team', 'Community']);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);
  const [targetTranslationLangs, setTargetTranslationLangs] = useState<string[]>(['en', 'vi', 'ko', 'ja', 'fr']);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);

  // Load content into editor on post load once editorRef is available
  useEffect(() => {
    if (editorRef.current && content && editorRef.current.innerHTML === '') {
      editorRef.current.innerHTML = marked.parse(content) as string;
    }
  }, [content]);

  useEffect(() => {
    if (!getAdminSession()) {
      router.push(`/${lang}/xyz_safe`);
    } else {
      setIsAuthorized(true);
    }
  }, [lang, router]);

  const fetchAuthors = async () => {
    const local = localStorage.getItem('local_authors');
    let authorList = ['Sếp', 'AI Plus Team', 'Community'];
    if (local) {
      try {
        authorList = JSON.parse(local);
      } catch (e) {}
    }

    const { data, error } = await supabase
      .from('authors')
      .select('name')
      .order('name', { ascending: true });
      
    if (data && !error && data.length > 0) {
      const dbNames = data.map((a: any) => a.name);
      const merged = Array.from(new Set([...authorList, ...dbNames])).sort();
      setAuthors(merged);
    } else {
      setAuthors(authorList.sort());
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (data && !error) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isNew && postId) {
      loadPost();
    }
  }, [isNew, postId]);

  const loadPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();
      
    if (data && !error) {
      setTitle(data.title || '');
      setSlug(data.slug || '');
      setExcerpt(data.excerpt || '');
      setContent(data.content || '');
      setSection(data.section || 'news');
      setCategoryId(data.category_id || '');
      setFeaturedImage(data.featured_image || '');
      setIsPublished(data.is_published || false);
      setPostLang(data.lang || lang);
      setAuthorName(data.author_name || 'Sếp');
      if (editorRef.current) {
        editorRef.current.innerHTML = marked.parse(data.content || '') as string;
      }
    } else {
      alert('Failed to load post');
      router.push(`/${lang}/xyz_safe`);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (isNew) {
      setSlug(slugify(e.target.value));
    }
  };

  const handleAddAuthor = async () => {
    const name = prompt(postLang === 'vi' ? 'Nhập tên tác giả mới:' : 'Enter new author name:');
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    if (authors.includes(trimmed)) {
      alert(postLang === 'vi' ? 'Tác giả này đã tồn tại!' : 'Author already exists!');
      return;
    }

    const { error } = await supabase.from('authors').insert([{ name: trimmed }]);
    const updated = [...authors, trimmed].sort();
    setAuthors(updated);
    localStorage.setItem('local_authors', JSON.stringify(updated));
    setAuthorName(trimmed);
    
    if (!error) {
      fetchAuthors();
    }
  };

  const handleDeleteAuthor = async () => {
    if (!authorName) return;
    if (['Sếp', 'AI Plus Team', 'Community'].includes(authorName)) {
      alert(postLang === 'vi' ? 'Không thể xóa tác giả mặc định!' : 'Cannot delete default authors!');
      return;
    }

    if (confirm(postLang === 'vi' ? `Bạn có chắc chắn muốn xóa tác giả "${authorName}"?` : `Are you sure you want to delete author "${authorName}"?`)) {
      const { error } = await supabase.from('authors').delete().eq('name', authorName);
      const updated = authors.filter(a => a !== authorName);
      setAuthors(updated);
      localStorage.setItem('local_authors', JSON.stringify(updated));
      setAuthorName('Sếp');
      
      if (!error) {
        fetchAuthors();
      }
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, compressedFile, { upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + error.message);
      return null;
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploadingImage(true);
    const file = e.target.files[0];
    const url = await uploadImage(file);
    if (url) {
      setFeaturedImage(url);
    }
    setUploadingImage(false);
  };

  const updateContentFromDom = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    
    // Convert HTML to Markdown using Turndown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced'
    });

    // Clean up images replacement
    turndownService.addRule('cleanImages', {
      filter: 'img',
      replacement: function (content, node: any) {
        const src = node.getAttribute('src') || '';
        const alt = node.getAttribute('alt') || 'image';
        return `\n![${alt}](${src})\n`;
      }
    });

    // Custom rule to ensure paragraphs and divs have clear double newlines in markdown
    turndownService.addRule('paragraphsAndDivs', {
      filter: ['p', 'div'],
      replacement: function (content, node) {
        const text = content.trim();
        if (!text) return '';
        return '\n\n' + text + '\n\n';
      }
    });

    const markdown = turndownService.turndown(html);
    setContent(markdown);
  };

  const insertImageToEditor = (imageUrl: string, alt: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand('insertImage', false, imageUrl);
    
    // Add nice brutalist style classes to the inserted image
    setTimeout(() => {
      if (editorRef.current) {
        const imgs = editorRef.current.querySelectorAll('img');
        if (imgs && imgs.length > 0) {
          const lastImg = imgs[imgs.length - 1];
          lastImg.setAttribute('alt', alt);
          lastImg.className = 'border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-6 max-w-full block';
        }
      }
      updateContentFromDom();
    }, 50);
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const url = await uploadImage(file);
    if (url) {
      insertImageToEditor(url, file.name.split('.')[0]);
    }
  };

  const applyHeading = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    updateContentFromDom();
  };

  const applyStyle = (command: string) => {
    document.execCommand(command, false);
    updateContentFromDom();
  };

  const applyLink = () => {
    const url = prompt(postLang === 'vi' ? 'Nhập link liên kết:' : 'Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      updateContentFromDom();
    }
  };

  const handleSave = async (publish: boolean = false) => {
    if (!title || !slug || !content) {
      alert('Title, Slug and Content are required!');
      return null;
    }

    setIsSaving(true);
    const postData = {
      title,
      slug,
      excerpt,
      content,
      section,
      category_id: categoryId || null,
      featured_image: featuredImage,
      is_published: publish,
      lang: postLang,
      author_name: authorName
    };

    let resultId = postId;

    if (isNew) {
      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();
        
      if (error) {
        alert('Error saving post: ' + error.message);
      } else {
        resultId = data.id;
        alert('Post saved successfully!');
        router.push(`/${lang}/xyz_safe`);
      }
    } else {
      const { error } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', postId);
        
      if (error) {
        alert('Error updating post: ' + error.message);
      } else {
        alert('Post updated successfully!');
        router.push(`/${lang}/xyz_safe`);
      }
    }
    
    setIsSaving(false);
    return resultId;
  };

  const handleTranslateAndSave = async () => {
    if (!title || !slug || !content) {
      alert('Please fill out the post before translating.');
      return;
    }
    setIsTranslateModalOpen(true);
  };

  const executeTranslations = async () => {
    const activeTargets = targetTranslationLangs.filter(l => l !== postLang);
    
    if (activeTargets.length === 0) {
      alert('Please select at least one target language to translate to.');
      return;
    }

    setIsTranslating(true);
    setIsTranslateModalOpen(false);

    try {
      const savedId = await handleSave(true);
      if (!savedId) throw new Error("Could not save original post");

      const results: string[] = [];
      const errors: string[] = [];

      for (const targetLang of activeTargets) {
        try {
          const res = await fetch('/api/translate-post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title,
              excerpt,
              content,
              targetLang
            })
          });

          if (!res.ok) {
            let errMsg = `API failed for ${targetLang}`;
            try {
              const errJson = await res.json();
              if (errJson && errJson.error) {
                errMsg = errJson.error;
              }
            } catch (_) {}
            throw new Error(errMsg);
          }
          const translatedData = await res.json();

          let targetCategoryId = null;
          if (categoryId) {
            const currentCategory = categories.find(c => c.id === categoryId);
            if (currentCategory) {
              const counterpart = categories.find(c => c.slug === currentCategory.slug && c.lang === targetLang);
              if (counterpart) {
                targetCategoryId = counterpart.id;
              }
            }
          }

          const targetSlug = `${slug}-${targetLang}`;

          const translatedPostData = {
            title: translatedData.title,
            slug: targetSlug,
            excerpt: translatedData.excerpt,
            content: translatedData.content,
            section,
            category_id: targetCategoryId,
            featured_image: featuredImage,
            is_published: true,
            lang: targetLang,
            author_name: authorName
          };

          // Try updating first in case a translation for this slug & lang already exists
          const { data: existingPost } = await supabase
            .from('posts')
            .select('id')
            .eq('slug', targetSlug)
            .eq('lang', targetLang)
            .maybeSingle();

          let error = null;
          if (existingPost) {
            const { error: updateError } = await supabase
              .from('posts')
              .update(translatedPostData)
              .eq('id', existingPost.id);
            error = updateError;
          } else {
            const { error: insertError } = await supabase
              .from('posts')
              .insert([translatedPostData]);
            error = insertError;
          }

          if (error) {
            throw new Error(`DB save failed for ${targetLang}: ${error.message}`);
          }

          results.push(targetLang.toUpperCase());
        } catch (e: any) {
          errors.push(`${targetLang.toUpperCase()}: ${e.message}`);
        }
      }

      if (errors.length > 0) {
        alert(`Translation completed with errors:\nSuccess: ${results.join(', ') || 'None'}\nFailed:\n${errors.join('\n')}`);
      } else {
        alert(`Successfully published and translated to: ${results.join(', ')}!`);
      }
      
      router.push(`/${lang}/xyz_safe`);
    } catch (err: any) {
      alert('Translation process failed: ' + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-black p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push(`/${lang}/xyz_safe`)} className="p-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-display font-black uppercase tracking-tight">
              {isNew ? 'Create New Post' : 'Edit Post'}
            </h1>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => handleSave(false)}
              disabled={isSaving || isTranslating}
              className="px-6 py-2 bg-white border-4 border-black font-black uppercase text-sm tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Save Draft'}
            </button>
            
            <button 
              onClick={() => handleSave(true)}
              disabled={isSaving || isTranslating}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white border-4 border-black font-black uppercase text-sm tracking-widest shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <Save size={18} /> Publish
            </button>
            
            <button 
              onClick={handleTranslateAndSave}
              disabled={isSaving || isTranslating}
              className="flex items-center gap-2 px-6 py-2 bg-[#ef4444] text-white border-4 border-black font-black uppercase text-sm tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              {isTranslating ? <Loader2 className="animate-spin" size={18} /> : <Languages size={18} />}
              Publish & Translate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full p-3 border-2 border-black font-bold outline-none focus:bg-slate-50"
                    placeholder="Post title..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2">Slug</label>
                    <input 
                      type="text" 
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full p-3 border-2 border-black text-sm outline-none focus:bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2">Language</label>
                    <select 
                      value={postLang}
                      onChange={(e) => setPostLang(e.target.value)}
                      className="w-full p-3 border-2 border-black text-sm font-bold uppercase tracking-widest outline-none bg-white"
                    >
                      <option value="en">English</option>
                      <option value="vi">Vietnamese</option>
                      <option value="ko">Korean</option>
                      <option value="ja">Japanese</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2">Section</label>
                  <select 
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full p-3 border-2 border-black text-sm font-bold uppercase tracking-widest outline-none bg-white"
                  >
                    <option value="news">News Feed</option>
                    <option value="compare">Comparison</option>
                    <option value="guide">Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2">Author (Tác giả)</label>
                  <div className="flex gap-2">
                    <select 
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="flex-1 p-3 border-2 border-black text-sm font-bold uppercase tracking-widest outline-none bg-white"
                    >
                      {authors.map((auth) => (
                        <option key={auth} value={auth}>{auth}</option>
                      ))}
                    </select>
                    
                    <button
                      type="button"
                      onClick={handleAddAuthor}
                      className="px-4 py-2 bg-emerald-400 text-black border-2 border-black font-black uppercase text-xs hover:bg-black hover:text-white transition-colors"
                      title="Add new author"
                    >
                      + Add
                    </button>
                    
                    {!['Sếp', 'AI Plus Team', 'Community'].includes(authorName) && (
                      <button
                        type="button"
                        onClick={handleDeleteAuthor}
                        className="px-4 py-2 bg-red-400 text-black border-2 border-black font-black uppercase text-xs hover:bg-[#ef4444] hover:text-white transition-colors"
                        title="Delete selected author"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {section === 'news' && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest mb-2">Category (Chuyên mục)</label>
                    <select 
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full p-3 border-2 border-black text-sm font-bold uppercase tracking-widest outline-none bg-white"
                    >
                      <option value="">-- No Category (Không chọn chuyên mục) --</option>
                      {categories.filter(c => c.lang === postLang).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2">Excerpt (Summary)</label>
                  <textarea 
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full p-3 border-2 border-black font-medium text-sm outline-none focus:bg-slate-50 h-24 resize-none"
                    placeholder="Short description for preview cards..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2">Featured Image</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-[#F3F4F6] border-2 border-black px-4 py-2 font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageUpload} disabled={uploadingImage} />
                    </label>
                    {featuredImage && (
                      <span className="text-xs font-bold text-emerald-600 truncate max-w-[200px]">{featuredImage}</span>
                    )}
                  </div>
                  {featuredImage && (
                    <div className="mt-4 aspect-video w-full border-2 border-black overflow-hidden bg-[#F3F4F6]">
                      <img src={featuredImage} alt="Featured" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[600px]">
              <div className="p-2 border-b-4 border-black bg-[#F3F4F6] flex items-center gap-2 flex-wrap">
                <button type="button" onClick={() => applyHeading('<h1>')} title="Heading 1" className="p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"><Heading1 size={16} /></button>
                <button type="button" onClick={() => applyHeading('<h2>')} title="Heading 2" className="p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"><Heading2 size={16} /></button>
                <button type="button" onClick={() => applyHeading('<h3>')} title="Heading 3" className="p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"><Heading3 size={16} /></button>
                <div className="w-px h-6 bg-black mx-1"></div>
                <button type="button" onClick={() => applyStyle('bold')} title="Bold" className="p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"><Bold size={16} /></button>
                <button type="button" onClick={() => applyStyle('italic')} title="Italic" className="p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"><Italic size={16} /></button>
                <div className="w-px h-6 bg-black mx-1"></div>
                <button type="button" onClick={applyLink} title="Link" className="p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"><LinkIcon size={16} /></button>
                
                <label className="cursor-pointer p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center" title="Upload Image to Content">
                  <ImageIcon size={16} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleContentImageUpload} />
                </label>
              </div>
              
              <div
                ref={editorRef}
                contentEditable
                onInput={updateContentFromDom}
                className="flex-1 w-full p-6 outline-none overflow-y-auto font-sans text-base leading-relaxed bg-white border-0 prose prose-slate prose-lg max-w-none 
                  prose-headings:font-black prose-headings:tracking-tight prose-headings:my-4
                  prose-p:font-bold prose-p:leading-relaxed prose-p:text-slate-800 prose-p:my-3
                  prose-strong:font-black prose-strong:text-black
                  prose-em:italic prose-em:text-[#ef4444]
                  prose-img:border-4 prose-img:border-black prose-img:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] prose-img:my-6
                  prose-blockquote:border-l-8 prose-blockquote:border-[#ef4444] prose-blockquote:bg-white prose-blockquote:p-8 prose-blockquote:font-black prose-blockquote:italic
                  prose-li:font-bold"
                style={{ minHeight: '400px' }}
              />
            </div>
          </div>

          {/* Preview Column */}
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-[calc(100vh-140px)] sticky top-6 overflow-hidden flex flex-col">
            <div className="p-4 border-b-4 border-black bg-black text-white">
              <h2 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <Type size={16} /> Live Preview
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <article>
                <header className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-[#ef4444] text-white px-4 py-1 font-black text-xs uppercase tracking-widest border-2 border-black skew-x-[-10deg]">
                      {section.toUpperCase()}
                    </span>
                  </div>
                  
                  <h1 className="text-2xl md:text-4xl font-black leading-tight mb-8 tracking-tight">
                    {title || 'Post Title Goes Here'}
                  </h1>
                  
                  <p className="text-lg font-bold leading-relaxed text-slate-700 border-l-8 border-black pl-8 py-2 mb-12">
                    {excerpt || 'Your engaging post excerpt will appear here. It sets the tone for the article.'}
                  </p>
                </header>

                {featuredImage && (
                  <div className="aspect-video w-full border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-[#F3F4F6] overflow-hidden mb-16">
                    <img src={featuredImage} alt={title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="prose prose-slate prose-lg max-w-none 
                  prose-headings:font-black prose-headings:tracking-tight
                  prose-p:font-bold prose-p:leading-relaxed prose-p:text-slate-800 prose-p:mb-6
                  prose-strong:font-black prose-strong:text-black
                  prose-em:italic prose-em:text-[#ef4444]
                  prose-img:border-4 prose-img:border-black prose-img:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                  prose-blockquote:border-l-8 prose-blockquote:border-[#ef4444] prose-blockquote:bg-white prose-blockquote:p-8 prose-blockquote:font-black prose-blockquote:italic
                  prose-li:font-bold
                  ">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {content || 'Start typing to see your markdown preview...'}
                  </ReactMarkdown>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>

      {/* Neo-brutalist Multi-language Translation Modal */}
      {isTranslateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full p-8 relative">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4 border-b-4 border-black pb-2 flex items-center justify-between">
              <span>🌎 Translate & Publish</span>
              <button 
                onClick={() => setIsTranslateModalOpen(false)}
                className="text-black hover:text-[#ef4444] transition-colors font-black text-xl"
              >
                ✕
              </button>
            </h3>
            
            <p className="font-bold text-sm text-slate-700 mb-6 leading-relaxed">
              Select the target languages to translate your post into. This will automatically translate the title, excerpt, and content, and publish them.
            </p>
            
            <div className="space-y-3 mb-8">
              {[
                { code: 'en', label: 'English (EN) 🇺🇸' },
                { code: 'vi', label: 'Tiếng Việt (VI) 🇻🇳' },
                { code: 'ko', label: '한국어 (KO) 🇰🇷' },
                { code: 'ja', label: '日本語 (JA) 🇯🇵' },
                { code: 'fr', label: 'Français (FR) 🇫🇷' },
              ]
                .filter(l => l.code !== postLang)
                .map((l) => (
                  <label 
                    key={l.code} 
                    className="flex items-center gap-3 p-3 border-2 border-black font-black uppercase text-xs cursor-pointer hover:bg-slate-50 transition-colors select-none"
                  >
                    <input 
                      type="checkbox"
                      checked={targetTranslationLangs.includes(l.code)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetTranslationLangs([...targetTranslationLangs, l.code]);
                        } else {
                          setTargetTranslationLangs(targetTranslationLangs.filter(c => c !== l.code));
                        }
                      }}
                      className="w-4 h-4 border-2 border-black rounded-none checked:bg-black accent-black shrink-0"
                    />
                    <span>{l.label}</span>
                  </label>
                ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsTranslateModalOpen(false)}
                className="flex-1 py-3 border-2 border-black font-black uppercase text-xs hover:bg-slate-100 transition-all bg-white"
              >
                Cancel
              </button>
              <button
                onClick={executeTranslations}
                className="flex-1 py-3 bg-[#ef4444] text-white border-2 border-black font-black uppercase text-xs hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                Start Translation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
