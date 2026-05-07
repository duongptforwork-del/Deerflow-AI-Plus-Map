import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  lang: string;
  href?: string;
  className?: string;
}

export default function SectionHeader({ title, lang, href, className = "" }: SectionHeaderProps) {
  return (
    <div className={`flex justify-between items-end border-b-4 border-black pb-4 mb-10 ${className}`}>
      <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight leading-none">
        {title}
      </h2>
      {href && (
        <Link 
          href={href} 
          className="text-xs font-black bg-black text-white px-4 py-2 hover:bg-[#ef4444] transition-colors flex items-center gap-1 group"
        >
          SEE ALL
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
        </Link>
      )}
    </div>
  );
}
