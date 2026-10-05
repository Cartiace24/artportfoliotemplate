import { motion } from 'motion/react'
import type { Artwork, SiteConfig, SiteSettings } from '../../lib/types'
import { publicArtUrl } from '../../lib/supabase'
import { SmartImage } from '../../components/SmartImage'
import { Stamp, Tape } from './Bits'
import { easeSoft } from '../../animations/variants'

export function CommissionBadge({ settings }: { settings: SiteSettings }) {
  const open = settings.commission_status === 'open'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.42, ease: easeSoft as unknown as [number, number, number, number] }}
      className="flex items-center gap-4"
      role="status"
    >
      <Stamp tone={open ? 'moss' : 'accent'}>{open ? 'Open' : 'Closed'}</Stamp>
      {open && settings.available_slots != null && (
        <span className="font-note text-[19px] text-muted">{settings.available_slots} slots left!</span>
      )}
    </motion.div>
  )
}

export function Hero({ settings, heroArt, config }: { settings: SiteSettings; heroArt: Artwork | null; config: SiteConfig }) {
  const img = heroArt ? publicArtUrl(heroArt.image_path) : null
  const year = new Date().getFullYear()

  return (
    <section className="relative overflow-hidden pt-[72px]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between border-b border-line py-3"
        >
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted">
            Sketchbook — {year}
          </p>
          <p className="font-note text-[18px] text-muted hidden sm:block -rotate-2">
            everything here is drawn with love
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 py-10 md:py-14 items-center">
          {/* artist intro */}
          <div className="lg:col-span-5 relative">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: easeSoft as unknown as [number, number, number, number] }}
              className="font-mono text-[11px] tracking-[0.22em] uppercase text-accent mb-4"
            >
              {config.tagline || 'Lorem ipsum dolor sit amet'}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.16, ease: easeSoft as unknown as [number, number, number, number] }}
              className="font-display text-[clamp(3.4rem,9vw,6.2rem)] leading-[0.95] tracking-[-0.01em] text-ink"
            >
              {config.site_name || 'Lorem Ipsum'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3, ease: easeSoft as unknown as [number, number, number, number] }}
              className="mt-5 text-[16px] leading-[1.7] text-ink-soft max-w-[42ch]"
            >
              {settings.commission_message || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4, ease: easeSoft as unknown as [number, number, number, number] }}
              className="mt-6"
            >
              <CommissionBadge settings={settings} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.48, ease: easeSoft as unknown as [number, number, number, number] }}
              className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3"
            >
              <a
                href="#work"
                className="inline-flex items-center justify-center bg-ink text-cream px-7 py-3.5 text-[14px] font-semibold tracking-wide hover:bg-accent-deep transition-colors min-h-[48px]"
              >
                View the wall
              </a>
              <a
                href="/commissions"
                className="link-wavy inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink hover:text-accent-deep transition-colors min-h-[48px] decoration-accent"
              >
                Commission sheet →
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="hidden lg:block absolute -bottom-2 left-1 font-note text-[20px] text-muted rotate-[-4deg]"
              aria-hidden
            >
              start here ↓
            </motion.p>
          </div>

          {/* large artwork, taped into the page */}
          <div className="lg:col-span-7 relative sm:-rotate-1">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="absolute -top-7 right-2 font-note text-[20px] text-muted rotate-3 z-10"
              aria-hidden
            >
              hi, i draw things ↙
            </motion.p>
            <motion.figure
              initial={{ clipPath: 'inset(4% 3% 4% 3%)', opacity: 0 }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: easeSoft as unknown as [number, number, number, number] }}
              className="relative"
            >
              {/* backing sheet peeking out behind */}
              <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rotate-[1.5deg] bg-parchment border border-line" />
              <div className="mat relative hard-shadow">
                <Tape tone="accent" className="-top-3 left-10 -rotate-6" />
                {img ? (
                  <SmartImage
                    path={heroArt?.image_path ?? null}
                    alt={heroArt?.title ?? 'Featured artwork'}
                    className="w-full h-[340px] sm:h-[460px] lg:h-[560px] object-cover"
                    width={1400}
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    eager
                  />
                ) : (
                  <div className="w-full h-[340px] sm:h-[460px] lg:h-[560px] grid place-items-center bg-parchment" role="img" aria-label="Featured artwork coming soon">
                    <span className="font-display italic text-[32px] text-muted">No work yet</span>
                  </div>
                )}
              </div>
              <figcaption className="relative flex items-baseline justify-between gap-4 pt-3 mt-3">
                <p className="font-note text-[22px] leading-tight text-ink truncate">
                  {heroArt?.title ?? 'Untitled'} {heroArt?.year ? `’${heroArt.year.slice(2)}` : ''}
                </p>
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted shrink-0">
                  {heroArt?.category ?? ''}
                </p>
              </figcaption>
            </motion.figure>
          </div>
        </div>
      </div>
    </section>
  )
}
