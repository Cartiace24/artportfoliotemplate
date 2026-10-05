import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft, BadgeDollarSign, Check, Copy, Download, Eye, FileText, Globe, ImagePlus, Inbox, LayoutDashboard,
  Loader2, Lock, Palette, RefreshCw, Settings2, Share2, Trash2, TriangleAlert, Upload, User,
} from 'lucide-react'
import { getSupabase, publicArtUrl } from '../lib/supabase'
import { isDemoAllowed, isSupabaseConfigured } from '../lib/env'
import { callManageRpc, tokenHash, uploadArtworkFile, validateImageFile, validateManageToken } from '../lib/manageApi'
import { generateManageToken, sha256Hex } from '../lib/tokens'
import { PageMeta } from '../lib/meta'
import {
  PLACEHOLDER_ABOUT, PLACEHOLDER_ARTWORKS, PLACEHOLDER_CONFIG, PLACEHOLDER_PRICES, PLACEHOLDER_SETTINGS, PLACEHOLDER_SOCIALS, PLACEHOLDER_TERMS,
  type AboutContent, type Artwork, type CommissionPrice, type CommissionRequest, type SiteConfig, type SiteSettings, type SocialLink, type TermsSection,
} from '../lib/types'

type Tab = 'overview' | 'artwork' | 'commissions' | 'inbox' | 'pricing' | 'about' | 'socials' | 'terms' | 'site' | 'access'

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'artwork', label: 'Artwork', icon: Palette },
  { id: 'commissions', label: 'Commissions', icon: Settings2 },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'pricing', label: 'Pricing', icon: BadgeDollarSign },
  { id: 'about', label: 'About', icon: User },
  { id: 'socials', label: 'Socials', icon: Share2 },
  { id: 'terms', label: 'Terms', icon: FileText },
  { id: 'site', label: 'Site', icon: Globe },
  { id: 'access', label: 'Access', icon: Lock },
]

function useManageData(token: string | null, authed: boolean) {
  const [settings, setSettings] = useState<SiteSettings>(PLACEHOLDER_SETTINGS)
  const [artworks, setArtworks] = useState<Artwork[]>(PLACEHOLDER_ARTWORKS)
  const [prices, setPrices] = useState<CommissionPrice[]>(PLACEHOLDER_PRICES)
  const [about, setAbout] = useState<AboutContent>(PLACEHOLDER_ABOUT)
  const [socials, setSocials] = useState<SocialLink[]>(PLACEHOLDER_SOCIALS)
  const [terms, setTerms] = useState<TermsSection[]>(PLACEHOLDER_TERMS)
  const [config, setConfig] = useState<SiteConfig>(PLACEHOLDER_CONFIG)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!authed) return
    ;(async () => {
      setLoading(true)
      setLoadError(null)
      if (!isSupabaseConfigured) {
        // Demo data only exists when demo mode is allowed (dev). In
        // production without Supabase there is nothing legitimate to show.
        if (!isDemoAllowed) {
          setLoadError('Studio is not connected. Ask your developer to configure Supabase, then reload your private link.')
          setLoading(false)
          return
        }
        try {
          const raw = localStorage.getItem('shiakonii-demo-data')
          if (raw) {
            const d = JSON.parse(raw)
            if (d.settings) setSettings(d.settings)
            if (d.artworks) setArtworks(d.artworks)
            if (d.prices) setPrices(d.prices)
            if (d.about) setAbout(d.about)
            if (d.socials) setSocials(d.socials)
            if (d.terms) setTerms(d.terms)
            if (d.config) setConfig(d.config)
          }
        } catch { /* ignore */ }
        setLoading(false)
        return
      }
      try {
        const sb = getSupabase()!
        const [s, a, p, ab, so, t, c] = await Promise.all([
          sb.from('site_settings').select('*').limit(1).maybeSingle(),
          sb.from('artworks').select('*').order('sort_order'),
          sb.from('commission_prices').select('*, commission_categories(name)').order('sort_order'),
          sb.from('about_content').select('*').limit(1).maybeSingle(),
          sb.from('social_links').select('*').order('sort_order'),
          sb.from('terms_sections').select('*').order('sort_order'),
          sb.from('site_config').select('*').limit(1).maybeSingle(),
        ])
        if (s.data) setSettings(s.data as SiteSettings)
        if (a.data?.length) setArtworks(a.data as Artwork[])
        if (p.data?.length) {
          setPrices((p.data as unknown[]).map((r) => {
            const row = r as Record<string, unknown>
            const cat = row['commission_categories'] as { name?: string } | null
            return { ...(row as object), category_name: cat?.name } as CommissionPrice
          }))
        }
        if (ab.data) setAbout(ab.data as AboutContent)
        if (so.data?.length) setSocials(so.data as SocialLink[])
        if (t.data?.length) setTerms(t.data as TermsSection[])
        if (c.data) setConfig(c.data as SiteConfig)
      } catch {
        setLoadError("Couldn't load your site content. Check your connection and refresh — your published site is unaffected.")
      }
      setLoading(false)
    })()
  }, [authed, token])

  useEffect(() => {
    if (!authed || !isDemoAllowed) return
    try {
      localStorage.setItem('shiakonii-demo-data', JSON.stringify({ settings, artworks, prices, about, socials, terms, config }))
    } catch { /* ignore */ }
  }, [authed, settings, artworks, prices, about, socials, terms, config])

  return { settings, setSettings, artworks, setArtworks, prices, setPrices, about, setAbout, socials, setSocials, terms, setTerms, config, setConfig, loading, loadError }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#8d857a]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

const inputCls = 'w-full rounded-xl border border-[#e6dcc8] bg-white px-4 py-2.5 text-[14.5px] text-[#40203f] placeholder:text-[#b6ab9c] focus:border-[#5b2b4e] focus:outline-none'

