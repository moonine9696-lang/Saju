import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR, Noto_Sans_KR } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const serifKr = Noto_Serif_KR({
  variable: "--font-serif-kr",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

const sansKr = Noto_Sans_KR({
  variable: "--font-sans-kr",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "사주의 길 — 내 사주, 한눈에",
  description:
    "생년월일시를 입력하면 사주 여덟 글자와 무료 간단한 사주풀이를 바로 확인할 수 있습니다.",
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${serifKr.variable} ${sansKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-night-600/60">
          <div className="mx-auto max-w-xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-(family-name:--font-serif-kr) text-lg font-semibold tracking-wide text-paper-100">
              사주의 <span className="text-gold-400">길</span>
            </Link>
            <span className="text-xs text-paper-500">명리학 기반 사주풀이</span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-night-600/60 mt-16">
          <div className="mx-auto max-w-xl px-4 py-6 space-y-3">
            <nav className="flex gap-4 text-xs text-paper-400">
              <Link href="/products" className="hover:text-paper-200 underline underline-offset-2">
                상품 안내
              </Link>
              <Link href="/refund" className="hover:text-paper-200 underline underline-offset-2">
                환불 정책
              </Link>
              <Link href="/privacy" className="hover:text-paper-200 underline underline-offset-2">
                개인정보처리방침
              </Link>
            </nav>
            {/* 사업자 정보 */}
            <div className="text-[11px] leading-relaxed text-paper-500">
              <p>상호명: 사주의 길 | 대표: 문인구</p>
              <p>사업자등록번호: 149-99-01744 | 통신판매업 신고번호: 2026-부산수영-0356</p>
              <p>주소: 부산 수영구 수영로 541-1 1505호 | 연락처: moonine9696@gmail.com</p>
              <p className="mt-1">© 2026 사주의 길. All rights reserved.</p>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
