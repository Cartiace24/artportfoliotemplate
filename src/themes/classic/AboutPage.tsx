import { AboutPreview, SocialLinks } from './About'
import { Eyebrow, Note, Reveal, SectionHead } from './Bits'
import { ConfigError } from './States'
import { SmartImage } from '../../components/SmartImage'
import { PageMeta } from '../../lib/meta'
import { useAbout, useArtworks, useSiteConfig, useSocials } from '../../hooks/useSiteContent'

export function About() {
  const { about, isMisconfigured } = useAbout()
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
      {isMisconfigured && (
        <div className="mb-4 mt-6">
          <ConfigError compact />
        </div>
      )}
      <div className="py-10 md:py-14 border-b border-ink">
        <Reveal>
          <Eyebrow>Profile</Eyebrow>
          <h1 className="font-display text-[clamp(2.8rem,7vw,4.5rem)] leading-[1] text-ink mt-3">
            About
          </h1>
          <p className="mt-4 text-[15.5px] text-ink-soft">{about.short_description}</p>
        </Reveal>
      </div>

      <div className="mt-10">
        <AboutPreview about={about} />
      </div>

      {(artworks[1] || artworks[2]) && (
        <div className="mt-12">
          <Note className="text-[20px] -rotate-1 mb-4">some old favourites ↓</Note>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {[artworks[1], artworks[2]].filter(Boolean).map((a, i) => (
              <Reveal key={a!.id}>
                <figure className={`relative bg-cream border border-line p-2 hard-shadow ${i ? 'rotate-1' : '-rotate-1'}`}>
                  <SmartImage
                    path={a!.image_path}
                    alt={a!.title}
                    width={800}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="w-full h-56 sm:h-72 object-cover"
                  />
                  <figcaption className="pt-1.5 font-note text-[19px] text-ink truncate">
                    {a!.title}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      <div className="mt-14 text-center border-t border-line pt-10">
        <SectionHead index="02" title="Elsewhere" note="Contact" />
        <div className="flex justify-center">
          <SocialLinks socials={socials} />
        </div>
      </div>
    </main>
  )
}