export function Manage() {
  const { token = '' } = useParams()
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [mode, setMode] = useState<'supabase' | 'demo' | 'none'>('none')
  const [tab, setTab] = useState<Tab>('overview')
  const [toast, setToast] = useState<string | null>(null)
  const data = useManageData(token || null, authed)

  useEffect(() => {
    if (!token) {
      setChecking(false)
      return
    }
    validateManageToken(token).then((r) => {
      setAuthed(r.ok)
      setMode(r.mode)
      setChecking(false)
    })
  }, [token])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const say = (m: string) => setToast(m)

  if (checking) {
    return (
      <main className="min-h-dvh grid place-items-center px-4">
        <p className="font-hand text-[26px] text-[#8a6f5c] flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" /> opening your studio…
        </p>
      </main>
    )
  }

  if (!token || !authed) {
    return (
      <main className="min-h-dvh grid place-items-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-8 text-center">
          <p className="mx-auto w-12 h-12 rounded-full bg-[#f2d8d3]/60 grid place-items-center text-[22px]" aria-hidden>🔒</p>
          <h1 className="font-serif-ed italic text-[28px] text-[#40203f] mt-3">This studio link doesn&rsquo;t work</h1>
          <p className="text-[14px] text-[#6d5f6b] mt-2 leading-relaxed">
            Management links are long, private URLs like <code className="bg-[#f3ecdd] px-1.5 py-0.5 rounded text-[12.5px]">/manage/…token…</code>.
            If you lost yours, ask your developer to generate a fresh one — the old one stops working immediately.
          </p>
          <Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#5b2b4e] text-white px-6 py-3 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to the gallery
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main id="main" className="min-h-dvh pb-16">
      <PageMeta title={`Studio — ${data.config.site_name}`} description="Private site management studio." />
      <div className="sticky top-0 z-40 bg-[#FAF6EF]/94 backdrop-blur border-b border-[#e6dcc8]">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 h-[64px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-9 h-9 rounded-full border border-[#e6dcc8] bg-white grid place-items-center hover:bg-[#f3ecdd]" aria-label="View public site">
              <Eye className="w-4 h-4" />
            </Link>
            <div>
              <p className="font-hand text-[22px] leading-none font-bold text-[#40203f]">studio ✿</p>
              <p className="text-[11px] text-[#8d857a] font-semibold tracking-wide">
                {isDemoAllowed ? 'DEMO MODE — changes stay in this browser' : 'connected to Supabase'} • {mode}
              </p>
            </div>
          </div>
          <Link to="/" className="text-[13px] font-bold text-[#5b2b4e] underline underline-offset-4">view site →</Link>
        </div>
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pb-3 flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Management sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13.5px] font-bold border transition-colors min-h-[44px] ${
                tab === t.id ? 'bg-[#5b2b4e] text-white border-[#5b2b4e]' : 'bg-white text-[#5b2b4e] border-[#e6dcc8]'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" aria-hidden /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1080px] px-4 sm:px-6 pt-6">
        {data.loadError && (
          <div role="alert" className="mb-4 rounded-2xl border border-[#c98a8a]/40 bg-[#f2d8d3]/40 px-5 py-4 text-[14px] font-semibold text-[#6e2f2f]">
            {data.loadError}
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
            {tab === 'overview' && <OverviewTab data={data} say={say} onGo={setTab} token={token!} />}
            {tab === 'artwork' && <ArtworkTab data={data} say={say} token={token!} />}
            {tab === 'commissions' && <CommissionsTab data={data} say={say} token={token!} />}
            {tab === 'inbox' && <InboxTab say={say} token={token!} />}
            {tab === 'pricing' && <PricingTab data={data} say={say} token={token!} />}
            {tab === 'about' && <AboutTab data={data} say={say} token={token!} />}
            {tab === 'socials' && <SocialsTab data={data} say={say} token={token!} />}
            {tab === 'terms' && <TermsTab data={data} say={say} token={token!} />}
            {tab === 'site' && <SiteTab data={data} say={say} token={token!} />}
            {tab === 'access' && <AccessTab say={say} token={token!} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && (
          <ToastMessage message={toast} />
        )}
      </AnimatePresence>
    </main>
  )
}

type Data = ReturnType<typeof useManageData>

function isErrorToast(message: string): boolean {
  return /couldn|fail|error|invalid|expired|empty|over 8MB|choose an image|not connected|no longer valid/i.test(message)
}

function ToastMessage({ message }: { message: string }) {
  const err = isErrorToast(message)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] inline-flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold shadow-xl ${
        err ? 'bg-[#6e2f2f] text-white' : 'bg-[#40203f] text-white'
      }`}
      role={err ? 'alert' : 'status'}
    >
      {err ? <TriangleAlert className="w-4 h-4 shrink-0" aria-hidden /> : <Check className="w-4 h-4 shrink-0" aria-hidden />}
      <span className="break-words">{message}</span>
    </motion.div>
  )
}

/* ---------------- Overview ---------------- */
function OverviewTab({ data, say, onGo, token }: { data: Data; say: (m: string) => void; onGo: (t: Tab) => void; token: string }) {
  const { settings, artworks } = data
  const open = settings.commission_status === 'open'
  const featured = artworks.filter((a) => a.featured).length
  const [restoring, setRestoring] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      settings: data.settings,
      config: data.config,
      about: data.about,
      artworks: data.artworks,
      prices: data.prices,
      socials: data.socials,
      terms: data.terms,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `site-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 5000)
    say('Backup downloaded ♡')
  }

  const importBackup = async (file: File) => {
    let d: Record<string, unknown>
    try {
      d = JSON.parse(await file.text()) as Record<string, unknown>
    } catch {
      say("Couldn't read that file — is it a site backup?")
      return
    }
    if (!d || typeof d !== 'object' || !d.settings) {
      say("That doesn't look like a site backup.")
      return
    }
    if (!confirm('Restore this backup? It adds its artworks, socials, and terms as new entries and overwrites settings, about, pricing, and site name.')) return
    setRestoring(true)
    try {
      if (!isSupabaseConfigured) {
        if (isDemoAllowed) {
          if (d.settings) data.setSettings(d.settings as SiteSettings)
          if (d.config) data.setConfig(d.config as SiteConfig)
          if (d.about) data.setAbout(d.about as AboutContent)
          if (Array.isArray(d.artworks)) data.setArtworks(d.artworks as Artwork[])
          if (Array.isArray(d.prices)) data.setPrices(d.prices as CommissionPrice[])
          if (Array.isArray(d.socials)) data.setSocials(d.socials as SocialLink[])
          if (Array.isArray(d.terms)) data.setTerms(d.terms as TermsSection[])
          say('Backup restored (demo) ♡')
        } else {
          say("Couldn't restore — studio is not connected.")
        }
        return
      }
      const h = await tokenHash(token)
      const call = async (fn: string, args: Record<string, unknown>) => {
        const r = await callManageRpc({ fn, args: { p_token_hash: h, ...args } })
        if (!r.ok) throw new Error(r.error ?? fn)
      }
      const s = d.settings as SiteSettings
      await call('manage_update_settings', { p_status: s.commission_status, p_message: s.commission_message, p_slots: s.available_slots })
      data.setSettings(s)
      if (d.config) {
        const c = d.config as SiteConfig
        await call('manage_update_config', { p_site_name: c.site_name, p_tagline: c.tagline, p_hero_title: c.hero_title })
        data.setConfig(c)
      }
      if (d.about) {
        const ab = d.about as AboutContent
        await call('manage_update_about', { p_bio: ab.bio, p_short: ab.short_description, p_interests: ab.interests, p_subjects: ab.subjects, p_signature: ab.signature, p_profile_path: ab.profile_image_path })
        data.setAbout(ab)
      }
      if (Array.isArray(d.prices)) {
        const rows = d.prices as CommissionPrice[]
        for (const row of rows) {
          const match = data.prices.find(
            (p) => p.type === row.type && (p.category_name === row.category_name || p.category_id === row.category_id)
          )
          const target = match ?? data.prices.find((p) => p.type === row.type)
          if (target) {
            await call('manage_upsert_price', { p_id: target.id, p_price: Number(row.price), p_enabled: row.enabled })
          }
        }
        say('Pricing restored — refresh the Pricing tab to confirm ♡')
      }
      if (Array.isArray(d.artworks)) {
        const rows = (d.artworks as Artwork[]).slice(0, 200)
        const added: Artwork[] = []
        for (const row of rows) {
          if (!row.title || !row.image_path) continue
          await call('manage_upsert_artwork', {
            p_title: row.title, p_description: row.description ?? null, p_category: row.category ?? 'Lorem',
            p_image_path: row.image_path, p_year: row.year ?? null, p_featured: !!row.featured, p_sort: row.sort_order ?? 0,
          })
          added.push({ ...row, id: `restored-${Date.now()}-${added.length}` })
        }
        if (added.length) data.setArtworks([...data.artworks, ...added])
      }
      if (Array.isArray(d.socials)) {
        for (const row of d.socials as SocialLink[]) {
          if (!row.platform) continue
          await call('manage_upsert_social', { p_platform: row.platform, p_url: row.url ?? '', p_display: row.display_name ?? null, p_enabled: row.enabled !== false, p_sort: row.sort_order ?? 0 })
        }
      }
      if (Array.isArray(d.terms)) {
        for (const row of d.terms as TermsSection[]) {
          if (!row.title && !row.body) continue
          await call('manage_upsert_terms', { p_title: row.title ?? '', p_body: row.body ?? '', p_sort: row.sort_order ?? 0 })
        }
      }
      say('Backup restored — reloading…')
      setTimeout(() => window.location.reload(), 1400)
    } catch (e) {
      say("Couldn't restore — " + (e instanceof Error ? e.message : 'please try again.'))
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <div className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-6">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8d857a]">Commission status</p>
        <p className={`mt-2 font-serif-ed text-[36px] font-semibold ${open ? 'text-green-800' : 'text-[#6e2f2f]'}`}>
          {open ? '🟢 OPEN' : '🔴 CLOSED'}
        </p>
        {settings.commission_message && <p className="mt-1 font-hand text-[20px] text-[#6d5f6b]">“{settings.commission_message}”</p>}
        <p className="text-[13px] text-[#8d857a] mt-1">Slots: {settings.available_slots ?? '—'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => onGo('commissions')}
            className="rounded-full bg-[#5b2b4e] text-white px-5 py-2.5 text-[13.5px] font-bold min-h-[44px]">Change status →</button>
          <button onClick={() => onGo('artwork')}
            className="rounded-full border border-[#5b2b4e]/40 text-[#5b2b4e] px-5 py-2.5 text-[13.5px] font-bold min-h-[44px]">Manage artwork</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/" className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#5b2b4e] underline underline-offset-4 min-h-[44px]">
            <Eye className="w-4 h-4" aria-hidden /> View live site
          </Link>
          <button onClick={() => onGo('inbox')}
            className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#5b2b4e] underline underline-offset-4 min-h-[44px]">
            <Inbox className="w-4 h-4" aria-hidden /> Check requests
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {[
          ['Artworks', String(artworks.length), 'pieces in your gallery'],
          ['Featured', String(featured), 'shown on the homepage'],
          ['Pricing', String(data.prices.filter((p) => p.enabled).length), 'active price points'],
          ['Socials', String(data.socials.filter((s) => s.enabled).length), 'live links'],
        ].map(([k, v, sub]) => (
          <div key={k} className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] p-5">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8d857a]">{k}</p>
            <p className="font-serif-ed text-[34px] text-[#40203f] font-semibold">{v}</p>
            <p className="text-[12.5px] text-[#8d857a]">{sub}</p>
          </div>
        ))}
      </div>
      <div className="md:col-span-2 rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] p-5 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px]">
          <p className="font-serif-ed italic text-[19px] text-[#40203f]">Backup ✿</p>
          <p className="text-[13px] text-[#8d857a]">Download everything as JSON, or restore from a backup file.</p>
        </div>
        <button onClick={exportBackup}
          className="inline-flex items-center gap-2 rounded-full border border-[#5b2b4e]/40 text-[#5b2b4e] px-5 py-2.5 text-[13.5px] font-bold min-h-[44px]">
          <Download className="w-4 h-4" aria-hidden /> Export
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Choose backup file"
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) importBackup(f)
          }} />
        <button onClick={() => fileRef.current?.click()} disabled={restoring}
          className="inline-flex items-center gap-2 rounded-full bg-[#5b2b4e] text-white px-5 py-2.5 text-[13.5px] font-bold min-h-[44px] disabled:opacity-60">
          {restoring ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Upload className="w-4 h-4" aria-hidden />}
          {restoring ? 'Restoring…' : 'Restore'}
        </button>
      </div>
      <p className="md:col-span-2 rounded-2xl bg-[#f3ecdd]/60 border border-dashed border-[#c9b995] p-4 text-[13.5px] text-[#6d5f6b]">
        ✿ Tip: everything you change here appears on the public site instantly — no redeploy needed
        {isDemoAllowed ? ' (demo mode: changes stay in this browser until Supabase is connected).' : '.'}
      </p>
    </div>
  )
}

