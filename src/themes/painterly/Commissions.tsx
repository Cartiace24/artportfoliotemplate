import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import type { Artwork, CommissionCategory, CommissionPrice, SiteSettings } from '../../lib/types'
import { SmartImage } from '../../components/SmartImage'
import { PNote, PReveal, PTape, SquiggleArrow } from './bits'

export function PCommissionPreview({
  settings,
  categories,
  prices,
  examples = [],
}: {
  settings: SiteSettings
  categories: CommissionCategory[]
  prices: CommissionPrice[]
  examples?: Artwork[]
}) {
  const open = settings.commission_status === 'open'
  const byCat = categories.map((c) => ({
    ...c,
    items: prices.filter((p) => p.category_id === c.id && p.enabled).sort((a, b) => a.sort_order - b.sort_order),
  }))

  return (
    <aside className="relative pt-canvas border-2 border-[var(--pt-ink)] px-6 pt-8 pb-6 rotate-[0.5deg]">
      <PTape className="-top-4 left-10 -rotate-3" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--pt-brown)]">Commission sheet</p>
          <h3 className="pt-display text-[32px] leading-none text-[var(--pt-ink)] mt-2">Commissions</h3>
        </div>
        <span
          role="status"
          aria-label={open ? 'Commissions open' : 'Commissions closed'}
          className={`inline-block border-[3px] px-3 py-1 font-mono text-[12px] tracking-[0.2em] uppercase rotate-3 shrink-0 ${
            open ? 'border-[var(--pt-olive)] text-[var(--pt-olive)]' : 'border-[var(--pt-ochre)] text-[var(--pt-ochre)]'
          }`}
        >
          {open ? 'Open' : 'Closed'}
        </span>
      </div>
      {open && settings.available_slots != null && (
        <PNote className="text-[21px] mt-2 -rotate-1">— {settings.available_slots} slots right now!</PNote>
      )}

      {examples.length > 0 && (
        <div className="mt-5" aria-label="Recent examples">
          <PNote className="text-[19px] mb-2">some recent pieces ↓</PNote>
          <div className="grid grid-cols-3 gap-2">
            {examples.slice(0, 3).map((a, i) => (
              <figure key={a.id} className={`bg-[var(--pt-cream)] border border-[var(--pt-ink)]/50 p-1 ${i === 1 ? '-rotate-2' : i === 2 ? 'rotate-2' : ''}`}>
                <SmartImage path={a.image_path} alt="" width={400} sizes="20vw" className="w-full aspect-square object-cover" />
              </figure>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2">
        {byCat.map((cat) => {
          const min = cat.items.length ? Math.min(...cat.items.map((p) => Number(p.price))) : null
          return (
            <PReveal key={cat.id}>
              <div className="py-5 border-b-2 border-dashed border-[var(--pt-ink)]/30 last:border-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="pt-display italic text-[24px] text-[var(--pt-ink)]">{cat.name}</p>
                  {min != null && <p className="pt-hand text-[22px] text-[var(--pt-ochre)] -rotate-1">from ${min}!</p>}
                </div>
                <dl className="mt-2">
                  {cat.items.map((p) => (
                    <div key={p.id} className="flex items-baseline gap-3 py-1.5">
                      <dt className="text-[14.5px] font-semibold text-[var(--pt-ink)] shrink-0">{p.type}</dt>
                      <span aria-hidden className="flex-1 border-b-2 border-dotted border-[var(--pt-brown)]/50 translate-y-[-4px]" />
                      <dd className="pt-display text-[22px] text-[var(--pt-ink)] shrink-0">${p.price}</dd>
                    </div>
                  ))}
                  {cat.items.length === 0 && (
                    <p className="text-[13px] text-[var(--pt-brown)] py-2">Prices still wet — check back soon.</p>
                  )}
                </dl>
              </div>
            </PReveal>
          )
        })}
      </div>

      <div className="pt-2">
        <Link
          to="/commissions"
          className="flex items-center justify-center gap-2 bg-[var(--pt-ink)] text-[var(--pt-cream)] px-5 py-3.5 text-[14px] font-semibold tracking-wide hover:bg-[var(--pt-ochre)] transition-colors min-h-[48px]"
        >
          Read the full sheet →
        </Link>
      </div>
    </aside>
  )
}

const STEPS = [
  { n: '01', title: 'Send your idea', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.' },
  { n: '02', title: 'Sketch', body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.' },
  { n: '03', title: 'Approval', body: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.' },
  { n: '04', title: 'Final artwork', body: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.' },
]

export function PCommissionProcess() {
  return (
    <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
      {STEPS.map((s, i) => (
        <motion.li
          key={s.n}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className={`relative ${i % 2 ? 'lg:mt-8 rotate-[0.6deg]' : '-rotate-[0.6deg]'}`}
        >
          <p className="pt-hand text-[44px] leading-none text-[var(--pt-ochre)]" aria-hidden>{s.n}</p>
          <h3 className="pt-display text-[22px] text-[var(--pt-ink)] mt-1">{s.title}</h3>
          <p className="text-[14px] leading-relaxed text-[var(--pt-ink-soft)] mt-1.5">{s.body}</p>
          {i < 3 && (
            <SquiggleArrow className="hidden lg:block absolute top-2 -right-7 w-12 h-6 text-[var(--pt-teal)] rotate-12" />
          )}
        </motion.li>
      ))}
    </ol>
  )
}
