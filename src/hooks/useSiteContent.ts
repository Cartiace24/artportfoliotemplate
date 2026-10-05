import { useCallback, useEffect, useState } from 'react'
import { getSupabase } from '../lib/supabase'
import { isDemoAllowed, isProductionMisconfigured, isSupabaseConfigured } from '../lib/env'
import {
  PLACEHOLDER_ABOUT,
  PLACEHOLDER_ARTWORKS,
  PLACEHOLDER_CATEGORIES,
  PLACEHOLDER_CONFIG,
  PLACEHOLDER_PRICES,
  PLACEHOLDER_SETTINGS,
  PLACEHOLDER_SOCIALS,
  PLACEHOLDER_TERMS,
  type AboutContent,
  type Artwork,
  type CommissionCategory,
  type CommissionPrice,
  type SiteConfig,
  type SiteSettings,
  type SocialLink,
  type TermsSection,
} from '../lib/types'

export interface QueryState<T> {
  data: T
  loading: boolean
  error: string | null
  /** True when showing built-in demo placeholders (dev only). */
  isDemo: boolean
  /** True when production has no usable backend — render config error. */
  isMisconfigured: boolean
}

function demoState<T>(data: T): QueryState<T> {
  return { data, loading: false, error: null, isDemo: true, isMisconfigured: false }
}

const MISCONFIG = 'misconfigured'

async function throwIfMisconfigured(): Promise<void> {
  if (isProductionMisconfigured) throw new Error(MISCONFIG)
}

function misconfiguredState<T>(fallback: T): QueryState<T> {
  return { data: fallback, loading: false, error: MISCONFIG, isDemo: false, isMisconfigured: true }
}

