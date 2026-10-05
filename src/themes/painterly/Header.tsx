import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import type { SiteSettings } from '../../lib/types'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/#work', label: 'Gallery', anchor: true },
  { to: '/commissions', label: 'Commissions' },
  { to: '/about', label: 'About' },
  { to: '/commissions#request', label: 'Contact', anchor: true },
] as const

export function PHeader({ settings, siteName }: { settings: SiteSettings; siteName: string }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const isOpen = settings.commission_status === 'open'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [loc.pathname, loc.hash])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[var(--pt-paper)]/95 backdrop-blur-sm border-b-2 border-[var(--pt-ink)]' : 'bg-transparent'
        }`}
      >
        <div
          className={`mx-auto max-w-[1280px] px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-[58px]' : 'h-[72px]'
          }`}
        >
          <Link to="/" className="pt-hand font-bold text-[32px] leading-none text-[var(--pt-ink)] -rotate-2" aria-label={`${siteName} home`}>
            {siteName}
          </Link>

          <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
            {LINKS.map((l) =>
              'anchor' in l ? (
                <a
                  key={l.label}
                  href={l.to}
                  className="pt-hand text-[22px] text-[var(--pt-ink)] hover:text-[var(--pt-ochre)] transition-colors pb-0.5 min-h-[44px] inline-flex items-center"
                >
                  {l.label}
                </a>
              ) : (
                <NavLink
                  key={l.label}
                  to={l.to}
                  end={'end' in l && !!l.end}
                  className={({ isActive }) =>
                    `pt-hand text-[22px] transition-colors pb-0.5 min-h-[44px] inline-flex items-center ${
                      isActive ? 'text-[var(--pt-ochre)]' : 'text-[var(--pt-ink)] hover:text-[var(--pt-ochre)]'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/commissions"
              className="hidden sm:inline-flex items-center gap-2 border-2 border-[var(--pt-ink)] bg-[var(--pt-sun)] text-[var(--pt-ink)] px-4 py-2 font-mono text-[11px] tracking-[0.12em] uppercase font-medium hover:bg-[var(--pt-ochre)] hover:text-white transition-colors min-h-[44px]"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-[var(--pt-olive)]' : 'bg-[var(--pt-ink)]'}`} aria-hidden />
              {isOpen ? 'Open' : 'Closed'}
            </Link>
            <button
              className="md:hidden inline-flex items-center justify-center w-11 h-11 text-[var(--pt-ink)]"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="painterly-mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 md:hidden bg-[var(--pt-paper)]"
          >
            <motion.nav
              id="painterly-mobile-nav"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="h-full flex flex-col justify-center px-8 pt-16"
              aria-label="Mobile"
            >
              <p className="pt-hand text-[26px] text-[var(--pt-ochre)] mb-4 -rotate-1">where to, friend?</p>
              <div className="grid gap-1">
                {[
                  ['/', 'Home'],
                  ['/commissions', 'Commissions'],
                  ['/about', 'About'],
                  ['/tos', 'Terms'],
                ].map(([to, label], i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.35 }}
                  >
                    <Link
                      to={to}
                      className={`flex items-baseline gap-4 py-3 border-b-2 border-[var(--pt-ink)]/20 pt-display text-[38px] leading-none ${
                        loc.pathname === to ? 'text-[var(--pt-ochre)]' : 'text-[var(--pt-ink)]'
                      }`}
                    >
                      <span className="font-mono text-[12px] text-[var(--pt-brown)]">0{i + 1}</span>
                      {label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <Link
                to="/commissions"
                className="mt-8 inline-flex items-center gap-2 border-2 border-[var(--pt-ink)] bg-[var(--pt-sun)] text-[var(--pt-ink)] px-5 py-3 font-mono text-[12px] tracking-[0.12em] uppercase w-fit"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-[var(--pt-olive)]' : 'bg-[var(--pt-ink)]'}`} aria-hidden />
                {isOpen ? 'Commissions open' : 'Commissions closed'}
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
