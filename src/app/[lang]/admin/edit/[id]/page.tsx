"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Eye, 
  Settings, 
  ChevronDown, 
  Image as ImageIcon, 
  Type, 
  Layout, 
  Globe,
  Lock,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  List,
  Upload,
  Loader2
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

export default function EditPostPage({ params }: { params: { lang: string, id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const lang = params.lang || 'en';
  const postId = params.id;
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
  const [featuredImage, setFeaturedImage] = useState('');
  const [authorName, setAuthorName] = useState('');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth_session');
    if (auth === 'true') {
      setIsAuthorized(true);
      fetchInitialData();
    } else {
      setIsAuthorized(false);
      setIsFetching(false);
    }
  }, []);

  const fetchInitialData = async () => {
    setIsFetching(true);
    await fetchCategories();
    await fetchPostData();
    setIsFetching(false);
  };

  const fetchCategories = async () => {
    const targetLang = lang === 'vn' ? 'vi' : lang;
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('lang', targetLang)
      .order('name');
    
    if (data) setCategories(data);
    if (error) console.error('Fetch categories error:', error);
  };

  const fetchPostData = async () => {
    if (!postId) return;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Fetch post error:', error);
      alert('Không tìm thấy bài viết này Sếp ơi!');
      router.push(`/${lang}/admin`);
      return;
    }

    if (data) {
      setTitle(data.title || '');
      setSlug(data.slug || '');
      setExcerpt(data.excerpt || '');
      setContent(data.content || '');
      setCategoryId(data.category_id || '');
      setFeaturedImage(data.featured_image || '');
      setAuthorName(data.author_name || '');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsAddingCategory(true);
    const targetLang = lang === 'vn' ? 'vi' : lang;
    const catSlug = newCategoryName
      .toLowerCase()
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data, error } = await supabase
      .from('categories')
      .insert([{ 
        name: newCategoryName, 
        slug: catSlug, 
        lang: targetLang, 
        type: 'post' 
      }])
      .select();

    if (error) {
      alert('Lỗi tạo category: ' + error.message);
    } else if (data) {
      setCategories([...categories, data[0]]);
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
      fetchInitialData();
    } else {
      alert('Sai mật khẩu rồi Sếp ơi!');
    }
    setIsChecking(false);
  };

  // Optional: Auto-generate slug from title (only if slug is empty)
  const syncSlug = () => {
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
  };

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

  const handleUpdate = async (published = false) => {
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
      author_name: authorName || 'Sếp',
      is_published: published,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', postId);

    if (error) {
      console.error('Update error:', error);
      alert('Lỗi rồi Sếp: ' + error.message);
    } else {
      alert('Đã cập nhật bài viết!');
      router.push(`/${lang}/admin`);
    }
    setIsLoading(false);
  };

  if (isAuthorized === null || isFetching) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="font-black text-2xl mb-2 uppercase tracking-tight text-center">Admin Access</h1>
          <p className="text-slate-500 text-center text-sm mb-6 font-medium">Vui lòng nhập mật khẩu để tiếp tục, Sếp.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Password..."
              className="w-full border-2 border-black p-4 rounded-xl outline-none font-bold text-center tracking-widest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              disabled={isChecking}
            />
            <button 
              disabled={isChecking}
              className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
            >
              {isChecking ? 'Verifying...' : 'Unlock Editor'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(`/${lang}/admin`)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">Edit Post</h1>
            <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{title || 'Untitled Article'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full mr-4">
            <Globe size={14} />
            <span className="uppercase">{lang}</span>
          </div>
          <button onClick={() => handleUpdate(false)} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>Update Draft</span>
          </button>
          <button onClick={() => handleUpdate(true)} disabled={isLoading} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5">
            <Send size={18} />
            <span>Update & Publish</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <input 
              type="text" 
              placeholder="Enter catchphrase or title..."
              className="w-full text-4xl font-black placeholder:text-slate-200 outline-none mb-6 tracking-tight"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <div className="flex items-center gap-4 mb-8 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Layout size={14} />
                <span>Permalink:</span>
              </div>
              <input 
                type="text"
                className="text-sm text-blue-600 font-mono bg-blue-50 px-2 py-1 rounded border-none outline-none flex-1"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <button onClick={syncSlug} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">
                Sync Title
              </button>
            </div>

            <textarea 
              placeholder="Write an engaging excerpt..."
              className="w-full text-lg text-slate-600 placeholder:text-slate-300 outline-none mb-8 resize-none h-24 border-b border-slate-100 focus:border-blue-500 transition-colors"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />

            <div className="min-h-[400px]">
              <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto">
                <button onClick={() => insertText('# ', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"><Heading1 size={20} /></button>
                <button onClick={() => insertText('## ', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"><Heading2 size={20} /></button>
                <button onClick={() => insertText('### ', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"><Heading3 size={20} /></button>
                <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                <button onClick={() => insertText('**', '**')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"><Bold size={20} /></button>
                <button onClick={() => insertText('- ', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"><List size={20} /></button>
              </div>

              <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-100 pb-2">
                <Type size={18} />
                <span className="text-sm font-bold uppercase tracking-widest">Content Body</span>
              </div>
              <textarea 
                ref={contentRef}
                placeholder="Start writing..."
                className="w-full h-[600px] text-slate-800 placeholder:text-slate-200 outline-none resize-none leading-relaxed text-lg font-medium"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Settings size={18} className="text-slate-400" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Post Settings</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Author Name</label>
                <input 
                  type="text" 
                  placeholder="Who's writing?"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Category</label>
                <div className="space-y-3">
                  <div className="relative">
                    <select 
                      className="w-full appearance-none bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Featured Image</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group border-2 border-dashed border-slate-200 rounded-2xl aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all overflow-hidden"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                  ) : featuredImage ? (
                    <>
                      <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="text-slate-300" size={32} />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Click to upload</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
