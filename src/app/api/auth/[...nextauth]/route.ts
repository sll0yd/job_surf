//import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import NextAuth from 'next-auth/next';

// Create and export NextAuth handler
const handler = NextAuth(authOptions);

// Export the GET and POST handlers
export { handler as GET, handler as POST };