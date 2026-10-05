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

export interface TermsSection {
  id: string
  title: string
  body: string
  sort_order: number
}

export interface SiteConfig {
  id: string
  site_name: string
  tagline: string
  hero_title: string
}

export interface CommissionRequest {
  id: string
  name: string
  contact: string
  type: string
  details: string
  created_at: string
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

/** Temporary demo artwork — original flat-vector sample scenes with baked-in
 *  watermarks. Demo/development mode ONLY. Replace or remove anytime through
 *  the Artwork tab in the management studio; nothing here touches production. */
function demoArt(opts: {
  w: number
  h: number
  bg: string
  scene: string
  mark: string
  mx: number
  my: number
  rotate?: number
  fill?: string
  size?: number
  opacity?: number
}): string {
  const { w, h, bg, scene, mark, mx, my, rotate = 0, fill = '#ffffff', size = 30, opacity = 0.85 } = opts
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>` +
    `<rect width='${w}' height='${h}' fill='${bg}'/>${scene}` +
    `<g opacity='${opacity}'><text x='${mx}' y='${my}' text-anchor='middle' font-family='Verdana, sans-serif' font-size='${size}' font-weight='bold' letter-spacing='8' fill='${fill}' transform='rotate(${rotate} ${mx} ${my})'>${mark}</text></g></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const demoWanderer = demoArt({
  w: 960, h: 720, bg: '#E4D3B3',
  scene:
    `<circle cx='700' cy='180' r='90' fill='#C96F2E'/>` +
    `<path d='M0,560 Q240,460 480,550 T960,540 V720 H0 Z' fill='#8A7B52'/>` +
    `<path d='M0,620 Q300,560 640,620 T960,610 V720 H0 Z' fill='#5E6F3C'/>` +
    `<path d='M430,690 L468,445 L532,445 L570,690 Z' fill='#2E2B25'/>` +
    `<circle cx='500' cy='388' r='56' fill='#2E2B25'/>` +
    `<circle cx='500' cy='408' r='38' fill='#E8C39E'/>` +
    `<rect x='452' y='446' width='96' height='22' rx='4' fill='#B8491F'/>` +
    `<path d='M480,408 q10,8 20,0 M502,408 q10,8 20,0' stroke='#2E2B25' stroke-width='4' fill='none' stroke-linecap='round'/>` +
    `<path d='M180,200 q14,-12 28,0 q14,-12 28,0 M250,240 q12,-10 24,0' stroke='#2E2B25' stroke-width='4' fill='none' stroke-linecap='round'/>`,
  mark: 'DEMO ARTWORK', mx: 700, my: 668, fill: '#2E2B25', size: 28, opacity: 0.8,
})

const demoPortrait = demoArt({
  w: 800, h: 1000, bg: '#D9DCD2',
  scene:
    `<ellipse cx='400' cy='1020' rx='270' ry='190' fill='#4A443B'/>` +
    `<rect x='368' y='690' width='64' height='130' fill='#E8C39E'/>` +
    `<ellipse cx='400' cy='480' rx='205' ry='235' fill='#33302A'/>` +
    `<ellipse cx='400' cy='560' rx='150' ry='190' fill='#EBC39C'/>` +
    `<path d='M250,520 Q262,378 400,368 Q538,378 550,520 Q500,448 400,450 Q300,448 250,520 Z' fill='#33302A'/>` +
    `<path d='M308,560 q22,14 44,0 M448,560 q22,14 44,0' stroke='#33302A' stroke-width='6' fill='none' stroke-linecap='round'/>` +
    `<circle cx='330' cy='620' r='22' fill='#C96F2E' opacity='0.35'/><circle cx='470' cy='620' r='22' fill='#C96F2E' opacity='0.35'/>` +
    `<ellipse cx='400' cy='672' rx='26' ry='10' fill='#A34A2E'/>` +
    `<circle cx='548' cy='640' r='10' fill='#B8491F'/>`,
  mark: 'SAMPLE ART', mx: 400, my: 500, rotate: -16, fill: '#ffffff', size: 32, opacity: 0.55,
})

const demoWayfarer = demoArt({
  w: 800, h: 1120, bg: '#D5D2C9',
  scene:
    `<rect x='0' y='980' width='800' height='140' fill='#B9B09A'/>` +
    `<ellipse cx='400' cy='985' rx='150' ry='18' fill='#2E2B25' opacity='0.2'/>` +
    `<line x1='352' y1='370' x2='298' y2='570' stroke='#3E5C50' stroke-width='46' stroke-linecap='round'/>` +
    `<line x1='448' y1='370' x2='502' y2='570' stroke='#3E5C50' stroke-width='46' stroke-linecap='round'/>` +
    `<path d='M340,320 L460,320 L482,650 L318,650 Z' fill='#3E5C50'/>` +
    `<rect x='318' y='470' width='164' height='26' fill='#2E2B25'/>` +
    `<rect x='352' y='650' width='36' height='230' fill='#2E2B25'/>` +
    `<rect x='412' y='650' width='36' height='230' fill='#2E2B25'/>` +
    `<rect x='344' y='872' width='52' height='60' rx='8' fill='#2E2B25'/>` +
    `<rect x='404' y='872' width='52' height='60' rx='8' fill='#2E2B25'/>` +
    `<circle cx='400' cy='222' r='56' fill='#E8C39E'/>` +
    `<path d='M344,222 a56,56 0 0 1 112,0 L500,200 Q480,140 400,140 Q320,140 300,200 Z' fill='#2E2B25'/>` +
    `<path d='M460,300 Q560,340 590,460 Q520,440 470,380 Z' fill='#B8491F'/>` +
    `<circle cx='384' cy='222' r='5' fill='#2E2B25'/><circle cx='416' cy='222' r='5' fill='#2E2B25'/>`,
  mark: 'PORTFOLIO DEMO', mx: 400, my: 92, fill: '#2E2B25', size: 30, opacity: 0.75,
})

const demoSketch = demoArt({
  w: 960, h: 720, bg: '#F1EDE2',
  scene:
    `<defs><pattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'><path d='M40,0H0V40' fill='none' stroke='#D8D2C2' stroke-width='1'/></pattern></defs>` +
    `<rect width='960' height='720' fill='url(#grid)'/>` +
    `<circle cx='480' cy='290' r='110' fill='none' stroke='#8A8378' stroke-width='3' stroke-dasharray='10 8'/>` +
    `<line x1='480' y1='150' x2='480' y2='700' stroke='#8A8378' stroke-width='2' stroke-dasharray='6 8'/>` +
    `<line x1='340' y1='290' x2='620' y2='290' stroke='#8A8378' stroke-width='2' stroke-dasharray='6 8'/>` +
    `<path d='M480,400 C470,500 448,590 428,690 M480,400 C492,500 512,590 532,690' fill='none' stroke='#6F675B' stroke-width='5' stroke-linecap='round'/>` +
    `<path d='M380,470 Q480,440 580,470 M390,560 Q480,535 570,560' fill='none' stroke='#6F675B' stroke-width='4' stroke-linecap='round'/>` +
    `<path d='M680,180 l40,40 M720,180 l-40,40' stroke='#8A8378' stroke-width='4' stroke-linecap='round'/>` +
    `<circle cx='240' cy='540' r='46' fill='none' stroke='#8A8378' stroke-width='3'/>` +
    `<path d='M700,540 h90 m0,0 l-18,-14 m18,14 l-18,14' stroke='#6F675B' stroke-width='4' fill='none' stroke-linecap='round'/>`,
  mark: 'SAMPLE ART', mx: 480, my: 668, fill: '#6F675B', size: 28, opacity: 0.7,
})

const demoNightTide = demoArt({
  w: 1040, h: 720, bg: '#26355E',
  scene:
    `<circle cx='830' cy='200' r='118' fill='#E0A83C'/>` +
    `<circle cx='205' cy='175' r='68' fill='#EFE7D2'/><circle cx='232' cy='158' r='58' fill='#26355E'/>` +
    `<circle cx='120' cy='420' r='5' fill='#ffffff'/><circle cx='420' cy='140' r='4' fill='#ffffff'/><circle cx='620' cy='330' r='5' fill='#ffffff'/><circle cx='940' cy='420' r='4' fill='#ffffff'/>` +
    `<path d='M500,120 h26 m-13,-13 v26 M150,300 h22 m-11,-11 v22' stroke='#ffffff' stroke-width='4' stroke-linecap='round'/>` +
    `<path d='M0,520 Q130,470 260,515 T520,510 T780,515 T1040,505 V720 H0 Z' fill='#3E7C8C'/>` +
    `<path d='M0,590 Q160,545 320,585 T640,580 T1040,575 V720 H0 Z' fill='#C96F2E'/>` +
    `<path d='M0,655 Q200,625 400,650 T800,645 T1040,645 V720 H0 Z' fill='#EFE7D2'/>` +
    `<path d='M300,420 q14,-12 28,0 q14,-12 28,0' stroke='#EFE7D2' stroke-width='5' fill='none' stroke-linecap='round'/>`,
  mark: 'DEMO ARTWORK', mx: 800, my: 660, fill: '#ffffff', size: 30, opacity: 0.85,
})

const demoInkGarden = demoArt({
  w: 960, h: 720, bg: '#EDE8DC',
  scene:
    `<ellipse cx='300' cy='480' rx='120' ry='150' fill='#1E1C18' opacity='0.92'/>` +
    `<ellipse cx='650' cy='420' rx='90' ry='170' fill='#1E1C18' opacity='0.85'/>` +
    `<path d='M300,180 V560 M650,120 V560' stroke='#1E1C18' stroke-width='22' stroke-linecap='round'/>` +
    `<ellipse cx='220' cy='300' rx='70' ry='26' fill='#1E1C18' transform='rotate(-24 220 300)'/>` +
    `<ellipse cx='390' cy='250' rx='70' ry='26' fill='#1E1C18' transform='rotate(22 390 250)'/>` +
    `<ellipse cx='580' cy='220' rx='64' ry='24' fill='#1E1C18' transform='rotate(-20 580 220)'/>` +
    `<ellipse cx='730' cy='290' rx='64' ry='24' fill='#1E1C18' transform='rotate(24 730 290)'/>` +
    `<circle cx='150' cy='600' r='8' fill='#1E1C18'/><circle cx='830' cy='600' r='6' fill='#1E1C18'/><circle cx='790' cy='150' r='7' fill='#1E1C18'/><circle cx='180' cy='120' r='5' fill='#1E1C18'/>` +
    `<rect x='806' y='586' width='64' height='64' rx='6' fill='#A33A22'/>` +
    `<path d='M820,600 h36 M820,614 h36 M820,628 h22' stroke='#EDE8DC' stroke-width='6' stroke-linecap='round'/>`,
  mark: 'SAMPLE ART', mx: 740, my: 92, fill: '#1E1C18', size: 26, opacity: 0.6,
})

const demoValley = demoArt({
  w: 1120, h: 720, bg: '#CFDDD6',
  scene:
    `<circle cx='880' cy='150' r='70' fill='#D9A441'/>` +
    `<ellipse cx='240' cy='150' rx='110' ry='34' fill='#ffffff' opacity='0.9'/>` +
    `<ellipse cx='330' cy='130' rx='80' ry='28' fill='#ffffff' opacity='0.9'/>` +
    `<path d='M0,420 Q280,280 560,400 T1120,380 V560 H0 Z' fill='#9AA88F'/>` +
    `<path d='M0,500 Q300,400 620,480 T1120,470 V580 H0 Z' fill='#6F7F5C'/>` +
    `<path d='M700,380 l36,-70 36,70 Z M780,395 l30,-58 30,58 Z' fill='#33402E'/>` +
    `<path d='M0,560 H1120 V720 H0 Z' fill='#7FA3A8'/>` +
    `<path d='M180,620 h120 M420,660 h180 M700,620 h140' stroke='#ffffff' stroke-width='5' stroke-linecap='round' opacity='0.7'/>` +
    `<path d='M480,240 q14,-12 28,0 q14,-12 28,0 M560,200 q12,-10 24,0' stroke='#33402E' stroke-width='5' fill='none' stroke-linecap='round'/>`,
  mark: 'YOUR ART HERE', mx: 205, my: 655, fill: '#26352A', size: 28, opacity: 0.7,
})

const demoEye = demoArt({
  w: 800, h: 800, bg: '#E2D9C6',
  scene:
    `<path d='M120,330 Q400,300 680,330' fill='none' stroke='#1E1C18' stroke-width='26' stroke-linecap='round'/>` +
    `<path d='M120,430 Q400,250 680,430 Q400,610 120,430 Z' fill='#F1EDE2' stroke='#1E1C18' stroke-width='10'/>` +
    `<circle cx='400' cy='430' r='122' fill='#3E6B6F'/>` +
    `<circle cx='400' cy='430' r='122' fill='none' stroke='#1E1C18' stroke-width='6'/>` +
    `<circle cx='400' cy='430' r='56' fill='#141311'/>` +
    `<circle cx='438' cy='392' r='22' fill='#ffffff'/>` +
    `<path d='M200,330 L150,270 M300,300 L265,235 M500,300 L535,235 M600,330 L650,270' stroke='#1E1C18' stroke-width='9' stroke-linecap='round'/>` +
    `<circle cx='120' cy='650' r='34' fill='#B8491F' opacity='0.85'/>`,
  mark: 'PORTFOLIO DEMO', mx: 400, my: 400, rotate: -12, fill: '#ffffff', size: 30, opacity: 0.65,
})

export const PLACEHOLDER_ARTWORKS: Artwork[] = [
  { id: 'a1', title: 'Wanderer at Dusk', category: 'Illustration', description: 'Original character illustration — a lone traveler under a paper sun.', image_path: demoWanderer, year: '2025', featured: true, sort_order: 1 },
  { id: 'a2', title: 'Quiet Gaze', category: 'Portrait', description: 'Portrait study in muted earth tones.', image_path: demoPortrait, year: '2025', featured: true, sort_order: 2 },
  { id: 'a3', title: 'Wayfarer, Full Length', category: 'Character', description: 'Full-body character concept with travel cloak and scarf.', image_path: demoWayfarer, year: '2024', featured: true, sort_order: 3 },
  { id: 'a4', title: 'Figure Construction', category: 'Sketch', description: 'Pencil-style construction sketch with guide lines.', image_path: demoSketch, year: '2024', featured: true, sort_order: 4 },
  { id: 'a5', title: 'Night Tide', category: 'Illustration', description: 'Bold flat-color night scene with sun, moon, and waves.', image_path: demoNightTide, year: '2025', featured: true, sort_order: 5 },
  { id: 'a6', title: 'Ink Garden', category: 'Ink Study', description: 'Monochrome brush study with a single vermilion seal.', image_path: demoInkGarden, year: '2023', featured: true, sort_order: 6 },
  { id: 'a7', title: 'Still Valley', category: 'Environment', description: 'Layered hill-and-lake environment sketch.', image_path: demoValley, year: '2024', featured: true, sort_order: 7 },
  { id: 'a8', title: 'Eye Study', category: 'Detail', description: 'Close-up detail study of an eye in flat color.', image_path: demoEye, year: '2025', featured: true, sort_order: 8 },
]

export const PLACEHOLDER_CONFIG: SiteConfig = {
  id: 'default',
  site_name: 'Lorem Ipsum',
  tagline: 'Lorem ipsum dolor sit amet',
  hero_title: 'It’s Lorem!',
}

export const PLACEHOLDER_TERMS: TermsSection[] = [
  { id: 't1', title: '1. Lorem ipsum', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', sort_order: 1 },
  { id: 't2', title: '2. Dolor sit', body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', sort_order: 2 },
  { id: 't3', title: '3. Amet consectetur', body: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', sort_order: 3 },
  { id: 't4', title: '4. Adipiscing elit', body: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', sort_order: 4 },
  { id: 't5', title: '5. Sed do eiusmod', body: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.', sort_order: 5 },
  { id: 't6', title: '6. Tempor incididunt', body: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.', sort_order: 6 },
  { id: 't7', title: '7. Ut labore', body: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.', sort_order: 7 },
]