export function useSiteSettings(): QueryState<SiteSettings> & { settings: SiteSettings; setSettings: (s: SiteSettings) => void } {
  const [state, setState] = useState<QueryState<SiteSettings>>(() =>
    !isSupabaseConfigured
      ? isDemoAllowed
        ? { data: PLACEHOLDER_SETTINGS, loading: false, error: null, isDemo: true, isMisconfigured: false }
        : { data: PLACEHOLDER_SETTINGS, loading: false, error: MISCONFIG, isDemo: false, isMisconfigured: true }
      : { data: PLACEHOLDER_SETTINGS, loading: true, error: null, isDemo: false, isMisconfigured: false }
  )

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    ;(async () => {
      try {
        await throwIfMisconfigured()
        const sb = getSupabase()!
        const { data, error } = await sb
          .from('site_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (cancelled) return
        if (error) throw error
        if (!data) throw new Error('empty')
        setState({ data: data as SiteSettings, loading: false, error: null, isDemo: false, isMisconfigured: false })
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : 'load failed'
        if (msg === 'empty') {
          // Seeded table missing — keep placeholder content but flag it.
          setState({ data: PLACEHOLDER_SETTINGS, loading: false, error: null, isDemo: false, isMisconfigured: false })
        } else {
          setState((s) => ({ ...s, loading: false, error: "Couldn't load commission status. Please refresh and try again." }))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return {
    ...state,
    settings: state.data,
    setSettings: (s: SiteSettings) => setState((prev) => ({ ...prev, data: s })),
  }
}

export function useArtworks(featuredOnly = false) {
  const [state, setState] = useState<QueryState<Artwork[]>>(() =>
    !isSupabaseConfigured
      ? isDemoAllowed
        ? demoState(PLACEHOLDER_ARTWORKS)
        : misconfiguredState(PLACEHOLDER_ARTWORKS)
      : { data: [], loading: true, error: null, isDemo: false, isMisconfigured: false }
  )

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      await throwIfMisconfigured()
      const sb = getSupabase()!
      let q = sb.from('artworks').select('*').order('sort_order', { ascending: true })
      if (featuredOnly) q = q.eq('featured', true)
      const { data, error } = await q
      if (error) throw error
      setState({ data: (data ?? []) as Artwork[], loading: false, error: null, isDemo: false, isMisconfigured: false })
    } catch (e) {
      const msg = e instanceof Error && e.message === MISCONFIG ? MISCONFIG : "Couldn't load the artwork right now. Please refresh and try again."
      setState((s) => ({ ...s, loading: false, error: msg, isMisconfigured: msg === MISCONFIG }))
    }
  }, [featuredOnly])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    ...state,
    artworks: state.data,
    loading: state.loading,
    refresh,
    setArtworks: (a: Artwork[] | ((prev: Artwork[]) => Artwork[])) =>
      setState((s) => ({ ...s, data: typeof a === 'function' ? (a as (p: Artwork[]) => Artwork[])(s.data) : a })),
  }
}

export function usePricing(): QueryState<{ categories: CommissionCategory[]; prices: CommissionPrice[] }> & {
  categories: CommissionCategory[]
  prices: CommissionPrice[]
} {
  const [state, setState] = useState<
    QueryState<{ categories: CommissionCategory[]; prices: CommissionPrice[] }>
  >(() =>
    !isSupabaseConfigured
      ? isDemoAllowed
        ? demoState({ categories: PLACEHOLDER_CATEGORIES, prices: PLACEHOLDER_PRICES })
        : misconfiguredState({ categories: [], prices: [] })
      : { data: { categories: [], prices: [] }, loading: true, error: null, isDemo: false, isMisconfigured: false }
  )

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    ;(async () => {
      try {
        await throwIfMisconfigured()
        const sb = getSupabase()!
        const [cats, prs] = await Promise.all([
          sb.from('commission_categories').select('*').order('sort_order'),
          sb.from('commission_prices').select('*, commission_categories(name)').order('sort_order'),
        ])
        if (cancelled) return
        if (cats.error) throw cats.error
        if (prs.error) throw prs.error
        const prices = ((prs.data ?? []) as unknown[]).map((r: unknown) => {
          const row = r as Record<string, unknown>
          const cat = row['commission_categories'] as { name?: string } | null
          return { ...(row as object), category_name: cat?.name } as CommissionPrice
        })
        setState({
          data: { categories: (cats.data ?? []) as CommissionCategory[], prices },
          loading: false,
          error: null,
          isDemo: false,
          isMisconfigured: false,
        })
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: "Couldn't load pricing right now. Please refresh and try again." }))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { ...state, categories: state.data.categories, prices: state.data.prices }
}

export function useAbout(): QueryState<AboutContent> & {
  about: AboutContent
  setAbout: (a: AboutContent) => void
} {
  const [state, setState] = useState<QueryState<AboutContent>>(() =>
    !isSupabaseConfigured
      ? isDemoAllowed
        ? demoState(PLACEHOLDER_ABOUT)
        : misconfiguredState(PLACEHOLDER_ABOUT)
      : { data: PLACEHOLDER_ABOUT, loading: true, error: null, isDemo: false, isMisconfigured: false }
  )

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    ;(async () => {
      try {
        await throwIfMisconfigured()
        const sb = getSupabase()!
        const { data, error } = await sb.from('about_content').select('*').limit(1).maybeSingle()
        if (cancelled) return
        if (error) throw error
        if (data) setState({ data: data as AboutContent, loading: false, error: null, isDemo: false, isMisconfigured: false })
        else setState((s) => ({ ...s, loading: false }))
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: "Couldn't load the artist bio. Please refresh and try again." }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return {
    ...state,
    about: state.data,
    setAbout: (a: AboutContent) => setState((s) => ({ ...s, data: a })),
  }
}

export function useSocials(): QueryState<SocialLink[]> & { socials: SocialLink[] } {
  const [state, setState] = useState<QueryState<SocialLink[]>>(() =>
    !isSupabaseConfigured
      ? isDemoAllowed
        ? demoState(PLACEHOLDER_SOCIALS)
        : misconfiguredState([])
      : { data: [], loading: true, error: null, isDemo: false, isMisconfigured: false }
  )

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    ;(async () => {
      try {
        await throwIfMisconfigured()
        const sb = getSupabase()!
        const { data, error } = await sb.from('social_links').select('*').eq('enabled', true).order('sort_order')
        if (cancelled) return
        if (error) throw error
        setState({ data: (data ?? []) as SocialLink[], loading: false, error: null, isDemo: false, isMisconfigured: false })
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: null }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { ...state, socials: state.data }
}

export function useSiteConfig(): QueryState<SiteConfig> & {
  config: SiteConfig
  setConfig: (c: SiteConfig) => void
} {
  const [state, setState] = useState<QueryState<SiteConfig>>(() =>
    !isSupabaseConfigured
      ? isDemoAllowed
        ? demoState(PLACEHOLDER_CONFIG)
        : misconfiguredState(PLACEHOLDER_CONFIG)
      : { data: PLACEHOLDER_CONFIG, loading: true, error: null, isDemo: false, isMisconfigured: false }
  )

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    ;(async () => {
      try {
        await throwIfMisconfigured()
        const sb = getSupabase()!
        const { data, error } = await sb.from('site_config').select('*').limit(1).maybeSingle()
        if (cancelled) return
        if (error) throw error
        if (data) setState({ data: data as SiteConfig, loading: false, error: null, isDemo: false, isMisconfigured: false })
        else setState((s) => ({ ...s, loading: false }))
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: null }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return {
    ...state,
    config: state.data,
    setConfig: (c: SiteConfig) => setState((s) => ({ ...s, data: c })),
  }
}

export function useTerms(): QueryState<TermsSection[]> & { sections: TermsSection[] } {
  const [state, setState] = useState<QueryState<TermsSection[]>>(() =>
    !isSupabaseConfigured
      ? isDemoAllowed
        ? demoState(PLACEHOLDER_TERMS)
        : misconfiguredState([])
      : { data: [], loading: true, error: null, isDemo: false, isMisconfigured: false }
  )

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    ;(async () => {
      try {
        await throwIfMisconfigured()
        const sb = getSupabase()!
        const { data, error } = await sb.from('terms_sections').select('*').order('sort_order')
        if (cancelled) return
        if (error) throw error
        setState({ data: (data ?? []) as TermsSection[], loading: false, error: null, isDemo: false, isMisconfigured: false })
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: "Couldn't load this page. Please refresh and try again." }))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { ...state, sections: state.data }
}
