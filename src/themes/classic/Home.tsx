import { useState } from 'react'
import { Hero } from './Hero'
import { ArtworkViewer, FeaturedGallery } from './Gallery'
import { CommissionPreview, CommissionProcess } from './Commissions'
import { AboutPreview, SocialLinks } from './About'
import { Eyebrow, Reveal, SectionHead } from './Bits'
import { ConfigError, EmptyGallery, GallerySkeleton, InlineError } from './States'
import { PageMeta } from '../../lib/meta'
import { publicArtUrl } from '../../lib/supabase'
import { useAbout, useArtworks, usePricing, useSiteConfig, useSiteSettings, useSocials } from '../../hooks/useSiteContent'
import type { Artwork } from '../../lib/types'

export function Home() {
  const { settings, loading: settingsLoading } = useSiteSettings()
  const { artworks, loading: artLoading, error: artError, isMisconfigured, refresh } = useArtworks(true)
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
      <Hero settings={settings} heroArt={heroArt} config={config} />

      {isMisconfigured && (
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-6">
          <ConfigError compact />
        </div>
      )}

      {/* 01 — Work */}
      <section id="work" aria-label="Selected work" className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-14 md:pt-20 scroll-mt-16">
            <SectionHead index="01" title="The Wall" note={`${artworks.length} pieces pinned`} />
        {artLoading || settingsLoading ? (
          <GallerySkeleton />
        ) : artError ? (
          <InlineError message={artError} onRetry={refresh} />
        ) : artworks.length === 0 ? (
          <EmptyGallery />
        ) : (
          <FeaturedGallery artworks={artworks} onOpen={setViewer} />
        )}
      </section>

      {/* 02 — Commissions */}
      <section aria-label="Commissions" className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-16 md:pt-24">
        <SectionHead index="02" title="Commissions" note={settings.commission_status === 'open' ? 'Open' : 'Closed'} />
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <Reveal className="lg:col-span-5">
            {priceLoading ? (
              <div className="border border-line bg-cream p-6 animate-pulse" aria-hidden>
                <div className="h-7 w-40 bg-parchment" />
                <div className="mt-4 h-20 bg-parchment" />
                <div className="mt-3 h-20 bg-parchment" />
              </div>
            ) : priceError ? (
              <InlineError message={priceError} />
            ) : (
              <CommissionPreview settings={settings} categories={categories} prices={prices} examples={artworks} />
            )}
          </Reveal>
          <p className="mt-3 font-note text-[20px] text-muted text-right -rotate-1">picked fresh from the wall ↓</p>
          <div className="lg:col-span-7">
            <Reveal delay={1}>
              <Eyebrow className="mb-4">How it works</Eyebrow>
              <CommissionProcess />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 03 — About */}
      <section aria-label="About the artist" className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-16 md:pt-24">
        <SectionHead index="03" title="About" note="Profile" />
        <AboutPreview about={about} />
      </section>

      {/* 04 — Elsewhere */}
      <section aria-label="Elsewhere" className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-16 md:pt-24 pb-4 text-center">
        <SectionHead index="04" title="Elsewhere" note="Contact" />
        <SocialLinks socials={socials} />
      </section>

      <ArtworkViewer art={viewer} artworks={artworks} onClose={() => setViewer(null)} onNav={setViewer} />
    </main>
  )
}
