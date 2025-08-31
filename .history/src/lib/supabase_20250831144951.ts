import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface FileRecord {
  id: string
  user_id: string
  original_name: string
  encrypted_name: string
  file_size: number
  file_type: string
  encryption_key: string
  created_at: string
  updated_at: string
}
