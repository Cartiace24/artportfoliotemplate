import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Sparkles, X } from 'lucide-react'
import type { SiteSettings } from '../lib/types'

function statusPill(status: SiteSettings['commission_status']) {
  return status === 'open' ? 'Commissions Open' : 'Commissions Closed'
}

export function Header({ settings }: { settings: SiteSettings }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const isOpen = settings.commission_status === 'open'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [loc.pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open ])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open ])

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `relative px-1 py-1 text-[14.5px] font-medium tracking-wide transition-colors ${
      isActive ? 'text-[#40203f]' : 'text-[#6d5f6b] hover:text-[#40203f]'
    }`

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#FAF6EF]/92 backdrop-blur-md shadow-[0_1px_0_#e6dcc8,0_10px_30px_-18px_rgba(64,32,63,0.35)]'
            : 'bg-transparent'
        }`}
      >
        <div
          className={`mx-auto max-w-[1280px] px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-[60px]' : 'h-[76px]'
          }`}
        >
          <Link to="/" className="flex items-center gap-2 group" aria-label="Lorem Ipsum home">
            <span className="font-hand text-[30px] leading-none font-bold tracking-tight text-[#40203f] -rotate-2 group-hover:rotate-0 transition-transform">
              LOREM IPSUM
            </span>
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#5b2b4e]" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
              <path d="M12 21 c-5 -4 -8 -7 -8 -11 a4.5 4.5 0 0 1 8 -3 a4.5 4.5 0 0 1 8 3 c0 4 -3 7 -8 11" />
              <circle cx="9" cy="10" r="0.9" fill="currentColor" />
              <circle cx="15" cy="10" r="0.9" fill="currentColor" />
            </svg>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            <NavLink to="/" className={linkCls} end>
              {({ isActive }) => (
                <span>
                  Portfolio
                  <span className={`block h-[1.5px] bg-[#5b2b4e] transition-all ${isActive ? 'w-full' : 'w-0'}`} />
                </span>
              )}
            </NavLink>
            <NavLink to="/commissions" className={linkCls}>
              {({ isActive }) => (
                <span>
                  Commissions
                  <span className={`block h-[1.5px] bg-[#5b2b4e] transition-all ${isActive ? 'w-full' : 'w-0'}`} />
                </span>
              )}
            </NavLink>
            <NavLink to="/tos" className={linkCls}>
              {({ isActive }) => (
                <span>
                  T.O.S.
                  <span className={`block h-[1.5px] bg-[#5b2b4e] transition-all ${isActive ? 'w-full' : 'w-0'}`} />
                </span>
              )}
            </NavLink>
            <NavLink to="/about" className={linkCls}>
              {({ isActive }) => (
                <span>
                  About
                  <span className={`block h-[1.5px] bg-[#5b2b4e] transition-all ${isActive ? 'w-full' : 'w-0'}`} />
                </span>
              )}
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/commissions"
              className={`hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold text-[#FAF6EF] transition-transform hover:-translate-y-0.5 ${
                isOpen ? 'bg-[#5b2b4e]' : 'bg-[#6d5f6b]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
              {statusPill(settings.commission_status)}
              <span aria-hidden>✦</span>
            </Link>
            <button
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-[#e6dcc8] bg-[#fffdf7]"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-[#40203f]/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
            <motion.nav
              id="mobile-nav"
              initial={{ y: -16, opacity: 0, scale: 0.98, rotate: -0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
              exit={{ y: -12, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-[72px] left-4 right-4 rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-6 origin-top"
              aria-label="Mobile"
            >
              <div className="absolute -top-3 left-10 tape tape-lav" style={{ width: 72 }} aria-hidden />
              <p className="font-hand text-[22px] text-[#8a6f5c] -rotate-1 mb-3">lorem ipsum? ♡</p>
              <div className="grid gap-1 text-[18px] font-serif-ed">
                {[
                  ['/', 'Portfolio'],
                  ['/commissions', 'Commissions'],
                  ['/tos', 'T.O.S.'],
                  ['/about', 'About'],
                ].map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    className={`rounded-xl px-4 py-3 hover:bg-[#f3ecdd] ${loc.pathname === to ? 'bg-[#f3ecdd] text-[#40203f]' : 'text-[#5b2b4e]'}`}
                  >
                    <span className="italic">{label}</span>
                  </Link>
                ))}
              </div>
              <Link
                to="/commissions"
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#5b2b4e] text-[#FAF6EF] px-5 py-3.5 font-semibold"
              >
                <Sparkles className="w-4 h-4" aria-hidden />
                {statusPill(settings.commission_status)}
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
