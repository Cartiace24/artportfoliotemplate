import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import type { SiteSettings } from '../lib/types'

const LINKS = [
  { to: '/#work', label: 'Work', match: '/' },
  { to: '/commissions', label: 'Commissions', match: '/commissions' },
  { to: '/about', label: 'About', match: '/about' },
] as const

export function Header({ settings, siteName }: { settings: SiteSettings; siteName: string }) {
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
          scrolled ? 'bg-paper/95 backdrop-blur-sm border-b border-line' : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div
          className={`mx-auto max-w-[1280px] px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-[58px]' : 'h-[72px]'
          }`}
        >
          <Link to="/" className="font-display italic text-[24px] leading-none text-ink" aria-label={`${siteName} home`}>
            {siteName}
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            {LINKS.map((l) =>
              l.to.startsWith('/#') ? (
                <a
                  key={l.to}
                  href={l.to}
                  className={`relative text-[14px] font-medium tracking-wide transition-colors pb-0.5 ${
                    loc.pathname === '/' ? 'text-ink' : 'text-ink-soft hover:text-ink'
                  } after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:bg-accent after:transition-all ${
                    loc.pathname === '/' && l.match === '/' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
                  }`}
                >
                  {l.label}
                </a>
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `relative text-[14px] font-medium tracking-wide transition-colors pb-0.5 ${
                      isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'
                    } after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:bg-accent after:transition-all ${
                      isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              )
            )}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/commissions"
              className="hidden sm:inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.08em] uppercase text-ink hover:text-accent transition-colors min-h-[44px]"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-moss' : 'bg-accent'}`} aria-hidden />
              {isOpen ? 'Open for work' : 'Books closed'}
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
            <button
              className="md:hidden inline-flex items-center justify-center w-11 h-11 text-ink"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
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
            className="fixed inset-0 z-40 md:hidden bg-paper"
          >
            <motion.nav
              id="mobile-nav"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="h-full flex flex-col justify-center px-8 pt-16"
              aria-label="Mobile"
            >
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted mb-6">Menu</p>
              <div className="grid gap-2">
                {[
                  ['/', 'Work'],
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
                      className={`flex items-baseline gap-4 py-3 border-b border-line font-display text-[40px] leading-none ${
                        loc.pathname === to ? 'text-accent' : 'text-ink'
                      }`}
                    >
                      <span className="font-mono text-[12px] text-muted">0{i + 1}</span>
                      {label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <Link
                to="/commissions"
                className="mt-8 inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.08em] uppercase text-ink"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-moss' : 'bg-accent'}`} aria-hidden />
                {isOpen ? 'Open for work' : 'Books closed'}
                <ArrowUpRight className="w-4 h-4" aria-hidden />
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
