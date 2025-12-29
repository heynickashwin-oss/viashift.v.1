import { createClient } from '@supabase/supabase-js';

// Environment variables should be set in .env file
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mbnxqpxbmcbobkmynqer.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ibnhxcHhibWNib2JrbXlucWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzQzMDAsImV4cCI6MjA4MTMxMDMwMH0.Uk1KUi9c8VxDBvflF1twJQYgAxOf1xDOW1e98xKqeR0';

// Warn in development if using hardcoded values
if (import.meta.env.DEV && !import.meta.env.VITE_SUPABASE_URL) {
  console.warn('[viashift] Using hardcoded Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env for production.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);