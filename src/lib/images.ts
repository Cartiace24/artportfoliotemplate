import { getSupabase } from './supabase'
import { SUPABASE_URL, isSupabaseConfigured } from './env'

/**
 * Optimized artwork URLs via Supabase's image-render API.
 * Falls back to the plain public URL when Supabase isn't configured,
 * the path is already absolute, or transformations are unavailable
 * (the <SmartImage> component retries with the original on error).
 */

export function isStoragePath(path: string | null | undefined): path is string {
  if (!path) return false
  if (/^https?:\/\//.test(path) || path.startsWith('data:') || path.startsWith('/')) return false
  return true
}

function renderUrl(path: string, width: number): string | null {
  if (!isSupabaseConfigured || !SUPABASE_URL) return null
  const clean = path.replace(/^\/+/, '')
  return (
    `${SUPABASE_URL}/storage/v1/render/image/public/artwork/${clean}` +
    `?width=${width}&quality=80&resize=contain`
  )
}

export function plainArtUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null
  if (!isStoragePath(imagePath)) return imagePath
  const sb = getSupabase()
  if (!sb) return null
  return sb.storage.from('artwork').getPublicUrl(imagePath).data.publicUrl
}

/** Resized URL + srcset for responsive loading. */
export function artImage(
  imagePath: string | null | undefined,
  baseWidth = 900
): { src: string | null; srcSet?: string; fallback: string | null } {
  const fallback = plainArtUrl(imagePath)
  if (!imagePath || !isStoragePath(imagePath)) return { src: fallback, fallback }
  const src = renderUrl(imagePath, baseWidth) ?? fallback
  const widths = [480, 800, 1200].filter((w) => w <= baseWidth + 400)
  const srcSet = widths
    .map((w) => {
      const u = renderUrl(imagePath, w)
      return u ? `${u} ${w}w` : null
    })
    .filter(Boolean)
    .join(', ')
  return { src, srcSet: srcSet || undefined, fallback }
}
