
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';

// Vite (usado por Vercel) expone variables de entorno con prefijo VITE_
// al código del cliente a través de `import.meta.env`.
// Asegúrate de que tus variables de entorno en Vercel se llamen VITE_SUPABASE_URL y VITE_SUPABASE_KEY.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;


if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key are required. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_KEY as environment variables in Vercel.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
