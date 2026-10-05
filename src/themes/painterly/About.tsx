import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import type { AboutContent, SocialLink } from '../../lib/types'
import { publicArtUrl } from '../../lib/supabase'
import { SmartImage } from '../../components/SmartImage'
import { PNote, PReveal, PTape, PaintDabs } from './bits'

export function PAboutPreview({ about, onDark = false }: { about: AboutContent; onDark?: boolean }) {
  const img = publicArtUrl(about.profile_image_path)
  const t = onDark ? 'text-[var(--pt-cream)]' : 'text-[var(--pt-ink)]'
  const sub = onDark ? 'text-[var(--pt-cream)]/85' : 'text-[var(--pt-ink)]'
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
          <p className={`mt-3 pt-display text-[24px] md:text-[28px] leading-[1.4] max-w-[40ch] ${t}`}>
            {about.bio}
          </p>
        </PReveal>
        <PReveal delay={1}>
          <div className="mt-8 grid sm:grid-cols-2 gap-x-8">
            <div className={`border-t-[3px] py-4 ${onDark ? 'border-[var(--pt-ochre)]' : 'border-[var(--pt-ink)]'}`}>
              <p className={`pt-hand text-[24px] ${onDark ? 'text-[var(--pt-sun)]' : 'text-[var(--pt-ochre)]'}`}>i paint…</p>
              <p className={`mt-1 text-[14.5px] leading-relaxed ${sub}`}>
                {about.subjects.length ? about.subjects.join(' · ') : '—'}
              </p>
            </div>
            <div className={`border-t-[3px] py-4 ${onDark ? 'border-[var(--pt-ochre)]' : 'border-[var(--pt-ink)]'}`}>
              <p className={`pt-hand text-[24px] ${onDark ? 'text-[var(--pt-sun)]' : 'text-[var(--pt-ochre)]'}`}>currently into…</p>
              <p className={`mt-1 text-[14.5px] leading-relaxed ${sub}`}>
                {about.interests.length ? about.interests.join(' · ') : '—'}
              </p>
            </div>
          </div>
          {about.signature && (
            <p className={`mt-4 pt-hand text-[38px] -rotate-2 ${onDark ? 'text-[var(--pt-sun)]' : 'text-[var(--pt-ink)]'}`}>{about.signature}</p>
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

export function PSocialLinks({ socials, onDark = false }: { socials: SocialLink[]; onDark?: boolean }) {
  const live = socials.filter((s) => s.enabled && s.url && s.url !== '#')
  const name = onDark ? 'text-[var(--pt-cream)]' : 'text-[var(--pt-ink)]'
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
              <span className={`pt-hand font-bold text-[30px] leading-none transition-colors group-hover:text-[var(--pt-ochre)] ${name}`}>
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
  void tagline
  const live = socials.filter((s) => s.enabled && s.url && s.url !== '#').slice(0, 6)
  return (
    <footer className="bg-[#10173a] text-[var(--pt-cream)]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-baseline gap-4">
            <p className="pt-hand text-[28px] leading-none -rotate-1">{siteName}</p>
            <p className="font-mono text-[11px] tracking-[0.1em] uppercase opacity-60">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Footer">
            {[
              ['/', 'Home'],
              ['/#work', 'Gallery'],
              ['/commissions', 'Commissions'],
              ['/about', 'About'],
            ].map(([to, label]) =>
              to.startsWith('/#') ? (
                <a key={to} href={to} className="pt-hand text-[22px] opacity-80 hover:opacity-100 hover:text-[var(--pt-sun)] transition min-h-[44px] inline-flex items-center">
                  {label}
                </a>
              ) : (
                <Link key={to} to={to} className="pt-hand text-[22px] opacity-80 hover:opacity-100 hover:text-[var(--pt-sun)] transition min-h-[44px] inline-flex items-center">
                  {label}
                </Link>
              )
            )}
          </nav>
          {live.length > 0 && (
            <div className="flex items-center gap-4">
              {live.slice(0, 3).map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.platform}
                  className="inline-flex items-center justify-center w-11 h-11 opacity-80 hover:opacity-100 hover:text-[var(--pt-sun)] transition min-h-[44px]"
                >
                  <SocialGlyph platform={s.platform} />
                </a>
              ))}
            </div>
          )}
        </div>
        <div aria-hidden className="mt-6 flex items-center gap-2 opacity-50">
          <PaintDabs />
        </div>
      </div>
    </footer>
  )
}

export function SocialGlyph({ platform }: { platform: string }) {
  const p = platform.toLowerCase()
  const cls = 'w-5 h-5'
  if (p.includes('instagram')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (p.includes('mail') || p.includes('email') || p.includes('contact')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={2} className={cls}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={cls}>
      <path d="M4 4l7.5 16L14 13l7-2.5z" />
      <path d="M14 13l6 6" />
    </svg>
  )
}
