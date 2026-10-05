import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { CommissionCategory, CommissionPrice, SiteSettings } from '../lib/types'
import { Eyebrow, Reveal } from './Bits'

export function CommissionPreview({
  settings,
  categories,
  prices,
}: {
  settings: SiteSettings
  categories: CommissionCategory[]
  prices: CommissionPrice[]
}) {
  const open = settings.commission_status === 'open'
  const byCat = categories.map((c) => ({
    ...c,
    items: prices.filter((p) => p.category_id === c.id && p.enabled).sort((a, b) => a.sort_order - b.sort_order),
  }))

  return (
    <aside className="border border-line bg-cream">
      <div className="px-6 pt-6 pb-5 border-b border-line">
        <Eyebrow>Rate card</Eyebrow>
        <h3 className="font-display text-[30px] leading-none text-ink mt-2">Commissions</h3>
        <p className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase" role="status">
          <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-moss' : 'bg-accent'}`} aria-hidden />
          <span className={open ? 'text-ink' : 'text-accent-deep'}>{open ? 'Open' : 'Closed'}</span>
          {open && settings.available_slots != null && (
            <span className="text-muted normal-case tracking-normal">— {settings.available_slots} slots</span>
          )}
        </p>
      </div>

      <div className="px-6 py-2">
        {byCat.map((cat) => (
          <Reveal key={cat.id}>
            <div className="py-5 border-b border-line last:border-0">
              <p className="font-display italic text-[21px] text-ink">{cat.name}</p>
              <dl className="mt-3">
                {cat.items.map((p) => (
                  <div key={p.id} className="flex items-baseline gap-3 py-1.5">
                    <dt className="text-[14px] font-medium text-ink shrink-0">{p.type}</dt>
                    <span className="leader flex-1 h-px" aria-hidden />
                    <dd className="font-display text-[20px] text-ink shrink-0">${p.price}</dd>
                  </div>
                ))}
                {cat.items.length === 0 && (
                  <p className="text-[13px] text-muted py-2">Rates to be announced.</p>
                )}
              </dl>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="px-6 pb-6">
        <Link
          to="/commissions"
          className="flex items-center justify-center gap-2 bg-ink text-cream px-5 py-3.5 text-[14px] font-semibold tracking-wide hover:bg-accent-deep transition-colors min-h-[48px]"
        >
          Full details <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    </aside>
  )
}

const STEPS = [
  { n: '01', title: 'Request', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.' },
  { n: '02', title: 'Discussion', body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.' },
  { n: '03', title: 'Sketch', body: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.' },
  { n: '04', title: 'Final', body: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.' },
]

export function CommissionProcess() {
  return (
    <ol className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-line">
      {STEPS.map((s, i) => (
        <motion.li
          key={s.n}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="border-b border-r border-line px-6 py-7 bg-cream"
        >
          <p className="font-display text-[44px] leading-none text-accent" aria-hidden>{s.n}</p>
          <h3 className="font-mono text-[12px] tracking-[0.18em] uppercase text-ink mt-4">{s.title}</h3>
          <p className="text-[14px] leading-relaxed text-ink-soft mt-2">{s.body}</p>
        </motion.li>
      ))}
    </ol>
  )
}
