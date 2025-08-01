import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Estas variables serán inyectadas por tu proveedor de hosting (ej. Vercel)
// durante el proceso de despliegue.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key are required. Make sure to set them as environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
