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
  title: "CheckinFlow – 活動簽到系統",
  description: "CheckinFlow 是一套結合 LINE Login 的活動簽到系統，支援活動 QRCode 簽到、時間驗證、LINE 綁定與後台管理。",
  keywords: ["CheckinFlow", "LINE Login", "活動簽到系統", "QRCode", "QRCode 簽到", "時間驗證",
            "LINE 綁定", "後台管理"],
  metadataBase: new URL("https://checkin.isafe.org.tw/"),
  openGraph: {
    title: "CheckinFlow",
    description: "活動簽到系統",
    url: "https://checkin.isafe.org.tw/",
    siteName: "CheckinFlow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
