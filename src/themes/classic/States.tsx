import { Link } from 'react-router-dom'
import { CONFIG_ERROR_MESSAGE } from '../../lib/env'

export function ConfigError({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="alert"
      className={`border border-dashed border-muted/60 bg-cream text-center ${
        compact ? 'px-4 py-4' : 'px-6 py-10'
      }`}
    >
      <p className="font-display italic text-[24px] text-ink">Something is misconfigured</p>
      <p className="mt-1 text-[14px] text-ink-soft max-w-[52ch] mx-auto">{CONFIG_ERROR_MESSAGE}</p>
    </div>
  )
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="border border-accent/50 bg-accent-soft/40 px-5 py-4 text-center">
      <p className="text-[14px] font-semibold text-accent-deep">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 border border-accent-deep/40 px-5 py-2 text-[13px] font-bold text-accent-deep hover:bg-accent-deep/5 min-h-[44px]"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-10" aria-hidden>
      {['md:col-span-12', 'md:col-span-7', 'md:col-span-5'].map((span, i) => (
        <div key={i} className={`${span} animate-pulse`}>
          <div className="border border-line bg-parchment aspect-[16/10]" />
          <div className="mt-3 h-4 w-2/5 bg-parchment" />
        </div>
      ))}
    </div>
  )
}

export function EmptyGallery() {
  return (
    <div className="relative border border-dashed border-muted/60 bg-cream/60 px-6 py-14 text-center -rotate-[0.3deg]">
      <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted">Nothing pinned yet</p>
      <p className="mt-3 font-note text-[30px] text-ink">the wall is waiting for its first piece…</p>
      <p className="mt-2 text-[14px] text-ink-soft">
        Meanwhile, <Link to="/commissions" className="link-wavy font-semibold text-ink decoration-accent">see what can be commissioned</Link>.
      </p>
    </div>
  )
}
