import { useState } from 'react'
import { Link } from 'react-router-dom'
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
        <div className="relative border border-line bg-parchment/45 p-4 sm:p-6 lg:p-8">
          <div aria-hidden className="absolute -top-3 right-8 hidden lg:block w-24 h-6 rotate-[3deg] tape-paper" />
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <Reveal>
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
          <div className="lg:pt-3">
            <Reveal delay={1}>
              <p className="font-note text-[22px] text-muted -rotate-1 mb-2">a little guide before we begin</p>
              <h3 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] leading-[0.96] text-ink">Let&rsquo;s make<br />something good.</h3>
              <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-ink-soft">
                Choose a commission type, tell me about your idea, and we&rsquo;ll settle the details together before any drawing begins.
              </p>
              <dl className="mt-6 grid sm:grid-cols-3 border-y border-line">
                <div className="py-3 sm:pr-3 border-b sm:border-b-0 sm:border-r border-line">
                  <dt className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted">Availability</dt>
                  <dd className="mt-1 text-[14px] font-semibold text-ink">{settings.commission_status === 'open' ? 'Taking requests' : 'Waitlist open'}</dd>
                </div>
                <div className="py-3 sm:px-3 border-b sm:border-b-0 sm:border-r border-line">
                  <dt className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted">Quote</dt>
                  <dd className="mt-1 text-[14px] font-semibold text-ink">Confirmed first</dd>
                </div>
                <div className="py-3 sm:pl-3">
                  <dt className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted">Timeline</dt>
                  <dd className="mt-1 text-[14px] font-semibold text-ink">Set together</dd>
                </div>
              </dl>
              <Link
                to="/commissions#request"
                className="mt-7 inline-flex min-h-[48px] items-center justify-center bg-ink px-6 py-3 text-[14px] font-semibold tracking-wide text-cream transition-colors hover:bg-accent-deep"
              >
                Request a commission →
              </Link>
              <p className="mt-3 font-note text-[18px] text-muted">references + a clear idea are always welcome</p>
              <div className="mt-8 border-t border-line pt-7">
                <Eyebrow className="mb-5">How it works</Eyebrow>
                <CommissionProcess />
              </div>
            </Reveal>
          </div>
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
