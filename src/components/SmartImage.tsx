import { useState } from 'react'
import { artImage } from '../lib/images'

interface SmartImageProps {
  path: string | null | undefined
  alt: string
  className?: string
  width?: number
  sizes?: string
  eager?: boolean
  draggable?: boolean
}

/**
 * Artwork <img> with Supabase-rendered responsive sizes.
 * If the render API is unavailable it falls back to the original file,
 * so images never break when transformations are disabled.
 */
export function SmartImage({
  path,
  alt,
  className,
  width = 900,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
  eager = false,
  draggable = true,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false)
  const { src, srcSet, fallback } = artImage(path, width)
  const current = failed ? fallback : src

  if (!current) {
    return (
      <div className={`grid place-items-center bg-[#efe7d6] ${className ?? ''}`} role="img" aria-label={`${alt} — image unavailable`}>
        <span className="font-hand text-[22px] text-[#8a6f5c]">♡</span>
      </div>
    )
  }

  return (
    <img
      src={current}
      srcSet={failed ? undefined : srcSet}
      sizes={failed ? undefined : sizes}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={draggable}
      onError={() => {
        if (!failed && fallback && current !== fallback) setFailed(true)
      }}
    />
  )
}
