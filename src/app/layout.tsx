import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Providers } from '@/components/providers';
import './globals.css';

// Load Inter font
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Metadata for the application
export const metadata: Metadata = {
  title: 'JobSurf - Ride the wave to your next job',
  description: 'Track and manage your job applications effectively with JobSurf',
  icons: {
    icon: '/favicon.ico',
  },
};

// Root layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <AuthProvider>
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
              {children}
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}