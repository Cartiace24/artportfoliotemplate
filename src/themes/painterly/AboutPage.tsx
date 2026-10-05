import { PAboutPreview, PSocialLinks } from './About'
import { PNote, PReveal, PSectionHead, PTape } from './bits'
import { SmartImage } from '../../components/SmartImage'
import { PageMeta } from '../../lib/meta'
import { useAbout, useArtworks, useSiteConfig, useSocials } from '../../hooks/useSiteContent'

export function PainterlyAbout() {
  const { about } = useAbout()
  const { socials } = useSocials()
  const { artworks } = useArtworks(false)
  const { config } = useSiteConfig()

  return (
    <main id="main" className="pt-[72px] mx-auto max-w-[1080px] px-4 sm:px-6 pb-10">
      <PageMeta
        title={`${config.site_name} — About`}
        description={about.short_description ?? config.tagline}
        path="/about"
      />
      <div className="py-10 md:py-14 text-center">
        <PReveal>
          <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-[var(--pt-brown)]">Sketchbook entry</p>
          <h1 className="pt-display text-[clamp(3rem,9vw,5.5rem)] leading-[0.95] text-[var(--pt-ink)] mt-3">
            About
          </h1>
          <PNote className="text-[24px] mt-2">{about.short_description}</PNote>
        </PReveal>
      </div>

      <div className="mt-6">
        <PAboutPreview about={about} />
      </div>

      {(artworks[1] || artworks[2]) && (
        <div className="mt-14">
          <PNote className="text-[24px] -rotate-1 mb-4 text-center">taped in from the archives ↓</PNote>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {[artworks[1], artworks[2]].filter(Boolean).map((a, i) => (
              <PReveal key={a!.id}>
                <figure className={`relative bg-[var(--pt-cream)] border-2 border-[var(--pt-ink)] p-2 ${i ? 'rotate-2' : '-rotate-2'}`}>
                  <PTape className="-top-3 left-1/2 -translate-x-1/2 !w-[80px] !h-[24px]" />
                  <SmartImage
                    path={a!.image_path}
                    alt={a!.title}
                    width={800}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="w-full h-56 sm:h-72 object-cover"
                  />
                  <figcaption className="pt-1.5 pt-hand text-[24px] text-[var(--pt-ink)] truncate">
                    {a!.title}
                  </figcaption>
                </figure>
              </PReveal>
            ))}
          </div>
        </div>
      )}

      <div className="mt-16 text-center">
        <PSectionHead kicker="letters welcome" title="Contact" note="Elsewhere" />
        <div className="flex justify-center">
          <PSocialLinks socials={socials} />
        </div>
      </div>
    </main>
  )
}
