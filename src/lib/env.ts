/**
 * Environment + mode resolution.
 *
 * - Supabase is "configured" when both VITE_ vars are present (non-empty).
 * - Demo mode (placeholders + localStorage studio) is ONLY allowed in dev,
 *   or when explicitly opted in via VITE_DEMO_MODE=true.
 * - In production without Supabase configured, the app must show a clear
 *   configuration error — never silently swap in placeholder art or accept
 *   fake management tokens.
 */

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function looksPlaceholder(v: string | undefined): boolean {
  if (!v) return true
  const t = v.trim()
  if (!t) return true
  return /^(your-|example|changeme|xxx|placeholder|https:\/\/xyzcompany)/i.test(t)
}

export const SUPABASE_URL = looksPlaceholder(rawUrl) ? undefined : rawUrl?.trim()
export const SUPABASE_ANON_KEY = looksPlaceholder(rawAnon) ? undefined : rawAnon?.trim()

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const isDev = Boolean(import.meta.env.DEV)
export const isProd = Boolean(import.meta.env.PROD)

/** Demo mode is a development convenience only. */
export const isDemoAllowed =
  !isSupabaseConfigured && (isDev || import.meta.env.VITE_DEMO_MODE === 'true')

/** Production with missing/invalid Supabase config → show config error UI. */
export const isProductionMisconfigured = isProd && !isSupabaseConfigured

export const CONFIG_ERROR_MESSAGE =
  'The gallery is taking a short break — the site owner needs to connect the artwork database. Please check back soon!'
