import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_PROJECT_REF'))) {
  console.error(
    '[Supabase] Missing or invalid config. In .env.local set:\n' +
    '  NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co (use your real project URL from Supabase Dashboard → Settings → API)\n' +
    '  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key'
  )
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!,
  )
}
