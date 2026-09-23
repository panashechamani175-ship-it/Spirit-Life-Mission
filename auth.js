const SUPABASE_URL = window.SLMT_SUPABASE_URL;
const SUPABASE_KEY = window.SLMT_SUPABASE_ANON_KEY;

function supabaseReady(){
  return SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('PASTE_') && !SUPABASE_KEY.includes('PASTE_');
}

if (!supabaseReady()) {
  console.warn('Supabase is not configured. Add the Project URL and publishable/anon key in admin/supabase-config.js.');
}

const sb = supabaseReady() ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

async function requireAdmin(redirect=true){
  if (!sb) { if (redirect) location.href='index.html?config=missing'; return null; }
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { if (redirect) location.href='index.html'; return null; }
  const { data, error } = await sb.from('admin_users').select('id,user_id,role,email,display_name').eq('user_id', session.user.id).maybeSingle();
  if (error || !data || data.role !== 'admin') {
    await sb.auth.signOut();
    if (redirect) location.href='index.html?error=not-authorized';
    return null;
  }
  return {session, admin:data};
}

async function signOut(){ if(sb) await sb.auth.signOut(); location.href='index.html'; }
