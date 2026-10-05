export type CommissionStatus = 'open' | 'closed'

export interface SiteSettings {
  id: string
  commission_status: CommissionStatus
  commission_message: string | null
  available_slots: number | null
  updated_at: string | null
}

export interface Artwork {
  id: string
  title: string
  description: string | null
  category: string
  image_path: string
  year: string | null
  featured: boolean
  sort_order: number
}

export interface CommissionCategory {
  id: string
  name: string
  sort_order: number
}

export interface CommissionPrice {
  id: string
  category_id: string
  type: string // Bust | Half | Full
  price: number
  enabled: boolean
  sort_order: number
  category_name?: string
}

export interface AboutContent {
  id: string
  bio: string
  short_description: string | null
  profile_image_path: string | null
  interests: string[]
  subjects: string[]
  signature: string | null
}

export interface SocialLink {
  id: string
  platform: string
  url: string
  display_name: string | null
  enabled: boolean
  sort_order: number
}

/* ---------- Placeholder content (used when Supabase is not configured) ---------- */

export const PLACEHOLDER_SETTINGS: SiteSettings = {
  id: 'default',
  commission_status: 'open',
  commission_message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  available_slots: 3,
  updated_at: null,
}

export const PLACEHOLDER_ABOUT: AboutContent = {
  id: 'default',
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  short_description: 'Lorem ipsum dolor sit amet',
  profile_image_path: null,
  interests: ['Lorem', 'Ipsum', 'Dolor', 'Sit amet', 'Consectetur', 'Adipiscing'],
  subjects: ['Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet'],
  signature: '— Lorem ipsum',
}

export const PLACEHOLDER_CATEGORIES: CommissionCategory[] = [
  { id: 'cat-lorem', name: 'Lorem', sort_order: 1 },
  { id: 'cat-ipsum', name: 'Ipsum', sort_order: 2 },
]

export const PLACEHOLDER_PRICES: CommissionPrice[] = [
  { id: 'p1', category_id: 'cat-lorem', type: 'Bust', price: 10, enabled: true, sort_order: 1, category_name: 'Lorem' },
  { id: 'p2', category_id: 'cat-lorem', type: 'Half', price: 15, enabled: true, sort_order: 2, category_name: 'Lorem' },
  { id: 'p3', category_id: 'cat-lorem', type: 'Full', price: 25, enabled: true, sort_order: 3, category_name: 'Lorem' },
  { id: 'p4', category_id: 'cat-ipsum', type: 'Bust', price: 25, enabled: true, sort_order: 1, category_name: 'Ipsum' },
  { id: 'p5', category_id: 'cat-ipsum', type: 'Half', price: 40, enabled: true, sort_order: 2, category_name: 'Ipsum' },
  { id: 'p6', category_id: 'cat-ipsum', type: 'Full', price: 60, enabled: true, sort_order: 3, category_name: 'Ipsum' },
]

export const PLACEHOLDER_SOCIALS: SocialLink[] = [
  { id: 's1', platform: 'X', url: '#', display_name: 'lorem ipsum', enabled: true, sort_order: 1 },
  { id: 's2', platform: 'Instagram', url: '#', display_name: 'lorem ipsum', enabled: true, sort_order: 2 },
  { id: 's3', platform: 'TikTok', url: '#', display_name: 'lorem ipsum', enabled: true, sort_order: 3 },
  { id: 's4', platform: 'Twitch', url: '#', display_name: 'lorem ipsum', enabled: true, sort_order: 4 },
  { id: 's5', platform: 'Ko-fi', url: '#', display_name: 'lorem ipsum', enabled: true, sort_order: 5 },
  { id: 's6', platform: 'Cara', url: '#', display_name: 'lorem ipsum', enabled: true, sort_order: 6 },
]

/** Offline-safe grey placeholder boxes (data-URI SVG) — no external images. */
function loremBox(label: string, w: number, h: number) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='#e6dfd1'/><rect x='14' y='14' width='${w - 28}' height='${h - 28}' fill='none' stroke='#b6ab9c' stroke-width='2' stroke-dasharray='8 6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Georgia, serif' font-style='italic' font-size='26' fill='#8d857a'>${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const PLACEHOLDER_ARTWORKS: Artwork[] = [
  { id: 'a1', title: 'Lorem ipsum dolor', category: 'Lorem', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', image_path: loremBox('Lorem ipsum', 900, 600), year: '2025', featured: true, sort_order: 1 },
  { id: 'a2', title: 'Consectetur adipiscing', category: 'Lorem', description: 'Sed do eiusmod tempor incididunt ut labore et dolore.', image_path: loremBox('Dolor sit', 600, 600), year: '2025', featured: true, sort_order: 2 },
  { id: 'a3', title: 'Sed do eiusmod', category: 'Lorem', description: 'Ut enim ad minim veniam, quis nostrud exercitation.', image_path: loremBox('Amet', 600, 600), year: '2024', featured: true, sort_order: 3 },
  { id: 'a4', title: 'Tempor incididunt', category: 'Lorem', description: 'Ullamco laboris nisi ut aliquip ex ea commodo.', image_path: loremBox('Consectetur', 800, 560), year: '2024', featured: true, sort_order: 4 },
  { id: 'a5', title: 'Ut labore et dolore', category: 'Lorem', description: 'Duis aute irure dolor in reprehenderit in voluptate.', image_path: loremBox('Adipiscing', 700, 560), year: '2025', featured: true, sort_order: 5 },
  { id: 'a6', title: 'Magna aliqua', category: 'Lorem', description: 'Excepteur sint occaecat cupidatat non proident.', image_path: loremBox('Elit sed', 800, 560), year: '2023', featured: true, sort_order: 6 },
]
