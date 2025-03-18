import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '../components/providers';

// Load Inter font
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Metadata for the application
export const metadata: Metadata = {
  title: 'Job Application Tracker',
  description: 'Track and manage your job applications effectively',
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
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}