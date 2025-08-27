import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/auth-provider';
import { ToastProvider } from '@/components/providers/toast-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Creative Creatives V2 - AI-Powered Ad Creation',
  description: 'Create professional 30-second advertisements using AI. Powered by Google Veo, Imagen, and LLaMA creative expert.',
  keywords: ['AI advertising', 'video generation', 'creative ads', 'Google Veo', 'Imagen', 'LLaMA'],
  authors: [{ name: 'Creative Creatives Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
