'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function GlobalSearch({ lang }: { lang: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ posts: any[]; guides: any[] }>({ posts: [], guides: [] });
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const t = {
    search_btn: {
      vi: 'Tìm kiếm trí tuệ...', en: 'Search Intelligence...', ko: '인텔리전스 검색...', ja: 'インテリジェンス検索...', fr: 'Recherche d\'intelligence...'
    }[lang] || 'Search Intelligence...',
    search_placeholder: {
      vi: 'Tìm bài viết, cẩm nang hoặc xu hướng...',
      en: 'Search posts, guides, or trends...',
      ko: '글, 가이드 또는 트렌드 검색...',
      ja: '記事、ガイド、またはトレンドを検索...',
      fr: 'Rechercher des articles, guides ou tendances...'
    }[lang] || 'Search posts, guides, or trends...',
    scanning: {
      vi: 'Đang quét Cơ sở dữ liệu...', en: 'Scanning Database...', ko: '데이터베이스 스캔 중...', ja: 'データベースをスキャン中...', fr: 'Balayage de la base de données...'
    }[lang] || 'Scanning Database...',
    enter_min: {
      vi: 'Nhập ít nhất 2 ký tự để tìm kiếm',
      en: 'Enter at least 2 characters to search',
      ko: '검색하려면 최소 2자를 입력하세요',
      ja: '検索するには2文字以上入力してください',
      fr: 'Entrez au moins 2 caractères pour rechercher'
    }[lang] || 'Enter at least 2 characters to search',
    no_results: {
      vi: 'Không tìm thấy dữ liệu trí tuệ',
      en: 'No intelligence found',
      ko: '인텔리전스를 찾을 수 없습니다',
      ja: 'インテリジェンスが見つかりません',
      fr: 'Aucune intelligence trouvée'
    }[lang] || 'No intelligence found',
    try_diff: {
      vi: 'Thử từ khóa khác xem sao',
      en: 'Try different keywords',
      ko: '다른 키워드를 시도해 보세요',
      ja: '別のキーワードをお試しください',
      fr: 'Essayez différents mots-clés'
    }[lang] || 'Try different keywords',
    news_updates: {
      vi: 'Tin tức & Cập nhật',
      en: 'News & Updates',
      ko: '뉴스 및 업데이트',
      ja: 'ニュース＆アップデート',
      fr: 'Nouvelles & Mises à jour'
    }[lang] || 'News & Updates',
    strategic_guides: {
      vi: 'Cẩm nang chiến lược',
      en: 'Strategic Guides',
      ko: '전략 가이드',
      ja: '戦略ガイド',
      fr: 'Guides stratégiques'
    }[lang] || 'Strategic Guides',
    select: {
      vi: 'CHỌN', en: 'SELECT', ko: '선택', ja: '選択', fr: 'SÉLECTIONNER'
    }[lang] || 'SELECT',
    close: {
      vi: 'ĐÓNG', en: 'CLOSE', ko: '닫기', ja: '閉じる', fr: 'FERMER'
    }[lang] || 'CLOSE',
    brand_search: {
      vi: 'Tìm kiếm AI PLUS MAP',
      en: 'AI PLUS MAP Intelligence Search',
      ko: 'AI PLUS MAP 인텔리전스 검색',
      ja: 'AI PLUS MAP インテリジェンス検索',
      fr: 'Recherche AI PLUS MAP'
    }[lang] || 'AI PLUS MAP Intelligence Search'
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults({ posts: [], guides: [] });
        return;
      }

      setIsSearching(true);
      
      const [newsRes, guidesRes] = await Promise.all([
        supabase
          .from('posts')
          .select('title, slug, excerpt, section')
          .eq('lang', lang)
          .eq('section', 'news')
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
          .limit(5),
        supabase
          .from('posts')
          .select('title, slug, excerpt, section')
          .eq('lang', lang)
          .eq('section', 'guide')
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
          .limit(5)
      ]);

      setResults({
        posts: newsRes.data || [],
        guides: guidesRes.data || []
      });
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, lang]);

  const handleNavigate = (section: string, slug: string) => {
    router.push(`/${lang}/${section}/${slug}`);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-4 px-4 py-2 border-2 border-black bg-white hover:bg-slate-50 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0 hover:translate-x-[2px] hover:translate-y-[2px]"
      >
        <Search size={18} />
        <span className="font-black text-xs uppercase hidden lg:inline">{t.search_btn}</span>
        <kbd className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 border border-slate-300 rounded bg-slate-100 text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4">
          <div 
            ref={searchRef}
            className="w-full max-w-2xl bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col"
          >
            <div className="flex items-center border-b-4 border-black p-4 bg-slate-50">
              <Search className="mr-4 text-slate-400" />
              <input 
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search_placeholder}
                className="flex-grow bg-transparent border-none outline-none font-black text-xl placeholder:text-slate-300 uppercase tracking-tighter"
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-black hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="animate-spin mb-4" />
                  <span className="font-black text-xs uppercase italic tracking-widest">{t.scanning}</span>
                </div>
              ) : query.length < 2 ? (
                <div className="py-12 text-center">
                  <p className="font-black text-xs uppercase text-slate-400 italic">{t.enter_min}</p>
                </div>
              ) : results.posts.length === 0 && results.guides.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-black text-2xl uppercase tracking-tighter">{t.no_results}</p>
                  <p className="text-xs font-bold text-[#ef4444] uppercase mt-2 italic">{t.try_diff}</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {results.posts.length > 0 && (
                    <section>
                      <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#ef4444]"></span> {t.news_updates}
                      </h3>
                      <div className="space-y-2">
                        {results.posts.map((post) => (
                          <button
                            key={post.slug}
                            onClick={() => handleNavigate(post.section, post.slug)}
                            className="w-full text-left p-4 border-2 border-black hover:bg-black hover:text-white transition-all group"
                          >
                            <h4 className="font-black text-lg uppercase leading-none mb-1">{post.title}</h4>
                            <p className="text-[10px] font-bold line-clamp-1 opacity-60 uppercase">{post.excerpt}</p>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {results.guides.length > 0 && (
                    <section>
                      <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500"></span> {t.strategic_guides}
                      </h3>
                      <div className="space-y-2">
                        {results.guides.map((guide) => (
                          <button
                            key={guide.slug}
                            onClick={() => handleNavigate(guide.section, guide.slug)}
                            className="w-full text-left p-4 border-2 border-black hover:bg-[#ef4444] hover:text-white transition-all group"
                          >
                            <h4 className="font-black text-lg uppercase leading-none mb-1">{guide.title}</h4>
                            <p className="text-[10px] font-bold line-clamp-1 opacity-60 uppercase">{guide.excerpt}</p>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>

            <div className="border-t-4 border-black p-3 bg-slate-50 flex justify-between items-center px-6">
              <div className="flex gap-4">
                <span className="text-[9px] font-black uppercase text-slate-400"><kbd className="border border-slate-300 px-1 rounded bg-white mr-1 text-black">ENTER</kbd> {t.select}</span>
                <span className="text-[9px] font-black uppercase text-slate-400"><kbd className="border border-slate-300 px-1 rounded bg-white mr-1 text-black">ESC</kbd> {t.close}</span>
              </div>
              <span className="text-[9px] font-black uppercase italic text-[#ef4444]">{t.brand_search}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
