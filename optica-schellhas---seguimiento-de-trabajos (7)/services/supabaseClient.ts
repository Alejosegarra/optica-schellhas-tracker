// Manual type declaration for import.meta.env to fix vite/client errors.
interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';

// -------------------------------------------------------------------
// ¡IMPORTANTE!
// Este archivo ahora lee las claves desde las Variables de Entorno.
// Deberás configurar estas variables en Vercel durante el despliegue.
// -------------------------------------------------------------------

// Vercel (usando el preset de Vite) inyectará las variables aquí.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = "Configuración de Supabase incompleta. Asegúrate de que las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY están configuradas en Vercel.";
    alert(errorMessage);
    throw new Error(errorMessage);
}


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);