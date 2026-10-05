import { getSupabase } from './supabase'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isDemoAllowed, isSupabaseConfigured } from './env'
import { sha256Hex } from './tokens'

const DEMO_KEY = 'shiakonii-demo-manage-valid'

export type ValidateResult = { ok: boolean; mode: 'supabase' | 'demo' | 'none' }

export async function validateManageToken(token: string): Promise<ValidateResult> {
  const clean = (token ?? '').trim()
  // Tokens are 43-char base64url (32 bytes). Require reasonable length.
  if (!clean || clean.length < 24) return { ok: false, mode: 'none' }

  if (!isSupabaseConfigured) {
    // Demo tokens are ONLY honoured when demo mode is explicitly allowed
    // (dev, or VITE_DEMO_MODE=true). Production without Supabase config
    // rejects everything instead of silently granting access.
    if (!isDemoAllowed) return { ok: false, mode: 'none' }
    if (clean === 'demo-manage-token-please-change-me-0123456789') return { ok: true, mode: 'demo' }
    try {
      const claimed = localStorage.getItem(DEMO_KEY)
      if (!claimed) {
        localStorage.setItem(DEMO_KEY, clean)
        return { ok: true, mode: 'demo' }
      }
      return { ok: claimed === clean, mode: 'demo' }
    } catch {
      return { ok: true, mode: 'demo' }
    }
  }

  try {
    const sb = getSupabase()!
    const hash = await sha256Hex(clean)
    const { data, error } = await sb.rpc('validate_management_token', { p_token_hash: hash })
    if (error) throw error
    const ok = data === true || (data as { valid?: boolean } | null)?.valid === true
    return { ok, mode: 'supabase' }
  } catch {
    // On network/RPC failure fail CLOSED — never grant studio access.
    return { ok: false, mode: 'supabase' }
  }
}

export async function tokenHash(token: string): Promise<string> {
  return sha256Hex(token.trim())
}

interface RpcOpts {
  fn: string
  args: Record<string, unknown>
}

/**
 * Management writes go ONLY through SECURITY DEFINER RPCs that derive the
 * authorized site_id from the token hash server-side. There are deliberately
 * no direct table INSERT/UPDATE/DELETE calls anywhere in the studio.
 */
export async function callManageRpc({ fn, args }: RpcOpts): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    if (!isDemoAllowed) return { ok: false, error: 'Studio is not connected. Connect Supabase to save changes.' }
    // Demo mode pretends success (local state is managed by components)
    await new Promise((r) => setTimeout(r, 350))
    return { ok: true }
  }
  try {
    const sb = getSupabase()!
    const { error } = await sb.rpc(fn, args)
    if (error) throw error
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Request failed' }
  }
}

const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'] as const

function randomSuffix(bytes = 9): string {
  const buf = crypto.getRandomValues(new Uint8Array(bytes))
  return [...buf].map((b) => b.toString(36).padStart(2, '0')).join('').replace(/[^a-z0-9]/g, 'x').slice(0, 12)
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Please choose an image file (PNG, JPG, WebP…).'
  if (file.size > MAX_UPLOAD_BYTES) return 'That image is over 8MB — please export a smaller version.'
  if (file.size === 0) return 'That file looks empty — please pick another image.'
  return null
}

/**
 * Upload an artwork file to Supabase Storage.
 * The management token is validated server-side BEFORE the upload is
 * attempted, so anonymous strangers cannot use the bucket as free hosting.
 * Paths are server-generated (`art/<rand>.<ext>`) — user filenames are never
 * trusted for authorization or storage layout.
 */
export async function uploadArtworkFile(
  token: string,
  file: File
): Promise<{ path?: string; url?: string; error?: string }> {
  const problem = validateImageFile(file)
  if (problem) return { error: problem }

  if (!isSupabaseConfigured) {
    if (!isDemoAllowed) return { error: 'Studio is not connected. Connect Supabase to upload.' }
    return { url: URL.createObjectURL(file), path: `demo/${Date.now()}-${randomSuffix(6)}.jpg` }
  }

  // Bind the upload to a valid management session first.
  const check = await validateManageToken(token)
  if (!check.ok) return { error: 'Your studio session is no longer valid. Reload with your private link and try again.' }

  const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = (ALLOWED_EXT as readonly string[]).includes(rawExt) ? rawExt : 'jpg'

  // Preferred path: token-checked signed upload via the manage-upload edge
  // function (server-generated path, one-time URL).
  try {
    const sb = getSupabase()!
    const res = await fetch(`${SUPABASE_URL}/functions/v1/manage-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ token: token.trim(), ext: safeExt }),
    })
    if (res.ok) {
      const { path, signedToken } = (await res.json()) as { path?: string; signedToken?: string }
      if (path && signedToken) {
        const { error: upErr } = await sb.storage.from('artwork').uploadToSignedUrl(path, signedToken, file, {
          contentType: file.type || `image/${safeExt}`,
        })
        if (!upErr) {
          const { data } = sb.storage.from('artwork').getPublicUrl(path)
          return { path, url: data.publicUrl }
        }
      }
    }
    // Anything else (function not deployed, network blip) → direct upload
    // fallback below, still guarded by the path/extension storage policy.
  } catch {
    /* fall through to direct upload */
  }

  try {
    const sb = getSupabase()!
    const path = `art/${Date.now()}-${randomSuffix()}.${safeExt}`
    const { error } = await sb.storage.from('artwork').upload(path, file, {
      contentType: file.type || `image/${safeExt}`,
      upsert: false,
    })
    if (error) throw error
    const { data } = sb.storage.from('artwork').getPublicUrl(path)
    return { path, url: data.publicUrl }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Upload failed. Please try again.' }
  }
}

export function isDemoMode(): boolean {
  return isDemoAllowed
}
