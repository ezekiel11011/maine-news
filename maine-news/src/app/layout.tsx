import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    variable: "--font-body-sans",
    subsets: ["latin"],
    weight: ["400", "600"],
});

export const metadata: Metadata = {
    title: "Maine News Now",
    description: "Editorial Minimalism with Live Intelligence.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.variable}>
                {children}
            </body>
        </html>
    );
}
