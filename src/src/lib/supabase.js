import { createClient } from '@supabase/supabase-js'

// Project credentials
const SUPABASE_URL = 'https://rvfwwetpxyzadqyefxzu.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Znd3ZXRweHl6YWRxeWVmeHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTA4MjEsImV4cCI6MjA2OTI4NjgyMX0.NylgYgpb-0OW5xFOe-lmudSqlytWou19JhxlYb7QtD0'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

export default supabase