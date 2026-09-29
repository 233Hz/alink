import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://angslcexviasghvjbcqe.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZ3NsY2V4dmlhc2dodmpiY3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NDQxMjksImV4cCI6MjEwNDUyMDEyOX0.rlnVQgDT6hzsE2xVCXW2dH_bIDU73af3YqE6yV-BEDE';

const supabaseSchema = import.meta.env.VITE_SUPABASE_SCHEMA || 'web_nav';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: supabaseSchema,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
