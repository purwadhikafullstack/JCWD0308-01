import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { StoreProvider } from '../storeProvider';

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'WearDrobe',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
        <html lang="en">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    </StoreProvider>
  );
}
