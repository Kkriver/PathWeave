import { useState } from 'react'
import { TagChip } from './TagChip'

export function TranslationPanel({
  stories,
  translationPool,
  onToggleTag,
  onRemoveTag,
  onEditTag,
  onAddCustomTag,
  showApprovedTagsPublic,
  onTogglePublicTags,
  infoTooltip,
}) {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ochre-700">Optional employer translation</p>
          <div className="mt-2 flex items-center gap-3">
            <h2 className="font-display text-3xl text-gumleaf-800 md:text-4xl">Review optional tags</h2>
            {infoTooltip}
          </div>
          <p className="mt-4 text-base leading-7 text-gumleaf-600">
            PathWeave can suggest words that may help employers or organisations understand your story in another
            context. These tags are optional. They do not replace your own words.
          </p>
        </div>
        <label className="flex items-center gap-3 rounded-[24px] bg-white/85 px-4 py-3 text-sm text-gumleaf-700 shadow-soft">
          <input
            type="checkbox"
            checked={showApprovedTagsPublic}
            onChange={onTogglePublicTags}
            className="h-4 w-4 rounded border-gumleaf-300 text-gumleaf-800 focus:ring-gumleaf-700"
          />
          <span>Show approved tags in my public PathWeave</span>
        </label>
      </div>

      <div className="rounded-[28px] border border-dashed border-ochre-300 bg-white/75 p-5 text-sm leading-6 text-gumleaf-700 shadow-soft">
        Some meanings may not translate neatly into standard workplace language. Keep, edit, or remove any tag that
        does not feel right.
      </div>

      <div className="grid gap-6">
        {stories.map((story) => (
          <TranslationStoryCard
            key={story.id}
            story={story}
            translationPool={translationPool}
            onToggleTag={onToggleTag}
            onRemoveTag={onRemoveTag}
            onEditTag={onEditTag}
            onAddCustomTag={onAddCustomTag}
          />
        ))}
      </div>
    </section>
  )
}

