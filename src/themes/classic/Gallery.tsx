import { useState } from 'react'
import { motion } from 'motion/react'
import type { Artwork } from '../../lib/types'
import { SmartImage } from '../../components/SmartImage'

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
  const categories = [...new Set(artworks.map((art) => art.category))]
  const [activeCategory, setActiveCategory] = useState('All')
  const visibleArtworks = activeCategory === 'All' ? artworks : artworks.filter((art) => art.category === activeCategory)

  return (
    <>
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2" aria-label="Filter artwork by category">
          {['All', ...categories].map((category) => {
            const selected = activeCategory === category
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={selected}
                className={`min-h-[44px] border px-3.5 py-2 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors ${
                  selected ? 'border-ink bg-ink text-cream' : 'border-line text-ink hover:border-ink'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-12 md:gap-y-8">
        {visibleArtworks.slice(0, 12).map((a, i) => (
          <ArtworkCard key={a.id} art={a} onOpen={onOpen} index={i} slot={slotFor(i)} />
        ))}
      </div>
    </>
  )
}

// Fullscreen viewing lives in the shared theme-aware viewer so every
// theme keeps identical keyboard, swipe, and focus behavior.
export { ArtworkViewer } from '../../components/ArtworkViewer'
