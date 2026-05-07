"use client";

import React, { useState, useEffect } from 'react';
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
  Lock
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
  const [isPublished, setIsPublished] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    
    if (data) setCategories(data);
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

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [title]);

  const handleSave = async (published = false) => {
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
      author: 'Sếp'
    };

    const { error } = await supabase
      .from('posts')
      .insert([postData]);

    if (error) {
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
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(`/${lang}/admin`)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">Create New Post</h1>
            <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{title || 'Untitled Article'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full mr-4">
            <Globe size={14} />
            <span className="uppercase">{lang}</span>
          </div>
          <button 
            onClick={() => handleSave(false)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
          >
            <Save size={18} />
            <span>Save Draft</span>
          </button>
          <button 
            onClick={() => handleSave(true)}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <Send size={18} />
            <span>Publish Post</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-12 gap-8">
        {/* Editor Side */}
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
              <code className="text-sm text-blue-600 font-mono">
                aiplusmap.com/{lang}/article/<span className="bg-blue-100 px-1 rounded">{slug || '...'}</span>
              </code>
            </div>

            <textarea 
              placeholder="Write an engaging excerpt..."
              className="w-full text-lg text-slate-600 placeholder:text-slate-300 outline-none mb-8 resize-none h-24 border-b border-slate-100 focus:border-blue-500 transition-colors"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />

            <div className="min-h-[400px]">
              <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-100 pb-2">
                <Type size={18} />
                <span className="text-sm font-bold uppercase tracking-widest">Content Body</span>
              </div>
              <textarea 
                placeholder="Start writing your story here..."
                className="w-full h-[600px] text-slate-800 placeholder:text-slate-200 outline-none resize-none leading-relaxed text-lg"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Settings Side */}
        <div className="col-span-4 space-y-6">
          {/* Publishing Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Settings size={18} className="text-slate-400" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Post Settings</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Category</label>
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

              {/* Featured Image */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Featured Image URL</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3.5 text-slate-400">
                    <ImageIcon size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-600 focus:ring-2 focus:ring-blue-500/20"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                  />
                </div>
                {featuredImage && (
                  <div className="mt-4 rounded-2xl overflow-hidden border-2 border-slate-100 aspect-video relative group">
                    <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="text-white" size={24} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Help/Status */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white border-4 border-slate-800 shadow-xl">
            <h4 className="font-black uppercase tracking-tighter text-xl mb-4">Pro Tips</h4>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              <li className="flex gap-2">
                <span className="text-blue-400">●</span> 
                Slugs are auto-generated but can be overridden.
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">●</span> 
                Make sure to select the correct language (/en or /vi).
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">●</span> 
                Images should be high resolution (1200x630px).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
