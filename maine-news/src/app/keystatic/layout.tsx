import { Metadata } from 'next';

export const metadata: Metadata = {
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1
    }
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
