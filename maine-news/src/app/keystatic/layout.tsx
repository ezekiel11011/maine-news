import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Keystatic Admin',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head />
            <body>{children}</body>
        </html>
    );
}
