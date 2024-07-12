import '../../globals.css';
import { StoreProvider } from '@/app/storeProvider';
import { Toaster } from 'sonner';
import { Poppins } from 'next/font/google';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminDashboard } from '@/components/sidebar/AdminDashboard';
import Loading from './loading';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: {
    template: '%s | Weardrobe',
    default: 'Weardrobe',
  },
  description: 'Weardrobe admin dashboard.',
};

export default function Layout({children}: Readonly<{children: React.ReactNode}>) {

  return (
    <StoreProvider>
        <html lang="en">
          <body className={poppins.className}>
            <AdminDashboard>
                <Suspense fallback={<Loading/>}>
                    <Toaster position="top-center" richColors/>
                    {children}
                </Suspense>
            </AdminDashboard>
          </body>
        </html>
    </StoreProvider>
  );
}
