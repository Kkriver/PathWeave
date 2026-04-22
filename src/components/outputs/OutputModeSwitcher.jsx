export default function OutputModeSwitcher({ modes, value, onChange }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {modes.map((mode) => (
        <button
          key={mode.key}
          className={`rounded-[28px] border p-5 text-left transition ${
            value === mode.key ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-stone-50 text-stone-800'
          }`}
          onClick={() => onChange(mode.key)}
          type="button"
        >
          <p className="text-xs uppercase tracking-[0.24em] opacity-70">{mode.label}</p>
          <p className="mt-3 font-display text-2xl">{mode.title}</p>
          <p className="mt-3 text-sm leading-6 opacity-80">{mode.description}</p>
        </button>
      ))}
    </div>
  )
}

