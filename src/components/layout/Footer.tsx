import Link from 'next/link';
import Image from 'next/image';

export default function Footer({ lang }: { lang: string }) {
  const t = {
    desc: {
      vi: 'AI Plus Map: Nguồn thông tin hàng ngày của bạn về Tin tức AI, Cập nhật AI tốt nhất và Bảng xếp hạng AI. Vẽ bản đồ bối cảnh trí tuệ nhân tạo cho tương lai.',
      en: 'AI Plus Map: Your daily source for AI News Today, Best AI Updates, and AI Ranking. Mapping the intelligence landscape for the future.',
      ko: 'AI Plus Map: AI 뉴스, 최고의 AI 업데이트 및 AI 랭킹을 제공하는 일일 소스입니다. 미래를 위한 인공지능 지형도를 그립니다.',
      ja: 'AI Plus Map: AIニュース、最高のAIアップデート、およびAIランキング의 매일 소스. 미래의 인텔리전스 전망을 맵핑합니다.',
      fr: 'AI Plus Map: Votre source quotidienne d\'actualités AI, de meilleures mises à jour AI et de classement AI. Cartographier le paysage de l\'intelligence pour l\'avenir.'
    }[lang] || 'AI Plus Map: Your daily source for AI News Today, Best AI Updates, and AI Ranking. Mapping the intelligence landscape for the future.',
    navigation: {
      vi: 'Điều Hướng', en: 'Navigation', ko: '탐색', ja: 'ナビゲーション', fr: 'Navigation'
    }[lang] || 'Navigation',
    news_feed: {
      vi: 'Tin Tức AI', en: 'News Feed', ko: '뉴스 피드', ja: 'ニュース', fr: 'Flux d\'actualités'
    }[lang] || 'News Feed',
    ai_comparisons: {
      vi: 'So Sánh AI', en: 'AI Comparisons', ko: 'AI 비교', ja: '比較', fr: 'Comparaisons AI'
    }[lang] || 'AI Comparisons',
    usage_guides: {
      vi: 'Hướng Dẫn AI', en: 'Usage Guides', ko: '사용 가이드', ja: 'ガイド', fr: 'Guides d\'utilisation'
    }[lang] || 'Usage Guides',
    industry_events: {
      vi: 'Sự Kiện AI', en: 'Industry Events', ko: '업계 이벤트', ja: 'イベント', fr: 'Événements du secteur'
    }[lang] || 'Industry Events',
    connect: {
      vi: 'Kết Nối', en: 'Connect', ko: '연결', ja: '接続', fr: 'Se connecter'
    }[lang] || 'Connect',
    rights: {
      vi: 'BẢN QUYỀN THUỘC VỀ AI PLUS MAP. KHÔNG CÓ AI NÀO BỊ HẠI TRONG QUÁ TRÌNH THỰC HIỆN TẠP CHÍ NÀY.',
      en: 'ALL RIGHTS RESERVED. NO AI WAS HARMED IN THE MAKING OF THIS MAGAZINE.',
      ko: '모든 권리 보유. 이 잡지를 제작하는 동안 인공지능(AI)은 해를 입지 않았습니다.',
      ja: 'ALL RIGHTS RESERVED. このマガジンの作成において、いかなるAIも被害を受けませんでした。',
      fr: 'TOUS DROITS RÉSERVÉS. AUCUNE IA N\'A ÉTÉ BLESSÉE LORS DE LA CRÉATION DE CE MAGAZINE.'
    }[lang] || 'ALL RIGHTS RESERVED. NO AI WAS HARMED IN THE MAKING OF THIS MAGAZINE.',
    privacy: {
      vi: 'Chính sách bảo mật', en: 'Privacy Policy', ko: '개인정보 처리방침', ja: 'プライバシーポリシー', fr: 'Politique de confidentialité'
    }[lang] || 'Privacy Policy',
    terms: {
      vi: 'Điều khoản dịch vụ', en: 'Terms of Service', ko: '이용약관', ja: '利用規約', fr: 'Conditions d\'utilisation'
    }[lang] || 'Terms of Service'
  };

  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t-8 border-[#ef4444]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-4 mb-10 group">
              <div className="bg-[#ef4444] border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                <Image 
                  src="/logo.png" 
                  alt="AI Plus Map Logo" 
                  width={56} 
                  height={56} 
                  className="block object-contain invert"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-5xl font-display font-black tracking-tighter leading-none">AI PLUS MAP</span>
              </div>
            </div>
            <p className="text-white/60 max-w-md font-bold leading-relaxed">
              {t.desc}
            </p>
          </div>
          
          <div>
            <h5 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-[#ef4444]">{t.navigation}</h5>
            <ul className="space-y-4 text-sm font-black uppercase italic">
              <li><Link href={`/${lang}/news`} className="hover:text-[#ef4444] transition-colors">{t.news_feed}</Link></li>
              <li><Link href={`/${lang}/compare`} className="hover:text-[#ef4444] transition-colors">{t.ai_comparisons}</Link></li>
              <li><Link href={`/${lang}/guide`} className="hover:text-[#ef4444] transition-colors">{t.usage_guides}</Link></li>
              <li><Link href={`/${lang}/events`} className="hover:text-[#ef4444] transition-colors">{t.industry_events}</Link></li>
            </ul>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h5 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-[#ef4444]">{t.connect}</h5>
              <div className="flex gap-4">
                <div className="w-10 h-10 border-2 border-white flex items-center justify-center font-black hover:bg-white hover:text-black transition-all cursor-pointer">TW</div>
                <div className="w-10 h-10 border-2 border-white flex items-center justify-center font-black hover:bg-white hover:text-black transition-all cursor-pointer">FB</div>
                <div className="w-10 h-10 border-2 border-white flex items-center justify-center font-black hover:bg-white hover:text-black transition-all cursor-pointer">YT</div>
              </div>
            </div>

          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
            &copy; 2026 AI PLUS MAP. {t.rights}
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-white/40">
            <Link href="#" className="hover:text-white">{t.privacy}</Link>
            <Link href="#" className="hover:text-white">{t.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
