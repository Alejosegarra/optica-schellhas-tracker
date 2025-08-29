import { createClient } from '@supabase/supabase-js';

// -------------------------------------------------------------------
// ¡IMPORTANTE!
// Reemplaza los siguientes valores con tu propia URL y clave anónima
// de tu proyecto de Supabase. Puedes encontrarlas en:
// "Project Settings" > "API" en tu dashboard de Supabase.
// -------------------------------------------------------------------
const supabaseUrl = 'https://ozcazslaxngcqrcobbvy.supabase.co'; // Pega tu URL aquí
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Y2F6c2xheG5nY3FyY29iYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTAzNzEsImV4cCI6MjA3MDY4NjM3MX0.2LPFRedfEwjAfB2iSUYRYAbPFi4kmckRSSxqbUbFbOA'; // Pega tu clave anónima aquí

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    // Este error solo es visible para desarrolladores en la consola,
    // pero te avisa que necesitas configurar tus claves.
    const errorMessage = "Configuración de Supabase incompleta. Por favor, edita el archivo 'services/supabaseClient.ts' y añade tu URL y clave anónima de Supabase.";
    alert(errorMessage); // Usamos un alert para que sea muy obvio durante el desarrollo
    throw new Error(errorMessage);
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
