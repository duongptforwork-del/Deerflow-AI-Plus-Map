'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown as ChevronIcon } from 'lucide-react';
import GlobalSearch from '@/components/search/GlobalSearch';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar({ lang }: { lang: string }) {
  const [categories, setCategories] = useState<any[]>([]);

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

  // Mapping for sections
  const sections = [
    { name: lang === 'vi' ? 'TIN TỨC' : 'NEWS', slug: 'news' },
    { name: lang === 'vi' ? 'SO SÁNH' : 'COMPARE', slug: 'compare' },
    { name: lang === 'vi' ? 'HƯỚNG DẪN' : 'GUIDES', slug: 'guide' },
    { name: lang === 'vi' ? 'SỰ KIỆN' : 'EVENTS', slug: 'events' },
  ];

  return (
    <header className="bg-white border-b-2 border-black py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href={`/${lang}`} className="flex items-center gap-3 group">
            <div className="bg-black border-2 border-black p-1.5 group-hover:-rotate-6 transition-transform shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
              <div className="w-9 h-9 relative invert">
                <Image 
                  src="/logo.png" 
                  alt="AI Plus Map Logo" 
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-black tracking-tighter block leading-none">AI PLUS MAP</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">The Intelligence Cartography</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-1 font-black text-sm uppercase italic">
                <li><Link href={`/${lang}`} className="px-3 py-2 hover:bg-black hover:text-white transition-colors">{lang === 'vi' ? 'Trang Chủ' : 'Home'}</Link></li>
                
                {sections.map((section) => {
                  if (section.slug === 'news') {
                    return (
                      <li key={section.slug} className="relative group py-2">
                        <Link href={`/${lang}/${section.slug}`} className="px-3 py-2 hover:bg-black hover:text-white transition-colors flex items-center gap-1">
                          {section.name} <ChevronIcon size={14} className="group-hover:rotate-180 transition-transform duration-200" />
                        </Link>
                        
                        {categories.length > 0 && (
                          <div className="absolute left-0 mt-2 pt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                              {categories.map((cat) => (
                                <Link 
                                  key={cat.slug} 
                                  href={`/${lang}/category/${cat.slug}`} 
                                  className="px-4 py-3 hover:bg-black hover:text-white text-xs font-black uppercase tracking-widest border-b-2 border-black last:border-0 transition-colors normal-case"
                                >
                                  {cat.name}
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
                      <Link href={`/${lang}/${section.slug}`} className="px-3 py-2 hover:bg-black hover:text-white transition-colors">
                        {section.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <GlobalSearch lang={lang} />
          </div>
        </div>
      </div>
    </header>
  );
}
