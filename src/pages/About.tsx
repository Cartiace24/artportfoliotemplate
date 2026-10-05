import { AboutPreview, SocialLinks } from '../components/About'
import { Reveal, Tape } from '../components/Bits'
import { ConfigError } from '../components/States'
import { useAbout, useArtworks, useSocials } from '../hooks/useSiteContent'
import { publicArtUrl } from '../lib/supabase'

export function About() {
  const { about, isMisconfigured } = useAbout()
  const { socials } = useSocials()
  const { artworks } = useArtworks(false)

  return (
    <main id="main" className="pt-[110px] mx-auto max-w-[1080px] px-4 sm:px-6 pb-10">
      {isMisconfigured && (
        <div className="mb-4">
          <ConfigError compact />
        </div>
      )}
      <Reveal>
        <p className="font-hand text-[22px] text-[#8a6f5c] -rotate-1">lorem ipsum dolor…</p>
        <h1 className="font-serif-ed text-[44px] md:text-[60px] leading-none text-[#40203f] font-semibold">About <span className="italic">Lorem</span></h1>
        <p className="mt-2 text-[15.5px] text-[#5c4f5e]">{about.short_description}</p>
      </Reveal>

      <div className="mt-8">
        <AboutPreview about={about} />
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-6">
        <Reveal>
          <div className="relative rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-6 rotate-[-0.5deg]">
            <Tape className="-top-3 left-8" sage />
            <h2 className="font-serif-ed italic text-[24px] text-[#40203f]">Lorem ipsum dolor</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {about.subjects.map((s) => (
                <span key={s} className="rounded-full bg-[#f2d8d3]/60 border border-[#c98a8a]/30 px-3.5 py-1 text-[13px] font-bold text-[#5b2b4e]">{s}</span>
              ))}
            </div>
            <h2 className="font-serif-ed italic text-[24px] text-[#40203f] mt-6">Lorem ipsum</h2>
            <ul className="mt-2 font-hand text-[21px] text-[#6d5f6b] space-y-1">
              {about.interests.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={1}>
          <div className="relative rounded-2xl bg-[#f3ecdd]/60 border border-[#e6dcc8] p-6 rotate-[0.5deg]">
            <h2 className="font-serif-ed italic text-[24px] text-[#40203f]">Lorem ipsum ♡</h2>
            <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-[#4d4250]">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            </div>
            <p className="mt-4 font-hand text-[24px] text-[#40203f] -rotate-1">{about.signature}</p>
          </div>
        </Reveal>
      </div>

      {(artworks[1] || artworks[2]) && (
        <div className="mt-8 grid grid-cols-2 gap-4">
          {[artworks[1], artworks[2]].filter(Boolean).map((a, i) => (
            <Reveal key={a!.id} delay={i}>
              <img src={publicArtUrl(a!.image_path) ?? ''} alt={a!.title} loading="lazy"
                className={`rounded-2xl border border-[#e6dcc8] print-shadow w-full h-56 sm:h-72 object-cover ${i ? 'rotate-[0.7deg]' : 'rotate-[-0.7deg]'}`} />
            </Reveal>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <p className="font-hand text-[22px] text-[#8a6f5c] mb-4">lorem ipsum ♡</p>
        <SocialLinks socials={socials} />
      </div>
    </main>
  )
}
