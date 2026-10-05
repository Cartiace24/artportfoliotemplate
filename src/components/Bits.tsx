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

export function Tape({ className = '', rose = false, sage = false }: { className?: string; rose?: boolean; sage?: boolean }) {
  const bg = rose ? 'tape-rose' : sage ? 'tape-sage' : 'tape-lav'
  return <span aria-hidden className={`tape ${bg} ${className}`} style={{ transform: 'rotate(-4deg)' }} />
}

export function SectionHeading({
  title,
  note,
}: {
  kicker?: string
  title: ReactNode
  note?: string
}) {
  return (
    <div className="flex items-end gap-4 mb-6">
      <h2 className="font-serif-ed text-[28px] md:text-[34px] leading-none text-[#40203f] flex items-center gap-2 shrink-0">
        <span aria-hidden className="text-[#5b2b4e] text-[20px]">✦</span>
        <span className="italic font-medium">{title}</span>
      </h2>
      <span className="hidden sm:block h-px flex-1 bg-[#e6dcc8] mb-2" aria-hidden />
      {note && (
        <span className="hidden md:block text-[11px] tracking-[0.18em] uppercase text-[#8d857a] mb-1.5 whitespace-nowrap">
          {note}
        </span>
      )}
    </div>
  )
}

export function Doodles({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round">
      <path d="M8 44 C 14 30, 20 30, 22 40 M22 40 l-4 -6 M22 40 l4 -6" />
      <path d="M40 18 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
      <path d="M78 12 c 3 -3 8 0 5 4 c -2 3 -5 1 -5 -1 c 0 3 -3 4 -5 1 c -3 -4 2 -7 5 -4" />
      <path d="M100 40 q 6 -8 12 0 q -6 8 -12 0" />
      <circle cx="104" cy="14" r="2.2" />
    </svg>
  )
}

export function Star({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 1.5 14.6 9.4 22.5 12 14.6 14.6 12 22.5 9.4 14.6 1.5 12 9.4 9.4Z" />
    </svg>
  )
}
