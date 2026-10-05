import { useSiteConfig } from '../hooks/useSiteContent'
import { resolveTheme } from '../lib/theme'
import { Terms as ClassicTerms } from '../themes/classic/Terms'
import { PainterlyTerms } from '../themes/painterly/Terms'

export function Terms() {
  const { config } = useSiteConfig()
  return resolveTheme(config.theme) === 'painterly' ? <PainterlyTerms /> : <ClassicTerms />
}
