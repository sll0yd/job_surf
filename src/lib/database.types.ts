// Supabase Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          user_id: string
          company: string
          position: string
          location: string | null
          url: string | null
          description: string | null
          salary: string | null
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          notes: string | null
          status: string
          applied_date: string | null
          interview_date: string | null
          offer_date: string | null
          rejected_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company: string
          position: string
          location?: string | null
          url?: string | null
          description?: string | null
          salary?: string | null
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          notes?: string | null
          status?: string
          applied_date?: string | null
          interview_date?: string | null
          offer_date?: string | null
          rejected_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string
          position?: string
          location?: string | null
          url?: string | null
          description?: string | null
          salary?: string | null
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          notes?: string | null
          status?: string
          applied_date?: string | null
          interview_date?: string | null
          offer_date?: string | null
          rejected_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          job_id: string | null
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          job_id?: string | null
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          job_id?: string | null
          description?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}