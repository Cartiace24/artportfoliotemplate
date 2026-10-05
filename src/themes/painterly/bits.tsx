import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { fadeUp } from '../../animations/variants'

export function PReveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      custom={delay}
    >
      {children}
    </motion.div>
  )
}

/** Masking tape strip. Position with extra classes. */
export function PTape({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`pt-tape ${className}`} />
}

/** Handwritten margin note in paint. */
export function PNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`pt-hand text-[var(--pt-brown)] ${className}`}>{children}</p>
}

/** Small paint daubs row. */
export function PaintDabs({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="pt-daub w-2.5 h-2.5 bg-[var(--pt-sun)]" />
      <span className="pt-daub w-2 h-2 bg-[var(--pt-ochre)]" />
      <span className="pt-daub w-2.5 h-2.5 bg-[var(--pt-olive)]" />
      <span className="pt-daub w-2 h-2 bg-[var(--pt-teal)]" />
    </span>
  )
}

/** Hand-drawn curved arrow. */
export function SquiggleArrow({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 80 40"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M6 8 C 30 34, 52 34, 70 12 M70 12 l-11 1 M70 12 l-3 11" />
    </svg>
  )
}

/** Torn-paper section divider with paint daubs. */
export function PaintDivider({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`flex items-center gap-4 ${className}`}>
      <span className="h-[3px] flex-1 bg-[var(--pt-ochre)] opacity-70" style={{ clipPath: 'polygon(0 30%, 100% 0, 100% 70%, 0 100%)' }} />
      <PaintDabs />
      <span className="h-[3px] flex-1 bg-[var(--pt-ochre)] opacity-70" style={{ clipPath: 'polygon(0 0, 100% 30%, 100% 100%, 0 70%)' }} />
    </div>
  )
}

/**
 * Painterly section header: handwritten kicker, painted title,
 * torn divider. Example: sketchbook page / Selected Work
 */
export function PSectionHead({
  kicker,
  title,
  note,
}: {
  kicker: string
  title: ReactNode
  note?: string
}) {
  return (
    <div className="mb-8">
      <p className="pt-hand text-[24px] text-[var(--pt-ochre)] -rotate-1">{kicker}</p>
      <div className="flex items-baseline gap-4 mt-1">
        <h2 className="pt-display text-[34px] md:text-[44px] leading-none text-[var(--pt-ink)] shrink-0">
          {title}
        </h2>
        {note && (
          <span className="hidden md:block font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--pt-brown)] whitespace-nowrap ml-auto">
            {note}
          </span>
        )}
      </div>
      <div aria-hidden className="mt-3 h-[3px] bg-[var(--pt-ink)] opacity-90" style={{ clipPath: 'polygon(0 20%, 100% 0, 100% 80%, 0 100%)' }} />
    </div>
  )
}
