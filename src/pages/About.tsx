import { useSiteConfig } from '../hooks/useSiteContent'
import { useActiveTheme } from '../lib/theme'
import { About as ClassicAbout } from '../themes/classic/AboutPage'
import { PainterlyAbout } from '../themes/painterly/AboutPage'

export function About() {
  const { config } = useSiteConfig()
  return useActiveTheme(config.theme) === 'painterly' ? <PainterlyAbout /> : <ClassicAbout />
}
