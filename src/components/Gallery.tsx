import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import type { Artwork } from '../lib/types'
import { SmartImage } from './SmartImage'
import { Tape } from './Bits'

export function ArtworkCard({
  art,
  onOpen,
  index,
  span,
}: {
  art: Artwork
  onOpen: (art: Artwork) => void
  index: number
  span?: string
}) {
  const rot = [-0.8, 0.6, -0.4, 0.8][index % 4]
  return (
    <motion.figure
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`${span ?? ''} group relative rounded-xl bg-[#fffdf7] border border-[#e6dcc8] p-2 pb-3 print-shadow`}
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <Tape className="-top-3 left-1/2 -translate-x-1/2 !w-[72px]" />
      <button
        onClick={() => onOpen(art)}
        className="block w-full text-left rounded-lg overflow-hidden focus-visible:outline-offset-4 min-h-[48px]"
        aria-label={`Open ${art.title} (${art.category}) — view larger`}
        aria-haspopup="dialog"
      >
        <div className="overflow-hidden rounded-lg art-img">
          <SmartImage
            path={art.image_path}
            alt={`${art.title} — ${art.category}`}
            width={800}
            className="w-full h-full object-cover aspect-[4/3] transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <figcaption className="px-1.5 pt-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-[#f2d8d3]/70 text-[#5b2b4e] text-[11.5px] font-bold px-2.5 py-1">
            {art.category}
          </span>
          <span className="font-hand text-[17px] text-[#6d5f6b] truncate">{art.title}</span>
        </figcaption>
        <span className="pointer-events-none absolute inset-2 rounded-lg bg-[#40203f]/0 group-hover:bg-[#40203f]/8 transition-colors flex items-end p-3 opacity-0 group-hover:opacity-100">
          <span className="text-[12.5px] font-semibold text-[#fffdf7] bg-[#40203f]/80 rounded-full px-3 py-1.5 backdrop-blur-sm translate-y-1 group-hover:translate-y-0 transition-transform">
            View ✦ {art.year ?? ''}
          </span>
        </span>
      </button>
    </motion.figure>
  )
}

export function FeaturedGallery({ artworks, onOpen }: { artworks: Artwork[]; onOpen: (a: Artwork) => void }) {
  // asymmetric editorial layout
  const spans = [
    'md:col-span-7',
    'md:col-span-5',
    'md:col-span-5',
    'md:col-span-7',
    'md:col-span-6',
    'md:col-span-6',
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
      {artworks.slice(0, 6).map((a, i) => (
        <ArtworkCard key={a.id} art={a} onOpen={onOpen} index={i} span={spans[i % spans.length]} />
      ))}
    </div>
  )
}

export function ArtworkViewer({
  art,
  artworks,
  onClose,
  onNav,
}: {
  art: Artwork | null
  artworks: Artwork[]
  onClose: () => void
  onNav: (a: Artwork) => void
}) {
  const idx = art ? artworks.findIndex((a) => a.id === art.id) : -1
  const closeRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<Element | null>(null)
  const go = useCallback(
    (dir: 1 | -1) => {
      if (idx < 0) return
      const next = artworks[(idx + dir + artworks.length) % artworks.length]
      if (next) onNav(next)
    },
    [idx, artworks, onNav]
  )

  useEffect(() => {
    if (!art) return
    previouslyFocused.current = document.activeElement
    // Move focus into the dialog for screen-reader + keyboard users.
    const t = setTimeout(() => closeRef.current?.focus(), 60)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      // Return focus to the thumbnail that opened the viewer.
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus({ preventScroll: true })
    }
  }, [art, go, onClose])

  // touch swipe
  useEffect(() => {
    if (!art) return
    let sx = 0
    const ts = (e: TouchEvent) => (sx = e.touches[0]?.clientX ?? 0)
    const te = (e: TouchEvent) => {
      const dx = (e.changedTouches[0]?.clientX ?? 0) - sx
      if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1)
    }
    window.addEventListener('touchstart', ts, { passive: true })
    window.addEventListener('touchend', te, { passive: true })
    return () => {
      window.removeEventListener('touchstart', ts)
      window.removeEventListener('touchend', te)
    }
  }, [art, go])

  return (
    <AnimatePresence>
      {art && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${art.title} viewer`}
        >
          <div className="absolute inset-0 bg-[#2b1530]/78 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.94, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 12, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-4xl max-h-[92dvh] overflow-auto rounded-2xl bg-[#FAF6EF] border border-[#e6dcc8] print-shadow p-3 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3 px-1 pb-3">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#8d857a]">{art.category}{art.year ? ` • ${art.year}` : ''}</p>
                <h3 className="font-serif-ed italic text-[24px] text-[#40203f] leading-tight">{art.title}</h3>
                {art.description && <p className="text-[14px] text-[#6d5f6b] mt-1 max-w-[60ch]">{art.description}</p>}
              </div>
              <button ref={closeRef} onClick={onClose} className="shrink-0 w-11 h-11 rounded-full bg-[#5b2b4e] text-white grid place-items-center hover:bg-[#40203f]" aria-label="Close viewer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-[#efe7d6] border border-[#e6dcc8] min-h-[240px] sm:min-h-[320px] grid place-items-center">
              <SmartImage
                path={art.image_path}
                alt={`${art.title} full view`}
                width={1600}
                sizes="100vw"
                draggable={false}
                className="w-full max-h-[68dvh] object-contain bg-[#efe7d6]"
              />
            </div>
            <div className="flex items-center justify-between pt-3 px-1">
              <button onClick={() => go(-1)} className="inline-flex items-center gap-2 rounded-full border border-[#5b2b4e]/30 px-5 py-2.5 font-semibold text-[#5b2b4e] hover:bg-[#5b2b4e]/5 min-h-[48px]" aria-label="Previous artwork">
                <ChevronLeft className="w-5 h-5" /> Prev
              </button>
              <span className="font-hand text-[20px] text-[#8a6f5c]">{idx + 1} / {artworks.length}</span>
              <button onClick={() => go(1)} className="inline-flex items-center gap-2 rounded-full border border-[#5b2b4e]/30 px-5 py-2.5 font-semibold text-[#5b2b4e] hover:bg-[#5b2b4e]/5 min-h-[48px]" aria-label="Next artwork">
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
