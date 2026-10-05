import { useSiteConfig } from '../hooks/useSiteContent'
import { useActiveTheme } from '../lib/theme'
import { Commissions as ClassicCommissions } from '../themes/classic/CommissionsPage'
import { PainterlyCommissions } from '../themes/painterly/CommissionsPage'

export function Commissions() {
  const { config } = useSiteConfig()
  return useActiveTheme(config.theme) === 'painterly' ? <PainterlyCommissions /> : <ClassicCommissions />
}
