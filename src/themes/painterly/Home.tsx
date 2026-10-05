import { useState } from 'react'
import { PHero } from './Hero'
import { PGallery } from './Gallery'
import { ArtworkViewer } from '../../components/ArtworkViewer'
import { PCommissionPreview, PCommissionProcess } from './Commissions'
import { PAboutPreview, PSocialLinks, SocialGlyph } from './About'
import { PNote, PReveal, PSectionHead, PaintSwatches, TornNote } from './bits'
import { PageMeta } from '../../lib/meta'
import { publicArtUrl } from '../../lib/supabase'
import { useAbout, useArtworks, usePricing, useSiteConfig, useSiteSettings, useSocials } from '../../hooks/useSiteContent'
import type { Artwork } from '../../lib/types'

export function PainterlyHome() {
  const { settings } = useSiteSettings()
  const { artworks, loading: artLoading, error: artError, refresh } = useArtworks(true)
  const { categories, prices, loading: priceLoading, error: priceError } = usePricing()
  const { about } = useAbout()
  const { socials } = useSocials()
  const { config } = useSiteConfig()
  const [viewer, setViewer] = useState<Artwork | null>(null)
  const heroArt = artworks[0] ?? null
  const liveSocials = socials.filter((s) => s.enabled && s.url && s.url !== '#')

  return (
    <main id="main">
      <PageMeta
        title={`${config.site_name} — ${config.tagline}`}
        description={config.tagline}
        image={heroArt ? publicArtUrl(heroArt.image_path) : null}
        path="/"
      />
      <PHero settings={settings} heroArt={heroArt} config={config} />

      {/* cream gallery band, torn over the dark hero */}
      <section aria-label="Gallery wall" className="pt-cream-band relative z-10 -mt-5">
        <div id="work" className="mx-auto max-w-[1280px] px-4 sm:px-6 scroll-mt-20">
          <div className="grid lg:grid-cols-12 gap-8 items-end mb-10">
            <div className="lg:col-span-8">
              <p className="pt-hand text-[26px] text-[var(--pt-ochre)] -rotate-1">fresh off the easel</p>
              <h2 className="pt-display text-[44px] md:text-[60px] leading-none text-[var(--pt-ink)] mt-1">
                Gallery
              </h2>
              <div aria-hidden className="mt-3 h-[5px] w-40 bg-[var(--pt-ochre)]" style={{ clipPath: 'polygon(0 25%, 100% 0, 99% 80%, 1% 100%)' }} />
            </div>
            <p className="lg:col-span-4 text-[15px] leading-[1.7] text-[var(--pt-ink-soft)] italic lg:pb-1">
              A collection of recent works, sketches, and random art made along the way.
            </p>
          </div>
          {artLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6" aria-hidden>
              {['md:col-span-8', 'md:col-span-4', 'md:col-span-6'].map((span, i) => (
                <div key={i} className={`${span} animate-pulse`}>
                  <div className="border-2 border-[var(--pt-ink)]/20 bg-[var(--pt-canvas)] aspect-[4/3]" />
                </div>
              ))}
            </div>
          ) : artError ? (
            <div role="alert" className="border-2 border-[var(--pt-ochre)] px-5 py-4 text-center">
              <p className="text-[14px] font-semibold text-[var(--pt-ochre)]">{artError}</p>
              <button onClick={refresh} className="mt-2 border border-[var(--pt-ochre)] px-5 py-2 text-[13px] font-bold text-[var(--pt-ochre)] min-h-[44px]">
                Try again
              </button>
            </div>
          ) : artworks.length === 0 ? (
            <div className="border-2 border-dashed border-[var(--pt-ink)]/40 px-6 py-14 text-center -rotate-[0.3deg]">
              <p className="pt-hand text-[32px] text-[var(--pt-ink)]">the wall is waiting for its first piece…</p>
            </div>
          ) : (
            <PGallery artworks={artworks} onOpen={setViewer} />
          )}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <PaintSwatches />
            <p className="pt-hand text-[24px] text-[var(--pt-brown)] rotate-1">more art coming soon… ☺</p>
          </div>
        </div>
      </section>

      {/* dark studio band: commissions sheet + about + connect */}
      <section aria-label="Studio desk" className="pt-night-soft">
        <div className="relative z-[1] mx-auto max-w-[1280px] px-4 sm:px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
            {/* commission sheet */}
            <div id="commissions">
              <PReveal>
                <p className="pt-hand text-[26px] text-[var(--pt-sun)] -rotate-1 mb-4">pinned to the desk ↓</p>
                {priceLoading ? (
                  <div className="border-2 border-[var(--pt-cream)]/20 p-6 animate-pulse" aria-hidden>
                    <div className="h-7 w-40 bg-[var(--pt-cream)]/10" />
                    <div className="mt-4 h-20 bg-[var(--pt-cream)]/10" />
                  </div>
                ) : priceError ? (
                  <div role="alert" className="border-2 border-[var(--pt-sun)] px-5 py-4 text-[14px] font-semibold text-[var(--pt-sun)]">
                    {priceError}
                  </div>
                ) : (
                  <PCommissionPreview settings={settings} categories={categories} prices={prices} examples={artworks} />
                )}
              </PReveal>
            </div>

            {/* about panel */}
            <div>
              <PSectionHead kicker="nice to meet you" title="About Me" onDark />
              <PAboutPreview about={about} onDark />
            </div>
          </div>

          {/* process gets the full row so the steps never collide */}
          <div className="mt-16">
            <PReveal>
              <p className="pt-hand text-[28px] text-[var(--pt-sun)] mb-5 -rotate-1">how it goes ↓</p>
              <PCommissionProcess onDark />
            </PReveal>
          </div>

          {/* connect + quote notes side by side */}
          <div className="mt-14 grid sm:grid-cols-2 gap-8 max-w-3xl">
            <PReveal>
              <TornNote className="rotate-2 h-full">
                <p className="pt-hand font-bold text-[30px] leading-none text-[var(--pt-ink)]">Let&rsquo;s Connect</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--pt-ink-soft)] italic">
                  Follow my journey, support my work, or just say hi!
                </p>
                {liveSocials.length > 0 ? (
                  <div className="mt-3 flex items-center gap-2">
                    {liveSocials.slice(0, 4).map((s) => (
                      <a
                        key={s.id}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={s.platform}
                        title={s.display_name || s.platform}
                        className="inline-flex items-center justify-center w-11 h-11 border-2 border-[var(--pt-ink)] text-[var(--pt-ink)] hover:bg-[var(--pt-ink)] hover:text-[var(--pt-cream)] transition-colors"
                      >
                        <SocialGlyph platform={s.platform} />
                      </a>
                    ))}
                  </div>
                ) : (
                  <PNote className="text-[20px] mt-2">no addresses yet…</PNote>
                )}
              </TornNote>
            </PReveal>
            {about.signature ? (
              <PReveal delay={1}>
                <TornNote className="-rotate-2 h-full">
                  <p className="pt-hand text-[24px] leading-[1.3] text-[var(--pt-ink)]">
                    &ldquo;{about.signature}&rdquo;
                  </p>
                  <p className="mt-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--pt-brown)]">
                    — {config.site_name}
                  </p>
                </TornNote>
              </PReveal>
            ) : null}
          </div>

          {/* contact anchor */}
          <section id="contact" aria-label="Contact" className="mt-16 text-center scroll-mt-20">
            <PSectionHead kicker="say hello" title="Contact" note="Elsewhere" onDark center />
            <div className="flex justify-center">
              <PSocialLinks socials={socials} onDark />
            </div>
          </section>
        </div>
      </section>

      <ArtworkViewer art={viewer} artworks={artworks} onClose={() => setViewer(null)} onNav={setViewer} theme="painterly" />
    </main>
  )
}
