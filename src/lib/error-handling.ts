// src/lib/error-handling.ts
import { AuthError } from '@supabase/supabase-js';

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  // Handle Supabase auth errors
  if (error instanceof AuthError) {
    return error.message;
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Default fallback
  return 'An unexpected error occurred';
}

/**
 * Handles API errors with consistent logging and formatting
 */
export function handleApiError(error: unknown, context: string): { message: string; status: number } {
  console.error(`Error in ${context}:`, error);
  
  return {
    message: getErrorMessage(error),
    status: error instanceof AuthError ? 401 : 500
  };
}