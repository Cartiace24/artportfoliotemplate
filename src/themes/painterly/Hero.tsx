import { motion } from 'motion/react'
import type { Artwork, SiteConfig, SiteSettings } from '../../lib/types'
import { publicArtUrl } from '../../lib/supabase'
import { SmartImage } from '../../components/SmartImage'
import { PNote, PTape, PaintDabs, SquiggleArrow } from './bits'
import { easeSoft } from '../../animations/variants'

export function PHero({ settings, heroArt, config }: { settings: SiteSettings; heroArt: Artwork | null; config: SiteConfig }) {
  const img = heroArt ? publicArtUrl(heroArt.image_path) : null
  const open = settings.commission_status === 'open'
  const year = new Date().getFullYear()

  return (
    <section className="pt-[72px]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {/* name plate */}
        <div className="text-center pt-8 md:pt-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-[11px] tracking-[0.24em] uppercase text-[var(--pt-brown)]"
          >
            A personal sketchbook — {year}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: easeSoft as unknown as [number, number, number, number] }}
            className="pt-display text-[clamp(3rem,10vw,6.5rem)] leading-[0.95] text-[var(--pt-ink)] mt-2"
          >
            {config.site_name || 'Lorem Ipsum'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            className="pt-hand text-[26px] text-[var(--pt-ochre)] mt-2 -rotate-1"
          >
            {config.tagline || 'Lorem ipsum dolor sit amet'}
          </motion.p>
        </div>

        {/* feature plate */}
        <motion.figure
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.3, ease: easeSoft as unknown as [number, number, number, number] }}
          className="relative mt-8 md:mt-10"
        >
          <div className="relative border-2 border-[var(--pt-ink)] bg-[var(--pt-cream)] p-2 sm:p-3 rotate-[0.6deg]">
            <PTape className="-top-4 left-8 -rotate-6" />
            <PTape className="-top-3 right-12 rotate-[7deg]" />
            <div className="pt-canvas overflow-hidden border border-[var(--pt-ink)]/40">
              {img ? (
                <SmartImage
                  path={heroArt?.image_path ?? null}
                  alt={heroArt?.title ?? 'Featured artwork'}
                  className="w-full h-[320px] sm:h-[440px] lg:h-[540px] object-cover"
                  width={1600}
                  sizes="100vw"
                  eager
                />
              ) : (
                <div className="w-full h-[320px] sm:h-[440px] lg:h-[540px] grid place-items-center" role="img" aria-label="Featured artwork coming soon">
                  <span className="pt-hand text-[36px] text-[var(--pt-brown)]">walls still drying…</span>
                </div>
              )}
            </div>
            {/* overlapping title strip */}
            <div className="sm:absolute sm:-bottom-7 sm:left-8 bg-[var(--pt-paper)] border-2 border-[var(--pt-ink)] px-5 py-2.5 mt-3 sm:mt-0 -rotate-1 inline-block max-w-full">
              <p className="pt-hand text-[26px] sm:text-[30px] leading-none text-[var(--pt-ink)] truncate">
                {heroArt?.title ?? 'Untitled'}
              </p>
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--pt-brown)] mt-1">
                {heroArt?.category ?? ''}{heroArt?.year ? ` — ${heroArt.year}` : ''}
              </p>
            </div>
            <PaintDabs className="absolute -bottom-3 right-6 bg-[var(--pt-paper)] px-2" />
          </div>
          <SquiggleArrow className="hidden md:block absolute -left-2 -bottom-10 w-20 h-10 text-[var(--pt-ochre)] -rotate-12" />
          <PNote className="hidden md:block absolute -left-1 -bottom-16 text-[21px] rotate-[-4deg]">
            my favourite right now!
          </PNote>
        </motion.figure>

        {/* intro strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: easeSoft as unknown as [number, number, number, number] }}
          className="grid md:grid-cols-12 gap-6 items-end mt-14 md:mt-20 pb-2"
        >
          <p className="md:col-span-7 text-[16px] leading-[1.75] text-[var(--pt-ink-soft)] max-w-[58ch]">
            {settings.commission_message || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
          </p>
          <div className="md:col-span-5 flex flex-wrap items-center gap-x-5 gap-y-3 md:justify-end">
            <p className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.14em] uppercase" role="status">
              <span className={`w-2 h-2 rounded-full ${open ? 'bg-[var(--pt-olive)]' : 'bg-[var(--pt-ochre)]'}`} aria-hidden />
              <span className={open ? 'text-[var(--pt-ink)]' : 'text-[var(--pt-ochre)]'}>
                {open ? 'Commissions open' : 'Commissions closed'}
              </span>
            </p>
            <a
              href="#work"
              className="inline-flex items-center justify-center bg-[var(--pt-ink)] text-[var(--pt-cream)] px-7 py-3.5 text-[14px] font-semibold tracking-wide hover:bg-[var(--pt-ochre)] transition-colors min-h-[48px]"
            >
              View My Work
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
