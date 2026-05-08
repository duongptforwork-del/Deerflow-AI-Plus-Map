"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  ChevronDown, 
  Image as ImageIcon, 
  Layout, 
  Globe,
  Lock,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  List,
  Upload,
  Loader2,
  Trash2
} from 'lucide-react';

// Security configuration (PBKDF2)
const AUTH_SALT = '128431c8252060cd971adbdaf3ae4b6a';
const AUTH_HASH = '5cb6ea6355ff5a7bc32458db87ab92c9dffd3da456b4ed6d7c995c295fd39048';

async function verifyPassword(password: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const saltBuffer = new Uint8Array(AUTH_SALT.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const passwordKey = await crypto.subtle.importKey(
      'raw', 
      encoder.encode(password), 
      { name: 'PBKDF2' }, 
      false, 
      ['deriveBits']
    );
    const hashBuffer = await crypto.subtle.deriveBits(
      { 
        name: 'PBKDF2', 
        salt: saltBuffer, 
        iterations: 100000, 
        hash: 'SHA-256' 
      },
      passwordKey, 
      256
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex === AUTH_HASH;
  } catch (e) {
    return false;
  }
}

export default function NewPostPage({ params }: { params: { lang: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const lang = params.lang || 'en';
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth State
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');


  const [section, setSection] = useState('news');
  const [featuredImage, setFeaturedImage] = useState('');
  
  const [categories, setCategories] = useState<any[]>([]);

  const filteredCategories = categories.filter(c => {
    if (section === 'compare') return c.slug.includes('compare');
    if (section === 'guide') return c.slug.includes('guide');
    return !c.slug.includes('compare') && !c.slug.includes('guide');
  });

  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find(c => c.id === categoryId)) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [section, categories]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth_session');
    if (auth === 'true') {
      setIsAuthorized(true);
      fetchCategories();
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const fetchCategories = async () => {
    const targetLang = lang;
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('lang', targetLang)
      .order('name');
    
    if (data) setCategories(data);
    if (error) console.error('Fetch categories error:', error);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsAddingCategory(true);
    const targetLang = lang;
    const catSlug = newCategoryName
      .toLowerCase()
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data, error } = await supabase
      .from('categories')
      .upsert({ 
        name: newCategoryName, 
        slug: catSlug, 
        lang: targetLang, 
        type: 'post' 
      }, { onConflict: 'slug,lang' })
      .select();

    if (error) {
      console.error('Upsert category error:', error);
      alert('Lỗi category: ' + error.message);
    } else if (data && data[0]) {
      setCategories(prev => {
        const exists = prev.find(c => c.id === data[0].id);
        if (exists) return prev;
        return [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name));
      });
      setCategoryId(data[0].id);
      setNewCategoryName('');
    }
    setIsAddingCategory(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    const isValid = await verifyPassword(password);
    if (isValid) {
      localStorage.setItem('admin_auth_session', 'true');
      setIsAuthorized(true);
      fetchCategories();
    } else {
      alert('Sai mật khẩu rồi Sếp ơi!');
    }
    setIsChecking(false);
  };

  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [title]);

  const insertText = (before: string, after: string = '') => {
    if (!contentRef.current) return;
    const start = contentRef.current.selectionStart;
    const end = contentRef.current.selectionEnd;
    const text = contentRef.current.value;
    const selected = text.substring(start, end);
    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    setContent(newText);
    
    setTimeout(() => {
      contentRef.current?.focus();
      contentRef.current?.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Sếp ơi, chỉ nhận ảnh JPEG, PNG, hoặc WebP thôi!');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      setFeaturedImage(publicUrl);
    } catch (error: any) {
      alert('Lỗi tải ảnh: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (published = false) => {
    if (!title || !slug || !content) {
      alert('Sếp điền thiếu Title, Slug hoặc Content kìa!');
      return;
    }

    setIsLoading(true);
    
    const postData = {
      title,
      slug,
      excerpt,
      content,
      category_id: categoryId || null,
      featured_image: featuredImage || null,
      is_published: published,
      lang: lang,
      author_name: 'Sếp'
    };

    const { error } = await supabase
      .from('posts')
      .insert([postData]);

    if (error) {
      console.error('Save error:', error);
      alert('Lỗi rồi Sếp: ' + error.message);
    } else {
      alert(published ? 'Đã xuất bản thành công!' : 'Đã lưu nháp!');
      router.push(`/${lang}/admin`);
    }
    setIsLoading(false);
  };

  if (isAuthorized === null) return null;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 font-display">
        <div className="bg-white p-10 border-4 border-black shadow-[12px_12px_0px_0px_rgba(239,68,68,1)] max-w-md w-full">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-[#ef4444] border-4 border-black flex items-center justify-center text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Lock size={40} strokeWidth={3} />
            </div>
          </div>
          <h1 className="font-black text-3xl mb-2 uppercase tracking-tighter text-center">Admin Access</h1>
          <p className="text-black/60 text-center text-sm mb-8 font-bold uppercase tracking-widest">Identify Yourself, Sếp.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="SECRET PASSWORD..."
              className="w-full border-4 border-black p-4 outline-none font-black text-center tracking-[0.2em] focus:bg-yellow-50 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              disabled={isChecking}
            />
            <button 
              disabled={isChecking}
              className="w-full bg-black text-white p-5 font-black uppercase tracking-[0.2em] border-4 border-black shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
            >
              {isChecking ? 'Verifying...' : 'Unlock Editor'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-display pb-20">
      <header className="h-20 bg-white border-b-4 border-black sticky top-0 z-10 px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push(`/${lang}/admin`)} 
            className="p-3 border-4 border-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </button>
          <div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 leading-none mb-1">Editor / New Post</h1>
            <p className="text-lg font-black tracking-tighter truncate max-w-[300px] uppercase">{title || 'Untitled Article'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-black bg-black text-white px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
            <Globe size={14} strokeWidth={3} />
            <span className="uppercase tracking-widest">{lang}</span>
          </div>
          <button 
            onClick={() => handleSave(false)} 
            disabled={isLoading} 
            className="flex items-center gap-2 px-6 py-3 text-sm font-black uppercase tracking-widest border-4 border-black hover:bg-black hover:text-white transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} strokeWidth={3} />}
            <span>Draft</span>
          </button>
          <button 
            onClick={() => handleSave(true)} 
            disabled={isLoading} 
            className="flex items-center gap-2 px-8 py-3 bg-[#ef4444] text-white text-sm font-black uppercase tracking-widest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <Send size={18} strokeWidth={3} />
            <span>Publish</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-10 grid grid-cols-12 gap-10">
        <div className="col-span-8 space-y-10">
          <div className="bg-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <input 
              type="text" 
              placeholder="ENTER TITLE..."
              className="w-full text-5xl font-black placeholder:text-black/10 outline-none mb-8 tracking-tighter uppercase focus:bg-yellow-50 p-2 border-b-4 border-transparent focus:border-black transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <div className="flex items-center gap-4 mb-10 p-4 bg-black text-white border-2 border-black">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                <Layout size={14} strokeWidth={3} />
                <span>Slug:</span>
              </div>
              <code className="text-sm font-black bg-transparent border-none outline-none flex-1 tracking-widest uppercase text-yellow-400">
                aiplusmap.com/{lang}/article/<span className="underline decoration-wavy">{slug || '...'}</span>
              </code>
            </div>

            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4 text-black/40">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Excerpt / Summary</span>
              </div>
              <textarea 
                placeholder="Write a punchy summary here..."
                className="w-full text-xl font-bold text-black placeholder:text-black/10 outline-none resize-none h-32 p-4 bg-[#F3F4F6] border-4 border-black focus:bg-white transition-all leading-relaxed"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>

            <div className="min-h-[400px]">
              <div className="flex items-center gap-2 mb-6 p-3 bg-black border-4 border-black overflow-x-auto">
                <button onClick={() => insertText('# ', '')} className="p-2 bg-white border-2 border-black hover:bg-[#ef4444] hover:text-white transition-all"><Heading1 size={20} strokeWidth={3} /></button>
                <button onClick={() => insertText('## ', '')} className="p-2 bg-white border-2 border-black hover:bg-[#ef4444] hover:text-white transition-all"><Heading2 size={20} strokeWidth={3} /></button>
                <button onClick={() => insertText('### ', '')} className="p-2 bg-white border-2 border-black hover:bg-[#ef4444] hover:text-white transition-all"><Heading3 size={20} strokeWidth={3} /></button>
                <div className="w-[2px] h-8 bg-white/20 mx-2"></div>
                <button onClick={() => insertText('**', '**')} className="p-2 bg-white border-2 border-black hover:bg-[#ef4444] hover:text-white transition-all"><Bold size={20} strokeWidth={3} /></button>
                <button onClick={() => insertText('- ', '')} className="p-2 bg-white border-2 border-black hover:bg-[#ef4444] hover:text-white transition-all"><List size={20} strokeWidth={3} /></button>
              </div>

              <div className="flex items-center gap-2 mb-4 text-black border-b-4 border-black pb-2">
                <span className="text-xs font-black uppercase tracking-[0.3em]">Content Body (Markdown)</span>
              </div>
              <textarea 
                ref={contentRef}
                placeholder="UNLEASH THE KNOWLEDGE..."
                className="w-full h-[800px] text-black placeholder:text-black/5 outline-none resize-none leading-relaxed text-xl font-bold p-4 focus:bg-yellow-50 transition-colors"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-10">
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(239,68,68,1)] overflow-hidden">
            <div className="p-6 border-b-4 border-black bg-[#ef4444] flex items-center gap-3">
              <div className="bg-black p-1.5 border-2 border-black text-white">
                <Layout size={18} strokeWidth={3} />
              </div>
              <h3 className="font-black text-sm uppercase tracking-[0.2em] text-white">Post Configuration</h3>
            </div>
            
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mb-4">Section Type</label>
                <div className="space-y-3">
                  {[
                    { id: 'news', label: 'News Feed' },
                    { id: 'compare', label: 'Comparison' },
                    { id: 'guide', label: 'AI Guide' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSection(type.id)}
                      className={`w-full p-4 border-4 transition-all text-left font-black uppercase tracking-widest ${
                        section === type.id 
                          ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]' 
                          : 'border-black bg-white hover:bg-[#F3F4F6]'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              
                <div>
                  <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mb-4">Category Selection</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <select 
                        className="w-full appearance-none bg-white border-4 border-black p-4 outline-none font-black uppercase tracking-widest cursor-pointer"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                      >
                        <option value="">UNCATEGORIZED</option>
                        {filteredCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={24} strokeWidth={3} className="absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
                    </div>

                    <div className="flex flex-col gap-3">
                      <input 
                        type="text" 
                        placeholder="NEW CATEGORY..."
                        className="w-full bg-[#F3F4F6] border-4 border-black p-3 outline-none font-black uppercase tracking-widest focus:bg-white text-xs"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={handleAddCategory}
                        disabled={isAddingCategory || !newCategoryName.trim()}
                        className="bg-black text-white p-3 font-black uppercase tracking-widest border-4 border-black hover:bg-[#ef4444] transition-all disabled:opacity-20"
                      >
                        {isAddingCategory ? 'ADDING...' : 'CREATE CATEGORY'}
                      </button>
                    </div>
                  </div>
                </div>

              <div>
                <label className="block text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mb-4">Featured Media</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group border-4 border-dashed border-black bg-[#F3F4F6] aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-50 hover:border-solid transition-all overflow-hidden"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-black" size={32} />
                    </div>
                  ) : featuredImage ? (
                    <>
                      <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <Upload className="text-white" size={32} strokeWidth={3} />
                        <span className="text-white font-black uppercase tracking-widest text-[10px]">Change Image</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFeaturedImage(''); }}
                        className="absolute top-2 right-2 p-2 bg-[#ef4444] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none"
                      >
                        <Trash2 size={16} strokeWidth={3} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-black p-3 border-2 border-black text-white">
                        <ImageIcon size={24} strokeWidth={3} />
                      </div>
                      <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Upload Cover</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 p-4 border-4 border-black bg-yellow-50">
                   <h5 className="text-[10px] font-black uppercase tracking-widest mb-2">Manual URL</h5>
                   <input 
                      type="text" 
                      placeholder="https://..."
                      className="w-full p-2 bg-white border-2 border-black text-[10px] outline-none"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                    />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
