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

/** Torn-paper note card. */
export function TornNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`pt-sheet px-6 py-6 ${className}`}>
      {children}
    </div>
  )
}

/** Row of paint swatches with optional caption. */
export function PaintSwatches({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-flex items-center gap-2 ${className}`}>
      <span className="inline-block w-7 h-5 rotate-[-8deg] bg-[var(--pt-teal)]" style={{ clipPath: 'polygon(4% 8%, 96% 0, 100% 90%, 0 100%)' }} />
      <span className="inline-block w-7 h-5 rotate-[5deg] bg-[var(--pt-sun)]" style={{ clipPath: 'polygon(0 12%, 98% 2%, 96% 96%, 3% 88%)' }} />
      <span className="inline-block w-7 h-5 rotate-[-4deg] bg-[var(--pt-ochre)]" style={{ clipPath: 'polygon(3% 4%, 97% 10%, 100% 92%, 0 98%)' }} />
      <span className="inline-block w-7 h-5 rotate-[7deg] bg-[var(--pt-olive)]" style={{ clipPath: 'polygon(0 8%, 100% 0, 97% 94%, 4% 100%)' }} />
    </span>
  )
}

/** Simple hand-drawn sunflower doodle (generic, decorative). */
export function SunflowerDoodle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 160" aria-hidden fill="none" className={className}>
      <path d="M60 70 C 58 100, 62 125, 58 155" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      <path d="M59 115 C 45 108, 36 108, 28 114 M60 130 C 72 124, 82 124, 90 130" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
      <g transform="translate(60 48)">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180
          const x1 = Math.cos(a) * 14
          const y1 = Math.sin(a) * 14
          const x2 = Math.cos(a) * 30
          const y2 = Math.sin(a) * 30
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={5} strokeLinecap="round" />
        })}
        <circle r="13" fill="currentColor" opacity="0.85" />
      </g>
    </svg>
  )
}

/** Small hand-drawn sparkle doodle. */
export function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className}>
      <path d="M12 3 L13.5 10.5 L21 12 L13.5 13.5 L12 21 L10.5 13.5 L3 12 L10.5 10.5 Z" />
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
  onDark = false,
  center = false,
}: {
  kicker: string
  title: ReactNode
  note?: string
  onDark?: boolean
  center?: boolean
}) {
  const titleColor = onDark ? 'text-[var(--pt-cream)]' : 'text-[var(--pt-ink)]'
  return (
    <div className={`mb-8 ${center ? 'text-center' : ''}`}>
      <p className={`pt-hand text-[24px] ${onDark ? 'text-[var(--pt-sun)]' : 'text-[var(--pt-ochre)]'} -rotate-1`}>{kicker}</p>
      <div className={`flex items-baseline gap-4 mt-1 ${center ? 'justify-center' : ''}`}>
        <h2 className={`pt-display text-[34px] md:text-[44px] leading-none shrink-0 ${titleColor}`}>
          {title}
        </h2>
        {note && (
          <span className="hidden md:block font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--pt-brown)] whitespace-nowrap ml-auto">
            {note}
          </span>
        )}
      </div>
      <div aria-hidden className={`mt-3 h-[3px] opacity-90 ${onDark ? 'bg-[var(--pt-sun)]' : 'bg-[var(--pt-ink)]'} ${center ? 'mx-auto max-w-[280px]' : ''}`} style={{ clipPath: 'polygon(0 20%, 100% 0, 100% 80%, 0 100%)' }} />
    </div>
  )
}
