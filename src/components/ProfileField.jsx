export function ProfileField({ label, value, helper, large = false, onChange }) {
  return (
    <label className="block rounded-[24px] border border-white/60 bg-white/80 p-5 shadow-soft">
      <span className="text-sm font-semibold text-gumleaf-800">{label}</span>
      {helper ? <span className="mt-1 block text-sm leading-6 text-gumleaf-600">{helper}</span> : null}
      {large ? (
        <textarea
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          rows={5}
          className="mt-4 w-full resize-none rounded-2xl border border-sand-100 bg-sand-50 px-4 py-3 text-base leading-7 text-gumleaf-700 outline-none focus:border-gumleaf-400"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="mt-4 w-full rounded-2xl border border-sand-100 bg-sand-50 px-4 py-3 text-base text-gumleaf-700 outline-none focus:border-gumleaf-400"
        />
      )}
    </label>
  )
}
