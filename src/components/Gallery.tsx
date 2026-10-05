import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import type { Artwork } from '../lib/types'
import { SmartImage } from './SmartImage'

interface WallSlot {
  span: string
  aspect: string
  rotate: string
  mat: boolean
  offset: string
}

// Two alternating patterns so large galleries never visibly repeat.
const WALL_A: WallSlot[] = [
  { span: 'md:col-span-12', aspect: 'aspect-[4/3] md:aspect-[21/9]', rotate: '', mat: false, offset: '' },
  { span: 'md:col-span-7', aspect: 'aspect-[4/3]', rotate: 'md:-rotate-1', mat: true, offset: '' },
  { span: 'md:col-span-5', aspect: 'aspect-[4/3] md:aspect-[3/4]', rotate: 'md:rotate-1', mat: true, offset: 'md:mt-14' },
  { span: 'md:col-span-5', aspect: 'aspect-[4/3]', rotate: 'md:-rotate-[0.5deg]', mat: false, offset: '' },
  { span: 'md:col-span-7', aspect: 'aspect-[4/3] md:aspect-[16/10]', rotate: 'md:rotate-[0.5deg]', mat: true, offset: 'md:-mt-6' },
  { span: 'md:col-span-12', aspect: 'aspect-[4/3] md:aspect-[21/9]', rotate: '', mat: false, offset: '' },
]

const WALL_B: WallSlot[] = [
  { span: 'md:col-span-12', aspect: 'aspect-[4/3] md:aspect-[16/10]', rotate: '', mat: false, offset: '' },
  { span: 'md:col-span-5', aspect: 'aspect-[4/3] md:aspect-[3/4]', rotate: 'md:rotate-1', mat: true, offset: '' },
  { span: 'md:col-span-7', aspect: 'aspect-[4/3]', rotate: 'md:-rotate-1', mat: true, offset: 'md:mt-10' },
  { span: 'md:col-span-7', aspect: 'aspect-[4/3] md:aspect-[16/10]', rotate: 'md:rotate-[0.5deg]', mat: false, offset: '' },
  { span: 'md:col-span-5', aspect: 'aspect-[4/3]', rotate: 'md:-rotate-[0.5deg]', mat: true, offset: '' },
  { span: 'md:col-span-6 md:col-start-4', aspect: 'aspect-[16/10]', rotate: 'md:rotate-1', mat: true, offset: 'md:mt-6' },
]

function slotFor(i: number): WallSlot {
  const loop = Math.floor(i / 6) % 2
  const pattern = loop === 0 ? WALL_A : WALL_B
  return pattern[i % 6]!
}

export function ArtworkCard({
  art,
  onOpen,
  index,
  slot,
}: {
  art: Artwork
  onOpen: (art: Artwork) => void
  index: number
  slot: WallSlot
}) {
  const num = String(index + 1).padStart(2, '0')
  return (
    <motion.figure
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`${slot.span} ${slot.offset} ${slot.rotate}`}
    >
      <button
        onClick={() => onOpen(art)}
        className="group block w-full text-left min-h-[48px]"
        aria-label={`Open ${art.title} (${art.category}) — view larger`}
        aria-haspopup="dialog"
      >
        <span className={`relative block ${slot.mat ? 'mat' : 'frame'} ${slot.rotate ? 'hard-shadow' : ''} overflow-hidden bg-parchment`}>
          <SmartImage
            path={art.image_path}
            alt={`${art.title} — ${art.category}`}
            width={slot.span.includes('12') ? 1600 : 1000}
            sizes={slot.span.includes('12') ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
            className={`w-full ${slot.aspect} object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]`}
          />
        </span>
        <figcaption className="flex items-baseline justify-between gap-3 pt-2">
          <span className="flex items-baseline gap-2 min-w-0">
            <span className="font-mono text-[11px] text-accent shrink-0" aria-hidden>{num}</span>
            <span className="font-note text-[21px] leading-tight text-ink truncate group-hover:text-accent-deep transition-colors">
              {art.title}
            </span>
          </span>
          <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-muted shrink-0">
            {art.category}{art.year ? ` ’${art.year.slice(2)}` : ''}
          </span>
        </figcaption>
      </button>
    </motion.figure>
  )
}

export function FeaturedGallery({ artworks, onOpen }: { artworks: Artwork[]; onOpen: (a: Artwork) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-12 md:gap-y-8">
      {artworks.slice(0, 12).map((a, i) => (
        <ArtworkCard key={a.id} art={a} onOpen={onOpen} index={i} slot={slotFor(i)} />
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
          <div className="absolute inset-0 bg-dark/95" onClick={onClose} />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-5xl max-h-[92dvh] overflow-auto bg-paper p-4 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-ink">
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted">
                Fig. {String(idx + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
              </p>
              <button
                ref={closeRef}
                onClick={onClose}
                className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.1em] uppercase text-ink hover:text-accent transition-colors min-w-[44px] min-h-[44px] justify-center"
                aria-label="Close viewer"
              >
                Close <X className="w-4 h-4" aria-hidden />
              </button>
            </div>
            <div className="pt-4">
              <h3 className="font-note text-[30px] sm:text-[34px] leading-tight text-ink">{art.title}</h3>
              <p className="mt-1 font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
                {art.category}{art.year ? ` — ${art.year}` : ''}
              </p>
              {art.description && <p className="text-[14.5px] leading-relaxed text-ink-soft mt-3 max-w-[62ch]">{art.description}</p>}
            </div>
            <div className="mat mt-4 overflow-hidden bg-parchment min-h-[240px] sm:min-h-[320px]">
              <SmartImage
                path={art.image_path}
                alt={`${art.title} full view`}
                width={1600}
                sizes="100vw"
                draggable={false}
                className="w-full max-h-[62dvh] object-contain"
              />
            </div>
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => go(-1)}
                className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.1em] uppercase text-ink hover:text-accent transition-colors min-h-[48px]"
                aria-label="Previous artwork"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden /> Prev
              </button>
              <button
                onClick={() => go(1)}
                className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.1em] uppercase text-ink hover:text-accent transition-colors min-h-[48px]"
                aria-label="Next artwork"
              >
                Next <ArrowRight className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
