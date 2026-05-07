"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  FolderTree, 
  Image as ImageIcon, 
  Settings, 
  Plus, 
  Search, 
  Bell, 
  LogOut,
  MoreVertical,
  Globe,
  Lock,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

const AdminDashboard = ({ posts = [], categories = [], lang = 'en' }: { posts?: any[], categories?: any[], lang?: string }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('posts');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

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

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Xóa category này có thể làm lỗi các bài viết đang thuộc nó. Sếp vẫn muốn xóa chứ?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        alert('Lỗi khi xóa category: ' + error.message);
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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsSubmittingCat(true);
    const slug = newCatName
      .toLowerCase()
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { error } = await supabase
      .from('categories')
      .insert([{ 
        name: newCatName, 
        slug, 
        lang: lang, 
        type: 'post' 
      }]);

    if (error) {
      alert('Lỗi tạo category: ' + error.message + '\nSếp nhớ chạy SQL fix RLS nhé!');
    } else {
      setNewCatName('');
      setShowCatModal(false);
      router.refresh();
    }
    setIsSubmittingCat(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth_session');
    if (auth === 'true') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    const isValid = await verifyPassword(password);
    if (isValid) {
      localStorage.setItem('admin_auth_session', 'true');
      setIsAuthorized(true);
    } else {
      alert('Sai mật khẩu rồi Sếp ơi!');
    }
    setIsChecking(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth_session');
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
          <p className="text-slate-500 text-center text-sm mb-6 font-bold">Vui lòng nhập mật khẩu để tiếp tục, Sếp.</p>
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
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F3F4F6] text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r-4 border-black flex flex-col">
        <div className="p-6 border-b-4 border-black">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ef4444] border-2 border-black flex items-center justify-center text-white font-bold">A+</div>
            <span className="font-display font-black text-xl tracking-tight">AI Plus Admin</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-transparent transition-all font-black uppercase text-xs tracking-widest ${
                activeTab === item.id 
                ? 'bg-black text-white border-black' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-black'
              }`}
            >
              <item.icon size={18} />
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b-4 border-black flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6] border-2 border-black focus:outline-none focus:bg-white transition-all font-bold"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-black px-3 py-1.5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
              <Globe size={14} />
              <span>{lang === 'en' ? 'EN' : 'VI'}</span>
            </div>
            
            <div className="flex items-center gap-3 border-l-4 border-black pl-6">
              <div className="text-right">
                <p className="text-sm font-black uppercase tracking-tighter leading-none">Sếp</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin</p>
              </div>
              <div className="w-10 h-10 bg-[#ef4444] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"></div>
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-4xl font-display font-black text-black tracking-tight uppercase leading-none">{activeTab}</h1>
                <p className="text-slate-500 mt-2 font-bold italic">Manage your {activeTab} content.</p>
              </div>
              
              {activeTab === 'posts' && (
                <button 
                  onClick={() => router.push(`/${lang}/admin/new`)}
                  className="flex items-center gap-2 bg-[#ef4444] text-white px-6 py-3 border-4 border-black font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <Plus size={20} />
                  <span>New Post</span>
                </button>
              )}

              {activeTab === 'categories' && (
                <button 
                  onClick={() => setShowCatModal(true)}
                  className="flex items-center gap-2 bg-[#ef4444] text-white px-6 py-3 border-4 border-black font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <Plus size={20} />
                  <span>New Category</span>
                </button>
              )}
            </div>

            {activeTab === 'posts' && (
              <>
                <div className="grid grid-cols-4 gap-6 mb-10">
                  {[
                    { label: 'Total Posts', value: posts.length.toString(), change: '+12%', color: '#ef4444' },
                    { label: 'Published', value: posts.filter(p => p.is_published).length.toString(), change: 'Stable', color: '#000' },
                    { label: 'Drafts', value: posts.filter(p => !p.is_published).length.toString(), change: '-2%', color: '#64748b' },
                    { label: 'SEO Score', value: '98/100', change: '+5%', color: '#ef4444' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                      <div className="flex items-end justify-between mt-2">
                        <p className="text-3xl font-display font-black text-black leading-none">{stat.value}</p>
                        <span className="text-[10px] font-black px-2 py-0.5 border-2 border-black bg-[#F3F4F6]">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-10">
                  <table className="w-full text-left">
                    <thead className="bg-black text-white">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Title</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Category</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black">
                      {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-black text-black leading-tight uppercase text-sm">{post.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">By {post.author_name || 'Sếp'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 border-2 border-black bg-white text-[10px] font-black uppercase tracking-widest">
                              {post.categories?.name || 'Uncategorized'}
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
                                  onClick={() => router.push(`/${lang}/admin/edit/${post.id}`)}
                                  className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-[#ef4444] hover:text-white transition-colors border-b-2 border-black"
                                >
                                  Edit Article
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
                                  Delete Article
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {posts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-black uppercase tracking-widest">
                            No posts found for this language.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'categories' && (
              <div className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Name</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Slug</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Language</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-black uppercase text-sm">{cat.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 border-2 border-black bg-[#F3F4F6] text-[10px] font-bold font-mono">{cat.slug}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 border-2 border-black bg-black text-white text-[10px] font-black uppercase tracking-widest">{cat.lang}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 text-slate-300 hover:text-[#ef4444] transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center text-slate-400 font-black uppercase tracking-widest">
                          No categories found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {['dashboard', 'events', 'media', 'settings'].includes(activeTab) && (
              <div className="bg-white border-4 border-dashed border-black p-24 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 border-4 border-black flex items-center justify-center text-black mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <Settings size={40} />
                </div>
                <h3 className="text-2xl font-display font-black text-black uppercase">Coming Soon</h3>
                <p className="text-slate-500 max-w-xs mt-3 font-bold">Tính năng này đang được Sếp phát triển, vui lòng quay lại sau.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b-4 border-black flex items-center justify-between bg-[#ef4444]">
              <h3 className="font-display font-black text-white uppercase tracking-widest text-xl">New Category</h3>
              <button onClick={() => setShowCatModal(false)} className="bg-white p-1 border-2 border-black hover:bg-black hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Category Name</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. AI News..."
                  className="w-full p-4 border-4 border-black outline-none font-black uppercase tracking-tighter focus:bg-[#F3F4F6] transition-colors"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
              </div>
              
              <div className="bg-[#F3F4F6] p-4 border-4 border-black border-dashed">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Target Language</p>
                <p className="font-black uppercase text-black">{lang === 'en' ? 'English (/en)' : 'Tiếng Việt (/vi)'}</p>
              </div>

              <button 
                disabled={isSubmittingCat || !newCatName.trim()}
                className="w-full bg-black text-white p-5 font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingCat ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                <span>Create Category</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
