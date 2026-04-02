import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vmygihyvsscdkixfctap.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '...'; // I will just read from .env

import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
const envUrlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
const envKeyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(envUrlMatch[1].trim(), envKeyMatch[1].trim());

async function doCheck() {
    const { data: obs } = await supabase.from('observaciones').select('id, estado').limit(5);
    console.log("Observaciones estado sample:");
    console.log(JSON.stringify(obs, null, 2));

    const { data: settings } = await supabase.from('settings').select('*').eq('key', 'estados');
    console.log("\nSettings 'estados':");
    console.log(JSON.stringify(settings, null, 2));
}

doCheck();
