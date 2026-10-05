import { useEffect } from 'react'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export interface PageMetaProps {
  title: string
  description: string
  image?: string | null
  path?: string
}

/** Sets document title + meta/OG tags per route. Runs client-side only. */
export function PageMeta({ title, description, image, path }: PageMetaProps) {
  useEffect(() => {
    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', 'website')
    if (path) upsertMeta('property', 'og:url', `${window.location.origin}${path}`)
    if (image) upsertMeta('property', 'og:image', image)
  }, [title, description, image, path])
  return null
}
