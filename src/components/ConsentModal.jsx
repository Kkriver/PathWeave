import { useState } from 'react'

export function ConsentModal({ open, onAccept }) {
  const [learnMoreOpen, setLearnMoreOpen] = useState(false)
  const [rememberChoice, setRememberChoice] = useState(false)

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gumleaf-800/45 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        className="w-full max-w-2xl rounded-[32px] border border-white/70 bg-white p-6 shadow-soft md:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ochre-700">First entry</p>
        <h2 id="consent-title" className="mt-3 font-display text-3xl text-gumleaf-800">
          Respecting story and cultural safety
        </h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-gumleaf-700">
          <p>
            PathWeave is designed to support respectful storytelling and self-representation.
          </p>
          <p>
            You are in control of what you choose to share. Some stories, knowledge, images, names, or cultural
            information may be private, sensitive, community-held, or not appropriate to record digitally.
          </p>
          <p>
            Please only share what feels right for you. PathWeave does not own your story, and this prototype should not
            be used to pressure anyone to disclose cultural knowledge.
          </p>
        </div>

        <ul className="mt-6 space-y-2 rounded-[24px] bg-sand-50 p-5 text-sm leading-6 text-gumleaf-700">
          <li>- You choose what to share</li>
          <li>- You can keep things private</li>
          <li>- Suggested tags are optional</li>
          <li>- Cultural meaning should stay with the storyteller and community</li>
        </ul>

        <label className="mt-5 flex items-center gap-3 text-sm text-gumleaf-700">
          <input
            type="checkbox"
            checked={rememberChoice}
            onChange={(event) => setRememberChoice(event.target.checked)}
            className="h-4 w-4 rounded border-gumleaf-300 text-gumleaf-800 focus:ring-gumleaf-700"
          />
          <span>Remember my choice on this device</span>
        </label>

        {learnMoreOpen ? (
          <div className="mt-5 rounded-[24px] border border-river-200 bg-river-100/55 p-5 text-sm leading-6 text-gumleaf-700">
            <p className="font-semibold text-gumleaf-800">Why this matters</p>
            <p className="mt-2">
              This design is informed by cultural responsiveness, Indigenous self-determination, and Indigenous Data
              Sovereignty principles. It aims to support story-sharing without forcing people into standard resume
              formats.
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onAccept({ rememberChoice })}
            className="rounded-full bg-gumleaf-800 px-5 py-3 text-sm font-semibold text-sand-50 transition hover:bg-gumleaf-600"
          >
            I understand
          </button>
          <button
            type="button"
            onClick={() => setLearnMoreOpen((current) => !current)}
            className="rounded-full border border-gumleaf-200 bg-white px-5 py-3 text-sm font-semibold text-gumleaf-800 transition hover:bg-sand-100"
          >
            Learn more
          </button>
        </div>
      </div>
    </div>
  )
}
