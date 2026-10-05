import { Link } from 'react-router-dom'
import { Reveal, Tape } from '../components/Bits'

const SECTIONS = [
  { t: '1. Lorem ipsum', b: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
  { t: '2. Dolor sit', b: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
  { t: '3. Amet consectetur', b: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
  { t: '4. Adipiscing elit', b: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
  { t: '5. Sed do eiusmod', b: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.' },
  { t: '6. Tempor incididunt', b: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.' },
  { t: '7. Ut labore', b: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.' },
]

export function Terms() {
  return (
    <main id="main" className="pt-[110px] mx-auto max-w-[820px] px-4 sm:px-6 pb-12">
      <Reveal>
        <p className="font-hand text-[22px] text-[#8a6f5c] -rotate-1">lorem ipsum dolor…</p>
        <h1 className="font-serif-ed text-[44px] md:text-[58px] leading-none text-[#40203f] font-semibold">Lorem <span className="italic">Ipsum</span></h1>
        <p className="mt-3 text-[14.5px] text-[#6d5f6b]">Lorem ipsum dolor sit amet • consectetur adipiscing elit.</p>
      </Reveal>
      <div className="mt-8 space-y-5">
        {SECTIONS.map((s, i) => (
          <Reveal key={s.t} delay={i % 3}>
            <section className="relative rounded-2xl bg-[#fffdf7] border border-[#e6dcc8] print-shadow p-6" style={{ transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)` }}>
              <Tape className="-top-3 left-8" />
              <h2 className="font-serif-ed italic text-[21px] text-[#40203f]">{s.t}</h2>
              <p className="mt-2 text-[14.8px] leading-relaxed text-[#4d4250]">{s.b}</p>
            </section>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-8 text-center">
        <p className="font-hand text-[22px] text-[#8a6f5c]">lorem ipsum dolor? ♡</p>
        <Link to="/commissions" className="mt-2 inline-flex rounded-full bg-[#5b2b4e] text-[#FAF6EF] px-7 py-3 font-semibold hover:bg-[#422040] transition-colors">
          Back to commissions →
        </Link>
      </Reveal>
    </main>
  )
}
