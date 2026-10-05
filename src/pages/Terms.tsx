import { Link } from 'react-router-dom'
import { Reveal, Tape } from '../components/Bits'
import { ConfigError, InlineError } from '../components/States'
import { PageMeta } from '../lib/meta'
import { useSiteConfig, useTerms } from '../hooks/useSiteContent'

export function Terms() {
  const { sections, loading, error, isMisconfigured } = useTerms()
  const { config } = useSiteConfig()

  return (
    <main id="main" className="pt-[110px] mx-auto max-w-[820px] px-4 sm:px-6 pb-12">
      <PageMeta
        title={`${config.site_name} — Lorem Ipsum`}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        path="/tos"
      />
      <Reveal>
        <p className="font-hand text-[22px] text-[#8a6f5c] -rotate-1">lorem ipsum dolor…</p>
        <h1 className="font-serif-ed text-[44px] md:text-[58px] leading-none text-[#40203f] font-semibold">Lorem <span className="italic">Ipsum</span></h1>
        <p className="mt-3 text-[14.5px] text-[#6d5f6b]">Lorem ipsum dolor sit amet • consectetur adipiscing elit.</p>
      </Reveal>
      {isMisconfigured && (
        <div className="mt-6">
          <ConfigError compact />
        </div>
      )}
      <div className="mt-8 space-y-5">
        {loading && (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] p-6 animate-pulse" aria-hidden>
                <div className="h-6 w-40 rounded bg-[#f3ecdd]" />
                <div className="mt-3 h-4 rounded bg-[#faf3e8]" />
                <div className="mt-2 h-4 w-5/6 rounded bg-[#faf3e8]" />
              </div>
            ))}
          </>
        )}
        {error && !loading && <InlineError message={error} />}
        {!loading && !error && sections.length === 0 && (
          <p className="font-hand text-[24px] text-[#8a6f5c] text-center py-8">lorem ipsum dolor… ♡</p>
        )}
        {!loading &&
          sections.map((s, i) => (
            <Reveal key={s.id} delay={i % 3}>
              <section className="relative rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-6" style={{ transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)` }}>
                <Tape className="-top-3 left-8" />
                <h2 className="font-serif-ed italic text-[21px] text-[#40203f]">{s.title}</h2>
                <p className="mt-2 text-[14.8px] leading-relaxed text-[#4d4250]">{s.body}</p>
              </section>
            </Reveal>
          ))}
      </div>
      <Reveal className="mt-8 text-center">
        <p className="font-hand text-[22px] text-[#8a6f5c]">lorem ipsum dolor? ♡</p>
        <Link to="/commissions" className="mt-2 inline-flex rounded-full bg-[#5b2b4e] text-[#FAF6EF] px-7 py-3 font-semibold hover:bg-[#422040] transition-colors min-h-[48px]">
          Back to commissions →
        </Link>
      </Reveal>
    </main>
  )
}
