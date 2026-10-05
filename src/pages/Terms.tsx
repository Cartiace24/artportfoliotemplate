import { useSiteConfig } from '../hooks/useSiteContent'
import { useActiveTheme } from '../lib/theme'
import { Terms as ClassicTerms } from '../themes/classic/Terms'
import { PainterlyTerms } from '../themes/painterly/Terms'

export function Terms() {
  const { config } = useSiteConfig()
  return useActiveTheme(config.theme) === 'painterly' ? <PainterlyTerms /> : <ClassicTerms />
}