/* ---------------- Commissions ---------------- */
function CommissionsTab({ data, say, token }: { data: Data; say: (m: string) => void; token: string }) {
  const { settings, setSettings } = data
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState(settings)
  useEffect(() => setDraft(settings), [settings])

  const save = async () => {
    setSaving(true)
    if (!isSupabaseConfigured) {
      if (!isDemoAllowed) {
        say("Couldn't save — studio is not connected.")
        setSaving(false)
        return
      }
      setSettings(draft)
      setSaving(false)
      say('Status saved (demo) ♡')
      return
    }
    const h = await tokenHash(token)
    const r = await callManageRpc({
      fn: 'manage_update_settings',
      args: { p_token_hash: h, p_status: draft.commission_status, p_message: draft.commission_message, p_slots: draft.available_slots },
    })
    if (!r.ok) {
      say("Couldn't save — " + (r.error ?? 'please try again.'))
      setSaving(false)
      return
    }
    setSettings(draft)
    setSaving(false)
    say('Commission status updated ♡')
  }

  return (
    <div className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-6 max-w-2xl">
      <h2 className="font-serif-ed italic text-[26px] text-[#40203f]">Commission status</h2>
      <div className="mt-4 flex gap-3" role="radiogroup" aria-label="Commission status">
        {(['open', 'closed'] as const).map((v) => (
          <button key={v} role="radio" aria-checked={draft.commission_status === v} onClick={() => setDraft({ ...draft, commission_status: v })}
            className={`flex-1 rounded-xl border-2 px-4 py-3.5 font-bold text-[15px] transition-colors ${
              draft.commission_status === v ? (v === 'open' ? 'border-green-700 bg-green-50 text-green-900' : 'border-[#6e2f2f] bg-[#f2d8d3]/40 text-[#6e2f2f]') : 'border-[#e6dcc8] text-[#8d857a]'
            }`}>
            {v === 'open' ? '🟢 Open' : '🔴 Closed'}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-4">
        <Field label="Status message">
          <input className={inputCls} value={draft.commission_message ?? ''} placeholder="Currently accepting 3 more slots…"
            onChange={(e) => setDraft({ ...draft, commission_message: e.target.value })} />
        </Field>
        <Field label="Available slots (number, optional)">
          <input className={inputCls} type="number" min={0} max={99} value={draft.available_slots ?? ''}
            onChange={(e) => setDraft({ ...draft, available_slots: e.target.value === '' ? null : Number(e.target.value) })} />
        </Field>
        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-[#5b2b4e] text-white px-7 py-3 font-bold disabled:opacity-60 min-h-[48px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

/* ---------------- Pricing ---------------- */
function PricingTab({ data, say, token }: { data: Data; say: (m: string) => void; token: string }) {
  const { prices, setPrices } = data
  const [saving, setSaving] = useState<string | null>(null)

  const update = (id: string, patch: Partial<CommissionPrice>) =>
    setPrices((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  const saveRow = async (row: CommissionPrice) => {
    setSaving(row.id)
    if (!isSupabaseConfigured) {
      if (!isDemoAllowed) {
        say("Couldn't save — studio is not connected.")
        setSaving(null)
        return
      }
      await new Promise((r) => setTimeout(r, 300))
      setSaving(null)
      say(`Saved ${row.category_name ?? ''} ${row.type} — $${row.price} ♡`)
      return
    }
    const h = await tokenHash(token)
    const r = await callManageRpc({
      fn: 'manage_upsert_price',
      args: { p_token_hash: h, p_id: row.id, p_price: Number(row.price), p_enabled: row.enabled, p_type: row.type, p_category_id: row.category_id },
    })
    setSaving(null)
    if (!r.ok) {
      say("Couldn't save — " + (r.error ?? 'please try again.') + ' Your edit is still shown; refresh to revert.')
      return
    }
    say(`Saved ${row.category_name ?? ''} ${row.type} — $${row.price} ♡`)
  }

  const groups = useMemo(() => {
    const m = new Map<string, CommissionPrice[]>()
    for (const p of prices) {
      const k = p.category_name ?? p.category_id
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(p)
    }
    return [...m.entries()]
  }, [prices])

  return (
    <div className="space-y-5 max-w-3xl">
      {groups.map(([cat, rows]) => (
        <section key={cat} className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-6">
          <h2 className="font-serif-ed italic text-[24px] text-[#40203f]">{cat}</h2>
          <div className="mt-4 space-y-3">
            {[...rows].sort((a, b) => a.sort_order - b.sort_order).map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-[#faf3e8] border border-[#e6dcc8]/70 p-3">
                <span className="w-16 font-bold text-[14px]">{p.type}</span>
                <label className="flex items-center gap-1.5 text-[14px] font-semibold">
                  <span aria-hidden>$</span>
                  <input type="number" min={0} value={p.price} onChange={(e) => update(p.id, { price: Number(e.target.value) })}
                    className="w-24 rounded-lg border border-[#e6dcc8] bg-white px-3 py-2" aria-label={`${cat} ${p.type} price`} />
                </label>
                <button onClick={() => update(p.id, { enabled: !p.enabled })}
                  aria-pressed={p.enabled}
                  className={`rounded-full px-4 py-2 text-[12.5px] font-bold border ${p.enabled ? 'bg-green-100 border-green-300 text-green-900' : 'bg-white border-[#e6dcc8] text-[#8d857a]'}`}>
                  {p.enabled ? '● Active' : '○ Hidden'}
                </button>
                <button onClick={() => saveRow(p)} disabled={saving === p.id}
                  className="ml-auto rounded-full bg-[#5b2b4e] text-white px-5 py-2 text-[13px] font-bold disabled:opacity-60 min-h-[40px]">
                  {saving === p.id ? '…' : 'Save'}
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/* ---------------- Artwork ---------------- */
function ArtworkTab({ data, say, token }: { data: Data; say: (m: string) => void; token: string }) {
  const { artworks, setArtworks } = data
  const [editing, setEditing] = useState<Artwork | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [orderDirty, setOrderDirty] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)

  useEffect(() => {
    if (!pendingDelete) return
    const t = setTimeout(() => setPendingDelete(null), 4000)
    return () => clearTimeout(t)
  }, [pendingDelete])

  const remove = async (id: string) => {
    if (pendingDelete !== id) {
      setPendingDelete(id)
      return
    }
    setPendingDelete(null)
    const snapshot = artworks
    setArtworks(snapshot.filter((x) => x.id !== id))
    if (!isSupabaseConfigured) {
      if (!isDemoAllowed) {
        setArtworks(snapshot)
        say("Couldn't delete — studio is not connected.")
        return
      }
      say('Artwork deleted (demo)')
      return
    }
    const h = await tokenHash(token)
    const r = await callManageRpc({ fn: 'manage_delete_artwork', args: { p_token_hash: h, p_id: id } })
    if (!r.ok) {
      setArtworks(snapshot)
      say("Couldn't delete — " + (r.error ?? 'please try again.'))
      return
    }
    say('Artwork deleted')
  }

  const toggleFeatured = async (art: Artwork) => {
    const next = !art.featured
    const snapshot = artworks
    setArtworks(snapshot.map((x) => (x.id === art.id ? { ...x, featured: next } : x)))
    if (!isSupabaseConfigured) {
      say(next ? 'Set as featured ✦ (demo)' : 'Removed from featured (demo)')
      return
    }
    const h = await tokenHash(token)
    const r = await callManageRpc({ fn: 'manage_upsert_artwork', args: { p_token_hash: h, p_id: art.id, p_featured: next, p_title: art.title } })
    if (!r.ok) {
      setArtworks(snapshot)
      say("Couldn't save — " + (r.error ?? 'please try again.'))
      return
    }
    say(next ? 'Set as featured ✦' : 'Removed from featured')
  }

  const move = (id: string, dir: -1 | 1) => {
    setArtworks((list) => {
      const i = list.findIndex((a) => a.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= list.length) return list
      const next = [...list]
      const [item] = next.splice(i, 1)
      next.splice(j, 0, item!)
      return next.map((a, k) => ({ ...a, sort_order: k + 1 }))
    })
    setOrderDirty(true)
  }

  const saveOrder = async () => {
    if (!isSupabaseConfigured) {
      if (!isDemoAllowed) {
        say("Couldn't save order — studio is not connected.")
        return
      }
      setOrderDirty(false)
      say('Order saved (demo) ♡')
      return
    }
    setSavingOrder(true)
    const h = await tokenHash(token)
    const r = await callManageRpc({ fn: 'manage_reorder_artworks', args: { p_token_hash: h, p_ids: artworks.map((a) => a.id) } })
    setSavingOrder(false)
    if (!r.ok) {
      say("Couldn't save order — " + (r.error ?? 'please try again.'))
      return
    }
    setOrderDirty(false)
    say('Gallery order saved ♡')
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-[14px] text-[#6d5f6b]"><strong>{artworks.length}</strong> pieces • reorder with ↑ ↓ then save • ★ = homepage</p>
        <div className="flex flex-wrap gap-2">
          {orderDirty && (
            <button onClick={saveOrder} disabled={savingOrder}
              className="inline-flex items-center gap-2 rounded-full bg-green-800 text-white px-5 py-2.5 text-[13.5px] font-bold min-h-[44px] disabled:opacity-60">
              {savingOrder ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Check className="w-4 h-4" aria-hidden />}
              {savingOrder ? 'Saving…' : 'Save order'}
            </button>
          )}
          <button onClick={() => setEditing({ id: `new-${Date.now()}`, title: '', category: 'Lorem', description: '', image_path: '', year: String(new Date().getFullYear()), featured: true, sort_order: artworks.length + 1 })}
            className="inline-flex items-center gap-2 rounded-full bg-[#5b2b4e] text-white px-5 py-2.5 text-[13.5px] font-bold min-h-[44px]">
            <ImagePlus className="w-4 h-4" aria-hidden /> Add artwork
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {artworks.map((a) => (
          <article key={a.id} className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] p-2.5 print-shadow">
            <img src={publicArtUrl(a.image_path) ?? ''} alt={a.title} loading="lazy" className="rounded-xl w-full aspect-[4/3] object-cover art-img" />
            <div className="px-1.5 py-2">
              <p className="font-bold text-[14px] truncate">{a.title || '(untitled)'} {a.featured && <span aria-label="featured">★</span>}</p>
              <p className="text-[12px] text-[#8d857a]">{a.category} {a.year ? `• ${a.year}` : ''}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button onClick={() => setEditing(a)} className="rounded-full border border-[#e6dcc8] px-4 py-2 text-[12.5px] font-bold hover:bg-[#f3ecdd] min-h-[44px]">Edit</button>
                <button onClick={() => toggleFeatured(a)} className="rounded-full border border-[#e6dcc8] px-4 py-2 text-[12.5px] font-bold hover:bg-[#f3ecdd] min-h-[44px]" aria-pressed={a.featured}>
                  {a.featured ? '★ Featured' : '☆ Feature'}
                </button>
                <button onClick={() => move(a.id, -1)} className="rounded-full border border-[#e6dcc8] px-4 py-2 text-[12.5px] font-bold min-h-[44px] min-w-[44px]" aria-label={`Move ${a.title || 'artwork'} earlier`}>↑</button>
                <button onClick={() => move(a.id, 1)} className="rounded-full border border-[#e6dcc8] px-4 py-2 text-[12.5px] font-bold min-h-[44px] min-w-[44px]" aria-label={`Move ${a.title || 'artwork'} later`}>↓</button>
                <button
                  onClick={() => remove(a.id)}
                  className={`rounded-full border px-4 py-2 text-[12.5px] font-bold min-h-[44px] ${
                    pendingDelete === a.id
                      ? 'border-red-700 bg-red-800 text-white'
                      : 'border-red-200 text-red-800 hover:bg-red-50'
                  }`}
                  aria-label={pendingDelete === a.id ? `Confirm delete ${a.title || 'artwork'}` : `Delete ${a.title || 'artwork'}`}
                >
                  {pendingDelete === a.id ? (
                    <span className="inline-flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" aria-hidden /> Sure?</span>
                  ) : (
                    <Trash2 className="w-4 h-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <ArtworkEditor
            art={editing}
            isNew={editing.id.startsWith('new-')}
            uploading={uploading}
            progress={progress}
            onFile={async (f) => {
              const problem = validateImageFile(f)
              if (problem) {
                say(problem)
                return
              }
              setUploading(true)
              setProgress('Uploading…')
              const r = await uploadArtworkFile(token, f)
              setUploading(false)
              setProgress('')
              if (r.error) {
                say("Couldn't upload — " + r.error)
                return
              }
              setEditing({ ...editing, image_path: r.path ?? r.url ?? '' })
              ;(editing as unknown as { _preview?: string })._preview = r.url ?? ''
              say('Image ready ♡ don’t forget Save')
            }}
            onChange={setEditing}
            onClose={() => setEditing(null)}
            onSave={async () => {
              if (!editing.title.trim()) {
                say('Give it a title first ♡')
                return
              }
              if (!editing.image_path) {
                say('Add an image first ♡')
                return
              }
              const isNew = editing.id.startsWith('new-')
              const row: Artwork = isNew ? { ...editing, id: `local-${Date.now()}` } : editing
              if (!isSupabaseConfigured) {
                if (!isDemoAllowed) {
                  say("Couldn't save — studio is not connected.")
                  return
                }
              } else {
                const h = await tokenHash(token)
                const r = await callManageRpc({
                  fn: 'manage_upsert_artwork',
                  args: { p_token_hash: h, p_id: isNew ? null : row.id, p_title: row.title, p_description: row.description, p_category: row.category, p_image_path: row.image_path, p_year: row.year, p_featured: row.featured, p_sort: row.sort_order },
                })
                if (!r.ok) {
                  say("Couldn't save — " + (r.error ?? 'please try again.'))
                  return
                }
              }
              setArtworks((list) => (isNew ? [...list, row] : list.map((x) => (x.id === row.id ? row : x))))
              setEditing(null)
              say(isSupabaseConfigured ? 'Artwork saved ♡' : 'Artwork saved (demo) ♡')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ArtworkEditor({ art, isNew, onChange, onClose, onSave, onFile, uploading, progress }: {
  art: Artwork
  isNew: boolean
  onChange: (a: Artwork) => void
  onClose: () => void
  onSave: () => void
  onFile: (f: File) => void
  uploading: boolean
  progress: string
}) {
  const preview = (art as unknown as { _preview?: string })._preview ?? publicArtUrl(art.image_path)
  const [dragOver, setDragOver] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    fileInput.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const dropFile = (f: File | undefined) => {
    if (f) onFile(f)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Artwork editor">
      <div className="absolute inset-0 bg-[#2b1530]/70" onClick={onClose} />
      <motion.div initial={{ y: 18, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 10, scale: 0.98 }}
        className="relative w-full max-w-lg max-h-[90dvh] overflow-auto rounded-2xl bg-[#FAF6EF] border border-[#e6dcc8] p-6">
        <h3 className="font-serif-ed italic text-[24px] text-[#40203f]">{isNew ? 'Add artwork ✿' : 'Edit artwork ✎'}</h3>
        <div className="mt-4">
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              dropFile(e.dataTransfer.files?.[0])
            }}
            className={`block rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-colors min-h-[44px] ${
              dragOver ? 'border-[#5b2b4e] bg-[#e7ddf0]/50' : 'border-[#c9b995] bg-white hover:bg-[#faf3e8]'
            }`}
          >
            <input
              ref={fileInput}
              type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" className="sr-only"
              aria-label="Choose artwork image"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) onFile(f)
                e.target.value = ''
              }} />
            {preview ? (
              <img src={preview} alt="Artwork preview" className="mx-auto rounded-xl max-h-56 object-contain" />
            ) : (
              <span className="font-hand text-[22px] text-[#8a6f5c]">drop an image here, or click to browse ♡</span>
            )}
            <span className="mt-2 block text-[12px] text-[#8d857a] font-semibold">
              {uploading ? progress || 'Uploading…' : 'PNG / JPG / WebP up to 8MB'}
            </span>
          </label>
        </div>
        <div className="mt-4 space-y-3">
          <Field label="Title"><input className={inputCls} value={art.title} onChange={(e) => onChange({ ...art, title: e.target.value })} placeholder="Lorem ipsum dolor" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select className={inputCls} value={art.category} onChange={(e) => onChange({ ...art, category: e.target.value })}>
                {['Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet', 'Other'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Year"><input className={inputCls} value={art.year ?? ''} onChange={(e) => onChange({ ...art, year: e.target.value })} placeholder="2026" /></Field>
          </div>
          <Field label="Description"><textarea className={inputCls} rows={3} value={art.description ?? ''} onChange={(e) => onChange({ ...art, description: e.target.value })} placeholder="A few words about this piece…" /></Field>
          <label className="flex items-center gap-2.5 text-[14px] font-bold">
            <input type="checkbox" checked={art.featured} onChange={(e) => onChange({ ...art, featured: e.target.checked })} className="w-5 h-5 accent-[#5b2b4e]" />
            ★ Show on homepage
          </label>
        </div>
        <div className="mt-5 flex gap-2.5">
          <button onClick={onClose} className="flex-1 rounded-full border border-[#e6dcc8] bg-white py-3 font-bold text-[14px]">Cancel</button>
          <button onClick={onSave} disabled={uploading} className="flex-1 rounded-full bg-[#5b2b4e] text-white py-3 font-bold text-[14px] disabled:opacity-60">Save artwork ♡</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ---------------- About ---------------- */
function AboutTab({ data, say, token }: { data: Data; say: (m: string) => void; token: string }) {
  const { about, setAbout } = data
  const [draft, setDraft] = useState(about)
  const [saving, setSaving] = useState(false)
  useEffect(() => setDraft(about), [about])

  const save = async () => {
    setSaving(true)
    if (!isSupabaseConfigured) {
      if (!isDemoAllowed) {
        say("Couldn't save — studio is not connected.")
        setSaving(false)
        return
      }
      setAbout(draft)
      setSaving(false)
      say('About saved (demo) ♡')
      return
    }
    const h = await tokenHash(token)
    const r = await callManageRpc({
      fn: 'manage_update_about',
      args: { p_token_hash: h, p_bio: draft.bio, p_short: draft.short_description, p_interests: draft.interests, p_subjects: draft.subjects, p_signature: draft.signature, p_profile_path: draft.profile_image_path },
    })
    if (!r.ok) {
      say("Couldn't save — " + (r.error ?? 'please try again.'))
      setSaving(false)
      return
    }
    setAbout(draft)
    setSaving(false)
    say('About updated ♡')
  }

  return (
    <div className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-6 max-w-2xl space-y-4">
      <h2 className="font-serif-ed italic text-[26px] text-[#40203f]">About you ✿</h2>
      <Field label="Short tagline">
        <input className={inputCls} value={draft.short_description ?? ''} onChange={(e) => setDraft({ ...draft, short_description: e.target.value })} />
      </Field>
      <Field label="Bio">
        <textarea className={inputCls} rows={5} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
      </Field>
      <Field label="Interests (comma separated)">
        <input className={inputCls} value={draft.interests.join(', ')} onChange={(e) => setDraft({ ...draft, interests: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
      </Field>
      <Field label="Subjects you draw (comma separated)">
        <input className={inputCls} value={draft.subjects.join(', ')} onChange={(e) => setDraft({ ...draft, subjects: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
      </Field>
        <Field label="Signature">
        <input className={inputCls} value={draft.signature ?? ''} onChange={(e) => setDraft({ ...draft, signature: e.target.value })} placeholder="— lorem ipsum" />
      </Field>
      <Field label="Profile image">
        <div className="flex gap-2">
          <input className={inputCls} value={draft.profile_image_path ?? ''} placeholder="Upload below or paste path…"
            onChange={(e) => setDraft({ ...draft, profile_image_path: e.target.value })} />
          <label className="shrink-0 rounded-xl bg-[#f3ecdd] border border-[#e6dcc8] px-4 py-2.5 text-[13px] font-bold cursor-pointer hover:bg-[#efe3cd]">
            <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const r = await uploadArtworkFile(token, f)
              if (r.path) {
                setDraft({ ...draft, profile_image_path: r.path })
                say('Profile image ready — hit Save ♡')
              } else say(r.error ?? 'Upload failed')
            }} />
            Upload
          </label>
        </div>
      </Field>
      <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[#5b2b4e] text-white px-7 py-3 font-bold disabled:opacity-60 min-h-[48px]">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save about
      </button>
    </div>
  )
}

/* ---------------- Socials ---------------- */
function SocialsTab({ data, say, token }: { data: Data; say: (m: string) => void; token: string }) {
  const { socials, setSocials } = data
  const [draft, setDraft] = useState(socials)
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    setDraft(socials)
    setDeletedIds([])
  }, [socials])

  const removeRow = (index: number) => {
    const row = draft[index]
    if (row && !row.id.startsWith('new-')) setDeletedIds((ids) => [...ids, row.id])
    setDraft(draft.filter((_, k) => k !== index))
  }

  const save = async () => {
    setSaving(true)
    if (!isSupabaseConfigured) {
      if (!isDemoAllowed) {
        say("Couldn't save — studio is not connected.")
        setSaving(false)
        return
      }
      setSocials(draft.filter((s) => s.platform.trim() !== ''))
      setDeletedIds([])
      setSaving(false)
      say('Socials saved (demo) ♡')
      return
    }
    const h = await tokenHash(token)
    for (const gone of deletedIds) {
      const r = await callManageRpc({ fn: 'manage_delete_social', args: { p_token_hash: h, p_id: gone } })
      if (!r.ok) {
        say("Couldn't remove a link — " + (r.error ?? 'please try again.'))
        setSaving(false)
        return
      }
    }
    for (const s of draft) {
      if (!s.platform.trim()) continue
      const r = await callManageRpc({
        fn: 'manage_upsert_social',
        args: { p_token_hash: h, p_id: s.id.startsWith('new-') ? null : s.id, p_platform: s.platform, p_url: s.url, p_display: s.display_name, p_enabled: s.enabled, p_sort: s.sort_order },
      })
      if (!r.ok) {
        say("Couldn't save — " + (r.error ?? 'please try again.'))
        setSaving(false)
        return
      }
    }
    setSocials(draft)
    setDeletedIds([])
    setSaving(false)
    say('Social links updated ♡')
  }

  return (
    <div className="max-w-2xl">
      <div className="space-y-3">
        {draft.map((s, i) => (
          <div key={s.id} className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] p-4 flex flex-wrap gap-2.5 items-center">
            <select value={s.platform} onChange={(e) => setDraft(draft.map((x, k) => (k === i ? { ...x, platform: e.target.value } : x)))}
              className="rounded-lg border border-[#e6dcc8] bg-white px-3 py-2 text-[13.5px] font-bold">
              {['X', 'Instagram', 'TikTok', 'Twitch', 'Ko-fi', 'Cara', 'Bluesky', 'Facebook', 'YouTube', 'Discord', 'Other'].map((p) => <option key={p}>{p}</option>)}
            </select>
            <input value={s.url} placeholder="https://…" onChange={(e) => setDraft(draft.map((x, k) => (k === i ? { ...x, url: e.target.value } : x)))}
              className="flex-1 min-w-[180px] rounded-lg border border-[#e6dcc8] px-3 py-2 text-[13.5px]" aria-label={`${s.platform} URL`} />
            <button onClick={() => setDraft(draft.map((x, k) => (k === i ? { ...x, enabled: !x.enabled } : x)))} aria-pressed={s.enabled}
              className={`rounded-full px-3.5 py-2 text-[12px] font-bold border ${s.enabled ? 'bg-green-100 border-green-300 text-green-900' : 'bg-white text-[#8d857a] border-[#e6dcc8]'}`}>
              {s.enabled ? 'On' : 'Off'}
            </button>
            <button onClick={() => removeRow(i)} className="rounded-full border border-red-200 text-red-800 p-2.5 hover:bg-red-50 min-h-[44px] min-w-[44px] grid place-items-center" aria-label={`Remove ${s.platform} link`}>
              <Trash2 className="w-4 h-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2.5">
        <button onClick={() => setDraft([...draft, { id: `new-${Date.now()}`, platform: 'X', url: '', display_name: '', enabled: true, sort_order: draft.length + 1 }])}
          className="rounded-full border border-[#5b2b4e]/40 text-[#5b2b4e] px-5 py-2.5 text-[13.5px] font-bold">+ Add link</button>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[#5b2b4e] text-white px-7 py-2.5 font-bold disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save socials
        </button>
      </div>
      <p className="mt-3 text-[12.5px] text-[#8d857a] flex gap-1.5"><TriangleAlert className="w-4 h-4 shrink-0" /> Never invent URLs — only add profiles you actually own. Empty links stay hidden on the public site.</p>
    </div>
  )
}

/* ---------------- Inbox ---------------- */
function InboxTab({ say, token }: { say: (m: string) => void; token: string }) {
  const [requests, setRequests] = useState<CommissionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const sb = getSupabase()!
      const h = await tokenHash(token)
      const { data, error: rpcErr } = await sb.rpc('manage_get_requests', { p_token_hash: h })
      if (rpcErr) throw rpcErr
      setRequests((data ?? []) as CommissionRequest[])
    } catch {
      setError("Couldn't load requests. Check your connection and try again.")
    }
    setLoading(false)
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!pendingDelete) return
    const t = setTimeout(() => setPendingDelete(null), 4000)
    return () => clearTimeout(t)
  }, [pendingDelete])

  const remove = async (id: string) => {
    if (pendingDelete !== id) {
      setPendingDelete(id)
      return
    }
    setPendingDelete(null)
    const snapshot = requests
    setRequests(snapshot.filter((r) => r.id !== id))
    const h = await tokenHash(token)
    const r = await callManageRpc({ fn: 'manage_delete_request', args: { p_token_hash: h, p_id: id } })
    if (!r.ok) {
      setRequests(snapshot)
      say("Couldn't delete — " + (r.error ?? 'please try again.'))
      return
    }
    say('Request removed')
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] p-8 text-center max-w-2xl">
        <p className="font-hand text-[24px] text-[#8a6f5c]">the inbox lives in Supabase ✉</p>
        <p className="mt-1 text-[14px] text-[#6d5f6b]">
          {isDemoAllowed
            ? 'Demo form submissions are not stored — connect Supabase and deploy the commission-request function to receive real requests.'
            : 'Studio is not connected.'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] text-[#6d5f6b]">
          <strong>{requests.length}</strong> request{requests.length === 1 ? '' : 's'} — reply via the contact they left ♡
        </p>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-[#e6dcc8] bg-white px-4 py-2 text-[13px] font-bold hover:bg-[#f3ecdd] min-h-[44px]">
          <RefreshCw className="w-3.5 h-3.5" aria-hidden /> Refresh
        </button>
      </div>
      {loading && (
        <div className="space-y-3" aria-hidden>
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] p-5 animate-pulse">
              <div className="h-5 w-40 rounded bg-[#f3ecdd]" />
              <div className="mt-2 h-4 rounded bg-[#faf3e8]" />
            </div>
          ))}
        </div>
      )}
      {error && !loading && (
        <div role="alert" className="rounded-2xl border border-[#c98a8a]/40 bg-[#f2d8d3]/40 px-5 py-4 text-[14px] font-semibold text-[#6e2f2f]">
          {error}
        </div>
      )}
      {!loading && !error && requests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#c9b995] bg-[#fffdf7]/60 px-6 py-10 text-center">
          <p className="font-hand text-[24px] text-[#8a6f5c]">no requests yet — share your commissions page! ✿</p>
        </div>
      )}
      <div className="space-y-3">
        {requests.map((r) => (
          <article key={r.id} className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[15px] text-[#40203f]">{r.name} <span className="font-hand font-normal text-[#8a6f5c]">• {r.type}</span></p>
                <p className="text-[12.5px] text-[#8d857a]">{r.contact} • {new Date(r.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => remove(r.id)}
                aria-label={pendingDelete === r.id ? 'Confirm delete request' : 'Delete request'}
                className={`shrink-0 rounded-full border px-4 py-2 text-[12.5px] font-bold min-h-[44px] ${
                  pendingDelete === r.id ? 'border-red-700 bg-red-800 text-white' : 'border-red-200 text-red-800 hover:bg-red-50'
                }`}
              >
                {pendingDelete === r.id ? 'Sure?' : <Trash2 className="w-4 h-4" aria-hidden />}
              </button>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-[#4d4250] whitespace-pre-wrap">{r.details}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Terms ---------------- */
function TermsTab({ data, say, token }: { data: Data; say: (m: string) => void; token: string }) {
  const { terms, setTerms } = data
  const [draft, setDraft] = useState(terms)
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    setDraft(terms)
    setDeletedIds([])
  }, [terms])

  const save = async () => {
    const clean = draft.filter((s) => s.title.trim() !== '' || s.body.trim() !== '')
    if (clean.length === 0) {
      say('Add at least one section first ♡')
      return
    }
    setSaving(true)
    if (!isSupabaseConfigured) {
      if (!isDemoAllowed) {
        say("Couldn't save — studio is not connected.")
        setSaving(false)
        return
      }
      setTerms(clean.map((s, i) => ({ ...s, sort_order: i + 1 })))
      setDeletedIds([])
      setSaving(false)
      say('Terms saved (demo) ♡')
      return
    }
    const h = await tokenHash(token)
    for (const gone of deletedIds) {
      const r = await callManageRpc({ fn: 'manage_delete_terms', args: { p_token_hash: h, p_id: gone } })
      if (!r.ok) {
        say("Couldn't remove a section — " + (r.error ?? 'please try again.'))
        setSaving(false)
        return
      }
    }
    clean.forEach((s, i) => (s.sort_order = i + 1))
    for (const s of clean) {
      const r = await callManageRpc({
        fn: 'manage_upsert_terms',
        args: { p_token_hash: h, p_id: s.id.startsWith('new-') ? null : s.id, p_title: s.title, p_body: s.body, p_sort: s.sort_order },
      })
      if (!r.ok) {
        say("Couldn't save — " + (r.error ?? 'please try again.'))
        setSaving(false)
        return
      }
    }
    setTerms(clean)
    setDeletedIds([])
    setSaving(false)
    say('Terms updated ♡')
  }

  return (
    <div className="max-w-2xl">
      <p className="text-[14px] text-[#6d5f6b] mb-4">These sections appear on the public <strong>/tos</strong> page, in order.</p>
      <div className="space-y-3">
        {draft.map((s, i) => (
          <div key={s.id} className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] p-4 space-y-2.5">
            <div className="flex gap-2.5">
              <input value={s.title} placeholder="Section title"
                onChange={(e) => setDraft(draft.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))}
                className="flex-1 rounded-lg border border-[#e6dcc8] bg-white px-3 py-2.5 text-[14px] font-bold min-h-[44px]"
                aria-label={`Section ${i + 1} title`} />
              <button
                onClick={() => {
                  if (!s.id.startsWith('new-')) setDeletedIds((ids) => [...ids, s.id])
                  setDraft(draft.filter((_, k) => k !== i))
                }}
                className="rounded-full border border-red-200 text-red-800 p-2.5 hover:bg-red-50 min-h-[44px] min-w-[44px] grid place-items-center"
                aria-label={`Remove section ${i + 1}`}>
                <Trash2 className="w-4 h-4" aria-hidden />
              </button>
            </div>
            <textarea value={s.body} rows={3} placeholder="Section text…"
              onChange={(e) => setDraft(draft.map((x, k) => (k === i ? { ...x, body: e.target.value } : x)))}
              className="w-full rounded-lg border border-[#e6dcc8] bg-white px-3 py-2.5 text-[14px]"
              aria-label={`Section ${i + 1} text`} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <button onClick={() => setDraft([...draft, { id: `new-${Date.now()}`, title: '', body: '', sort_order: draft.length + 1 }])}
          className="rounded-full border border-[#5b2b4e]/40 text-[#5b2b4e] px-5 py-2.5 text-[13.5px] font-bold min-h-[44px]">+ Add section</button>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[#5b2b4e] text-white px-7 py-2.5 font-bold disabled:opacity-60 min-h-[44px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Check className="w-4 h-4" aria-hidden />} Save terms
        </button>
      </div>
    </div>
  )
}

/* ---------------- Site ---------------- */
function SiteTab({ data, say, token }: { data: Data; say: (m: string) => void; token: string }) {
  const { config, setConfig } = data
  const [draft, setDraft] = useState(config)
  const [saving, setSaving] = useState(false)
  useEffect(() => setDraft(config), [config])

  const save = async () => {
    if (!draft.site_name.trim()) {
      say('Give your site a name first ♡')
      return
    }
    setSaving(true)
    if (!isSupabaseConfigured) {
      if (!isDemoAllowed) {
        say("Couldn't save — studio is not connected.")
        setSaving(false)
        return
      }
      setConfig(draft)
      setSaving(false)
      say('Site settings saved (demo) ♡')
      return
    }
    const h = await tokenHash(token)
    const r = await callManageRpc({
      fn: 'manage_update_config',
      args: { p_token_hash: h, p_site_name: draft.site_name.trim(), p_tagline: draft.tagline.trim(), p_hero_title: draft.hero_title.trim() },
    })
    if (!r.ok) {
      say("Couldn't save — " + (r.error ?? 'please try again.'))
      setSaving(false)
      return
    }
    setConfig(draft)
    setSaving(false)
    say('Site settings saved ♡')
  }

  return (
    <div className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-6 max-w-2xl space-y-4">
      <h2 className="font-serif-ed italic text-[26px] text-[#40203f]">Site ✿</h2>
      <p className="text-[13.5px] text-[#8d857a] -mt-2">Name, tagline, and hero headline — used in the header, footer, and browser tab.</p>
      <Field label="Site name">
        <input className={inputCls} value={draft.site_name} onChange={(e) => setDraft({ ...draft, site_name: e.target.value })} placeholder="Lorem Ipsum" maxLength={60} />
      </Field>
      <Field label="Tagline">
        <input className={inputCls} value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} placeholder="Lorem ipsum dolor sit amet" maxLength={140} />
      </Field>
      <Field label="Hero headline">
        <input className={inputCls} value={draft.hero_title} onChange={(e) => setDraft({ ...draft, hero_title: e.target.value })} placeholder="It’s Lorem!" maxLength={80} />
      </Field>
      <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-[#5b2b4e] text-white px-7 py-3 font-bold disabled:opacity-60 min-h-[48px]">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Check className="w-4 h-4" aria-hidden />} Save site settings
      </button>
    </div>
  )
}

/* ---------------- Access / token rotation ---------------- */
function AccessTab({ say, token }: { say: (m: string) => void; token: string }) {
  const [newToken, setNewToken] = useState<string | null>(null)
  const [working, setWorking] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [copied, setCopied] = useState<'current' | 'new' | null>(null)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(null), 2000)
    return () => clearTimeout(t)
  }, [copied])

  const copyText = async (text: string, which: 'current' | 'new') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      say(which === 'current' ? 'Current link copied ♡' : 'New link copied — store it somewhere safe!')
    } catch {
      say("Couldn't copy — long-press to copy the link manually.")
    }
  }

  const rotate = async () => {
    setWorking(true)
    // Cryptographically secure randomness (Web Crypto) — never Math.random().
    const fresh = generateManageToken(32)
    if (!isSupabaseConfigured) {
      if (!isDemoAllowed) {
        say("Couldn't rotate — studio is not connected.")
        setWorking(false)
        return
      }
      try {
        localStorage.setItem('shiakonii-demo-manage-valid', fresh)
      } catch { /* ignore */ }
      setNewToken(fresh)
      setWorking(false)
      say('New demo link created ♡')
      return
    }
    const oldHash = await tokenHash(token)
    const newHash = await sha256Hex(fresh)
    const r = await callManageRpc({ fn: 'manage_rotate_token', args: { p_old_hash: oldHash, p_new_hash: newHash } })
    if (!r.ok) {
      say("Couldn't rotate — " + (r.error ?? 'please run migration 002 and try again.'))
      setWorking(false)
      return
    }
    setNewToken(fresh)
    setWorking(false)
  }

  const fullLink = newToken ? `${window.location.origin}/manage/${newToken}` : null

  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-6">
        <h2 className="font-serif-ed italic text-[24px] text-[#40203f] flex items-center gap-2"><Lock className="w-5 h-5" /> Your private link</h2>
        <p className="mt-2 text-[14px] text-[#6d5f6b] leading-relaxed">
          This URL <em>is</em> your password. Anyone with it can edit your site — so keep it in your password manager and never post it publicly.
          The token itself is never stored; only a SHA-256 hash lives in the database.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => copyText(window.location.href, 'current')}
            className="inline-flex items-center gap-2 rounded-full border border-[#e6dcc8] bg-white px-5 py-2.5 text-[13.5px] font-bold hover:bg-[#f3ecdd] min-h-[44px]">
            <Copy className="w-4 h-4" aria-hidden /> {copied === 'current' ? 'Copied ✓' : 'Copy link'}
          </button>
          <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#e6dcc8] bg-white px-5 py-2.5 text-[13.5px] font-bold hover:bg-[#f3ecdd] min-h-[44px]">
            <Eye className="w-4 h-4" aria-hidden /> Preview site
          </a>
        </div>
      </div>

      <div className="rounded-2xl bg-[#40203f] text-[#FAF6EF] p-6">
        <h2 className="font-serif-ed italic text-[24px] flex items-center gap-2"><RefreshCw className="w-5 h-5" /> Lost your link? Make a new one</h2>
        <p className="mt-2 text-[13.5px] opacity-80">Generating a new token immediately disables this one. Save the new link somewhere safe!</p>
        {!confirm ? (
          <button onClick={() => setConfirm(true)} className="mt-4 rounded-full bg-[#FAF6EF] text-[#40203f] px-6 py-2.5 font-bold text-[14px] min-h-[44px]">
            Generate new private link…
          </button>
        ) : (
          <div className="mt-4 rounded-xl bg-white/10 border border-white/20 p-4">
            <p className="text-[14px] font-bold">Are you sure? This link will stop working right away.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setConfirm(false)} className="rounded-full border border-white/30 px-5 py-2.5 text-[13.5px] font-bold min-h-[44px]">Keep this link</button>
              <button onClick={rotate} disabled={working} className="rounded-full bg-[#FAF6EF] text-[#40203f] px-5 py-2.5 text-[13.5px] font-bold disabled:opacity-60 min-h-[44px]">
                {working ? 'Working…' : 'Yes, replace it'}
              </button>
            </div>
          </div>
        )}
        {fullLink && (
          <div className="mt-4 rounded-xl bg-[#FAF6EF] text-[#40203f] p-4 break-all">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#8a6f5c]">Your new private link (copy now!)</p>
            <p className="mt-1 text-[13.5px] font-mono">{fullLink}</p>
            <button onClick={() => copyText(fullLink, 'new')}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#5b2b4e] text-white px-5 py-2.5 text-[13px] font-bold min-h-[44px]">
              <Copy className="w-3.5 h-3.5" aria-hidden /> {copied === 'new' ? 'Copied ✓' : 'Copy new link'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
