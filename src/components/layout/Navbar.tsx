'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import GlobalSearch from '@/components/search/GlobalSearch';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar({ lang }: { lang: string }) {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('name, slug')
        .eq('type', 'post')
        .eq('lang', lang)
        .order('name');
      
      if (data) {
        setCategories(data);
      }
      
      if (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, [lang]);

  return (
    <header className="bg-white border-b-2 border-black py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href={`/${lang}`} className="flex items-center gap-2 group">
            <div className="bg-white border-2 border-black p-1 group-hover:rotate-6 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Image 
                src="/logo.png" 
                alt="AI Plus Map Logo" 
                width={40} 
                height={40} 
                className="block object-contain"
              />
            </div>
            <div>
              <span className="text-3xl font-display font-black tracking-tighter block leading-none">AI PLUS MAP</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">The Intelligence Cartography</span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-1 font-black text-sm uppercase italic">
                <li><Link href={`/${lang}`} className="px-3 py-2 hover:bg-black hover:text-white transition-colors">Home</Link></li>
                <li className="relative group">
                  <Link href={`/${lang}/news`} className="px-3 py-2 flex items-center gap-1 hover:bg-black hover:text-white transition-colors">
                    News <ChevronDown size={14} />
                  </Link>
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 w-64 bg-white border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hidden group-hover:block z-50">
                    {categories.map((cat) => (
                      <Link 
                        key={cat.slug} 
                        href={`/${lang}/category/${cat.slug}`}
                        className="block px-4 py-3 border-b border-black last:border-0 hover:bg-[#ef4444] hover:text-white transition-colors text-[12px] uppercase"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </li>
                <li><Link href={`/${lang}/compare`} className="px-3 py-2 hover:bg-black hover:text-white transition-colors">Compare</Link></li>
                <li><Link href={`/${lang}/guide`} className="px-3 py-2 hover:bg-black hover:text-white transition-colors">AI Guide</Link></li>
                <li><Link href={`/${lang}/events`} className="px-3 py-2 hover:bg-black hover:text-white transition-colors">Events</Link></li>
              </ul>
            </nav>
            <GlobalSearch lang={lang} />
          </div>
        </div>
      </div>
    </header>
  );
}
