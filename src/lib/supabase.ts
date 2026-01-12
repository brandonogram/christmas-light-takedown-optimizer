import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client with service role for admin operations
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, serviceRoleKey)
}

// Type exports for convenience
export type Company = Database['public']['Tables']['companies']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type JobInventory = Database['public']['Tables']['job_inventory']['Row']
export type JobPhoto = Database['public']['Tables']['job_photos']['Row']
export type Crew = Database['public']['Tables']['crews']['Row']
export type Route = Database['public']['Tables']['routes']['Row']
export type StatusUpdate = Database['public']['Tables']['status_updates']['Row']
export type JobberConnection = Database['public']['Tables']['jobber_connections']['Row']
export type GeneratedVideo = Database['public']['Tables']['generated_videos']['Row']