function TranslationStoryCard({ story, translationPool, onToggleTag, onRemoveTag, onEditTag, onAddCustomTag }) {
  const [customTag, setCustomTag] = useState('')
  const [editingTag, setEditingTag] = useState(null)
  const [editingValue, setEditingValue] = useState('')

  const excerpt = `${story.narrative.slice(0, 120)}${story.narrative.length > 120 ? '...' : ''}`
  const visibleTags = [...new Set([...translationPool.filter((tag) => story.tags.includes(tag)), ...story.tags])]

  const submitCustomTag = () => {
    if (!customTag.trim()) {
      return
    }

    onAddCustomTag(story.id, customTag)
    setCustomTag('')
  }

  const submitEdit = () => {
    if (!editingTag || !editingValue.trim()) {
      return
    }

    onEditTag(story.id, editingTag, editingValue)
    setEditingTag(null)
    setEditingValue('')
  }

  return (
    <article className="rounded-[30px] border border-white/60 bg-white/85 p-6 shadow-soft">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ochre-700">Original story context</p>
          <h3 className="mt-3 font-display text-2xl text-gumleaf-800">{story.title}</h3>
          <p className="mt-3 text-sm leading-6 text-gumleaf-600">{excerpt}</p>
          <p className="mt-4 leading-7 text-gumleaf-700">{story.narrative}</p>
        </div>

        <div className="rounded-[28px] border border-dashed border-clay-300 bg-clay-100/35 p-5">
          <p className="text-sm font-semibold text-clay-500">Suggested tags</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <TagChip
                key={`${story.id}-${tag}`}
                label={tag}
                active={story.approvedTags.includes(tag)}
                onClick={() => onToggleTag(story.id, tag)}
              />
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {visibleTags.map((tag) => (
              <div key={`${story.id}-${tag}-controls`} className="rounded-2xl bg-white/85 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gumleaf-800">{tag}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gumleaf-500">
                      {story.approvedTags.includes(tag) ? 'Accepted' : 'Not shown publicly'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gumleaf-600">{explainTagSuggestion(tag, story)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleTag(story.id, tag)}
                      className="rounded-full border border-gumleaf-200 bg-white px-3 py-2 text-xs font-semibold text-gumleaf-700"
                    >
                      {story.approvedTags.includes(tag) ? 'Remove tag' : 'Accept tag'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTag(tag)
                        setEditingValue(tag)
                      }}
                      className="rounded-full border border-river-200 bg-white px-3 py-2 text-xs font-semibold text-river-700"
                    >
                      Edit tag text
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveTag(story.id, tag)}
                      className="rounded-full border border-clay-300 bg-white px-3 py-2 text-xs font-semibold text-clay-500"
                    >
                      Remove tag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {editingTag ? (
            <div className="mt-5 rounded-2xl border border-river-200 bg-white p-4">
              <p className="text-sm font-semibold text-gumleaf-800">Edit tag text</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  value={editingValue}
                  onChange={(event) => setEditingValue(event.target.value)}
                  className="min-w-0 flex-1 rounded-2xl border border-sand-100 bg-sand-50 px-4 py-3 text-sm text-gumleaf-700 outline-none focus:border-gumleaf-400"
                />
                <button
                  type="button"
                  onClick={submitEdit}
                  className="rounded-full bg-gumleaf-800 px-4 py-3 text-sm font-semibold text-sand-50"
                >
                  Save edit
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl bg-white/85 p-4">
            <p className="text-sm font-semibold text-gumleaf-800">Add custom tag</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                value={customTag}
                onChange={(event) => setCustomTag(event.target.value)}
                placeholder="Add a word that feels right to you"
                className="min-w-0 flex-1 rounded-2xl border border-sand-100 bg-sand-50 px-4 py-3 text-sm text-gumleaf-700 outline-none focus:border-gumleaf-400"
              />
              <button
                type="button"
                onClick={submitCustomTag}
                className="rounded-full bg-clay-500 px-4 py-3 text-sm font-semibold text-white"
              >
                Add custom tag
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function explainTagSuggestion(tag, story) {
  const lowerTag = tag.toLowerCase()
  const storyText = `${story.title} ${story.narrative} ${story.involved.join(' ')} ${story.benefited.join(' ')}`.toLowerCase()

  if (lowerTag === 'leadership') return 'Suggested because the story shows responsibility, guidance, or helping others keep something moving.'
  if (lowerTag === 'teamwork') return 'Suggested because the story involves shared work with other people, groups, or community members.'
  if (lowerTag === 'communication') return 'Suggested because the story includes explaining, listening, checking in, or speaking with others.'
  if (lowerTag === 'community engagement') return 'Suggested because the story is connected to local people, shared activity, or community participation.'
  if (lowerTag === 'mentoring') return 'Suggested because the story involves guiding, encouraging, or helping younger people or peers.'
  if (lowerTag === 'organisation') return 'Suggested because the story includes planning, arranging, or helping things run smoothly.'
  if (lowerTag === 'cultural knowledge') return 'Suggested only as a broad workplace phrase. Keep it only if it feels appropriate and does not flatten the story.'
  if (lowerTag === 'creativity' || lowerTag === 'creative practice')
    return 'Suggested because the story includes making, design, visual work, or other creative process.'
  if (lowerTag === 'coordination') return 'Suggested because the story includes keeping tasks, people, or activities connected.'
  if (lowerTag === 'caregiving') return 'Suggested because the story shows care, support, or everyday responsibility for others.'
  if (lowerTag === 'initiative') return 'Suggested because the story shows self-direction, trying something new, or taking responsibility.'
  if (lowerTag === 'problem solving') return 'Suggested because the story includes adjusting, responding, or working through practical challenges.'
  if (storyText.includes(lowerTag)) return 'Suggested because this word already appears close to the story context.'
  return 'Suggested as one possible workplace-facing reading of the story. Keep it only if it still feels true to your meaning.'
}
