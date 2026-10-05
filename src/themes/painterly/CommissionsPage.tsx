import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, Loader2, TriangleAlert } from 'lucide-react'
import { PCommissionProcess } from './Commissions'
import { PNote, PReveal, PSectionHead, PTape, PaintDivider, SquiggleArrow } from './bits'
import { SmartImage } from '../../components/SmartImage'
import { PageMeta } from '../../lib/meta'
import { submitCommissionRequest } from '../../lib/requests'
import { useArtworks, usePricing, useSiteConfig, useSiteSettings } from '../../hooks/useSiteContent'

export function PainterlyCommissions() {
  const { settings } = useSiteSettings()
  const { categories, prices, loading: priceLoading, error: priceError } = usePricing()
  const { config } = useSiteConfig()
  const { artworks } = useArtworks(false)
  const [form, setForm] = useState({ name: '', contact: '', type: 'Lorem — Half ($15)', details: '', website: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const open = settings.commission_status === 'open'
  const startingPrice = prices.filter((p) => p.enabled).reduce<number | null>((lowest, p) =>
    lowest === null || p.price < lowest ? p.price : lowest, null)

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
      <div className="py-10 md:py-14 text-center">
        <PReveal>
          <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-[var(--pt-brown)]">The commission sheet</p>
          <h1 className="pt-display text-[clamp(3rem,9vw,5.5rem)] leading-[0.95] text-[var(--pt-ink)] mt-3">
            COMMISSIONS
          </h1>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3" role="status">
            <span
              aria-label={open ? 'Commissions open' : 'Commissions closed'}
              className={`inline-block border-[3px] px-4 py-1.5 font-mono text-[13px] tracking-[0.2em] uppercase rotate-[-2deg] ${
                open ? 'border-[var(--pt-olive)] text-[var(--pt-olive)]' : 'border-[var(--pt-ochre)] text-[var(--pt-ochre)]'
              }`}
            >
              {open ? 'Open' : 'Closed'}
            </span>
            {open && settings.available_slots != null && (
              <PNote className="text-[22px]">— {settings.available_slots} slots left!</PNote>
            )}
          </div>
          <dl className="mt-6 grid grid-cols-3 max-w-[620px] mx-auto border-y-2 border-[var(--pt-ink)]/25 text-left">
            <div className="py-3 pr-3 border-r-2 border-[var(--pt-ink)]/20">
              <dt className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--pt-brown)]">Starting at</dt>
              <dd className="mt-1 pt-display text-[24px] text-[var(--pt-ink)]">{startingPrice != null ? `$${startingPrice}` : 'Ask'}</dd>
            </div>
            <div className="py-3 px-3 border-r-2 border-[var(--pt-ink)]/20">
              <dt className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--pt-brown)]">Availability</dt>
              <dd className="mt-1 text-[14px] font-bold text-[var(--pt-ink)]">{open ? 'Taking requests' : 'Waitlist open'}</dd>
            </div>
            <div className="py-3 pl-3">
              <dt className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--pt-brown)]">Timeline</dt>
              <dd className="mt-1 text-[14px] font-bold text-[var(--pt-ink)]">Set with quote</dd>
            </div>
          </dl>
          {settings.commission_message && (
            <p className="mt-4 text-[15.5px] leading-relaxed text-[var(--pt-ink-soft)] max-w-[60ch] mx-auto">{settings.commission_message}</p>
          )}
        </PReveal>
      </div>

      <PaintDivider />

      {artworks.length > 0 && (
        <div className="mt-10">
          <PNote className="text-[24px] -rotate-1 mb-4 text-center">commission references — a feel for my hand ↓</PNote>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {artworks.slice(0, 4).map((a, i) => (
              <figure key={a.id} className={`relative bg-[var(--pt-cream)] border-2 border-[var(--pt-ink)] p-1.5 ${i % 2 ? 'rotate-2' : '-rotate-2'}`}>
                <PTape className="-top-3 left-1/2 -translate-x-1/2 !w-[70px] !h-[22px]" />
                <SmartImage path={a.image_path} alt={a.title} width={500} sizes="(max-width: 640px) 50vw, 25vw" className="w-full aspect-square object-cover" />
                <figcaption className="pt-2 flex items-baseline justify-between gap-2">
                  <span className="pt-hand text-[18px] text-[var(--pt-ink)] truncate">{a.title}</span>
                  <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--pt-brown)] shrink-0">{a.category}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 grid md:grid-cols-2 gap-x-12 gap-y-12">
        {priceLoading && (
          <>
            {[0, 1].map((i) => (
              <div key={i} className="animate-pulse" aria-hidden>
                <div className="h-8 w-32 bg-[var(--pt-canvas)]" />
                <div className="mt-4 space-y-2">
                  <div className="h-9 bg-[var(--pt-canvas)]" />
                  <div className="h-9 bg-[var(--pt-canvas)]" />
                  <div className="h-9 bg-[var(--pt-canvas)]" />
                </div>
              </div>
            ))}
          </>
        )}
        {priceError && !priceLoading && (
          <div role="alert" className="md:col-span-2 border-2 border-[var(--pt-ochre)] px-5 py-4 text-[14px] font-semibold text-[var(--pt-ochre)]">
            {priceError}
          </div>
        )}
        {!priceLoading && !priceError && categories.length === 0 && (
          <div className="md:col-span-2 border-2 border-dashed border-[var(--pt-ink)]/40 px-6 py-10 text-center">
            <p className="pt-hand text-[30px] text-[var(--pt-ink)]">prices still wet — check back soon!</p>
          </div>
        )}
        {!priceLoading && !priceError && categories.map((cat, ci) => {
          const items = prices.filter((p) => p.category_id === cat.id && p.enabled)
          const min = items.length ? Math.min(...items.map((p) => Number(p.price))) : null
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: ci * 0.06 }}
              className={ci % 2 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}
            >
              <p className="pt-hand text-[26px] text-[var(--pt-ochre)]">
                {String(ci + 1).padStart(2, '0')} · {cat.name}
                {min != null && <span className="text-[var(--pt-brown)]"> — from ${min}!</span>}
              </p>
              <dl className="mt-3 border-t-[3px] border-[var(--pt-ink)]">
                {items.map((p) => (
                  <div key={p.id} className="flex items-baseline gap-3 py-3 border-b-2 border-dashed border-[var(--pt-ink)]/25">
                    <dt className="text-[15px] font-bold text-[var(--pt-ink)] shrink-0">{p.type}</dt>
                    <span aria-hidden className="flex-1 border-b-[3px] border-dotted border-[var(--pt-brown)]/60 translate-y-[-5px]" />
                    <dd className="pt-display text-[26px] text-[var(--pt-ink)] shrink-0">${p.price}</dd>
                  </div>
                ))}
                {items.length === 0 && <p className="py-4 text-[14px] text-[var(--pt-brown)]">Prices still wet.</p>}
              </dl>
            </motion.div>
          )
        })}
      </div>
      {!priceLoading && !priceError && categories.length > 0 && (
        <PNote className="text-[21px] mt-6 max-w-[62ch]">
          psst — tricky backgrounds or extra characters cost a little more, we agree it first!
        </PNote>
      )}

      <section className="mt-16">
        <PSectionHead kicker="first this, then that" title="How It Goes" note="Four steps" />
        <PCommissionProcess />
      </section>

      <section className="mt-16 grid lg:grid-cols-2 gap-8">
        <div className="relative pt-canvas border-2 border-[var(--pt-ink)] p-6 sm:p-8 -rotate-[0.4deg]">
          <PTape className="-top-4 left-10 -rotate-3" />
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--pt-brown)]">Before you request</p>
          <ul className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-[var(--pt-ink)]">
            {[
              'A clear idea, visual references, and a note on mood or pose make for the best start.',
              'The final quote and timeline are confirmed before work begins.',
              'Please mention deadlines, extra characters, or complex backgrounds up front.',
              'Ask before requesting commercial use or a rush delivery.',
              'The sketch-review step keeps the direction clear before final rendering.',
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <Check className="w-4 h-4 mt-1 text-[var(--pt-olive)] shrink-0" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[13.5px] text-[var(--pt-brown)]">
            The rest lives on the <a href="/tos" className="font-bold text-[var(--pt-ink)] underline decoration-[var(--pt-ochre)] decoration-2 underline-offset-4">Terms page</a>.
          </p>
        </div>

        <div id="request" className="relative bg-[var(--pt-ink)] text-[var(--pt-cream)] p-6 sm:p-8 rotate-[0.4deg] scroll-mt-24">
          <PNote className="text-[22px] text-[var(--pt-sun)] rotate-1 mb-1">i reply within a few days!</PNote>
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-70">Send your idea</p>
          <h2 className="pt-display italic text-[32px] mt-2">Start a piece</h2>
          {sent ? (
            <div className="mt-5 border-2 border-dashed border-[var(--pt-cream)]/40 p-5 text-center" role="status">
              <p className="pt-hand text-[30px]">Thank you{form.name ? `, ${form.name}` : ''}!</p>
              <p className="text-[14px] opacity-80 mt-1">It's pinned to my inbox — talk soon.</p>
            </div>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
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
                  <span className="font-mono text-[11px] tracking-[0.14em] uppercase opacity-70">Name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5 w-full bg-transparent border-2 border-[var(--pt-cream)]/30 px-4 py-2.5 text-[14.5px] placeholder:text-[var(--pt-cream)]/35 focus:border-[var(--pt-sun)] min-h-[48px]"
                    placeholder="Lorem ipsum"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[11px] tracking-[0.14em] uppercase opacity-70">Contact</span>
                  <input
                    required
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="mt-1.5 w-full bg-transparent border-2 border-[var(--pt-cream)]/30 px-4 py-2.5 text-[14.5px] placeholder:text-[var(--pt-cream)]/35 focus:border-[var(--pt-sun)] min-h-[48px]"
                    placeholder="lorem@ipsum.dolor"
                  />
                </label>
              </div>
              <label className="block">
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase opacity-70">Type</span>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1.5 w-full bg-transparent border-2 border-[var(--pt-cream)]/30 px-4 py-2.5 text-[14.5px] text-[var(--pt-cream)] [&>option]:text-black min-h-[48px]"
                >
                  {prices.filter((p) => p.enabled).map((p) => (
                    <option key={p.id}>{p.category_name ?? ''} — {p.type} (${p.price})</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase opacity-70">Idea</span>
                <span className="mt-1 block text-[12px] leading-relaxed opacity-65">Include references, character details, mood, pose, and any deadline.</span>
                <textarea
                  required
                  rows={4}
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  className="mt-1.5 w-full bg-transparent border-2 border-[var(--pt-cream)]/30 px-4 py-2.5 text-[14.5px] placeholder:text-[var(--pt-cream)]/35 focus:border-[var(--pt-sun)]"
                  placeholder="Lorem ipsum dolor sit amet…"
                />
              </label>
              <button
                disabled={sending}
                className="w-full inline-flex items-center justify-center gap-2 bg-[var(--pt-sun)] text-[var(--pt-ink)] font-bold text-[14px] tracking-wide py-3.5 hover:bg-[var(--pt-ochre)] hover:text-white transition-colors min-h-[48px] disabled:opacity-70"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : null}
                {sending ? 'Sending…' : open ? 'Send it over' : 'Join the waitlist'}
              </button>
              {sendError && (
                <p className="border-2 border-[var(--pt-sun)]/60 px-4 py-2.5 text-[13.5px] font-semibold flex items-center gap-2" role="alert">
                  <TriangleAlert className="w-4 h-4 shrink-0" aria-hidden /> {sendError}
                </p>
              )}
              <div className="flex items-center gap-3">
                <SquiggleArrow className="w-14 h-7 text-[var(--pt-sun)] -rotate-6" />
                <p className="pt-hand text-[22px] text-[var(--pt-sun)]">lands right in my inbox!</p>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
