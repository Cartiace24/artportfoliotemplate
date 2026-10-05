import { useSiteConfig } from '../hooks/useSiteContent'
import { resolveTheme } from '../lib/theme'
import { About as ClassicAbout } from '../themes/classic/AboutPage'
import { PainterlyAbout } from '../themes/painterly/AboutPage'

export function About() {
  const { config } = useSiteConfig()
  return resolveTheme(config.theme) === 'painterly' ? <PainterlyAbout /> : <ClassicAbout />
}
