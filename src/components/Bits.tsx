import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { fadeUp } from '../animations/variants'

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
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

/** Small mono eyebrow label, e.g. "SELECTED WORK — 2026". */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[11px] tracking-[0.22em] uppercase text-muted ${className}`}>
      {children}
    </p>
  )
}

/** 1px horizontal rule. */
export function Rule({ className = '' }: { className?: string }) {
  return <hr aria-hidden className={`border-0 border-t border-line ${className}`} />
}

/**
 * Editorial section header: index number + display title + hairline rule.
 * Example: 02 / Selected Work ———— note
 */
export function SectionHead({
  index,
  title,
  note,
}: {
  index: string
  title: ReactNode
  note?: string
}) {
  return (
    <div className="flex items-baseline gap-4 mb-8">
      <span aria-hidden className="font-mono text-[12px] text-accent shrink-0">
        {index}
      </span>
      <h2 className="font-display text-[32px] md:text-[40px] leading-none text-ink shrink-0">
        {title}
      </h2>
      <span className="hidden sm:block h-px flex-1 bg-line" aria-hidden />
      {note && (
        <span className="hidden md:block font-mono text-[11px] tracking-[0.18em] uppercase text-muted whitespace-nowrap">
          {note}
        </span>
      )}
    </div>
  )
}
