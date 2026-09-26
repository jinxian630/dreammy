import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans, Caveat } from 'next/font/google';
import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const script = Caveat({
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Dreammy Admin',
  description: 'Manage Sky game services, orders, vouchers and reports for your Dreammy store.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FBF3EE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
