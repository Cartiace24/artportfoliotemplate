import { Suspense, lazy, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Header as ClassicHeader } from './themes/classic/Header'
import { Footer as ClassicFooter } from './themes/classic/About'
import { PHeader } from './themes/painterly/Header'
import { PFooter } from './themes/painterly/About'
import { Home } from './pages/Home'
import { Commissions } from './pages/Commissions'
import { About } from './pages/About'
import { Terms } from './pages/Terms'
import { useSiteConfig, useSiteSettings, useSocials } from './hooks/useSiteContent'
import { ActiveThemeContext, resolveTheme, type ThemeName } from './lib/theme'
import { Demo } from './pages/Demo'

// The studio is code-split: public visitors never download the
// management UI (~40% of the bundle).
const Manage = lazy(() => import('./pages/Manage').then((m) => ({ default: m.Manage })))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function PublicShell({ children, themeOverride }: { children: React.ReactNode; themeOverride?: ThemeName }) {
  const { settings } = useSiteSettings()
  const { socials } = useSocials()
  const { config } = useSiteConfig()
  const loc = useLocation()
  // This is a visitor preview only. The Studio remains the source of truth
  // for the site's saved theme, so browsing never changes public settings.
  const [previewTheme, setPreviewTheme] = useState<ThemeName | null>(null)
  const theme = previewTheme ?? themeOverride ?? resolveTheme(config.theme)
  const painterly = theme === 'painterly'
  const toggleTheme = () => setPreviewTheme(painterly ? 'classic' : 'painterly')
  // The painterly home hero is a dark painted band, so the header must
  // start in cream text there; everywhere else it starts in ink.
  const startDark = painterly && loc.pathname === '/'
  return (
    <ActiveThemeContext.Provider value={theme}>
    <div className={`paper-grain min-h-dvh flex flex-col ${painterly ? 'theme-painterly' : ''}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-ink focus:text-cream focus:px-4 focus:py-2">
        Skip to content
      </a>
      {painterly ? (
        <PHeader settings={settings} siteName={config.site_name} startDark={startDark} theme={theme} onToggleTheme={toggleTheme} />
      ) : (
        <ClassicHeader settings={settings} siteName={config.site_name} theme={theme} onToggleTheme={toggleTheme} />
      )}
      <div className="flex-1">{children}</div>
      {painterly ? (
        <PFooter socials={socials} siteName={config.site_name} tagline={config.tagline} />
      ) : (
        <ClassicFooter socials={socials} siteName={config.site_name} tagline={config.tagline} />
      )}
    </div>
    </ActiveThemeContext.Provider>
  )
}

function StudioLoading() {
  return (
    <main className="min-h-dvh grid place-items-center px-4">
      <p className="font-display italic text-[26px] text-muted flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin" aria-hidden /> opening your studio…
      </p>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollTop />
      <Routes>
        <Route path="/" element={<PublicShell><Home /></PublicShell>} />
        <Route path="/commissions" element={<PublicShell><Commissions /></PublicShell>} />
        <Route path="/about" element={<PublicShell><About /></PublicShell>} />
        <Route path="/tos" element={<PublicShell><Terms /></PublicShell>} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/demo/classic" element={<PublicShell themeOverride="classic"><Home /></PublicShell>} />
        <Route path="/demo/painterly" element={<PublicShell themeOverride="painterly"><Home /></PublicShell>} />
        <Route
          path="/manage/:token"
          element={
            <div className="paper-grain min-h-dvh bg-paper">
              <Suspense fallback={<StudioLoading />}>
                <Manage />
              </Suspense>
            </div>
          }
        />
        <Route
          path="*"
          element={
            <PublicShell>
              <main id="main" className="pt-[140px] pb-20 text-center px-4">
                <p className="font-mono text-[12px] tracking-[0.22em] uppercase text-muted">Nothing here</p>
                <h1 className="font-display text-[64px] text-ink">404</h1>
                <a href="/" className="mt-4 inline-block bg-ink text-cream px-7 py-3 text-[14px] font-semibold hover:bg-accent-deep transition-colors min-h-[48px]">
                  Back home →
                </a>
              </main>
            </PublicShell>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
