import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { AboutContent, SocialLink } from '../lib/types'
import { publicArtUrl } from '../lib/supabase'
import { SmartImage } from './SmartImage'
import { Eyebrow, Reveal } from './Bits'

export function AboutPreview({ about }: { about: AboutContent }) {
  const img = publicArtUrl(about.profile_image_path)
  return (
    <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-start">
      <Reveal className="md:col-span-4">
        <figure>
          <div className="frame bg-parchment overflow-hidden">
            {img ? (
              <SmartImage
                path={about.profile_image_path}
                alt="Artist portrait"
                width={600}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="w-full aspect-[4/5] object-cover"
              />
            ) : (
              <div className="w-full aspect-[4/5] grid place-items-center">
                <span className="font-display italic text-[28px] text-muted">Portrait</span>
              </div>
            )}
          </div>
          <figcaption className="pt-2.5 mt-3 border-t border-ink font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
            The artist
          </figcaption>
        </figure>
      </Reveal>
      <div className="md:col-span-8">
        <Reveal>
          <Eyebrow>Profile</Eyebrow>
          <p className="mt-3 font-display text-[24px] md:text-[28px] leading-[1.35] text-ink max-w-[38ch]">
            {about.bio}
          </p>
        </Reveal>
        <Reveal delay={1}>
          <dl className="mt-8 grid sm:grid-cols-2 gap-x-8">
            <div className="border-t border-line py-4">
              <dt className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted">Focus</dt>
              <dd className="mt-2 text-[14.5px] leading-relaxed text-ink">
                {about.subjects.length ? about.subjects.join(' · ') : '—'}
              </dd>
            </div>
            <div className="border-t border-line py-4">
              <dt className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted">Also into</dt>
              <dd className="mt-2 text-[14.5px] leading-relaxed text-ink">
                {about.interests.length ? about.interests.join(' · ') : '—'}
              </dd>
            </div>
          </dl>
          {about.signature && (
            <p className="mt-6 font-display italic text-[24px] text-ink">{about.signature}</p>
          )}
          <Link
            to="/about"
            className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink underline underline-offset-[6px] decoration-accent decoration-2 hover:text-accent-deep transition-colors min-h-[44px]"
          >
            Full profile <ArrowUpRight className="w-4 h-4" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </div>
  )
}

export function SocialLinks({ socials }: { socials: SocialLink[] }) {
  const live = socials.filter((s) => s.enabled && s.url && s.url !== '#')
  if (!live.length) {
    return (
      <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-muted">
        Links coming soon
      </p>
    )
  }
  return (
    <motion.ul
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
    >
      {live.map((s, i) => (
        <li key={s.id}>
          <a
            href={s.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`${s.platform}${s.display_name ? ` — ${s.display_name}` : ''}`}
            title={s.display_name || s.platform}
            className="group inline-flex items-baseline gap-2 py-2 min-h-[44px]"
          >
            <span className="font-mono text-[11px] text-accent" aria-hidden>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="font-display text-[22px] text-ink group-hover:text-accent-deep transition-colors">
              {s.platform}
            </span>
            <ArrowUpRight className="w-4 h-4 self-center text-muted group-hover:text-accent-deep group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" aria-hidden />
          </a>
        </li>
      ))}
    </motion.ul>
  )
}

export function Footer({ socials, siteName, tagline }: { socials: SocialLink[]; siteName: string; tagline: string }) {
  const live = socials.filter((s) => s.enabled && s.url && s.url !== '#').slice(0, 6)
  return (
    <footer className="mt-20 border-t border-ink">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display italic text-[30px] leading-none text-ink">{siteName}</p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-soft max-w-[36ch]">{tagline}</p>
          </div>
          <nav className="md:col-span-3 flex flex-col gap-1" aria-label="Footer">
            {[
              ['/', 'Work'],
              ['/commissions', 'Commissions'],
              ['/about', 'About'],
              ['/tos', 'Terms'],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="py-1.5 text-[14px] font-medium text-ink-soft hover:text-accent-deep transition-colors w-fit min-h-[36px]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="md:col-span-4">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted mb-2">Elsewhere</p>
            {live.length ? (
              <ul className="flex flex-wrap gap-x-5 gap-y-1">
                {live.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.platform}
                      className="inline-flex items-center gap-1 py-1.5 text-[14px] font-medium text-ink-soft hover:text-accent-deep transition-colors min-h-[36px]"
                    >
                      {s.platform} <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-muted">Links coming soon.</p>
            )}
          </div>
        </div>
        <div className="mt-10 pt-5 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-muted">
            © {new Date().getFullYear()} {siteName}
          </p>
          <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-muted">
            {tagline}
          </p>
        </div>
      </div>
    </footer>
  )
}
