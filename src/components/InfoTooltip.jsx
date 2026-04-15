import { useState } from 'react'

export function InfoTooltip({ label = 'More info', message }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-gumleaf-200 bg-white/90 text-xs font-semibold text-gumleaf-700 shadow-soft"
      >
        i
      </button>
      {open ? (
        <span className="absolute left-8 top-1/2 z-30 w-72 -translate-y-1/2 rounded-2xl border border-white/70 bg-white p-3 text-sm leading-6 text-gumleaf-700 shadow-soft">
          {message}
        </span>
      ) : null}
    </span>
  )
}
