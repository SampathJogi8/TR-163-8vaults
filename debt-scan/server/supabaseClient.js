const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://sanuttmhhvmvblymlbhl.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Database persistent state will not function.');
}

const supabase = createClient(supabaseUrl, supabaseKey || 'dummy-key');

module.exports = { supabase };
