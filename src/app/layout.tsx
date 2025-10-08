//app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Script from 'next/script';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'Bdic Virtual Market',
    description: 'A virtual market and logistics management system',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    const tawkToScriptId = process.env.NEXT_PUBLIC_TAWKTO_SCRIPT_ID;
    const tawkToWidgetId = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID;

    if (!tawkToScriptId || !tawkToWidgetId) {
        console.error('Tawk.to script ID or widget ID is missing in environment variables');
    }

    return (
        <html lang="en">
        <head>
            {tawkToScriptId && tawkToWidgetId && (
                <Script
                    id="tawkto"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                            (function(){
                                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                                s1.async=true;
                                s1.src='https://embed.tawk.to/${tawkToScriptId}/${tawkToWidgetId}';
                                s1.charset='UTF-8';
                                s1.setAttribute('crossorigin','*');
                                s0.parentNode.insertBefore(s1,s0);
                            })();
                        `,
                    }}
                />
            )}
        </head>
        <body className={`${inter.variable} antialiased`}>
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    );
}