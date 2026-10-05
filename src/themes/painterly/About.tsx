import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import type { AboutContent, SocialLink } from '../../lib/types'
import { publicArtUrl } from '../../lib/supabase'
import { SmartImage } from '../../components/SmartImage'
import { PNote, PReveal, PTape, PaintDabs, SquiggleArrow } from './bits'

export function PAboutPreview({ about }: { about: AboutContent }) {
  const img = publicArtUrl(about.profile_image_path)
  return (
    <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-start">
      <PReveal className="md:col-span-4">
        <figure className="relative rotate-2">
          <div className="bg-[var(--pt-cream)] border-2 border-[var(--pt-ink)] p-2 pb-0">
            <PTape className="-top-4 left-1/2 -translate-x-1/2 rotate-2" />
            {img ? (
              <SmartImage
                path={about.profile_image_path}
                alt="Artist portrait"
                width={600}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="w-full aspect-[4/5] object-cover border border-[var(--pt-ink)]/30"
              />
            ) : (
              <div className="w-full aspect-[4/5] grid place-items-center pt-canvas border border-[var(--pt-ink)]/30">
                <span className="pt-hand text-[32px] text-[var(--pt-brown)]">me, roughly</span>
              </div>
            )}
          </div>
          <figcaption className="flex items-baseline justify-between gap-3 pt-2">
            <span className="pt-hand text-[24px] text-[var(--pt-ink)]">thats me →</span>
            <PaintDabs />
          </figcaption>
        </figure>
      </PReveal>
      <div className="md:col-span-8">
        <PReveal>
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--pt-brown)]">Sketchbook entry no. 1</p>
          <p className="mt-3 pt-display text-[24px] md:text-[28px] leading-[1.4] text-[var(--pt-ink)] max-w-[40ch]">
            {about.bio}
          </p>
        </PReveal>
        <PReveal delay={1}>
          <div className="mt-8 grid sm:grid-cols-2 gap-x-8">
            <div className="border-t-[3px] border-[var(--pt-ink)] py-4">
              <p className="pt-hand text-[24px] text-[var(--pt-ochre)]">i paint…</p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-[var(--pt-ink)]">
                {about.subjects.length ? about.subjects.join(' · ') : '—'}
              </p>
            </div>
            <div className="border-t-[3px] border-[var(--pt-ink)] py-4">
              <p className="pt-hand text-[24px] text-[var(--pt-ochre)]">currently into…</p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-[var(--pt-ink)]">
                {about.interests.length ? about.interests.join(' · ') : '—'}
              </p>
            </div>
          </div>
          {about.signature && (
            <p className="mt-4 pt-hand text-[38px] text-[var(--pt-ink)] -rotate-2">{about.signature}</p>
          )}
          <Link
            to="/about"
            className="pt-brushlink mt-3 inline-flex items-center gap-1.5 text-[15px] font-bold text-[var(--pt-ink)] hover:text-[var(--pt-ochre)] transition-colors min-h-[44px]"
          >
            Read the whole page →
          </Link>
        </PReveal>
      </div>
    </div>
  )
}

export function PSocialLinks({ socials }: { socials: SocialLink[] }) {
  const live = socials.filter((s) => s.enabled && s.url && s.url !== '#')
  if (!live.length) {
    return (
      <PNote className="text-[24px] text-center">no addresses yet — check back soon!</PNote>
    )
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <PNote className="text-[26px] text-center -rotate-1 mb-3">my corners of the internet — come say hi!</PNote>
      <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        {live.map((s, i) => (
          <li key={s.id} className={i % 2 ? 'rotate-1' : '-rotate-1'}>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${s.platform}${s.display_name ? ` — ${s.display_name}` : ''}`}
              title={s.display_name || s.platform}
              className="group inline-flex items-baseline gap-1.5 py-2 min-h-[44px]"
            >
              <span className="pt-hand font-bold text-[30px] leading-none text-[var(--pt-ink)] group-hover:text-[var(--pt-ochre)] transition-colors">
                {s.platform}
              </span>
              <span aria-hidden className="font-mono text-[12px] text-[var(--pt-ochre)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export function PFooter({ socials, siteName, tagline }: { socials: SocialLink[]; siteName: string; tagline: string }) {
  const live = socials.filter((s) => s.enabled && s.url && s.url !== '#').slice(0, 6)
  return (
    <footer className="mt-20 border-t-[3px] border-[var(--pt-ink)] pt-canvas">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 pt-torn-top">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="pt-hand font-bold text-[40px] leading-none text-[var(--pt-ink)] -rotate-1">{siteName}</p>
            <PNote className="text-[22px] mt-2 max-w-[30ch]">{tagline} — thanks for flipping through!</PNote>
            <PaintDabs className="mt-4" />
          </div>
          <nav className="md:col-span-3 flex flex-col gap-1" aria-label="Footer">
            {[
              ['/', 'Home'],
              ['/#work', 'Gallery'],
              ['/commissions', 'Commissions'],
              ['/about', 'About'],
            ].map(([to, label]) =>
              to.startsWith('/#') ? (
                <a key={to} href={to} className="py-1.5 pt-hand text-[24px] text-[var(--pt-ink)] hover:text-[var(--pt-ochre)] transition-colors w-fit min-h-[36px]">
                  {label}
                </a>
              ) : (
                <Link key={to} to={to} className="py-1.5 pt-hand text-[24px] text-[var(--pt-ink)] hover:text-[var(--pt-ochre)] transition-colors w-fit min-h-[36px]">
                  {label}
                </Link>
              )
            )}
          </nav>
          <div className="md:col-span-4">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--pt-brown)] mb-2">Find me</p>
            {live.length ? (
              <ul className="flex flex-wrap gap-x-5 gap-y-1">
                {live.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.platform}
                      className="inline-flex items-center gap-1 py-1.5 pt-hand text-[24px] text-[var(--pt-ink)] hover:text-[var(--pt-ochre)] transition-colors min-h-[36px]"
                    >
                      {s.platform} <span aria-hidden className="font-mono text-[12px]">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <PNote className="text-[22px]">no addresses yet…</PNote>
            )}
            <SquiggleArrow flip className="w-16 h-8 text-[var(--pt-teal)] mt-3 -rotate-6" />
          </div>
        </div>
        <div className="mt-10 pt-5 border-t-2 border-dashed border-[var(--pt-ink)]/30 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--pt-brown)]">
            © {new Date().getFullYear()} {siteName}
          </p>
          <p className="pt-hand text-[22px] text-[var(--pt-brown)]">painted, not rendered ♡</p>
        </div>
      </div>
    </footer>
  )
}
