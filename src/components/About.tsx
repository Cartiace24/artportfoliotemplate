import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import type { AboutContent, SocialLink } from '../lib/types'
import { publicArtUrl } from '../lib/supabase'
import { SmartImage } from './SmartImage'
import { Reveal, Tape } from './Bits'

const PLATFORM_ICON: Record<string, string> = {
  X: '𝕏',
  Instagram: '◎',
  TikTok: '♪',
  Twitch: '▣',
  'Ko-fi': '☕',
  Cara: 'CG',
  Bluesky: '🦋',
  Facebook: 'f',
}

export function AboutPreview({ about }: { about: AboutContent }) {
  const img = publicArtUrl(about.profile_image_path)
  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-8 items-start">
      <Reveal className="relative">
        <div className="relative rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-2.5 rotate-[-2deg]">
          <Tape className="-top-3 left-1/2 -translate-x-1/2" />
          {img ? (
            <SmartImage
              path={about.profile_image_path}
              alt="Lorem ipsum portrait"
              width={600}
              sizes="(max-width: 768px) 100vw, 280px"
              className="rounded-xl w-full aspect-[4/5] object-cover art-img"
            />
          ) : (
            <div className="rounded-xl w-full aspect-[4/5] bg-gradient-to-br from-[#e7ddf0] via-[#f2d8d3] to-[#dde5d2] grid place-items-center">
              <span className="font-hand text-[64px] text-[#5b2b4e]">lorem ♡</span>
            </div>
          )}
          <p className="font-hand text-[19px] text-center text-[#8a6f5c] pt-2 pb-1 -rotate-1">lorem ipsum! ✿</p>
        </div>
      </Reveal>
      <div>
        <Reveal>
          <p className="font-hand text-[22px] text-[#8a6f5c]">lorem ipsum dolor…</p>
          <p className="mt-2 text-[15.5px] leading-[1.75] text-[#4d4250] max-w-[62ch]">{about.bio}</p>
        </Reveal>
        <Reveal delay={1}>
          <div className="mt-4 flex flex-wrap gap-2">
            {about.interests.map((t) => (
              <span key={t} className="rounded-full border border-[#b9a8d0]/50 bg-[#e7ddf0]/40 px-3.5 py-1 text-[13px] font-semibold text-[#5b2b4e]">
                {t}
              </span>
            ))}
          </div>
          <p className="mt-5 font-hand text-[26px] text-[#40203f] -rotate-1">{about.signature || '— lorem ipsum'}</p>
          <Link to="/about" className="mt-2 inline-block text-[14.5px] font-bold text-[#5b2b4e] underline decoration-wavy underline-offset-4 hover:text-[#40203f]">
            Read more about me →
          </Link>
        </Reveal>
      </div>
    </div>
  )
}

export function SocialLinks({ socials }: { socials: SocialLink[] }) {
  if (!socials.length) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-wrap items-center justify-center gap-3"
    >
      {socials.filter((s) => s.enabled && s.url && s.url !== '#').map((s) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`${s.platform}${s.display_name ? ` — ${s.display_name}` : ''}`}
          title={s.display_name || s.platform}
          className="w-11 h-11 rounded-full bg-[#5b2b4e] text-[#FAF6EF] grid place-items-center text-[15px] font-bold hover:bg-[#40203f] hover:-translate-y-1 hover:rotate-3 transition-all"
        >
          {PLATFORM_ICON[s.platform] ?? s.platform.slice(0, 2)}
        </a>
      ))}
      {socials.every((s) => !s.url || s.url === '#') && (
        <p className="font-hand text-[20px] text-[#8d857a]">lorem ipsum dolor… ♡</p>
      )}
    </motion.div>
  )
}

export function Footer({ socials, siteName, tagline }: { socials: SocialLink[]; siteName: string; tagline: string }) {
  return (
    <footer className="relative mt-16 border-t border-[#e6dcc8] bg-[#f6f0e2]/60">
      <div className="torn-edge absolute -top-[11px] inset-x-0 h-[12px] bg-[#f6f0e2]/60" aria-hidden />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-hand text-[28px] font-bold text-[#40203f] -rotate-1">{siteName.toUpperCase()}</p>
            <p className="font-hand text-[19px] text-[#8a6f5c]">{tagline} ♡</p>
          </div>
          <nav className="flex gap-6 text-[14px] font-semibold text-[#5b2b4e]" aria-label="Footer">
            <Link to="/" className="hover:underline">Portfolio</Link>
            <Link to="/commissions" className="hover:underline">Commissions</Link>
            <Link to="/tos" className="hover:underline">T.O.S.</Link>
            <Link to="/about" className="hover:underline">About</Link>
          </nav>
          <div className="flex gap-2.5">
            {socials.filter((s) => s.enabled && s.url && s.url !== '#').slice(0, 6).map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" aria-label={s.platform}
                className="w-9 h-9 rounded-full bg-[#5b2b4e]/90 text-[#FAF6EF] grid place-items-center text-[12px] font-bold hover:bg-[#40203f] transition-colors">
                {PLATFORM_ICON[s.platform] ?? s.platform.slice(0, 2)}
              </a>
            ))}
          </div>
        </div>
        <p className="mt-8 text-center text-[12.5px] tracking-wide text-[#8d857a]">
          {siteName.toUpperCase()} <span className="mx-2">•</span> {tagline} <span className="mx-2">•</span> {new Date().getFullYear()} <span className="mx-2">•</span> ♡
        </p>
      </div>
    </footer>
  )
}
