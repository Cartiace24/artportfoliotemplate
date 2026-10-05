import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import type { Artwork, SiteConfig, SiteSettings } from '../lib/types'
import { publicArtUrl } from '../lib/supabase'
import { SmartImage } from './SmartImage'
import { doodlePop, easeSoft } from '../animations/variants'

function useParallax(ref: React.RefObject<HTMLDivElement | null>) {
  const reduce = useReducedMotion()
  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    ref.current.style.setProperty('--px', `${x * 10}px`)
    ref.current.style.setProperty('--py', `${y * 10}px`)
  }
  const onLeave = () => {
    if (!ref.current) return
    ref.current.style.setProperty('--px', '0px')
    ref.current.style.setProperty('--py', '0px')
  }
  return { onMove, onLeave }
}

export function CommissionBadge({ settings }: { settings: SiteSettings }) {
  const open = settings.commission_status === 'open'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45, ease: easeSoft as unknown as [number, number, number, number] }}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13.5px] font-semibold border ${
        open ? 'bg-[#dde5d2]/70 border-[#9aa88f]/40 text-[#3d5233]' : 'bg-[#f2d8d3]/60 border-[#c98a8a]/40 text-[#6e2f2f]'
      }`}
      role="status"
    >
      <span className="relative flex w-2 h-2">
        <span className={`absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping ${open ? 'bg-green-600' : 'bg-red-500'}`} />
        <span className={`relative inline-flex w-2 h-2 rounded-full ${open ? 'bg-green-700' : 'bg-red-600'}`} />
      </span>
      Commission status: <span className="uppercase tracking-wide">{open ? 'OPEN' : 'CLOSED'}</span>
    </motion.div>
  )
}

export function Hero({ settings, heroArt, config }: { settings: SiteSettings; heroArt: Artwork | null; config: SiteConfig }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const { onMove, onLeave } = useParallax(wrapRef)
  const img = heroArt ? publicArtUrl(heroArt.image_path) : null

  return (
    <section className="relative overflow-hidden pt-[76px]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 grid lg:grid-cols-[minmax(0,460px)_1fr] gap-8 items-center py-8 md:py-12">
        {/* Left copy */}
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-hand text-[20px] md:text-[22px] text-[#8a6f5c] -rotate-2 mb-1"
          >
            lorem • ipsum • dolor sit amet...
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: easeSoft as unknown as [number, number, number, number] }}
            className="font-serif-ed font-semibold text-[56px] sm:text-[72px] lg:text-[84px] leading-[0.95] tracking-tight text-[#40203f]"
          >
            {config.hero_title || 'It’s Lorem!'}
            <span aria-hidden className="inline-block align-top text-[28px] ml-1 text-[#5b2b4e]">✦</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-4 text-[15.5px] md:text-[16.5px] text-[#5c4f5e] font-medium"
          >
            {config.tagline || 'Lorem ipsum dolor sit amet'}
          </motion.p>

          <div className="mt-4">
            <CommissionBadge settings={settings} />
            {settings.commission_message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="mt-2 font-hand text-[19px] text-[#6d5f6b]"
              >
                “{settings.commission_message}”
              </motion.p>
            )}
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.55 } } }}
            className="mt-6 flex flex-wrap gap-3"
          >
            <motion.span variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
              <Link
                to="/commissions"
                className="inline-flex items-center gap-2 rounded-full bg-[#5b2b4e] text-[#FAF6EF] px-6 py-3 text-[15px] font-semibold hover:bg-[#422040] hover:-translate-y-0.5 transition-all shadow-[0_12px_24px_-12px_rgba(91,43,78,0.7)] min-h-[48px]"
              >
                View commissions <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </motion.span>
            <motion.span variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
              <a
                href="#work"
                className="inline-flex items-center gap-2 rounded-full border border-[#5b2b4e]/40 px-6 py-3 text-[15px] font-semibold text-[#5b2b4e] hover:bg-[#5b2b4e]/5 hover:-translate-y-0.5 transition-all min-h-[48px]"
              >
                See portfolio
              </a>
            </motion.span>
          </motion.div>

          <motion.svg
            variants={doodlePop}
            initial="hidden"
            animate="show"
            custom={2}
            viewBox="0 0 60 40"
            className="hidden md:block w-14 h-10 text-[#8a6f5c] mt-6 -rotate-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path d="M4 6 C 18 30, 30 32, 52 8 M52 8 l-8 1 M52 8 l-1 8" strokeLinecap="round" />
          </motion.svg>
        </div>

        {/* Right artwork */}
        <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave} className="relative">
          <motion.div
            initial={{ clipPath: 'inset(6% 5% 6% 5% round 22px)', opacity: 0, scale: 0.985 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0% round 22px)', opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: easeSoft as unknown as [number, number, number, number] }}
            className="relative rounded-[22px] overflow-hidden print-shadow border border-[#e6dcc8] bg-[#efe7d6] lg:-mr-10 lg:ml-[-20px]"
            style={{ transform: 'translate(var(--px,0px), var(--py,0px))', transition: 'transform 0.25s ease-out' }}
          >
            {img ? (
              <SmartImage
                path={heroArt?.image_path ?? null}
                alt={heroArt?.title ?? 'Featured artwork by Lorem Ipsum'}
                className="w-full h-[320px] sm:h-[420px] lg:h-[520px] object-cover"
                width={1400}
                sizes="(max-width: 1024px) 100vw, 65vw"
                eager
              />
            ) : (
              <div className="w-full h-[320px] sm:h-[420px] lg:h-[520px] grid place-items-center bg-gradient-to-br from-[#e7ddf0] via-[#f2d8d3] to-[#dde5d2]" role="img" aria-label="Featured artwork coming soon">
                <span className="font-hand text-[44px] text-[#5b2b4e] -rotate-3">lorem ipsum ♡</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAF6EF]/55 via-transparent to-transparent pointer-events-none" aria-hidden />
          </motion.div>

          {/* tape + doodles */}
          <motion.div variants={doodlePop} initial="hidden" animate="show" custom={0} className="absolute -top-3 right-10 tape tape-rose rotate-6 !w-[110px]" aria-hidden />
          <motion.p
            variants={doodlePop}
            initial="hidden"
            animate="show"
            custom={1}
            className="absolute top-6 -right-1 sm:right-4 font-hand text-[20px] leading-tight text-[#40203f]/80 rotate-6 text-right drop-shadow-[0_1px_0_#FAF6EF]"
          >
            lorem<br />ipsum<br />♡
          </motion.p>
          <motion.div variants={doodlePop} initial="hidden" animate="show" custom={2} className="absolute bottom-8 -left-2 font-hand text-[#8a6f5c] text-[19px] -rotate-6" aria-hidden>
            ♡
          </motion.div>
        </div>
      </div>
    </section>
  )
}
