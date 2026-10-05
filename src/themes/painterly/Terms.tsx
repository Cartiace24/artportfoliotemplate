import { Link } from 'react-router-dom'
import { PNote, PReveal } from './bits'
import { PageMeta } from '../../lib/meta'
import { useSiteConfig, useTerms } from '../../hooks/useSiteContent'

export function PainterlyTerms() {
  const { sections, loading, error } = useTerms()
  const { config } = useSiteConfig()

  return (
    <main id="main" className="pt-[72px] mx-auto max-w-[820px] px-4 sm:px-6 pb-12">
      <PageMeta
        title={`${config.site_name} — Terms`}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        path="/tos"
      />
      <div className="py-10 md:py-14 text-center">
        <PReveal>
          <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-[var(--pt-brown)]">The fine print</p>
          <h1 className="pt-display text-[clamp(3rem,9vw,5.5rem)] leading-[0.95] text-[var(--pt-ink)] mt-3">
            Terms
          </h1>
          <PNote className="text-[24px] mt-2">boring bits, painted over quickly!</PNote>
        </PReveal>
      </div>
      <div className="mt-6 border-t-[3px] border-[var(--pt-ink)]">
        {loading && (
          <div className="animate-pulse py-8" aria-hidden>
            <div className="h-7 w-40 bg-[var(--pt-canvas)]" />
            <div className="mt-3 h-4 bg-[var(--pt-canvas)]" />
          </div>
        )}
        {error && !loading && (
          <div role="alert" className="my-8 border-2 border-[var(--pt-ochre)] px-5 py-4 text-[14px] font-semibold text-[var(--pt-ochre)]">
            {error}
          </div>
        )}
        {!loading && sections.length === 0 && !error && (
          <p className="pt-hand text-[28px] text-[var(--pt-brown)] text-center py-10">nothing pinned here yet…</p>
        )}
        {!loading &&
          sections.map((s, i) => (
            <PReveal key={s.id}>
              <section className="grid grid-cols-12 gap-4 py-7 border-b-2 border-dashed border-[var(--pt-ink)]/25">
                <p className={`col-span-2 sm:col-span-1 pt-hand text-[40px] leading-none text-[var(--pt-ochre)] ${i % 2 ? 'rotate-3' : '-rotate-3'}`} aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </p>
                <div className="col-span-10 sm:col-span-11">
                  <h2 className="pt-display text-[24px] text-[var(--pt-ink)]">{s.title.replace(/^\d+\.\s*/, '')}</h2>
                  <p className="mt-2 text-[14.8px] leading-relaxed text-[var(--pt-ink-soft)] max-w-[62ch]">{s.body}</p>
                </div>
              </section>
            </PReveal>
          ))}
      </div>
      <PReveal className="mt-10 text-center">
        <Link
          to="/commissions"
          className="inline-flex items-center justify-center bg-[var(--pt-ink)] text-[var(--pt-cream)] px-7 py-3.5 text-[14px] font-semibold tracking-wide hover:bg-[var(--pt-ochre)] transition-colors min-h-[48px]"
        >
          Back to commissions →
        </Link>
      </PReveal>
    </main>
  )
}
