/** Public portfolio visual theme. Persisted in site_config.theme. */
export type ThemeName = 'classic' | 'painterly'

export const THEMES: { id: ThemeName; label: string; blurb: string }[] = [
  { id: 'classic', label: 'Classic', blurb: 'The original sketchbook wall.' },
  { id: 'painterly', label: 'Painterly', blurb: 'Oil-paint sketchbook in ultramarine & ochre.' },
]

/** Unknown/missing values always fall back to classic. Never throws. */
export function resolveTheme(value: unknown): ThemeName {
  return value === 'painterly' ? 'painterly' : 'classic'
}
