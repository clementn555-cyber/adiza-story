const { createClient } = window.supabase;

const supabaseClient = createClient(
  window.ADIZA_CONFIG.SUPABASE_URL,
  window.ADIZA_CONFIG.SUPABASE_ANON_KEY
);