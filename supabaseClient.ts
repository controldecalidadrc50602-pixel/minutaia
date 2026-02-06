
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// In this environment, environment variables are injected into process.env.
// We check for existence to avoid the "supabaseUrl is required" error if they are missing.
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase configuration missing (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY). Falling back to LocalStorage.");
}
