import { createClient } from '@supabase/supabase-js';

// Usar import.meta.env es OBLIGATORIO en Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("¡Faltan las variables de Supabase!");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
