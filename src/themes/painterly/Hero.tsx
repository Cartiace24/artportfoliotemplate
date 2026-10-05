import { motion } from 'motion/react'
import type { Artwork, SiteConfig, SiteSettings } from '../../lib/types'
import { publicArtUrl } from '../../lib/supabase'
import { SmartImage } from '../../components/SmartImage'
import { PNote, PTape, PaintDabs, Sparkle, SquiggleArrow, SunflowerDoodle } from './bits'
import { easeSoft } from '../../animations/variants'

const EASE = easeSoft as unknown as [number, number, number, number]

export function PHero({ settings, heroArt, config }: { settings: SiteSettings; heroArt: Artwork | null; config: SiteConfig }) {
  const img = heroArt ? publicArtUrl(heroArt.image_path) : null
  const open = settings.commission_status === 'open'

  return (
    <section className="pt-night overflow-hidden">
      <div className="relative z-[1] mx-auto max-w-[1280px] px-4 sm:px-6 pt-[104px] md:pt-[120px] pb-14 md:pb-20">
        {/* moon glow accent */}
        <Sparkle className="absolute top-24 right-[12%] w-6 h-6 text-[var(--pt-sun)] opacity-80 hidden sm:block" />
        <Sparkle className="absolute top-40 right-[22%] w-4 h-4 text-[var(--pt-cream)] opacity-60 hidden sm:block" />

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          {/* intro */}
          <div className="lg:col-span-3 relative">
            <SunflowerDoodle aria-hidden className="absolute -left-6 -top-16 w-24 h-32 text-[var(--pt-sun)] opacity-90 hidden lg:block" />
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              className="pt-hand text-[clamp(2.6rem,5vw,3.8rem)] leading-[1] text-[var(--pt-cream)] -rotate-2"
            >
              Hi, I&rsquo;m {config.site_name || 'Lorem Ipsum'}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24, ease: EASE }}
              className="mt-4 text-[15.5px] leading-[1.7] text-[var(--pt-cream)]/85 max-w-[34ch] italic"
            >
              {config.tagline || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-2 flex items-center gap-3"
              aria-hidden
            >
              <SquiggleArrow className="w-16 h-8 text-[var(--pt-cream)]/70 rotate-12" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.46, ease: EASE }}
              className="mt-4 flex flex-wrap items-center gap-4"
            >
              <a
                href="#work"
                className="pt-brushbtn inline-flex items-center justify-center px-8 py-3.5 pt-hand font-bold text-[24px] min-h-[48px] -rotate-1 hover:rotate-0"
              >
                View My Work
              </a>
              <a
                href="/commissions#request"
                className="inline-flex items-center min-h-[48px] pt-hand text-[23px] text-[var(--pt-cream)] underline decoration-[var(--pt-sun)] decoration-2 underline-offset-8 hover:text-[var(--pt-sun)] transition-colors"
              >
                Request a piece →
              </a>
            </motion.div>
          </div>

          {/* feature artwork */}
          <motion.figure
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.3, ease: EASE }}
            className="lg:col-span-6 relative"
          >
            <div className="relative bg-[var(--pt-cream)] p-2.5 sm:p-3 rotate-[0.8deg] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)]">
              <PTape className="-top-4 left-10 -rotate-6" />
              <PTape className="-top-3 right-10 rotate-[6deg]" />
              <div className="overflow-hidden">
                {img ? (
                  <SmartImage
                    path={heroArt?.image_path ?? null}
                    alt={heroArt?.title ?? 'Featured artwork'}
                    className="w-full h-[300px] sm:h-[420px] lg:h-[480px] object-cover"
                    width={1400}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    eager
                  />
                ) : (
                  <div className="w-full h-[300px] sm:h-[420px] lg:h-[480px] grid place-items-center pt-canvas" role="img" aria-label="Featured artwork coming soon">
                    <span className="pt-hand text-[32px] text-[var(--pt-brown)]">walls still drying…</span>
                  </div>
                )}
              </div>
            </div>
            <figcaption className="mt-3 flex items-baseline justify-between gap-3 px-1">
              <p className="pt-hand text-[24px] text-[var(--pt-cream)] truncate">
                {heroArt?.title ?? 'Untitled'}{heroArt?.year ? ` — ${heroArt.year}` : ''}
              </p>
              <PaintDabs />
            </figcaption>
          </motion.figure>

          {/* margin note */}
          <motion.aside
            initial={{ opacity: 0, y: 24, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 2 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            className="lg:col-span-3"
            aria-label="Studio note"
          >
            <div className="pt-sheet px-6 py-6 max-w-[320px] mx-auto lg:mx-0">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--pt-brown)]">Pinned note</p>
              <p className="pt-hand text-[24px] leading-[1.25] text-[var(--pt-ink)] mt-2">
                {settings.commission_message || 'Same sky, different day, same chaos.'}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--pt-ink)]" role="status">
                  <span className={`w-2 h-2 rounded-full ${open ? 'bg-[var(--pt-olive)]' : 'bg-[var(--pt-ochre)]'}`} aria-hidden />
                  {open ? 'Open' : 'Closed'}
                </span>
                <span className="flex gap-1.5" aria-hidden>
                  <span className="inline-block w-5 h-4 bg-[var(--pt-teal)] rotate-[-6deg]" />
                  <span className="inline-block w-5 h-4 bg-[var(--pt-sun)] rotate-[4deg]" />
                  <span className="inline-block w-5 h-4 bg-[var(--pt-ochre)] rotate-[-3deg]" />
                </span>
              </div>
              {open && settings.available_slots != null && (
                <PNote className="text-[19px] mt-2">— {settings.available_slots} slots left!</PNote>
              )}
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}
