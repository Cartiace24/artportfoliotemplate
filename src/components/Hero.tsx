import { motion } from 'motion/react'
import type { Artwork, SiteConfig, SiteSettings } from '../lib/types'
import { publicArtUrl } from '../lib/supabase'
import { SmartImage } from './SmartImage'
import { easeSoft } from '../animations/variants'

export function CommissionBadge({ settings }: { settings: SiteSettings }) {
  const open = settings.commission_status === 'open'
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: easeSoft as unknown as [number, number, number, number] }}
      className="inline-flex items-center gap-2 border border-line bg-cream px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] uppercase"
      role="status"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-moss' : 'bg-accent'}`} aria-hidden />
      <span className={open ? 'text-ink' : 'text-accent-deep'}>
        {open ? 'Commissions open' : 'Commissions closed'}
      </span>
    </motion.p>
  )
}

export function Hero({ settings, heroArt, config }: { settings: SiteSettings; heroArt: Artwork | null; config: SiteConfig }) {
  const img = heroArt ? publicArtUrl(heroArt.image_path) : null
  const year = new Date().getFullYear()

  return (
    <section className="pt-[72px]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {/* top index row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between border-b border-line py-3"
        >
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted">
            Portfolio — {year}
          </p>
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted hidden sm:block">
            Fig. 01 — Featured
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 py-10 md:py-14 items-end">
          {/* copy */}
          <div className="lg:col-span-5">
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
              className="font-display text-[clamp(3.2rem,8vw,5.8rem)] leading-[0.98] tracking-[-0.01em] text-ink"
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
              {settings.available_slots != null && settings.commission_status === 'open' && (
                <span className="ml-3 font-mono text-[12px] text-muted">{settings.available_slots} slots left</span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.48, ease: easeSoft as unknown as [number, number, number, number] }}
              className="mt-8 flex flex-wrap items-center gap-6"
            >
              <a
                href="#work"
                className="inline-flex items-center justify-center bg-ink text-cream px-7 py-3.5 text-[14px] font-semibold tracking-wide hover:bg-accent-deep transition-colors min-h-[48px]"
              >
                View work
              </a>
              <a
                href="/commissions"
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink underline underline-offset-[6px] decoration-accent decoration-2 hover:text-accent-deep transition-colors min-h-[48px]"
              >
                Commission info →
              </a>
            </motion.div>
          </div>

          {/* artwork — framed, captioned like an exhibition plate */}
          <div className="lg:col-span-7">
            <motion.figure
              initial={{ clipPath: 'inset(4% 3% 4% 3%)', opacity: 0 }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: easeSoft as unknown as [number, number, number, number] }}
            >
              <div className="frame bg-parchment overflow-hidden">
                {img ? (
                  <SmartImage
                    path={heroArt?.image_path ?? null}
                    alt={heroArt?.title ?? 'Featured artwork'}
                    className="w-full h-[300px] sm:h-[420px] lg:h-[500px] object-cover"
                    width={1400}
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    eager
                  />
                ) : (
                  <div className="w-full h-[300px] sm:h-[420px] lg:h-[500px] grid place-items-center" role="img" aria-label="Featured artwork coming soon">
                    <span className="font-display italic text-[32px] text-muted">No work yet</span>
                  </div>
                )}
              </div>
              <figcaption className="flex items-baseline justify-between gap-4 pt-3 border-b border-line pb-3">
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-ink truncate">
                  Fig. 01 — {heroArt?.title ?? 'Untitled'}{heroArt?.year ? `, ${heroArt.year}` : ''}
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
