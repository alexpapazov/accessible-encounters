import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import SiteHeader from "@/components/SiteHeader";
import VisualStyleProvider from "@/components/VisualStyleProvider";
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
  title: "Accessible clinical encounters",
  description:
    "Interactive clinical encounters about care under pressure, where every decision costs something.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FBF5EE]">
        <AuthProvider>
          <VisualStyleProvider>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <SiteHeader />
            <main id="main">{children}</main>
          </VisualStyleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
