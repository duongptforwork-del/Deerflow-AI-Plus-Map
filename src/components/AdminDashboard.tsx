"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Image as ImageIcon, 
  Settings, 
  Plus, 
  Search, 
  Globe,
  Lock,
  LogOut,
  MoreVertical,
  Loader2,
  FolderOpen,
  Save
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { verifyPassword, setAdminSession, clearAdminSession, getAdminSession } from '@/utils/auth';

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

const AdminDashboard = ({ posts = [], lang = 'en' }: { posts?: any[], lang?: string }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('posts');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Category Management States
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catLang, setCatLang] = useState(lang);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (data && !error) {
      setCategories(data);
    }
    setLoadingCategories(false);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug) {
      alert('Tên danh mục và Slug là bắt buộc!');
      return;
    }
    setIsSavingCategory(true);

    const categoryData = {
      name: catName,
      slug: catSlug,
      description: catDescription,
      lang: catLang
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id);

      if (error) {
        alert('Lỗi khi sửa danh mục: ' + error.message);
      } else {
        alert('Cập nhật danh mục thành công!');
        fetchCategories();
        resetCategoryForm();
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([categoryData]);

      if (error) {
        alert('Lỗi khi tạo danh mục: ' + error.message);
      } else {
        alert('Tạo danh mục thành công!');
        fetchCategories();
        resetCategoryForm();
      }
    }
    setIsSavingCategory(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Sếp chắc chắn muốn xóa danh mục này? Các bài viết liên quan sẽ bị mất liên kết.')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        alert('Lỗi khi xóa danh mục: ' + error.message);
      } else {
        fetchCategories();
      }
    }
  };

  const startEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCatName(cat.name || '');
    setCatSlug(cat.slug || '');
    setCatDescription(cat.description || '');
    setCatLang(cat.lang || lang);
    setShowCategoryForm(true);
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatDescription('');
    setCatLang(lang);
    setShowCategoryForm(false);
  };

  const handleCatNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCatName(e.target.value);
    if (!editingCategory) {
      setCatSlug(slugify(e.target.value));
    }
  };

  const handleDeletePost = async (id: string) => {
    if (confirm('Sếp chắc chắn muốn xóa bài này chứ?')) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) {
        alert('Lỗi khi xóa bài: ' + error.message);
      } else {
        router.refresh();
      }
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('posts')
      .update({ is_published: !currentStatus })
      .eq('id', id);
    
    if (error) {
      alert('Lỗi khi cập nhật trạng thái: ' + error.message);
    } else {
      router.refresh();
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const authorized = getAdminSession();
    setIsAuthorized(authorized);
    if (authorized) {
      fetchCategories();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    const isValid = await verifyPassword(password);
    if (isValid) {
      setAdminSession();
      setIsAuthorized(true);
    } else {
      alert('Sai mật khẩu rồi Sếp ơi!');
    }
    setIsChecking(false);
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAuthorized(false);
    router.refresh();
  };

  if (isAuthorized === null) return null;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#ef4444] flex items-center justify-center text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="font-display font-black text-2xl mb-2 uppercase tracking-tight text-center">Admin Access</h1>
          <p className="text-slate-500 text-center text-sm mb-6 font-bold text-slate-500 uppercase tracking-widest">Identify Yourself, Sếp.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Password..."
              className="w-full border-4 border-black p-4 outline-none font-bold text-center tracking-widest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              disabled={isChecking}
            />
            <button 
              disabled={isChecking}
              className="w-full bg-[#ef4444] text-white p-4 font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
            >
              {isChecking ? 'Verifying...' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'posts', label: 'All Posts', icon: FileText },
    { id: 'news', label: 'News Feed', icon: FileText },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'compare', label: 'Comparison', icon: FileText },
    { id: 'guide', label: 'Guides', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'posts' || activeTab === 'dashboard') return matchesSearch;
    return matchesSearch && post.section === activeTab;
  });

  return (
    <div className="flex h-screen bg-[#F3F4F6] text-slate-900 font-sans">
      <aside className="w-64 bg-white border-r-4 border-black flex flex-col">
        <div className="p-6 border-b-4 border-black">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ef4444] border-2 border-black flex items-center justify-center text-white font-bold">A+</div>
            <span className="font-display font-black text-xl tracking-tight">AI Plus Admin</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-transparent transition-all font-black uppercase text-[10px] tracking-widest ${
                activeTab === item.id 
                ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-black'
              }`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t-4 border-black">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-[#ef4444] transition-colors font-black uppercase text-xs tracking-widest"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b-4 border-black flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
              <input 
                type="text" 
                placeholder="Search articles..." 
                className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6] border-2 border-black focus:outline-none focus:bg-white transition-all font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-black px-3 py-1.5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
              <Globe size={14} />
              <span>{lang === 'en' ? 'EN' : 'VI'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-4xl font-display font-black text-black tracking-tight uppercase leading-none">{activeTab}</h1>
                <p className="text-slate-500 mt-2 font-bold italic uppercase text-xs tracking-widest">Managing {activeTab} content unification.</p>
              </div>
              
              <button 
                onClick={() => router.push(`/${lang}/xyz_safe/new`)}
                className="flex items-center gap-2 bg-[#ef4444] text-white px-6 py-3 border-4 border-black font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
              >
                <Plus size={20} />
                <span>New Post</span>
              </button>
            </div>

            {['posts', 'news', 'compare', 'guide', 'events'].includes(activeTab) && (
              <>
                <div className="grid grid-cols-4 gap-6 mb-10">
                  <div className="bg-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filtered Result</p>
                    <p className="text-3xl font-display font-black text-black leading-none mt-2">{filteredPosts.length}</p>
                  </div>
                  <div className="bg-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Published</p>
                    <p className="text-3xl font-display font-black text-[#ef4444] leading-none mt-2">{filteredPosts.filter(p => p.is_published).length}</p>
                  </div>
                </div>

                <div className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-10">
                  <table className="w-full text-left">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Title</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Section</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black">
                      {filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-black text-black leading-tight uppercase text-sm">{post.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">/{post.slug}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 border-2 border-black bg-white text-[10px] font-black uppercase tracking-widest">
                              {post.section || 'news'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 border-2 border-black text-[10px] font-black uppercase tracking-widest ${
                              post.is_published ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}>
                              {post.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">
                            {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === post.id ? null : post.id);
                              }}
                              className="p-2 text-black hover:bg-black hover:text-white transition-all border-2 border-transparent hover:border-black"
                            >
                              <MoreVertical size={18} />
                            </button>
                            
                            {openMenuId === post.id && (
                              <div className="absolute right-6 top-12 w-48 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 flex flex-col items-start overflow-hidden">
                                <button 
                                  onClick={() => router.push(`/${lang}/xyz_safe/edit/${post.id}`)}
                                  className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-[#ef4444] hover:text-white transition-colors border-b-2 border-black"
                                >
                                  Edit Post
                                </button>
                                <button 
                                  onClick={() => handleTogglePublish(post.id, post.is_published)}
                                  className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors border-b-2 border-black"
                                >
                                  {post.is_published ? 'Unpublish' : 'Publish Now'}
                                </button>
                                <button 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#ef4444] hover:bg-[#ef4444] hover:text-white transition-colors"
                                >
                                  Delete Post
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredPosts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-black uppercase tracking-widest">
                            No content found for this section.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'categories' && (
              <>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h1 className="text-4xl font-display font-black text-black tracking-tight uppercase leading-none">Categories</h1>
                    <p className="text-slate-500 mt-2 font-bold italic uppercase text-xs tracking-widest">Manage article categories for multilingual news feeds.</p>
                  </div>
                  
                  {!showCategoryForm && (
                    <button 
                      onClick={() => setShowCategoryForm(true)}
                      className="flex items-center gap-2 bg-[#ef4444] text-white px-6 py-3 border-4 border-black font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                      <Plus size={20} />
                      <span>New Category</span>
                    </button>
                  )}
                </div>

                {showCategoryForm && (
                  <form onSubmit={handleSaveCategory} className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8 mb-10 space-y-6">
                    <h3 className="font-display font-black text-xl uppercase border-b-2 border-black pb-2">
                      {editingCategory ? 'Edit Category' : 'Create New Category'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2">Category Name</label>
                        <input 
                          type="text" 
                          value={catName}
                          onChange={handleCatNameChange}
                          placeholder="e.g. Technology, AI Agents..."
                          className="w-full p-3 border-2 border-black font-bold outline-none focus:bg-slate-50"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2">Slug</label>
                        <input 
                          type="text" 
                          value={catSlug}
                          onChange={(e) => setCatSlug(slugify(e.target.value))}
                          placeholder="e.g. technology, ai-agents..."
                          className="w-full p-3 border-2 border-black font-bold outline-none focus:bg-slate-50"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2">Language</label>
                        <select 
                          value={catLang}
                          onChange={(e) => setCatLang(e.target.value)}
                          className="w-full p-3 border-2 border-black font-bold uppercase tracking-widest bg-white outline-none"
                        >
                          <option value="en">English</option>
                          <option value="vi">Vietnamese</option>
                          <option value="de">German</option>
                          <option value="hi">Hindi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-widest mb-2">Description</label>
                        <textarea 
                          value={catDescription}
                          onChange={(e) => setCatDescription(e.target.value)}
                          placeholder="Brief description of this category (useful for SEO)..."
                          className="w-full p-3 border-2 border-black font-bold outline-none focus:bg-slate-50 h-12 resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        type="submit"
                        disabled={isSavingCategory}
                        className="flex items-center gap-2 bg-[#ef4444] text-white px-6 py-3 border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                      >
                        {isSavingCategory ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Category
                      </button>
                      
                      <button 
                        type="button"
                        onClick={resetCategoryForm}
                        className="px-6 py-3 bg-white border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-10">
                  <table className="w-full text-left">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Name</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Slug</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Language</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Description</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black">
                      {loadingCategories ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-16 text-center">
                            <Loader2 className="animate-spin inline-block mr-2" /> Loading categories...
                          </td>
                        </tr>
                      ) : (
                        categories.filter(c => c.lang === lang).map((cat) => (
                          <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-black uppercase text-sm">{cat.name}</td>
                            <td className="px-6 py-4 text-[10px] font-bold text-slate-500 tracking-wider">/category/{cat.slug}</td>
                            <td className="px-6 py-4 text-xs font-black uppercase tracking-widest">{cat.lang}</td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-medium max-w-xs truncate">{cat.description || 'N/A'}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button 
                                onClick={() => startEditCategory(cat)}
                                className="px-3 py-1.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="px-3 py-1.5 border-2 border-[#ef4444] text-[#ef4444] bg-white hover:bg-[#ef4444] hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                      {!loadingCategories && categories.filter(c => c.lang === lang).length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-black uppercase tracking-widest">
                            No categories found for this language.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {['dashboard', 'media', 'settings'].includes(activeTab) && (
              <div className="bg-white border-4 border-dashed border-black p-24 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 border-4 border-black flex items-center justify-center text-black mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <Settings size={40} />
                </div>
                <h3 className="text-2xl font-display font-black text-black uppercase">Coming Soon</h3>
                <p className="text-slate-500 max-w-xs mt-3 font-bold uppercase text-[10px] tracking-widest">Feature under development by Sếp.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
