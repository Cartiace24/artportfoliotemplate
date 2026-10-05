// Supabase Edge Function: commission-request
// Receives public commission requests, rate-limits by IP, stores them in
// commission_requests (service role — browsers have no direct access),
// and optionally notifies via Discord webhook or Resend.
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Optional: DISCORD_WEBHOOK_URL, RESEND_API_KEY, NOTIFY_EMAIL
//
// Deploy: supabase functions deploy commission-request
// Secrets:  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=... DISCORD_WEBHOOK_URL=...

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_PER_HOUR = 5

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
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

  // Honeypot — bots fill it, humans never see it.
  if (body.website) {
    await new Promise((r) => setTimeout(r, 400))
    return json({ ok: true })
  }

  const name = str(body.name, 120)
  const contact = str(body.contact, 200)
  const type = str(body.type, 120)
  const details = str(body.details, 4000)
  if (!name || !contact || !details) return json({ error: 'missing fields' }, 400)

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim().slice(0, 64) ?? 'unknown'

  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) return json({ error: 'not configured' }, 503)
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count, error: countErr } = await admin
    .from('commission_requests')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gt('created_at', hourAgo)
  if (countErr) return json({ error: 'try again later' }, 500)
  if ((count ?? 0) >= MAX_PER_HOUR) return json({ error: 'rate limited' }, 429)

  const { data: site } = await admin.from('sites').select('id').order('created_at').limit(1).maybeSingle()
  if (!site) return json({ error: 'not configured' }, 503)

  const { error: insertErr } = await admin.from('commission_requests').insert({
    site_id: (site as { id: string }).id,
    name,
    contact,
    type,
    details,
    ip,
  })
  if (insertErr) return json({ error: 'try again later' }, 500)

  // Best-effort notifications — a failed webhook must never fail the request.
  try {
    const webhook = Deno.env.get('DISCORD_WEBHOOK_URL')
    if (webhook) {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `✿ New commission request from **${name}** (${type})\nContact: ${contact}\n${details.slice(0, 1500)}`,
        }),
      })
    } else {
      const resendKey = Deno.env.get('RESEND_API_KEY')
      const notifyEmail = Deno.env.get('NOTIFY_EMAIL')
      if (resendKey && notifyEmail) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'studio@resend.dev',
            to: notifyEmail,
            subject: `New commission request from ${name}`,
            text: `Name: ${name}\nContact: ${contact}\nType: ${type}\n\n${details}`,
          }),
        })
      }
    }
  } catch {
    /* notifications are best-effort */
  }

  return json({ ok: true })
})
