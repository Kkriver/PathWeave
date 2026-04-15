import { useMemo, useState } from 'react'

const themeOrder = ['community', 'care', 'learning', 'creativity', 'leadership', 'place', 'future pathways']

export function JourneyMap({ stories, centreLabel = 'What matters to me' }) {
  const [view, setView] = useState('circle')
  const [selectedStoryId, setSelectedStoryId] = useState(stories[0]?.id ?? null)

  const storyNodes = useMemo(
    () =>
      stories.map((story, index) => ({
        ...story,
        type: inferStoryType(story, index),
        excerpt: `${story.narrative.slice(0, 110)}${story.narrative.length > 110 ? '...' : ''}`,
        themes: inferThemes(story),
      })),
    [stories],
  )

  const selectedNode = storyNodes.find((story) => story.id === selectedStoryId) ?? storyNodes[0]

  const circlePositions = [
    'left-[8%] top-[16%]',
    'right-[10%] top-[20%]',
    'left-[18%] bottom-[10%]',
    'right-[16%] bottom-[12%]',
    'left-[38%] top-[2%]',
    'right-[36%] bottom-[2%]',
  ]

  if (!selectedNode) {
    return (
      <div className="rounded-[32px] border border-dashed border-gumleaf-200 bg-white/80 p-6 text-sm leading-6 text-gumleaf-700 shadow-soft">
        Add a story to begin shaping a journey view.
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <ViewTab label="Circle view" active={view === 'circle'} onClick={() => setView('circle')} />
            <ViewTab label="Connection view" active={view === 'connection'} onClick={() => setView('connection')} />
          </div>
          <p className="max-w-xl text-sm leading-6 text-gumleaf-600">
            This view is designed to show that identity and experience do not always follow a single straight path.
          </p>
        </div>

        {view === 'circle' ? (
          <div className="relative min-h-[560px] overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur md:p-10">
            <div className="absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ochre-300/60" />
            <div className="absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-river-300/50" />

            <button
              type="button"
              className="absolute left-1/2 top-1/2 z-10 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gumleaf-200 bg-sand-50 p-6 text-center shadow-soft"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ochre-700">Centre node</p>
                <p className="mt-3 font-display text-2xl text-gumleaf-800">{centreLabel}</p>
              </div>
            </button>

            {storyNodes.map((story, index) => (
              <button
                key={story.id}
                type="button"
                onClick={() => setSelectedStoryId(story.id)}
                className={`absolute w-[220px] rounded-[26px] border p-4 text-left shadow-soft transition ${
                  circlePositions[index] || 'left-[10%] top-[10%]'
                } ${
                  selectedStoryId === story.id
                    ? 'border-gumleaf-400 bg-gumleaf-100/70'
                    : 'border-white/70 bg-white/90 hover:bg-sand-50'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ochre-700">{story.type}</p>
                <h3 className="mt-2 font-display text-2xl text-gumleaf-800">{story.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gumleaf-700">{story.excerpt}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur md:p-10">
            <div className="grid gap-6 md:grid-cols-3">
              {themeOrder.map((theme) => {
                const themedStories = storyNodes.filter((story) => story.themes.includes(theme))

                return (
                  <div key={theme} className="relative rounded-[26px] bg-sand-50/90 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ochre-700">{theme}</p>
                    <div className="mt-4 space-y-3">
                      {themedStories.map((story) => (
                        <button
                          key={`${theme}-${story.id}`}
                          type="button"
                          onClick={() => setSelectedStoryId(story.id)}
                          className={`w-full rounded-[22px] border p-4 text-left transition ${
                            selectedStoryId === story.id
                              ? 'border-river-400 bg-river-100/60'
                              : 'border-white bg-white hover:bg-river-100/40'
                          }`}
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-river-700">{story.type}</p>
                          <h3 className="mt-2 text-lg font-semibold text-gumleaf-800">{story.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-gumleaf-700">{story.excerpt}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <aside className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ochre-700">Detail panel</p>
        <h3 className="mt-3 font-display text-3xl text-gumleaf-800">{selectedNode.title}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{selectedNode.type}</Badge>
          <Badge>{selectedNode.privacy}</Badge>
        </div>

        <div className="mt-6 space-y-5">
          <DetailSection title="Full story" body={selectedNode.narrative} />
          <DetailList title="Involved people" items={selectedNode.involved} />
          <DetailList title="Who benefited" items={selectedNode.benefited} />
          <DetailList title="Location" items={[selectedNode.place]} />
          <DetailList title="Media placeholders" items={selectedNode.mediaItems || [selectedNode.mediaLabel]} />
          <DetailList title="Optional employer tags" items={selectedNode.approvedTags} />
          <DetailSection title="Short excerpt" body={`${selectedNode.narrative.slice(0, 140)}${selectedNode.narrative.length > 140 ? '...' : ''}`} />
        </div>
      </aside>
    </div>
  )
}

function inferThemes(story) {
  const themes = new Set()
  const haystack = `${story.title} ${story.narrative} ${story.tags.join(' ')} ${story.place}`.toLowerCase()

  if (haystack.includes('community') || haystack.includes('family') || haystack.includes('elder')) themes.add('community')
  if (haystack.includes('care') || haystack.includes('homework') || haystack.includes('help')) themes.add('care')
  if (haystack.includes('learn') || haystack.includes('school')) themes.add('learning')
  if (haystack.includes('creative') || haystack.includes('mural') || haystack.includes('art')) themes.add('creativity')
  if (haystack.includes('leadership') || haystack.includes('mentor') || haystack.includes('organising')) themes.add('leadership')
  if (story.place) themes.add('place')
  themes.add('future pathways')

  return [...themes]
}

function inferStoryType(story, index) {
  const lowerTitle = story.title.toLowerCase()
  if (lowerTitle.includes('market') || lowerTitle.includes('enterprise')) return 'Aspiration'
  if (lowerTitle.includes('homework') || lowerTitle.includes('care')) return 'Contribution'
  if (lowerTitle.includes('mural') || lowerTitle.includes('art')) return 'Story'
  return index % 2 === 0 ? 'Responsibility' : 'Story'
}

function ViewTab({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition ${
        active ? 'bg-gumleaf-800 text-sand-50' : 'bg-white/80 text-gumleaf-700 hover:bg-sand-100'
      }`}
    >
      {label}
    </button>
  )
}

function DetailSection({ title, body }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gumleaf-800">{title}</p>
      <p className="mt-2 text-sm leading-7 text-gumleaf-700">{body}</p>
    </div>
  )
}

function DetailList({ title, items }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gumleaf-800">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </div>
    </div>
  )
}

function Badge({ children }) {
  return <span className="rounded-full bg-sand-50 px-3 py-1 text-sm text-gumleaf-700">{children}</span>
}
