import { createContext, useContext } from 'react'

/** Public portfolio visual theme. Persisted in site_config.theme. */
export type ThemeName = 'classic' | 'painterly'

export const ActiveThemeContext = createContext<ThemeName | null>(null)

export const THEMES: { id: ThemeName; label: string; blurb: string }[] = [
  { id: 'classic', label: 'Classic', blurb: 'The original sketchbook wall.' },
  { id: 'painterly', label: 'Painterly', blurb: 'Oil-paint sketchbook in ultramarine & ochre.' },
]

/** Unknown/missing values always fall back to classic. Never throws. */
export function resolveTheme(value: unknown): ThemeName {
  return value === 'painterly' ? 'painterly' : 'classic'
}

/** Lets public pages follow a visitor preview or a forced showcase theme. */
export function useActiveTheme(fallback: unknown): ThemeName {
  return useContext(ActiveThemeContext) ?? resolveTheme(fallback)
}
