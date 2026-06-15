import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "NAGAMI 登録支援機関 - 特定技能支援管理システム",
  description: "特定技能外国人の支援業務を一元管理するシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="h-full flex bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen overflow-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
