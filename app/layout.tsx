import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Vanilla Royal | Premium B2B Vanilla Trade Platform',
  description:
    "Vanilla Royal is a premier B2B Trust Hub connecting the world's finest vanilla producers with global buyers. HS Code 0905.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
