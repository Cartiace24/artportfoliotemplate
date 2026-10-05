import { useSiteConfig } from '../hooks/useSiteContent'
import { useActiveTheme } from '../lib/theme'
import { Home as ClassicHome } from '../themes/classic/Home'
import { PainterlyHome } from '../themes/painterly/Home'

/** Route stays stable — the theme decides which design renders. */
export function Home() {
  const { config } = useSiteConfig()
  return useActiveTheme(config.theme) === 'painterly' ? <PainterlyHome /> : <ClassicHome />
}
