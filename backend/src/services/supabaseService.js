const { createClient } = require('@supabase/supabase-js');

let supabase = null;

const initializeSupabase = () => {
  try {
    const supabaseUrl = process.env.SUPABASE_PUBLIC_URL;
    const supabaseKey = process.env.SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and service key are required.');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    throw error;
  }
};

const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }
  return supabase;
};

module.exports = {
  initializeSupabase,
  getSupabase,
};
