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
        lang: lang === 'vn' ? 'vi' : lang, 
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
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A+</div>
            <span className="font-bold text-xl tracking-tight">AI Plus Admin</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 transition-colors font-bold"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              <Globe size={14} />
              <span>{lang === 'en' ? 'English (/en)' : 'Tiếng Việt (/vi)'}</span>
            </div>
            <button className="text-slate-500 hover:text-blue-600 relative">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">3</span>
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="text-right">
                <p className="text-sm font-bold">Sếp</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white shadow-sm"></div>
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{activeTab}</h1>
                <p className="text-slate-500 mt-1">Manage your {activeTab} content.</p>
              </div>
              
              {activeTab === 'posts' && (
                <button 
                  onClick={() => router.push(`/${lang}/admin/new`)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
                >
                  <Plus size={20} />
                  <span>Create New Post</span>
                </button>
              )}

              {activeTab === 'categories' && (
                <button 
                  onClick={() => setShowCatModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
                >
                  <Plus size={20} />
                  <span>New Category</span>
                </button>
              )}
            </div>

            {activeTab === 'posts' && (
              <>
                <div className="grid grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'Total Posts', value: posts.length.toString(), change: '+12%', color: 'blue' },
                    { label: 'Published', value: posts.filter(p => p.is_published).length.toString(), change: 'Stable', color: 'purple' },
                    { label: 'Drafts', value: posts.filter(p => !p.is_published).length.toString(), change: '-2%', color: 'emerald' },
                    { label: 'SEO Score', value: '98/100', change: '+5%', color: 'amber' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200">
                      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                      <div className="flex items-end justify-between mt-2">
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                          stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{post.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">By {post.author_name || 'Sếp'}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium">{post.categories?.name || 'Uncategorized'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              post.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${post.is_published ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                              {post.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === post.id ? null : post.id);
                              }}
                              className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                            >
                              <MoreVertical size={18} />
                            </button>
                            
                            {openMenuId === post.id && (
                              <div className="absolute right-6 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 flex flex-col items-start overflow-hidden animate-in fade-in zoom-in duration-200">
                                <button 
                                  onClick={() => router.push(`/${lang}/admin/edit/${post.id}`)}
                                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors border-b border-slate-100"
                                >
                                  Edit Article
                                </button>
                                <button 
                                  onClick={() => handleTogglePublish(post.id, post.is_published)}
                                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors border-b border-slate-100"
                                >
                                  {post.is_published ? 'Unpublish' : 'Publish Now'}
                                </button>
                                <button 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
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
                          <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">
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
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Language</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-900">{cat.name}</td>
                        <td className="px-6 py-4 text-sm font-mono text-blue-600 bg-blue-50/30">{cat.slug}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold uppercase">{cat.lang}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">
                          No categories found. Create one to get started!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {['dashboard', 'events', 'media', 'settings'].includes(activeTab) && (
              <div className="bg-white rounded-3xl border-4 border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <Settings size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-400">Coming Soon</h3>
                <p className="text-slate-400 max-w-xs mt-2">Tính năng này đang được Sếp phát triển, vui lòng quay lại sau.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-3xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b-4 border-black flex items-center justify-between bg-emerald-500">
              <h3 className="font-black text-white uppercase tracking-widest text-xl">New Category</h3>
              <button onClick={() => setShowCatModal(false)} className="bg-white p-1 rounded-lg border-2 border-black">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Category Name</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="e.g. AI News, Tutorial..."
                  className="w-full p-4 border-4 border-black rounded-xl outline-none font-bold focus:bg-slate-50 transition-colors"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border-2 border-black border-dashed">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Target Language</p>
                <p className="font-bold text-slate-900">{lang === 'en' ? 'English (/en)' : 'Tiếng Việt (/vi)'}</p>
              </div>

              <button 
                disabled={isSubmittingCat || !newCatName.trim()}
                className="w-full bg-black text-white p-4 rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
