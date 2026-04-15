import { useState } from 'react'
import { TagChip } from './TagChip'

export function StoryCard({ story, onToggleTag, onAddCustomTag }) {
  const [customTag, setCustomTag] = useState('')

  const submitCustomTag = () => {
    if (!customTag.trim()) {
      return
    }

    onAddCustomTag(story.id, customTag)
    setCustomTag('')
  }

  return (
    <article className="rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ochre-700">Story Card</p>
          <h3 className="mt-2 font-display text-2xl text-gumleaf-800">{story.title}</h3>
        </div>
        <div className="rounded-2xl border border-river-100 bg-river-100/70 px-4 py-3 text-sm text-river-700">
          <p className="font-semibold">{story.mediaType}</p>
          <p className="mt-1 text-river-700/80">{story.mediaLabel}</p>
        </div>
      </div>

      <p className="mt-5 leading-7 text-gumleaf-700">{story.narrative}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DetailBlock label="Who was involved" items={story.involved} />
        <DetailBlock label="Who benefited" items={story.benefited} />
        <DetailBlock label="Place / community" items={[story.place]} />
      </div>

      <div className="mt-6 rounded-3xl border border-dashed border-clay-300 bg-clay-100/40 p-4">
        <p className="text-sm font-semibold text-clay-500">Employer-readable tags</p>
        <p className="mt-2 text-sm leading-6 text-gumleaf-700">
          These tags help external employers understand the story. They do not replace the original narrative and
          can be accepted, removed, or rewritten by the user.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {story.tags.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              active={story.approvedTags.includes(tag)}
              onClick={() => onToggleTag(story.id, tag)}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={customTag}
            onChange={(event) => setCustomTag(event.target.value)}
            placeholder="Add your own translation tag"
            className="min-w-0 flex-1 rounded-2xl border border-clay-300 bg-white px-4 py-3 text-sm text-gumleaf-700 outline-none focus:border-gumleaf-400"
          />
          <button
            type="button"
            onClick={submitCustomTag}
            className="rounded-full bg-clay-500 px-4 py-3 text-sm font-semibold text-white"
          >
            Add tag
          </button>
        </div>
      </div>
    </article>
  )
}

function DetailBlock({ label, items }) {
  return (
    <div className="rounded-2xl bg-sand-50 p-4">
      <p className="text-sm font-semibold text-gumleaf-800">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-white px-3 py-1 text-sm text-gumleaf-700">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
