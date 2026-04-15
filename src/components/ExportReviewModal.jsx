export function ExportReviewModal({
  open,
  stories,
  config,
  onClose,
  onToggleField,
  onToggleStory,
  onModeChange,
  onContinueExport,
  onReviewSelection,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gumleaf-800/45 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-review-title"
        className="w-full max-w-4xl rounded-[32px] border border-white/70 bg-white p-6 shadow-soft md:p-8"
      >
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ochre-700">Export review</p>
            <h2 id="export-review-title" className="mt-3 font-display text-3xl text-gumleaf-800">
              Review what you share
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <section className="rounded-[28px] bg-sand-50 p-5">
              <p className="text-sm font-semibold text-gumleaf-800">PROFILE</p>
              <div className="mt-4 space-y-3">
                <CheckboxRow
                  label="Name"
                  checked={config.includeName}
                  onChange={() => onToggleField('includeName')}
                />
                <CheckboxRow
                  label="Story introduction"
                  checked={config.includeStoryIntroduction}
                  onChange={() => onToggleField('includeStoryIntroduction')}
                />
                <CheckboxRow
                  label="Place/community connection"
                  checked={config.includePlaceConnection}
                  onChange={() => onToggleField('includePlaceConnection')}
                />
              </div>
            </section>

            <section className="rounded-[28px] bg-sand-50 p-5">
              <p className="text-sm font-semibold text-gumleaf-800">STORIES</p>
              <div className="mt-4 space-y-3">
                {stories.map((story) => (
                  <CheckboxRow
                    key={story.id}
                    label={`Include ${story.title}`}
                    checked={config.includedStoryIds.includes(story.id)}
                    onChange={() => onToggleStory(story.id)}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[28px] bg-sand-50 p-5">
              <p className="text-sm font-semibold text-gumleaf-800">COMMUNITY</p>
              <div className="mt-4">
                <CheckboxRow
                  label="Include community contribution"
                  checked={config.includeCommunityContribution}
                  onChange={() => onToggleField('includeCommunityContribution')}
                />
              </div>
            </section>

            <section className="rounded-[28px] bg-sand-50 p-5">
              <p className="text-sm font-semibold text-gumleaf-800">PATHWAYS</p>
              <div className="mt-4">
                <CheckboxRow
                  label="Include future pathways"
                  checked={config.includeFuturePathways}
                  onChange={() => onToggleField('includeFuturePathways')}
                />
              </div>
            </section>

            <section className="rounded-[28px] bg-sand-50 p-5">
              <p className="text-sm font-semibold text-gumleaf-800">TAGS</p>
              <div className="mt-4">
                <CheckboxRow
                  label="Include approved tags"
                  checked={config.includeApprovedTags}
                  onChange={() => onToggleField('includeApprovedTags')}
                />
              </div>
            </section>

            <section className="rounded-[28px] bg-sand-50 p-5">
              <p className="text-sm font-semibold text-gumleaf-800">MEDIA</p>
              <div className="mt-4 space-y-3">
                <CheckboxRow
                  label="Include images"
                  checked={config.includeImages}
                  onChange={() => onToggleField('includeImages')}
                />
                <CheckboxRow
                  label="Include audio/video links"
                  checked={config.includeMediaLinks}
                  onChange={() => onToggleField('includeMediaLinks')}
                />
              </div>
            </section>
          </div>

          <section className="rounded-[28px] border border-dashed border-river-300 bg-river-100/35 p-5">
            <p className="text-sm font-semibold text-gumleaf-800">Export mode</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ['shared', 'Story-focused'],
                ['summary', 'Story + Tags'],
                ['structured', 'Structured JSON'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onModeChange(value)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    config.mode === value
                      ? 'bg-gumleaf-800 text-sand-50'
                      : 'bg-white/85 text-gumleaf-700 hover:bg-sand-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <div className="rounded-[24px] border border-dashed border-ochre-300 bg-white/75 p-5 text-sm leading-6 text-gumleaf-700">
            Some information may be personal, cultural, or community-held.
            Please confirm that you are only sharing content that is appropriate to share in this context.
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onReviewSelection}
              className="rounded-full border border-gumleaf-200 bg-white px-5 py-3 text-sm font-semibold text-gumleaf-800"
            >
              Review selection
            </button>
            <button
              type="button"
              onClick={onContinueExport}
              className="rounded-full bg-gumleaf-800 px-5 py-3 text-sm font-semibold text-sand-50"
            >
              Continue export
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-clay-300 bg-white px-5 py-3 text-sm font-semibold text-clay-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckboxRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 text-sm text-gumleaf-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gumleaf-300 text-gumleaf-800 focus:ring-gumleaf-700"
      />
      <span>{label}</span>
    </label>
  )
}
