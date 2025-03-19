import { 
  NextAuthOptions, 
  Session
} from 'next-auth';
import { DefaultSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from './supabase';

// Extend the default NextAuth User interface
declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

  interface Session {
    user: User & DefaultSession['user'];
    supabaseAccessToken?: string;
    googleAccessToken?: string;
  }
}

// Extended Session type with additional tokens
export interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  supabaseAccessToken?: string;
  googleAccessToken?: string;
}

// Declare a Token interface to extend the default JWT
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    supabaseAccessToken?: string;
    googleAccessToken?: string;
  }
}

// Auth configuration options
export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Optional: Configure profile info
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    
    // Email/Password credentials provider
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          // Authenticate with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });
          
          if (error || !data.user) {
            return null;
          }
          
          // Return user object
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            image: data.user.user_metadata?.avatar_url,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  
  // Configure session handling
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Customize pages
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/auth/error',
  },
  
  // Callbacks for customizing behavior
  callbacks: {
    // Add custom claims to JWT
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        
        // Store Google access token if using OAuth
        if (account && account.provider === 'google') {
          try {
            const googleAccessToken = account.access_token;
            
            // If we have an access token, we can add it to our token
            if (googleAccessToken) {
              token.googleAccessToken = googleAccessToken;
            }
          } catch (error) {
            console.error('OAuth token handling error:', error);
          }
        }
      }
      return token;
    },
    
    // Add custom properties to session
    async session({ session, token }) {
      if (token) {
        // Add user ID to session
        session.user.id = token.id as string;
        
        // Add Google access token if available
        if (token.googleAccessToken) {
          session.googleAccessToken = token.googleAccessToken;
        }
      }
      return session as ExtendedSession;
    },
  },
  
  // Secret for encrypting JWTs
  secret: process.env.NEXTAUTH_SECRET,
  
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
};

// Helper function to check if user is authenticated
export const isAuthenticated = (session: Session | null): boolean => {
  return !!session?.user?.id;
};

// Helper function to get the current user's ID
export const getCurrentUserId = (session: Session | null): string | null => {
  return session?.user?.id || null;
};

// Supabase auth helper functions
export const supabaseAuth = {
  // Sign up with email and password
  async signUp(email: string, password: string, name: string = '') {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
  },
  
  // Sign in with email and password
  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  },
  
  // Sign out
  async signOut() {
    return supabase.auth.signOut();
  },
  
  // Reset password
  async resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL}/auth/reset-password`,
    });
  },
  
  // Update password
  async updatePassword(new_password: string) {
    return supabase.auth.updateUser({
      password: new_password,
    });
  },
};