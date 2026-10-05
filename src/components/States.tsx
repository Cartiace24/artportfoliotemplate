import { Link } from 'react-router-dom'
import { CONFIG_ERROR_MESSAGE } from '../lib/env'

export function ConfigError({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-dashed border-[#c9b995] bg-[#f3ecdd]/60 text-center ${
        compact ? 'px-4 py-4' : 'px-6 py-10'
      }`}
    >
      <p className="font-hand text-[24px] text-[#8a6f5c]">oh no, the paint water spilled…</p>
      <p className="mt-1 text-[14px] text-[#6d5f6b] max-w-[52ch] mx-auto">{CONFIG_ERROR_MESSAGE}</p>
    </div>
  )
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-[#c98a8a]/40 bg-[#f2d8d3]/40 px-5 py-4 text-center">
      <p className="text-[14px] font-semibold text-[#6e2f2f]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-full border border-[#6e2f2f]/30 px-5 py-2 text-[13px] font-bold text-[#6e2f2f] hover:bg-[#6e2f2f]/5 min-h-[44px]"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function GallerySkeleton() {
  const spans = ['md:col-span-7', 'md:col-span-5', 'md:col-span-5', 'md:col-span-7']
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6" aria-hidden>
      {spans.map((span, i) => (
        <div
          key={i}
          className={`${span} rounded-xl bg-[#fffdf7] border border-[#e6dcc8] p-2 animate-pulse`}
        >
          <div className="rounded-lg bg-[#efe7d6] aspect-[4/3]" />
          <div className="px-1.5 py-2.5 flex gap-2">
            <div className="h-5 w-20 rounded-full bg-[#f2d8d3]/70" />
            <div className="h-5 w-28 rounded bg-[#f3ecdd]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function EmptyGallery() {
  return (
    <div className="rounded-2xl border border-dashed border-[#c9b995] bg-[#fffdf7]/60 px-6 py-10 text-center">
      <p className="font-hand text-[26px] text-[#8a6f5c]">lorem ipsum dolor sit amet ♡</p>
      <p className="mt-1 text-[14px] text-[#6d5f6b]">
        In the meantime, <Link to="/commissions" className="font-bold text-[#5b2b4e] underline underline-offset-4">see what you can commission</Link>.
      </p>
    </div>
  )
}
