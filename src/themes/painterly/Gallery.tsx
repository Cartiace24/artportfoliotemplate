import { useState } from 'react'
import { motion } from 'motion/react'
import type { Artwork } from '../../lib/types'
import { SmartImage } from '../../components/SmartImage'
import { PTape } from './bits'

interface PSlot {
  span: string
  aspect: string
  rotate: string
  offset: string
  tape: boolean
}

// Deliberately different rhythm from the Classic wall: tighter clusters,
// stronger tilts, staggered vertical offsets on both sides.
const PWALL: PSlot[] = [
  { span: 'md:col-span-8', aspect: 'aspect-[4/3] md:aspect-[16/11]', rotate: 'md:-rotate-2', offset: '', tape: true },
  { span: 'md:col-span-4', aspect: 'aspect-[4/3] md:aspect-[3/4]', rotate: 'md:rotate-2', offset: 'md:mt-16', tape: true },
  { span: 'md:col-span-4', aspect: 'aspect-square', rotate: 'md:rotate-[1.5deg]', offset: 'md:-mt-6', tape: false },
  { span: 'md:col-span-8', aspect: 'aspect-[4/3] md:aspect-[16/9]', rotate: 'md:-rotate-1', offset: '', tape: true },
  { span: 'md:col-span-6', aspect: 'aspect-[4/3]', rotate: 'md:rotate-[1deg]', offset: 'md:mt-8', tape: true },
  { span: 'md:col-span-6', aspect: 'aspect-[4/3]', rotate: 'md:-rotate-2', offset: '', tape: false },
]

const PWALL_B: PSlot[] = [
  { span: 'md:col-span-12', aspect: 'aspect-[4/3] md:aspect-[21/9]', rotate: '', offset: '', tape: true },
  { span: 'md:col-span-6', aspect: 'aspect-[4/3]', rotate: 'md:-rotate-[1.5deg]', offset: '', tape: false },
  { span: 'md:col-span-6', aspect: 'aspect-[4/3]', rotate: 'md:rotate-2', offset: 'md:mt-12', tape: true },
  { span: 'md:col-span-4', aspect: 'aspect-[3/4]', rotate: 'md:rotate-1', offset: '', tape: true },
  { span: 'md:col-span-8', aspect: 'aspect-[4/3] md:aspect-[16/10]', rotate: 'md:-rotate-1', offset: 'md:mt-6', tape: false },
  { span: 'md:col-span-7 md:col-start-3', aspect: 'aspect-[16/10]', rotate: 'md:rotate-[1.5deg]', offset: '', tape: true },
]

function slotFor(i: number): PSlot {
  const pattern = Math.floor(i / 6) % 2 === 0 ? PWALL : PWALL_B
  return pattern[i % 6]!
}

export function PArtworkCard({
  art,
  onOpen,
  index,
  slot,
}: {
  art: Artwork
  onOpen: (art: Artwork) => void
  index: number
  slot: PSlot
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 26 }}
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
        <span className="relative block bg-[var(--pt-cream)] border-2 border-[var(--pt-ink)] p-2 pb-0 overflow-visible">
          {slot.tape && <PTape className="-top-4 left-1/2 -translate-x-1/2 -rotate-2" />}
          <span className="block overflow-hidden border border-[var(--pt-ink)]/30 bg-[var(--pt-canvas)]">
            <SmartImage
              path={art.image_path}
              alt={`${art.title} — ${art.category}`}
              width={slot.span.includes('12') ? 1600 : 1000}
              sizes={slot.span.includes('12') ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
              className={`w-full ${slot.aspect} object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] group-hover:rotate-[0.5deg]`}
            />
          </span>
        </span>
        <figcaption className="flex items-baseline justify-between gap-3 pt-2">
          <span className="pt-hand text-[24px] leading-tight text-[var(--pt-ink)] truncate group-hover:text-[var(--pt-ochre)] transition-colors">
            {art.title}
          </span>
          <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--pt-brown)] shrink-0">
            {art.category}{art.year ? ` ’${art.year.slice(2)}` : ''}
          </span>
        </figcaption>
      </button>
    </motion.figure>
  )
}

export function PGallery({ artworks, onOpen }: { artworks: Artwork[]; onOpen: (a: Artwork) => void }) {
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
                className={`min-h-[44px] border-2 px-3.5 py-2 pt-hand text-[20px] transition-colors ${
                  selected
                    ? 'border-[var(--pt-ink)] bg-[var(--pt-sun)] text-[var(--pt-ink)]'
                    : 'border-[var(--pt-ink)]/35 text-[var(--pt-ink)] hover:border-[var(--pt-ochre)] hover:text-[var(--pt-ochre)]'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-12 md:gap-y-10">
        {visibleArtworks.slice(0, 12).map((a, i) => (
          <PArtworkCard key={a.id} art={a} onOpen={onOpen} index={i} slot={slotFor(i)} />
        ))}
      </div>
    </>
  )
}

export { ArtworkViewer as PArtworkViewer } from '../../components/ArtworkViewer'
