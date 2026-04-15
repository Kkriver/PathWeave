export function SectionTitle({ eyebrow, title, body, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-ochre-700">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-3xl text-gumleaf-800 md:text-4xl">{title}</h2>
      {body ? <p className="mt-4 max-w-3xl text-base leading-7 text-gumleaf-600">{body}</p> : null}
    </div>
  )
}
