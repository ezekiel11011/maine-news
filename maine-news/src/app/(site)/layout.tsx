import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import "../globals.css";

const oswald = Oswald({
  variable: "--font-heading-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-body-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mymainenews.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Maine News Today",
    template: "%s | Maine News Today"
  },
  description: "Editorial Minimalism with Live Intelligence. Unbiased. Unafraid. Unfiltered.",
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Maine News Today',
    title: 'Maine News Today',
    description: 'Editorial Minimalism with Live Intelligence. Unbiased. Unafraid. Unfiltered.',
    images: [
      {
        url: '/hero-fallback.jpeg',
        width: 1200,
        height: 630,
        alt: 'Maine News Today',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maine News Today',
    description: 'Editorial Minimalism with Live Intelligence. Unbiased. Unafraid. Unfiltered.',
    images: ['/hero-fallback.jpeg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${inter.variable}`}>
        <Header />
        <main className="container" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
