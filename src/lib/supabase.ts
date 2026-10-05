import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from './env'

// Re-export so existing imports keep working.
export { isSupabaseConfigured }

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (_client) return _client
  _client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _client
}

export function publicArtUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null
  // Already a full URL (demo placeholders) — use directly
  if (/^https?:\/\//.test(imagePath) || imagePath.startsWith('data:') || imagePath.startsWith('/')) {
    return imagePath
  }
  const sb = getSupabase()
  if (!sb) return null
  const { data } = sb.storage.from('artwork').getPublicUrl(imagePath)
  return data.publicUrl
}
