'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-center'; // Note: Lucide icon fix if needed
import { ChevronDown as ChevronIcon } from 'lucide-react';
import GlobalSearch from '@/components/search/GlobalSearch';
import { useState } from 'react';

export default function Navbar({ lang }: { lang: string }) {
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
                
                {sections.map((section) => (
                   <li key={section.slug}>
                     <Link href={`/${lang}/${section.slug}`} className="px-3 py-2 hover:bg-black hover:text-white transition-colors">
                       {section.name}
                     </Link>
                   </li>
                ))}
              </ul>
            </nav>
            <GlobalSearch lang={lang} />
          </div>
        </div>
      </div>
    </header>
  );
}
