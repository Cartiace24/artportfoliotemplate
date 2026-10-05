import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/About'
import { Home } from './pages/Home'
import { Commissions } from './pages/Commissions'
import { About } from './pages/About'
import { Terms } from './pages/Terms'
import { Manage } from './pages/Manage'
import { useSiteSettings, useSocials } from './hooks/useSiteContent'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function PublicShell({ children }: { children: React.ReactNode }) {
  const { settings } = useSiteSettings()
  const { socials } = useSocials()
  return (
    <div className="paper-grain min-h-dvh flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#40203f] focus:text-white focus:px-4 focus:py-2 focus:rounded-full">
        Skip to content
      </a>
      <Header settings={settings} />
      <div className="flex-1">{children}</div>
      <Footer socials={socials} />
    </div>
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
        <Route
          path="/manage/:token"
          element={
            <div className="paper-grain min-h-dvh bg-[#FAF6EF]">
              <Manage />
            </div>
          }
        />
        <Route
          path="*"
          element={
            <PublicShell>
              <main id="main" className="pt-[140px] pb-20 text-center px-4">
                <p className="font-hand text-[28px] text-[#8a6f5c]">oops, this page wandered off…</p>
                <h1 className="font-serif-ed text-[52px] text-[#40203f] font-semibold">404 ♡</h1>
                <a href="/" className="mt-4 inline-block rounded-full bg-[#5b2b4e] text-white px-7 py-3 font-semibold">
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
