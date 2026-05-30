import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "디스코드 서버 템플릿 추천 | 디스코드 서버 메이커",
  description:
    "발로란트, 롤, 친목, 커뮤니티 서버에 맞는 디스코드 서버 템플릿과 운영 봇을 추천합니다.",
  icons: {
    icon: "/dsm-icon.svg",
    shortcut: "/dsm-icon.svg",
    apple: "/dsm-icon.svg",
  },
  openGraph: {
    title: "디스코드 서버 템플릿 추천 | 디스코드 서버 메이커",
    description:
      "디스코드 서버 템플릿의 채널·역할 구조를 확인하고 운영 봇을 비교할 수 있는 사이트입니다.",
    type: "website",
    images: ["/dsm-icon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#07080d]">
        <div className="site-pattern-layer" aria-hidden="true" />
        <div className="relative z-10 flex min-h-full flex-col">{children}</div>
      </body>
    </html>
  );
}
