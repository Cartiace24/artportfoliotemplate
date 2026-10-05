import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Hero } from '../components/Hero'
import { ArtworkViewer, FeaturedGallery } from '../components/Gallery'
import { CommissionPreview, CommissionProcess } from '../components/Commissions'
import { AboutPreview, SocialLinks } from '../components/About'
import { Reveal, SectionHeading } from '../components/Bits'
import { ConfigError, EmptyGallery, GallerySkeleton, InlineError } from '../components/States'
import { useAbout, useArtworks, usePricing, useSiteSettings, useSocials } from '../hooks/useSiteContent'
import type { Artwork } from '../lib/types'

export function Home() {
  const { settings, loading: settingsLoading } = useSiteSettings()
  const { artworks, loading: artLoading, error: artError, isMisconfigured, refresh } = useArtworks(true)
  const { categories, prices, loading: priceLoading, error: priceError } = usePricing()
  const { about } = useAbout()
  const { socials } = useSocials()
  const [viewer, setViewer] = useState<Artwork | null>(null)

  return (
    <main id="main">
      <Hero settings={settings} heroArt={artworks[0] ?? null} />

      {isMisconfigured && (
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-4">
          <ConfigError compact />
        </div>
      )}

      {/* Featured + pricing */}
      <section id="work" aria-label="Featured artwork" className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-6 pb-4 scroll-mt-20">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div>
            <SectionHeading kicker="work" title="Lorem Ipsum" note="lorem ipsum dolor sit amet" />
            {artLoading || settingsLoading ? (
              <GallerySkeleton />
            ) : artError ? (
              <InlineError message={artError} onRetry={refresh} />
            ) : artworks.length === 0 ? (
              <EmptyGallery />
            ) : (
              <FeaturedGallery artworks={artworks} onOpen={setViewer} />
            )}
            <Reveal className="mt-6 text-center">
              <Link to="/commissions" className="inline-flex items-center gap-2 text-[14.5px] font-bold text-[#5b2b4e] underline decoration-wavy underline-offset-4 min-h-[44px]">
                lorem ipsum dolor? <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </Reveal>
          </div>
          <div className="lg:sticky lg:top-[84px]">
            <Reveal>
              {priceLoading ? (
                <div className="rounded-2xl bg-[#fffdf7]/80 border border-[#e6dcc8] p-6 animate-pulse" aria-hidden>
                  <div className="h-7 w-40 rounded bg-[#f3ecdd]" />
                  <div className="mt-4 h-24 rounded-xl bg-[#faf3e8]" />
                  <div className="mt-3 h-24 rounded-xl bg-[#faf3e8]" />
                </div>
              ) : priceError ? (
                <InlineError message={priceError} />
              ) : (
                <CommissionPreview settings={settings} categories={categories} prices={prices} />
              )}
            </Reveal>
            <p className="mt-3 font-hand text-[19px] text-[#8a6f5c] text-right rotate-1">lorem • ipsum • dolor ♡</p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section aria-label="Commission process" className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12">
        <SectionHeading title="Lorem ipsum dolor" note="lorem ipsum" kicker="process" />
        <CommissionProcess />
      </section>

      {/* About preview */}
      <section aria-label="About the artist" className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8">
        <SectionHeading title="Lorem ipsum" note="lorem ipsum dolor" kicker="about" />
        <AboutPreview about={about} />
      </section>

      {/* Socials */}
      <section aria-label="Social links" className="mx-auto max-w-[1280px] px-4 sm:px-6 py-10 text-center">
        <p className="font-hand text-[22px] text-[#8a6f5c] mb-4 -rotate-1">lorem ipsum! ✿</p>
        <SocialLinks socials={socials} />
      </section>

      <ArtworkViewer art={viewer} artworks={artworks} onClose={() => setViewer(null)} onNav={setViewer} />
    </main>
  )
}
