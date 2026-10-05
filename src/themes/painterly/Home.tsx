import { useState } from 'react'
import { PHero } from './Hero'
import { PGallery } from './Gallery'
import { ArtworkViewer } from '../../components/ArtworkViewer'
import { PCommissionPreview, PCommissionProcess } from './Commissions'
import { PAboutPreview, PSocialLinks } from './About'
import { PReveal, PSectionHead, PaintDivider } from './bits'
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

  return (
    <main id="main">
      <PageMeta
        title={`${config.site_name} — ${config.tagline}`}
        description={config.tagline}
        image={heroArt ? publicArtUrl(heroArt.image_path) : null}
        path="/"
      />
      <PHero settings={settings} heroArt={heroArt} config={config} />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <PaintDivider className="mt-12" />
      </div>

      {/* wall */}
      <section id="work" aria-label="Gallery wall" className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-12 md:pt-16 scroll-mt-16">
        <PSectionHead kicker="pinned up fresh" title="The Gallery Wall" note={`${artworks.length} pieces`} />
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
      </section>

      {/* commissions */}
      <section aria-label="Commissions" className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-16 md:pt-24">
        <PSectionHead kicker="yes, you can have one" title="Commissions" note={settings.commission_status === 'open' ? 'Open' : 'Closed'} />
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <PReveal className="lg:col-span-5">
            {priceLoading ? (
              <div className="border-2 border-[var(--pt-ink)]/20 p-6 animate-pulse" aria-hidden>
                <div className="h-7 w-40 bg-[var(--pt-canvas)]" />
                <div className="mt-4 h-20 bg-[var(--pt-canvas)]" />
              </div>
            ) : priceError ? (
              <div role="alert" className="border-2 border-[var(--pt-ochre)] px-5 py-4 text-[14px] font-semibold text-[var(--pt-ochre)]">
                {priceError}
              </div>
            ) : (
              <PCommissionPreview settings={settings} categories={categories} prices={prices} examples={artworks} />
            )}
          </PReveal>
          <div className="lg:col-span-7">
            <PReveal delay={1}>
              <p className="pt-hand text-[28px] text-[var(--pt-ochre)] mb-5 -rotate-1">how it goes ↓</p>
              <PCommissionProcess />
            </PReveal>
          </div>
        </div>
      </section>

      {/* about */}
      <section aria-label="About the artist" className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-16 md:pt-24">
        <PSectionHead kicker="the hand behind it" title="About" note="Profile" />
        <PAboutPreview about={about} />
      </section>

      {/* contact */}
      <section id="contact" aria-label="Contact" className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-16 md:pt-24 pb-4 text-center scroll-mt-16">
        <PSectionHead kicker="say hello" title="Contact" note="Elsewhere" />
        <PSocialLinks socials={socials} />
      </section>

      <ArtworkViewer art={viewer} artworks={artworks} onClose={() => setViewer(null)} onNav={setViewer} theme="painterly" />
    </main>
  )
}
