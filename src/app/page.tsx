'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import AuthPage from '@/components/AuthPage';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before checking auth status to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (mounted && !isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router, mounted]);

  // Show loading state
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-gray-600">Loading JobSurf...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show landing page or auth page
  if (!user) {
    return <AuthPage />;
  }

  // This should never render due to the redirect
  return null;
}