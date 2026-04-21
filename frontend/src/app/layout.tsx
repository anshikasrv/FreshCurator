import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from '@/store/StoreProvider';
import AuthProvider from '@/components/AuthProvider';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import ChatBot from '@/components/features/ai/ChatBot';

import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'FreshCurator - Organic Grocery Delivery',
  description: 'Hand-picked organics from local farms, curated with precision.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <StoreProvider>
            <AuthProvider>
              <Header />
                {children}
              <BottomNav />
              <ChatBot />
            </AuthProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
