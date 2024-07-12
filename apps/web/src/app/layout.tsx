import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'WearDrobe',
  description: 'Page Not Found!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
        <body className={inter.className}>
            {children}
        </body>
    </html>
  );
}