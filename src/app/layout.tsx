import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ShiftWise',
  description: 'AI-powered employee shift scheduling',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('antialiased', inter.className)} suppressHydrationWarning>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
