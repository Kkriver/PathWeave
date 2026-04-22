export default function OutputHeader({ eyebrow, title, description, actions = null }) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200/80 pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-400">{eyebrow}</p>
        <h3 className="mt-3 font-display text-3xl text-stone-900 sm:text-4xl">{title}</h3>
        <p className="mt-4 text-sm leading-7 text-stone-600">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  )
}

