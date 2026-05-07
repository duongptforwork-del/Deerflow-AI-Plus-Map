import Link from 'next/link';
import Image from 'next/image';

export default function Footer({ lang }: { lang: string }) {
  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t-8 border-[#ef4444]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-4 mb-10 group">
              <div className="bg-[#ef4444] border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                <Image 
                  src="/logo.png" 
                  alt="AI Plus Map Logo" 
                  width={56} 
                  height={56} 
                  className="block object-contain invert"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-5xl font-display font-black tracking-tighter leading-none">AI PLUS</span>
                <span className="text-3xl font-display font-black tracking-tighter leading-none text-black bg-[#ef4444] px-2 mt-1 w-fit border-2 border-white">MAP</span>
              </div>
            </div>
            <p className="text-slate-400 max-w-md font-bold leading-relaxed">
              AI Plus Map: Your daily source for AI News Today, Best AI Updates, and AI Ranking. Mapping the intelligence landscape for the future.
            </p>
          </div>
          
          <div>
            <h5 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-[#ef4444]">Navigation</h5>
            <ul className="space-y-4 text-sm font-black uppercase italic">
              <li><Link href={`/${lang}/news`} className="hover:text-[#ef4444] transition-colors">News Feed</Link></li>
              <li><Link href={`/${lang}/compare`} className="hover:text-[#ef4444] transition-colors">AI Comparisons</Link></li>
              <li><Link href={`/${lang}/guide`} className="hover:text-[#ef4444] transition-colors">Usage Guides</Link></li>
              <li><Link href={`/${lang}/events`} className="hover:text-[#ef4444] transition-colors">Industry Events</Link></li>
            </ul>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h5 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-[#ef4444]">Connect</h5>
              <div className="flex gap-4">
                <div className="w-10 h-10 border-2 border-white flex items-center justify-center font-black hover:bg-white hover:text-black transition-all cursor-pointer">TW</div>
                <div className="w-10 h-10 border-2 border-white flex items-center justify-center font-black hover:bg-white hover:text-black transition-all cursor-pointer">FB</div>
                <div className="w-10 h-10 border-2 border-white flex items-center justify-center font-black hover:bg-white hover:text-black transition-all cursor-pointer">YT</div>
              </div>
            </div>

          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            &copy; 2026 AI PLUS MAP. ALL RIGHTS RESERVED. NO AI WAS HARMED IN THE MAKING OF THIS MAGAZINE.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
