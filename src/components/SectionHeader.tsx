import Link from 'next/link';

interface SectionHeaderProps {
 title: string;
 lang: string;
 href?: string;
 className?: string;
}

export default function SectionHeader({ title, lang, href, className =""}: SectionHeaderProps) {
 return (
 <div className={`flex justify-between items-end border-b-4 border-black pb-4 mb-10 ${className}`}>
 <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-none uppercase">
 {title}
 </h2>
 {href && (
 <Link 
 href={href} 
 className="group text-xs font-black bg-white text-black px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
 >
 <span className="group-hover:text-[#ef4444] transition-colors flex items-center gap-1">
 {( {
 vi: 'XEM TẤT CẢ', en: 'SEE ALL', ko: '전체보기', ja: 'すべて見る', fr: 'VOIR TOUT'
 }[lang] || 'SEE ALL' )}
 <svg className="w-4 h-4"fill="none"stroke="currentColor"viewBox="0 0 24 24">
 <path strokeLinecap="round"strokeLinejoin="round"strokeWidth="3"d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
 </svg>
 </span>
 </Link>
 )}
 </div>
 );
}
