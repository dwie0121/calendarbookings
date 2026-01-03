/**
 * SUPABASE BRIDGE
 * 
 * To connect to Supabase:
 * 1. Create a Supabase project at supabase.com
 * 2. Run the SQL schema in the SQL Editor (Tables: events, staff, logs)
 * 3. Install @supabase/supabase-js
 * 4. Update the prisma.ts file to use the Supabase client instead of LocalEngine.
 */

/*
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project-url.supabase.co'
const supabaseKey = 'your-anon-key'
export const supabase = createClient(supabaseUrl, supabaseKey)
*/

export const isSupabaseEnabled = false;