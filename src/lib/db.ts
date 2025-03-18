import { supabase } from "./supabase";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { cache } from "react";
import { Database } from "./database.types";

/**
 * Create a Supabase client for server components
 */
export const createServerClient = cache(() => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
});

/**
 * Initialize the database with required tables
 * This function can be used in a migration script or admin panel
 */
export async function initializeDatabase() {
  // This function is for administrative purposes and should be used with caution
  
  // Check if tables exist first
  const { data: tablesExist, error: checkError } = await supabase
    .from('jobs')
    .select('id')
    .limit(1);
  
  if (!checkError) {
    console.log("Tables already exist, skipping initialization");
    return;
  }
  
  // Create jobs table
  const { error: jobsError } = await supabase.rpc('create_jobs_table', {});
  
  if (jobsError) {
    console.error("Error creating jobs table:", jobsError);
    throw new Error("Failed to initialize database: " + jobsError.message);
  }
  
  // Create activities table
  const { error: activitiesError } = await supabase.rpc('create_activities_table', {});
  
  if (activitiesError) {
    console.error("Error creating activities table:", activitiesError);
    throw new Error("Failed to initialize database: " + activitiesError.message);
  }
  
  console.log("Database initialized successfully");
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = createServerClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Execute a database query with proper error handling
 */
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await queryFn();
  
  if (error) {
    console.error("Database query error:", error);
    throw new Error(error.message || "Database query failed");
  }
  
  if (data === null) {
    throw new Error("No data returned from query");
  }
  
  return data as T;
}

/**
 * Check if the current user has access to a job
 */
export async function checkJobAccess(jobId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();
    
    return !error && !!data;
  } catch (error) {
    console.error("Error checking job access:", error);
    return false;
  }
}

/**
 * Generate select query with common filters for jobs
 */
export function buildJobsQuery(userId: string, options: {
  status?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}) {
  let query = supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId);
  
  if (options.status) {
    query = query.eq('status', options.status);
  }
  
  if (options.search) {
    const searchTerm = `%${options.search}%`;
    query = query.or(`company.ilike.${searchTerm},position.ilike.${searchTerm}`);
  }
  
  const sortBy = options.sortBy || 'updated_at';
  const sortDirection = options.sortDirection || 'desc';
  
  query = query.order(sortBy, { ascending: sortDirection === 'asc' });
  
  return query;
}