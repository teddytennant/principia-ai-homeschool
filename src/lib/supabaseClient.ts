import { createBrowserClient } from '@supabase/ssr';

// No need to log these here usually, but keeping if desired for debugging
// console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
// console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use createBrowserClient for client-side Supabase instance
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
