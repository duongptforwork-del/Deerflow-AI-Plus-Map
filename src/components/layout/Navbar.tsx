'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown as ChevronIcon } from 'lucide-react';
import GlobalSearch from '@/components/search/GlobalSearch';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar({ lang }: { lang: string }) {
 const [categories, setCategories] = useState<any[]>([]);
 const [langDropdownOpen, setLangDropdownOpen] = useState(false);
 const pathname = usePathname();
 const router = useRouter();

 const languages = [
 { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English' },
 { code: 'vi', label: 'VI', flag: '🇻🇳', name: 'Tiếng Việt' },
 { code: 'ko', label: 'KO', flag: '🇰🇷', name: '한국어' },
 { code: 'ja', label: 'JA', flag: '🇯🇵', name: '日本語' },
 { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
 ];

 const handleLanguageChange = (newLang: string) => {
 if (!pathname) return;
 const segments = pathname.split('/');
 segments[1] = newLang;
 const newPath = segments.join('/');
 router.push(newPath);
 };

 useEffect(() => {
 const fetchNavbarCategories = async () => {
 const { data, error } = await supabase
 .from('categories')
 .select('name, slug')
 .eq('lang', lang)
 .order('name', { ascending: true });
 if (data && !error) {
 setCategories(data);
 }
 };
 fetchNavbarCategories();
 }, [lang]);

 // Mapping for sections supporting 5 languages
 const sections = [
 { 
 name: { 
 vi: 'TIN TỨC', en: 'NEWS', ko: '뉴스', ja: 'ニュース', fr: 'ACTUALITÉS' 
 }[lang] || 'NEWS', 
 slug: 'news' 
 },
 
 
 { 
 name: { 
 vi: 'SỰ KIỆN', en: 'EVENTS', ko: '이벤트', ja: 'イベント', fr: 'ÉVÉNEMENTS' 
 }[lang] || 'EVENTS', 
 slug: 'events' 
 },
 ];

 return (
 <header className="bg-white border-b-4 border-black py-4 sticky top-0 z-50">
 <div className="max-w-7xl mx-auto px-4">
 <div className="flex flex-col md:flex-row justify-between items-center gap-6">
 <Link href={`/${lang}`} className="flex items-center gap-3 group">
 <div className="bg-black border-4 border-black p-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
 <div className="w-9 h-9 relative overflow-hidden invert">
 <Image 
 src="/logo.png"
 alt="AI Plus Map Logo"
 fill
 className="object-contain"
 onError={(e) => { e.currentTarget.src = '/placeholder.png'; }} />
 </div>
 </div>
 <div>
 <div className="flex items-baseline gap-1">
 <span className="text-3xl font-display font-black tracking-tighter block leading-none group-hover:text-[#ef4444] transition-colors">AI PLUS MAP</span>
 </div>
 <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">The Intelligence Cartography</span>
 </div>
 </Link>

 <div className="flex items-center gap-6">
 <nav className="hidden lg:block">
 <ul className="flex items-center gap-1 font-black text-sm uppercase italic">
 <li><Link href={`/${lang}`} className="group px-3 py-2 transition-colors">
 <span className="group-hover:text-[#ef4444] transition-colors">
 { { vi: 'Trang Chủ', en: 'Home', ko: '홈', ja: 'ホーム', fr: 'Accueil' }[lang] || 'Home' }
 </span>
 </Link></li>
 
 {sections.map((section) => {
 if (section.slug === 'news') {
 return (
 <li key={section.slug} className="relative group py-2">
 <Link href={`/${lang}/${section.slug}`} className="group px-3 py-2 transition-colors flex items-center gap-1">
 <span className="group-hover:text-[#ef4444] transition-colors flex items-center gap-1">{section.name} <ChevronIcon size={14} className=""/></span>
 </Link>
 
 {categories.length > 0 && (
 <div className="absolute left-0 mt-2 pt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto z-50">
 <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col">
 {categories.map((cat) => (
 <Link 
 key={cat.slug} 
 href={`/${lang}/category/${cat.slug}`} 
 className="group px-4 py-3 text-xs font-black uppercase tracking-widest border-b-4 border-black last:border-0 transition-colors normal-case block"
 >
 <span className="group-hover:text-[#ef4444] transition-colors">{cat.name}</span>
 </Link>
 ))}
 </div>
 </div>
 )}
 </li>
 );
 }

 return (
 <li key={section.slug}>
 <Link href={`/${lang}/${section.slug}`} className="group px-3 py-2 transition-colors block">
 <span className="group-hover:text-[#ef4444] transition-colors">{section.name}</span>
 </Link>
 </li>
 );
 })}
 </ul>
 </nav>
 <div className="flex items-center gap-4">
 <GlobalSearch lang={lang} />
 
 <div className="relative">
 <button 
 onClick={() => setLangDropdownOpen(!langDropdownOpen)}
 className="flex items-center gap-1.5 px-3 py-2 border-4 border-black font-black uppercase text-xs bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
 >
 <span>{languages.find(l => l.code === lang)?.flag || '🇺🇸'}</span>
 <span>{lang.toUpperCase()}</span>
 <ChevronIcon size={12} className={` ${langDropdownOpen ? 'rotate-180' : ''}`} />
 </button>

 {langDropdownOpen && (
 <>
 <div className="fixed inset-0 z-40"onClick={() => setLangDropdownOpen(false)} />
 <div className="absolute right-0 mt-2 w-40 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 flex flex-col">
 {languages.map((l) => (
 <button
 key={l.code}
 onClick={() => {
 handleLanguageChange(l.code);
 setLangDropdownOpen(false);
 }}
 className={`group flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-left border-b-4 border-black last:border-0 transition-colors ${
 lang === l.code ? 'bg-black text-white' : 'text-black bg-white'
 }`}
 >
 <span>{l.flag}</span>
 <span className={lang === l.code ? '' : 'group-hover:text-[#ef4444] transition-colors'}>{l.name}</span>
 </button>
 ))}
 </div>
 </>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 </header>
 );
}