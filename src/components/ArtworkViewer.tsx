import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import type { Artwork } from '../lib/types'
import type { ThemeName } from '../lib/theme'
import { SmartImage } from './SmartImage'

/**
 * Shared fullscreen artwork viewer. All behavior (keyboard, swipe, focus
 * trap + return, scroll lock) is identical in every theme — only the
 * presentation changes via the `theme` prop.
 */
export function ArtworkViewer({
  art,
  artworks,
  onClose,
  onNav,
  theme = 'classic',
}: {
  art: Artwork | null
  artworks: Artwork[]
  onClose: () => void
  onNav: (a: Artwork) => void
  theme?: ThemeName
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

  const pt = theme === 'painterly'

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
          <div className={`absolute inset-0 ${pt ? 'bg-[#101736]/95' : 'bg-dark/95'}`} onClick={onClose} />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full max-w-5xl max-h-[92dvh] overflow-auto p-4 sm:p-6 ${
              pt ? 'bg-[var(--pt-paper)] border-2 border-[var(--pt-ink)]' : 'bg-paper'
            }`}
          >
            {pt && <span aria-hidden className="pt-tape -top-3 left-10 -rotate-3" />}
            <div className={`flex items-center justify-between gap-3 pb-3 border-b ${pt ? 'border-[var(--pt-ink)]' : 'border-ink'}`}>
              <p className={`font-mono text-[11px] tracking-[0.18em] uppercase ${pt ? 'text-[var(--pt-brown)]' : 'text-muted'}`}>
                Fig. {String(idx + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
              </p>
              <button
                ref={closeRef}
                onClick={onClose}
                className={`inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.1em] uppercase min-w-[44px] min-h-[44px] justify-center transition-colors ${
                  pt ? 'text-[var(--pt-ink)] hover:text-[var(--pt-ochre)]' : 'text-ink hover:text-accent'
                }`}
                aria-label="Close viewer"
              >
                Close <X className="w-4 h-4" aria-hidden />
              </button>
            </div>
            <div className="pt-4">
              <h3 className={pt ? 'pt-hand text-[32px] sm:text-[36px] leading-tight text-[var(--pt-ink)]' : 'font-note text-[30px] sm:text-[34px] leading-tight text-ink'}>
                {art.title}
              </h3>
              <p className={`mt-1 font-mono text-[11px] tracking-[0.14em] uppercase ${pt ? 'text-[var(--pt-brown)]' : 'text-muted'}`}>
                {art.category}{art.year ? ` — ${art.year}` : ''}
              </p>
              {art.description && (
                <p className={`text-[14.5px] leading-relaxed mt-3 max-w-[62ch] ${pt ? 'text-[#3d3a52]' : 'text-ink-soft'}`}>
                  {art.description}
                </p>
              )}
            </div>
            <div className={`mt-4 overflow-hidden min-h-[240px] sm:min-h-[320px] ${pt ? 'border-2 border-[var(--pt-ink)] bg-[var(--pt-canvas)]' : 'mat bg-parchment'}`}>
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
                className={`inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.1em] uppercase min-h-[48px] transition-colors ${
                  pt ? 'text-[var(--pt-ink)] hover:text-[var(--pt-ochre)]' : 'text-ink hover:text-accent'
                }`}
                aria-label="Previous artwork"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden /> Prev
              </button>
              <button
                onClick={() => go(1)}
                className={`inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.1em] uppercase min-h-[48px] transition-colors ${
                  pt ? 'text-[var(--pt-ink)] hover:text-[var(--pt-ochre)]' : 'text-ink hover:text-accent'
                }`}
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
