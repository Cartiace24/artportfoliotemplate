import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Artwork, CommissionCategory, CommissionPrice, SiteSettings } from '../../lib/types'
import { SmartImage } from '../../components/SmartImage'
import { Eyebrow, Reveal, Stamp, Tape } from './Bits'

export function CommissionPreview({
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
    <aside className="relative bg-cream border border-line px-6 pt-7 pb-6">
      <Tape tone="moss" className="-top-3 left-8 -rotate-3" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <Eyebrow>Rate card</Eyebrow>
          <h3 className="font-display text-[30px] leading-none text-ink mt-2">Commissions</h3>
        </div>
        <Stamp tone={open ? 'moss' : 'accent'} className="mt-1">{open ? 'Open' : 'Closed'}</Stamp>
      </div>
      {open && settings.available_slots != null && (
        <p className="mt-2 font-note text-[19px] text-muted">— {settings.available_slots} slots right now!</p>
      )}

      {examples.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-2" aria-label="Recent examples">
          {examples.slice(0, 3).map((a) => (
            <figure key={a.id} className="frame bg-parchment overflow-hidden">
              <SmartImage path={a.image_path} alt="" width={400} sizes="20vw" className="w-full aspect-square object-cover" />
            </figure>
          ))}
        </div>
      )}

      <div className="mt-2">
        {byCat.map((cat) => {
          const min = cat.items.length ? Math.min(...cat.items.map((p) => Number(p.price))) : null
          return (
          <Reveal key={cat.id}>
            <div className="py-5 border-b border-line last:border-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display italic text-[21px] text-ink">{cat.name}</p>
                {min != null && <p className="font-note text-[17px] text-muted -rotate-1">from ${min}</p>}
              </div>
              <dl className="mt-2">
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
          )
        })}
      </div>

      <div className="pt-2">
        <Link
          to="/commissions"
          className="flex items-center justify-center gap-2 bg-ink text-cream px-5 py-3.5 text-[14px] font-semibold tracking-wide hover:bg-accent-deep transition-colors min-h-[48px]"
        >
          Full sheet <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    </aside>
  )
}

const STEPS = [
  { n: '1', title: 'Choose a type', body: 'Pick the format that fits your idea, then share the details and any references.' },
  { n: '2', title: 'Confirm the quote', body: 'We agree on the scope, price, and timeline before the drawing begins.' },
  { n: '3', title: 'Review the sketch', body: 'You get a chance to check the direction before the piece is taken to final.' },
  { n: '4', title: 'Receive your art', body: 'Your finished piece is delivered once the agreed process is complete.' },
]

export function CommissionProcess() {
  return (
    <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
      {STEPS.map((s, i) => (
        <motion.li
          key={s.n}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative border-t-2 border-ink pt-4"
        >
          <div className="flex items-baseline gap-3">
            <span className="font-note text-[40px] leading-none text-accent" aria-hidden>{s.n}</span>
            <h3 className="font-mono text-[12px] tracking-[0.18em] uppercase text-ink">{s.title}</h3>
          </div>
          <p className="text-[14px] leading-relaxed text-ink-soft mt-2">{s.body}</p>
        </motion.li>
      ))}
    </ol>
  )
}
