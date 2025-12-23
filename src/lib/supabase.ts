import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mbnxqpxbmcbobkmynqer.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ibnhxcHhibWNib2JrbXlucWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzQzMDAsImV4cCI6MjA4MTMxMDMwMH0.Uk1KUi9c8VxDBvflF1twJQYgAxOf1xDOW1e98xKqeR0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
