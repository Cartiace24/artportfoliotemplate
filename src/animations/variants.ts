import type { Variants } from 'motion/react'

export const easeSoft = [0.22, 1, 0.36, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeSoft as unknown as [number, number, number, number], delay: i * 0.08 },
  }),
}

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeSoft as unknown as [number, number, number, number] } },
}

export const maskReveal: Variants = {
  hidden: { clipPath: 'inset(8% 6% 8% 6% round 18px)', opacity: 0, scale: 0.985 },
  show: {
    clipPath: 'inset(0% 0% 0% 0% round 18px)',
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: easeSoft as unknown as [number, number, number, number] },
  },
}

export const doodlePop: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -8 },
  show: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.5, delay: 0.55 + i * 0.1, ease: easeSoft as unknown as [number, number, number, number] },
  }),
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
