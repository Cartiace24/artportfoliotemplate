// Supabase Edge Function: manage-upload
// Token-bound signed uploads. The browser sends its management token + the
// file extension; the function verifies the token hash against
// management_access (service role), generates a server-side storage path,
// and returns a one-time signed upload URL. User filenames are never
// trusted for paths.
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Deploy: supabase functions deploy manage-upload
//
// Lockdown note: once this function is deployed and the studio uses it,
// you can fully close the anon INSERT storage policy (see 002_hardening.sql
// "anon upload artwork") so uploads are ONLY possible through this
// token-checked path.

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif']

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function randomSuffix(bytes = 9): string {
  const buf = crypto.getRandomValues(new Uint8Array(bytes))
  return [...buf].map((b) => b.toString(36)).join('').replace(/[^a-z0-9]/g, 'x').slice(0, 12)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const token = typeof body.token === 'string' ? body.token.trim() : ''
  const rawExt = typeof body.ext === 'string' ? body.ext.toLowerCase() : 'jpg'
  const ext = ALLOWED_EXT.includes(rawExt) ? rawExt : 'jpg'
  if (!token || token.length < 24) return json({ error: 'unauthorized' }, 401)

  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) return json({ error: 'not configured' }, 503)
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')

  const { data: access } = await admin
    .from('management_access')
    .select('site_id')
    .eq('token_hash', hash)
    .is('revoked_at', null)
    .maybeSingle()
  if (!access) return json({ error: 'unauthorized' }, 401)

  await admin.from('management_access').update({ last_used_at: new Date().toISOString() }).eq('token_hash', hash)

  const path = `art/${Date.now()}-${randomSuffix()}.${ext}`
  const { data, error } = await admin.storage.from('artwork').createSignedUploadUrl(path)
  if (error || !data) return json({ error: 'upload unavailable' }, 500)

  return json({ path, signedToken: data.token })
})
