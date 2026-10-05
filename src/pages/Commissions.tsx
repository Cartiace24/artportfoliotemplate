import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, Clock, Heart, Loader2, Mail, Send, TriangleAlert } from 'lucide-react'
import { CommissionProcess } from '../components/Commissions'
import { Reveal, SectionHeading, Tape } from '../components/Bits'
import { ConfigError, InlineError } from '../components/States'
import { PageMeta } from '../lib/meta'
import { submitCommissionRequest } from '../lib/requests'
import { usePricing, useSiteConfig, useSiteSettings } from '../hooks/useSiteContent'

export function Commissions() {
  const { settings, error: settingsError } = useSiteSettings()
  const { categories, prices, loading: priceLoading, error: priceError, isMisconfigured } = usePricing()
  const { config } = useSiteConfig()
  const [form, setForm] = useState({ name: '', contact: '', type: 'Lorem — Half ($15)', details: '', website: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const open = settings.commission_status === 'open'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    setSending(true)
    setSendError(null)
    const r = await submitCommissionRequest(form)
    setSending(false)
    if (r.ok) setSent(true)
    else setSendError(r.error ?? 'Please try again.')
  }

  return (
    <main id="main" className="pt-[100px] mx-auto max-w-[1080px] px-4 sm:px-6 pb-8">
      <PageMeta
        title={`${config.site_name} — Lorem Ipsum`}
        description={settings.commission_message ?? config.tagline}
        path="/commissions"
      />
      <Reveal>
        <p className="font-hand text-[22px] text-[#8a6f5c] -rotate-1">lorem ipsum dolor sit amet…</p>
        <h1 className="font-serif-ed text-[44px] md:text-[60px] leading-none text-[#40203f] font-semibold mt-1">
          Lorem <span className="italic">Ipsum</span>
        </h1>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13.5px] font-bold border" role="status"
          style={open ? { background: '#dde5d2aa', borderColor: '#9aa88f66' } : { background: '#f2d8d355', borderColor: '#c98a8a66' }}>
          {open ? '🟢 Commissions Open' : '🔴 Commissions Closed'}
          {open && settings.available_slots != null && (
            <span className="font-hand text-[17px] font-medium">— {settings.available_slots} slots left!</span>
          )}
        </div>
        {settings.commission_message && (
          <p className="mt-2 font-hand text-[20px] text-[#6d5f6b]">“{settings.commission_message}”</p>
        )}
      </Reveal>

      {settingsError && (
        <div className="mt-4">
          <InlineError message={settingsError} />
        </div>
      )}
      {isMisconfigured && (
        <div className="mt-4">
          <ConfigError compact />
        </div>
      )}

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {priceLoading && (
          <>
            {[0, 1].map((i) => (
              <div key={i} className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] p-6 animate-pulse" aria-hidden>
                <div className="h-7 w-32 rounded bg-[#f3ecdd]" />
                <div className="mt-4 space-y-2">
                  <div className="h-10 rounded bg-[#faf3e8]" />
                  <div className="h-10 rounded bg-[#faf3e8]" />
                  <div className="h-10 rounded bg-[#faf3e8]" />
                </div>
              </div>
            ))}
          </>
        )}
        {priceError && !priceLoading && (
          <div className="md:col-span-2">
            <InlineError message={priceError} />
          </div>
        )}
        {!priceLoading && !priceError && categories.length === 0 && (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-[#c9b995] bg-[#fffdf7]/60 px-6 py-8 text-center">
            <p className="font-hand text-[24px] text-[#8a6f5c]">pricing is being sketched… check back soon ♡</p>
          </div>
        )}
        {!priceLoading && !priceError && categories.map((cat, ci) => {
          const items = prices.filter((p) => p.category_id === cat.id && p.enabled)
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24, rotate: ci ? 0.6 : -0.6 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="relative rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-6"
            >
              <Tape className="-top-3 left-8" />
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-[#f3ecdd] grid place-items-center text-[22px]" aria-hidden>{ci === 0 ? '🐱' : '🎨'}</span>
                <h2 className="font-serif-ed italic text-[26px] text-[#40203f]">{cat.name}</h2>
              </div>
              <dl className="mt-4 divide-y divide-[#e6dcc8]/70">
                {items.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3.5">
                    <dt className="font-semibold text-[15px] text-[#4d4250]">{p.type}</dt>
                    <dd className="font-serif-ed text-[24px] font-semibold text-[#40203f]">${p.price}</dd>
                  </div>
                ))}
                {items.length === 0 && <p className="py-4 text-[14px] text-[#8d857a]">Pricing coming soon ♡</p>}
              </dl>
              <p className="mt-2 text-[12.5px] text-[#8d857a]">+ complex backgrounds / extra characters may add a small fee — we&rsquo;ll chat first ♡</p>
            </motion.div>
          )
        })}
      </div>

      <section className="mt-12">
        <SectionHeading kicker="process" title="The process" note="simple & cozy" />
        <CommissionProcess />
      </section>

      <section className="mt-12 grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-6 relative">
          <Tape className="-top-3 right-10" rose />
          <h2 className="font-serif-ed italic text-[24px] text-[#40203f] flex items-center gap-2"><Clock className="w-5 h-5" /> Lorem ipsum</h2>
          <ul className="mt-3 space-y-2.5 text-[14.5px] text-[#4d4250] leading-relaxed">
            {[
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
              'Sed do eiusmod tempor incididunt ut labore et dolore.',
              'Ut enim ad minim veniam, quis nostrud exercitation.',
              'Duis aute irure dolor in reprehenderit in voluptate.',
              'Excepteur sint occaecat cupidatat non proident.',
            ].map((t) => (
              <li key={t} className="flex gap-2.5"><Check className="w-4 h-4 mt-1 text-[#9aa88f] shrink-0" aria-hidden />{t}</li>
            ))}
          </ul>
          <p className="mt-4 text-[13.5px] text-[#8d857a]">Full details live on the <a href="/tos" className="underline font-bold text-[#5b2b4e]">Terms of Service</a> page.</p>
        </div>

        <div className="rounded-2xl bg-[#5b2b4e] text-[#FAF6EF] p-6 relative overflow-hidden">
          <p className="font-hand text-[22px] text-[#e7ddf0] -rotate-1">lorem ipsum ✉</p>
          <h2 className="font-serif-ed italic text-[26px] mt-1">Lorem ipsum dolor!</h2>
          {sent ? (
            <div className="mt-4 rounded-xl bg-[#FAF6EF]/12 border border-white/20 p-5 text-center" role="status">
              <Heart className="w-8 h-8 mx-auto" aria-hidden />
              <p className="font-serif-ed italic text-[20px] mt-2">Thank you, {form.name || 'lorem'}!</p>
              <p className="text-[14px] opacity-85 mt-1">Your request is in the inbox — expect a reply within a few days ♡</p>
            </div>
          ) : (
            <form
              className="mt-4 space-y-3"
              onSubmit={onSubmit}
            >
              {/* Honeypot — invisible to humans, catches bots. */}
              <input
                type="text"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="sr-only"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[12.5px] font-bold uppercase tracking-wider opacity-70">Your name</span>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-xl bg-[#FAF6EF]/12 border border-white/25 px-4 py-2.5 placeholder:text-white/40 focus:bg-[#FAF6EF]/18"
                    placeholder="Lorem ipsum" />
                </label>
                <label className="block">
                  <span className="text-[12.5px] font-bold uppercase tracking-wider opacity-70">Contact (discord / email)</span>
                  <input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="mt-1 w-full rounded-xl bg-[#FAF6EF]/12 border border-white/25 px-4 py-2.5 placeholder:text-white/40"
                    placeholder="lorem@ipsum.dolor" />
                </label>
              </div>
              <label className="block">
                <span className="text-[12.5px] font-bold uppercase tracking-wider opacity-70">Commission type</span>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-[#FAF6EF]/12 border border-white/25 px-4 py-2.5 text-[#FAF6EF] [&>option]:text-black">
                  {prices.filter((p) => p.enabled).map((p) => (
                    <option key={p.id}>{p.category_name ?? ''} — {p.type} (${p.price})</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[12.5px] font-bold uppercase tracking-wider opacity-70">Your idea</span>
                <textarea required rows={4} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-[#FAF6EF]/12 border border-white/25 px-4 py-2.5 placeholder:text-white/40"
                  placeholder="Lorem ipsum dolor sit amet…" />
              </label>
              <button disabled={sending} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#FAF6EF] text-[#40203f] font-bold py-3 hover:-translate-y-0.5 transition-transform min-h-[48px] disabled:opacity-70 disabled:hover:translate-y-0">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Send className="w-4 h-4" aria-hidden />} {sending ? 'Sending…' : open ? 'Send request ♡' : 'Join the waitlist ♡'}
              </button>
              {sendError && (
                <p className="rounded-xl bg-red-900/40 border border-white/25 px-4 py-2.5 text-[13.5px] font-semibold flex items-center gap-2" role="alert">
                  <TriangleAlert className="w-4 h-4 shrink-0" aria-hidden /> {sendError}
                </p>
              )}
              <p className="text-[12px] opacity-60 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" aria-hidden /> Requests land in the studio inbox ♡</p>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
