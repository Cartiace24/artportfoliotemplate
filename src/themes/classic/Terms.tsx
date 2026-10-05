import { Link } from 'react-router-dom'
import { Eyebrow, Reveal } from './Bits'
import { ConfigError, InlineError } from './States'
import { PageMeta } from '../../lib/meta'
import { useSiteConfig, useTerms } from '../../hooks/useSiteContent'

export function Terms() {
  const { sections, loading, error, isMisconfigured } = useTerms()
  const { config } = useSiteConfig()

  return (
    <main id="main" className="pt-[72px] mx-auto max-w-[820px] px-4 sm:px-6 pb-12">
      <PageMeta
        title={`${config.site_name} — Terms`}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        path="/tos"
      />
      <div className="py-10 md:py-14 border-b border-ink">
        <Reveal>
          <Eyebrow>The fine print</Eyebrow>
          <h1 className="font-display text-[clamp(2.8rem,7vw,4.5rem)] leading-[1] text-ink mt-3">
            Terms
          </h1>
          <p className="mt-4 text-[14.5px] text-ink-soft">Lorem ipsum dolor sit amet • consectetur adipiscing elit.</p>
        </Reveal>
      </div>
      {isMisconfigured && (
        <div className="mt-6">
          <ConfigError compact />
        </div>
      )}
      <div className="mt-10">
        {loading && (
          <div className="animate-pulse" aria-hidden>
            <div className="h-6 w-40 bg-parchment" />
            <div className="mt-3 h-4 bg-parchment" />
            <div className="mt-2 h-4 w-5/6 bg-parchment" />
          </div>
        )}
        {error && !loading && <InlineError message={error} />}
        {!loading && !error && sections.length === 0 && (
          <p className="font-mono text-[12px] tracking-[0.18em] uppercase text-muted text-center py-8">Nothing here yet</p>
        )}
        {!loading &&
          sections.map((s, i) => (
            <Reveal key={s.id}>
              <section className="grid grid-cols-12 gap-4 py-7 border-b border-line first:border-t first:border-ink">
                <p className={`col-span-2 sm:col-span-1 font-note text-[34px] leading-none text-accent ${i % 2 ? 'rotate-2' : '-rotate-2'}`} aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </p>
                <div className="col-span-10 sm:col-span-11">
                  <h2 className="font-display text-[22px] text-ink">{s.title.replace(/^\d+\.\s*/, '')}</h2>
                  <p className="mt-2 text-[14.8px] leading-relaxed text-ink-soft max-w-[62ch]">{s.body}</p>
                </div>
              </section>
            </Reveal>
          ))}
      </div>
      <Reveal className="mt-10">
        <Link
          to="/commissions"
          className="inline-flex items-center justify-center bg-ink text-cream px-7 py-3.5 text-[14px] font-semibold tracking-wide hover:bg-accent-deep transition-colors min-h-[48px]"
        >
          Back to commissions →
        </Link>
      </Reveal>
    </main>
  )
}
