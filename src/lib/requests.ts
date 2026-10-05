import { SUPABASE_ANON_KEY, SUPABASE_URL, isDemoAllowed, isSupabaseConfigured } from './env'

export interface CommissionForm {
  name: string
  contact: string
  type: string
  details: string
  /** Honeypot — must stay empty. Bots fill it; humans never see it. */
  website?: string
}

const MIN_INTERVAL_MS = 60_000
const LAST_SENT_KEY = 'lorem-last-request-at'

function clientThrottled(): boolean {
  try {
    const last = Number(localStorage.getItem(LAST_SENT_KEY) ?? 0)
    return Date.now() - last < MIN_INTERVAL_MS
  } catch {
    return false
  }
}

function markSent() {
  try {
    localStorage.setItem(LAST_SENT_KEY, String(Date.now()))
  } catch {
    /* ignore */
  }
}

export async function submitCommissionRequest(
  form: CommissionForm
): Promise<{ ok: boolean; error?: string }> {
  const name = form.name.trim().slice(0, 120)
  const contact = form.contact.trim().slice(0, 200)
  const type = form.type.trim().slice(0, 120)
  const details = form.details.trim().slice(0, 4000)

  if (!name || !contact || !details) return { ok: false, error: 'Please fill in your name, contact, and idea.' }
  if (form.website) {
    // Honeypot filled — pretend success so bots learn nothing.
    await new Promise((r) => setTimeout(r, 600))
    return { ok: true }
  }

  if (!isSupabaseConfigured) {
    if (!isDemoAllowed) return { ok: false, error: 'Requests are unavailable right now. Please try a social link instead.' }
    if (clientThrottled()) return { ok: false, error: 'Please wait a minute before sending another request.' }
    await new Promise((r) => setTimeout(r, 800))
    markSent()
    return { ok: true }
  }

  if (clientThrottled()) return { ok: false, error: 'Please wait a minute before sending another request.' }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/commission-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ name, contact, type, details }),
    })
    if (res.status === 429) return { ok: false, error: 'Too many requests — please try again in an hour.' }
    if (!res.ok) {
      // Edge function not deployed? Surface a helpful message, not a silent fail.
      return { ok: false, error: 'Requests are unavailable right now. Please try a social link instead.' }
    }
    markSent()
    return { ok: true }
  } catch {
    return { ok: false, error: 'The connection failed. Please check yours and try again.' }
  }
}
