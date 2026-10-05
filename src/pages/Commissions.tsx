import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, Loader2, TriangleAlert } from 'lucide-react'
import { CommissionProcess } from '../components/Commissions'
import { Eyebrow, Reveal, SectionHead } from '../components/Bits'
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
    <main id="main" className="pt-[72px] mx-auto max-w-[1080px] px-4 sm:px-6 pb-8">
      <PageMeta
        title={`${config.site_name} — Commissions`}
        description={settings.commission_message ?? config.tagline}
        path="/commissions"
      />
      <div className="py-10 md:py-14 border-b border-ink">
        <Reveal>
          <Eyebrow>Rate card</Eyebrow>
          <h1 className="font-display text-[clamp(2.8rem,7vw,4.5rem)] leading-[1] text-ink mt-3">
            Commissions
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2" role="status">
            <span className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.14em] uppercase">
              <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-moss' : 'bg-accent'}`} aria-hidden />
              <span className={open ? 'text-ink' : 'text-accent-deep'}>
                {open ? 'Open for work' : 'Books closed'}
              </span>
            </span>
            {open && settings.available_slots != null && (
              <span className="font-mono text-[12px] text-muted">{settings.available_slots} slots left</span>
            )}
          </div>
          {settings.commission_message && (
            <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft max-w-[60ch]">{settings.commission_message}</p>
          )}
        </Reveal>
      </div>

      {settingsError && (
        <div className="mt-6">
          <InlineError message={settingsError} />
        </div>
      )}
      {isMisconfigured && (
        <div className="mt-6">
          <ConfigError compact />
        </div>
      )}

      <div className="mt-10 grid md:grid-cols-2 gap-x-12 gap-y-10">
        {priceLoading && (
          <>
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse" aria-hidden>
                <div className="h-7 w-32 bg-parchment" />
                <div className="mt-4 space-y-2">
                  <div className="h-8 bg-parchment" />
                  <div className="h-8 bg-parchment" />
                  <div className="h-8 bg-parchment" />
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
          <div className="md:col-span-2 border border-dashed border-muted/60 px-6 py-10 text-center">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted">No rates yet</p>
            <p className="mt-2 font-display text-[24px] text-ink">Rates are being set.</p>
          </div>
        )}
        {!priceLoading && !priceError && categories.map((cat, ci) => {
          const items = prices.filter((p) => p.category_id === cat.id && p.enabled)
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: ci * 0.06 }}
            >
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent">
                {String(ci + 1).padStart(2, '0')}
              </p>
              <h2 className="font-display italic text-[30px] text-ink mt-1">{cat.name}</h2>
              <dl className="mt-4 border-t border-ink">
                {items.map((p) => (
                  <div key={p.id} className="flex items-baseline gap-3 py-3 border-b border-line">
                    <dt className="text-[14.5px] font-medium text-ink shrink-0">{p.type}</dt>
                    <span className="leader flex-1 h-px" aria-hidden />
                    <dd className="font-display text-[22px] text-ink shrink-0">${p.price}</dd>
                  </div>
                ))}
                {items.length === 0 && <p className="py-4 text-[14px] text-muted">Rates to be announced.</p>}
              </dl>
            </motion.div>
          )
        })}
      </div>
      {!priceLoading && !priceError && categories.length > 0 && (
        <p className="mt-6 text-[13px] text-muted max-w-[62ch]">
          Complex backgrounds or extra characters may add a small fee — that gets agreed before anything starts.
        </p>
      )}

      <section className="mt-16">
        <SectionHead index="02" title="Process" note="Four steps" />
        <CommissionProcess />
      </section>

      <section className="mt-16 grid lg:grid-cols-2 gap-8">
        <div className="border border-line bg-cream p-6 sm:p-8">
          <Eyebrow>Good to know</Eyebrow>
          <ul className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-ink-soft">
            {[
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
              'Sed do eiusmod tempor incididunt ut labore et dolore.',
              'Ut enim ad minim veniam, quis nostrud exercitation.',
              'Duis aute irure dolor in reprehenderit in voluptate.',
              'Excepteur sint occaecat cupidatat non proident.',
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <Check className="w-4 h-4 mt-1 text-moss shrink-0" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[13.5px] text-muted">
            Full details on the <a href="/tos" className="font-semibold text-ink underline underline-offset-[5px] decoration-accent decoration-2">Terms page</a>.
          </p>
        </div>

        <div className="bg-ink text-cream p-6 sm:p-8">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-cream/60">Request a slot</p>
          <h2 className="font-display italic text-[30px] mt-2">Start a piece</h2>
          {sent ? (
            <div className="mt-5 border border-cream/25 p-5 text-center" role="status">
              <p className="font-display italic text-[22px]">Thank you{form.name ? `, ${form.name}` : ''}.</p>
              <p className="text-[14px] text-cream/75 mt-1">Your request is in the inbox — expect a reply within a few days.</p>
            </div>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
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
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-cream/60">Name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5 w-full bg-transparent border border-cream/30 px-4 py-2.5 text-[14.5px] placeholder:text-cream/35 focus:border-cream min-h-[48px]"
                    placeholder="Lorem ipsum"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-cream/60">Contact</span>
                  <input
                    required
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="mt-1.5 w-full bg-transparent border border-cream/30 px-4 py-2.5 text-[14.5px] placeholder:text-cream/35 focus:border-cream min-h-[48px]"
                    placeholder="lorem@ipsum.dolor"
                  />
                </label>
              </div>
              <label className="block">
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-cream/60">Type</span>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1.5 w-full bg-transparent border border-cream/30 px-4 py-2.5 text-[14.5px] text-cream [&>option]:text-black min-h-[48px]"
                >
                  {prices.filter((p) => p.enabled).map((p) => (
                    <option key={p.id}>{p.category_name ?? ''} — {p.type} (${p.price})</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-cream/60">Idea</span>
                <textarea
                  required
                  rows={4}
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  className="mt-1.5 w-full bg-transparent border border-cream/30 px-4 py-2.5 text-[14.5px] placeholder:text-cream/35 focus:border-cream"
                  placeholder="Lorem ipsum dolor sit amet…"
                />
              </label>
              <button
                disabled={sending}
                className="w-full inline-flex items-center justify-center gap-2 bg-accent text-cream font-semibold text-[14px] tracking-wide py-3.5 hover:bg-accent-deep transition-colors min-h-[48px] disabled:opacity-70"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : null}
                {sending ? 'Sending…' : open ? 'Send request' : 'Join the waitlist'}
              </button>
              {sendError && (
                <p className="border border-accent-soft/40 px-4 py-2.5 text-[13.5px] font-semibold flex items-center gap-2" role="alert">
                  <TriangleAlert className="w-4 h-4 shrink-0" aria-hidden /> {sendError}
                </p>
              )}
              <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-cream/50">Requests land in the studio inbox</p>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
