import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://mock-supabase-url.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'mock-anon-key';

if (!process.env.SUPABASE_URL) {
  console.warn('SUPABASE_URL env variable not set. Using fallback credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
