import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { CommissionCategory, CommissionPrice, SiteSettings } from '../lib/types'
import { Reveal, Tape } from './Bits'

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
    <aside className="relative rounded-2xl bg-[#fffdf7]/80 border border-[#e6dcc8] print-shadow p-6 sm:p-7 overflow-hidden">
      <Tape className="-top-1 right-8 rotate-[8deg]" />
      <h3 className="font-serif-ed text-[26px] leading-tight text-[#40203f]">
        Lorem<br /><span className="italic">dolor sit amet</span> <span aria-hidden className="text-[16px] align-top">✦</span>
      </h3>

      <div className="mt-5 space-y-5">
        {byCat.map((cat) => (
          <Reveal key={cat.id}>
            <div className="rounded-xl bg-[#faf3e8] border border-[#e6dcc8]/70 p-4">
              <p className="font-serif-ed italic text-[18px] text-[#40203f] mb-3 px-1">{cat.name}</p>
              <dl className="grid grid-cols-3 gap-2 text-center">
                {cat.items.map((p) => (
                  <div key={p.id} className="rounded-lg bg-[#fffdf7] border border-[#e6dcc8]/60 py-2.5">
                    <dt className="text-[12px] text-[#8d857a] font-medium">{p.type}</dt>
                    <dd className="font-serif-ed text-[20px] text-[#40203f] font-semibold">${p.price}</dd>
                  </div>
                ))}
                {cat.items.length === 0 && (
                  <p className="col-span-3 text-[13px] text-[#8d857a] py-2">Lorem ipsum dolor ♡</p>
                )}
              </dl>
            </div>
          </Reveal>
        ))}
      </div>

      {!open && (
        <p className="mt-4 rounded-xl bg-[#f2d8d3]/50 border border-[#c98a8a]/30 px-4 py-3 text-[13.5px] text-[#6e2f2f] font-medium" role="status">
          🔴 Commissions are currently closed — check back soon!
        </p>
      )}

      <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="mt-5">
        <Link
          to="/commissions"
          className="flex items-center justify-center gap-2 rounded-full bg-[#5b2b4e] text-[#FAF6EF] px-5 py-3.5 text-[15px] font-semibold hover:bg-[#422040] transition-colors"
        >
          View full commission details <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </motion.div>
      <span aria-hidden className="absolute bottom-3 left-4 text-[#b9a8d0] text-[20px]">❀</span>
    </aside>
  )
}

const STEPS = [
  { n: '01', title: 'Lorem ipsum dolor', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.', doodle: '✎' },
  { n: '02', title: 'Sit amet consectetur', body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.', doodle: '♡' },
  { n: '03', title: 'Adipiscing elit', body: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.', doodle: '✦' },
  { n: '04', title: 'Sed do eiusmod', body: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.', doodle: '✉' },
]

export function CommissionProcess() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {STEPS.map((s, i) => (
        <motion.div
          key={s.n}
          initial={{ opacity: 0, y: 26, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -0.8 : 0.8 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-5 pt-6"
        >
          <span aria-hidden className="absolute -top-3 left-5 tape tape-lav !w-[64px]" style={{ transform: `rotate(${i % 2 ? 5 : -5}deg)` }} />
          <p className="font-hand text-[22px] text-[#c98a8a]">{s.n} <span aria-hidden>{s.doodle}</span></p>
          <h3 className="font-serif-ed italic text-[19px] text-[#40203f] mt-1 leading-snug">{s.title}</h3>
          <p className="text-[13.8px] leading-relaxed text-[#6d5f6b] mt-2">{s.body}</p>
          {i < 3 && (
            <span aria-hidden className="hidden lg:block absolute top-1/2 -right-5 font-hand text-[26px] text-[#8a6f5c] rotate-12">→</span>
          )}
        </motion.div>
      ))}
    </div>
  )
}
