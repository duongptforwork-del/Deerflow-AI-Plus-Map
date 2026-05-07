import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ 
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "AI News Today, AI Ranking & Best AI Updates | AI Plus Map",
    template: "%s | AI Plus Map",
  },
  description: "Stay ahead with AI News Today and the latest AI Ranking. AI Plus Map delivers the Best AI updates, expert reviews, and a mapped landscape of artificial intelligence.",
  keywords: [
    "AI news today", 
    "AI Ranking", 
    "Best AI", 
    "AI updates", 
    "Artificial Intelligence", 
    "AI leaderboard"
  ],
  openGraph: {
    title: "AI News Today, AI Ranking & Best AI Updates | AI Plus Map",
    description: "Leading the intelligence cartography. Discover the top AI tools with our exclusive AI Ranking and daily news updates.",
    url: "https://aiplusmap.com",
    siteName: "AI Plus Map",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
  params: { lang },
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={lang} className={`${inter.variable} ${bricolage.variable}`}>
      <body className="bg-[#F3F4F6] text-black font-sans leading-relaxed selection:bg-[#ef4444] selection:text-white">
        <Navbar lang={lang} />
        {children}
        <Footer lang={lang} />
      </body>
    </html>
  );
}
