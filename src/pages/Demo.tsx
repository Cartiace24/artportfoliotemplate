import { Link } from 'react-router-dom'
import { ArrowRight, Palette } from 'lucide-react'
import { PageMeta } from '../lib/meta'

const OPTIONS = [
  {
    to: '/demo/classic',
    title: 'Classic',
    note: 'The original sketchbook wall',
    description: 'Warm paper, pinned prints, editorial type, and little handwritten moments.',
    className: 'bg-cream border-ink text-ink hover:bg-parchment',
  },
  {
    to: '/demo/painterly',
    title: 'Painterly',
    note: 'Oil-paint sketchbook after dark',
    description: 'Ultramarine night, ochre brush marks, torn paper, and a studio-desk mood.',
    className: 'bg-[#1b2653] border-[#e8a91c] text-[#faf5e4] hover:bg-[#26305b]',
  },
]

/** A public design picker; it intentionally has no link to the private Studio. */
export function Demo() {
  return (
    <main className="paper-grain min-h-dvh bg-paper px-4 py-10 sm:px-6 sm:py-16">
      <PageMeta title="Portfolio theme showcase" description="Choose a portfolio visual direction." path="/demo" />
      <div className="mx-auto max-w-[1000px]">
        <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted">Artist portfolio showcase</p>
        <h1 className="mt-4 max-w-[12ch] font-display text-[clamp(3rem,8vw,6rem)] leading-[0.9] text-ink">Pick a visual direction.</h1>
        <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-ink-soft">
          Same artwork and commission flow, two distinctly different studio atmospheres.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {OPTIONS.map((option) => (
            <Link
              key={option.to}
              to={option.to}
              className={`group min-h-[280px] border-2 p-7 sm:p-9 transition-colors ${option.className}`}
            >
              <Palette className="h-6 w-6" aria-hidden />
              <p className="mt-10 font-mono text-[11px] tracking-[0.18em] uppercase opacity-70">{option.note}</p>
              <h2 className="mt-2 font-display text-[48px] leading-none">{option.title}</h2>
              <p className="mt-4 max-w-[32ch] text-[15px] leading-relaxed opacity-80">{option.description}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-[14px] font-semibold group-hover:gap-3 transition-all">
                Explore theme <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
