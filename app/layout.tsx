import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'InvestIQ | AI-Powered Investment Analysis Platform',
  description: 'InvestIQ uses Google Gemini AI to analyze startup documents, generate investment insights, and create professional investor reports. Smart investment decisions made simple.',
  keywords: 'InvestIQ, startup analysis, AI investment, venture capital, Google Gemini, pitch deck analysis, investment intelligence, due diligence',
  authors: [{ name: 'InvestIQ Team' }],
  openGraph: {
    title: 'InvestIQ | AI-Powered Investment Analysis Platform',
    description: 'InvestIQ uses Google Gemini AI to analyze startup documents and generate professional investment insights.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvestIQ | AI-Powered Investment Analysis Platform',
    description: 'InvestIQ uses Google Gemini AI to analyze startup documents and generate professional investment insights.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/investIQ.png', sizes: '32x32', type: 'image/png' },
      { url: '/investIQ.png', sizes: '16x16', type: 'image/png' },
      { url: '/investIQ.png', sizes: 'any' },
    ],
    apple: [
      { url: '/investIQ.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/investIQ.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="font-sans bg-gray-50 dark:bg-gray-950 antialiased transition-colors duration-300">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
