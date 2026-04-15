export function TagChip({ label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? 'border-gumleaf-800 bg-gumleaf-800 text-sand-50'
          : 'border-gumleaf-200 bg-white/80 text-gumleaf-700 hover:border-gumleaf-400 hover:bg-gumleaf-100/50'
      }`}
    >
      {label}
    </button>
  )
}
