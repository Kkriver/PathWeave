import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  defaultDraftStory,
  defaultProfileDraft,
  exampleProfiles,
  exportModeDetails,
  suggestedTagLibrary,
} from './data/mockData'

const STORAGE_KEY = 'pathweave-story-state'
const CONSENT_KEY = 'pathweave-cultural-safety'
const ENTRY_MODAL_SEEN_KEY = 'pathweave-entry-modal-seen'

const wizardSteps = [
  { id: 'story', label: 'Story', phase: 'Lay the first thread' },
  { id: 'connections', label: 'Connections', phase: 'Bring in people and place' },
  { id: 'pathways', label: 'Pathways', phase: 'Shape future direction' },
  { id: 'stories', label: 'Stories', phase: 'Weave in stories and media' },
  { id: 'review', label: 'Review', phase: 'Decide what stays visible' },
  { id: 'share', label: 'Share', phase: 'Prepare ways of sharing' },
]

function loadState() {
  if (typeof window === 'undefined') {
    return {
      profile: defaultProfileDraft,
      stories: defaultProfileDraft.stories,
      draftStory: defaultDraftStory,
      showTagsInProfile: true,
    }
  }

  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    return {
      profile: saved.profile || defaultProfileDraft,
      stories: saved.stories || defaultProfileDraft.stories,
      draftStory: saved.draftStory || defaultDraftStory,
      showTagsInProfile: saved.showTagsInProfile ?? true,
    }
  } catch {
    return {
      profile: defaultProfileDraft,
      stories: defaultProfileDraft.stories,
      draftStory: defaultDraftStory,
      showTagsInProfile: true,
    }
  }
}

function splitValue(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function buildExportPayload(profile, selectedStories, shareConfig) {
  const approvedTags = shareConfig.includeTags
    ? [...new Set(selectedStories.flatMap((story) => story.acceptedTags || []))]
    : []

  return {
    name: profile.name || 'Your PathWeave',
    intro: profile.narrativeIntro || '',
    connections: {
      connectedWith: splitValue(profile.connectedWith),
      involved: splitValue(profile.involvedPeople),
      benefited: splitValue(profile.benefitedPeople),
      place: profile.placeConnection || '',
      community: profile.communityConnections || '',
    },
    pathways: {
      interests: splitValue(profile.interests),
      aspirations: splitValue(profile.aspirations),
      futureDirections: splitValue(profile.futurePathways),
    },
    stories: selectedStories.map((story) => ({
      title: story.title,
      narrative: story.narrative,
      location: story.location,
      involved: splitValue(story.involved || profile.involvedPeople),
      benefited: splitValue(story.benefited || profile.benefitedPeople),
      privacy: story.privacy,
      image: shareConfig.includeMedia ? story.image || '' : '',
      audio: shareConfig.includeMedia ? story.audio || '' : '',
      video: shareConfig.includeMedia ? story.video || '' : '',
      tags: shareConfig.includeTags ? story.acceptedTags || [] : [],
    })),
    tags: approvedTags,
  }
}

function firstSentence(value, fallback) {
  const text = String(value || '').trim()
  if (!text) {
    return fallback
  }

  if (text.length <= 120) {
    return text
  }

  return `${text.slice(0, 120).trim()}...`
}

function WeaveBands({ className = '' }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute left-[-8%] top-10 h-24 w-[52%] rotate-[8deg] rounded-full bg-amber-200/32 blur-2xl" />
      <div className="absolute right-[-6%] top-24 h-24 w-[48%] -rotate-[10deg] rounded-full bg-teal-200/24 blur-2xl" />
      <div className="absolute left-[12%] top-[28%] h-14 w-[42%] -rotate-[18deg] rounded-full bg-white/55 blur-xl" />
      <div className="absolute right-[10%] top-[36%] h-14 w-[38%] rotate-[16deg] rounded-full bg-white/45 blur-xl" />
      <div className="absolute left-[18%] bottom-[24%] h-16 w-[34%] rotate-[14deg] rounded-full bg-amber-100/45 blur-xl" />
      <div className="absolute right-[16%] bottom-[18%] h-16 w-[32%] -rotate-[16deg] rounded-full bg-teal-100/35 blur-xl" />
    </div>
  )
}

function ThreadMarker({ index, active, completed }) {
  return (
    <div
      className={`relative flex h-10 w-10 items-center justify-center rounded-full text-xs font-medium transition ${
        active
          ? 'bg-stone-900 text-white shadow-[0_14px_30px_-18px_rgba(28,25,23,0.9)]'
          : completed
            ? 'bg-teal-100 text-teal-900 ring-1 ring-teal-200'
            : 'bg-white text-stone-500 ring-1 ring-stone-200'
      }`}
    >
      {index + 1}
    </div>
  )
}

function Badge({ children, tone = 'light' }) {
  const tones = {
    light: 'bg-white/70 text-stone-700 ring-1 ring-stone-200',
    accent: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
    soft: 'bg-teal-100 text-teal-900 ring-1 ring-teal-200',
  }

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>
}

function StoryCard({ card, transformStyle = {}, className = '' }) {
  return (
    <article
      className={`precision-panel absolute w-[270px] overflow-hidden rounded-[24px] p-4 transition-transform duration-300 ease-out ${className}`}
      style={transformStyle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-stone-400">
          <span className="h-2 w-2 rounded-full bg-amberline/70" />
          {card.media}
        </div>
        <span className="rounded-full border border-black/5 bg-white/80 px-2.5 py-1 text-[11px] text-stone-500">{card.duration}</span>
      </div>
      <div className="mt-4 rounded-[18px] bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(241,240,236,0.85))] p-3 ring-1 ring-black/5">
        <div className="h-24 rounded-[14px] bg-[linear-gradient(160deg,rgba(249,249,248,0.92),rgba(236,233,226,0.88)),radial-gradient(circle_at_top_right,rgba(201,151,69,0.18),transparent_34%)]" />
      </div>
      <p className="mt-4 font-display text-2xl leading-tight text-stone-900">{card.title}</p>
      <p className="mt-3 text-sm leading-6 text-stone-600">{card.text}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <Badge tone="soft">{card.tag}</Badge>
        <span className="text-[11px] uppercase tracking-[0.22em] text-stone-400">{card.context}</span>
      </div>
    </article>
  )
}

function ConnectorLine({ d, delay = '0ms' }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="url(#weave-line-gradient)"
      strokeLinecap="round"
      strokeWidth="1.6"
      style={{ strokeDasharray: 420, strokeDashoffset: 0, transition: `transform 300ms ease ${delay}` }}
    />
  )
}

function WeaveVisual({ stories }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const weaveCards = [
    {
      id: 'story-1',
      title: stories[0]?.title || 'Mentoring circle',
      text: firstSentence(
        stories[0]?.narrative,
        'Story, reflection, and contribution stay together in the same card.',
      ),
      tag: (stories[0]?.acceptedTags || stories[0]?.tags || [])[0] || 'Community care',
      media: 'Audio note',
      duration: '02:14',
      context: stories[0]?.location || 'Local place',
      x: 32,
      y: 126,
      depth: 1.4,
      rotate: -8,
    },
    {
      id: 'story-2',
      title: stories[1]?.title || 'Creative workshop',
      text: firstSentence(
        stories[1]?.narrative,
        'A second story sits in relationship rather than in a strict timeline.',
      ),
      tag: (stories[1]?.acceptedTags || stories[1]?.tags || [])[0] || 'Creative work',
      media: 'Image set',
      duration: 'Gallery',
      context: stories[1]?.location || 'Shared studio',
      x: 246,
      y: 40,
      depth: 2,
      rotate: 6,
    },
    {
      id: 'story-3',
      title: stories[2]?.title || 'Pathway note',
      text: 'Connections and future directions can stay visible without becoming a resume summary.',
      tag: (stories[2]?.acceptedTags || stories[2]?.tags || [])[0] || 'Future pathways',
      media: 'Video clip',
      duration: '01:05',
      context: 'Next steps',
      x: 308,
      y: 258,
      depth: 2.6,
      rotate: -4,
    },
    {
      id: 'story-4',
      title: 'Community thread',
      text: 'Tags remain secondary while relationships, place, and story do the main work.',
      tag: 'Shared meaning',
      media: 'Story card',
      duration: 'Draft',
      context: 'In review',
      x: 92,
      y: 338,
      depth: 1.7,
      rotate: 5,
    },
  ]

  const handleMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 18
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 18
    setOffset({ x, y })
  }

  return (
    <div
      className="precision-panel relative isolate h-[520px] overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,247,243,0.78))] p-6 md:h-[580px]"
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      onMouseMove={handleMove}
    >
      <WeaveBands className="opacity-75" />
      <div className="absolute inset-0 bg-weave-grid opacity-60" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">The Loom</p>
          <p className="mt-2 font-display text-3xl text-stone-900">Narrative cards in relationship</p>
        </div>
        <Badge tone="accent">Community-led</Badge>
      </div>

      <svg aria-hidden="true" className="absolute inset-0 z-0 h-full w-full" viewBox="0 0 640 580">
        <defs>
          <linearGradient id="weave-line-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(201,151,69,0)" />
            <stop offset="48%" stopColor="rgba(201,151,69,0.72)" />
            <stop offset="100%" stopColor="rgba(201,151,69,0)" />
          </linearGradient>
        </defs>
        <ConnectorLine d="M 180 208 C 255 156, 292 120, 378 132" />
        <ConnectorLine d="M 424 204 C 470 260, 464 310, 414 370" />
        <ConnectorLine d="M 222 420 C 292 388, 332 360, 366 306" />
        <ConnectorLine d="M 168 246 C 140 308, 148 354, 200 402" />
      </svg>

      <div className="relative z-10 mt-10 h-[420px]">
        {weaveCards.map((card) => {
          const translateX = offset.x * card.depth
          const translateY = offset.y * card.depth

          return (
            <StoryCard
              key={card.id}
              card={card}
              className="shadow-precision"
              transformStyle={{
                left: `${card.x}px`,
                top: `${card.y}px`,
                transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${card.rotate}deg)`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function SectionHeading({ eyebrow, title, description, className = 'max-w-2xl', descriptionClassName = '' }) {
  return (
    <div className={className}>
      <p className="text-sm uppercase tracking-[0.32em] text-stone-500">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl text-stone-900 md:text-4xl">{title}</h2>
      <p className={`mt-4 text-base leading-7 text-stone-600 ${descriptionClassName}`}>{description}</p>
    </div>
  )
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 480)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) {
    return null
  }

  return (
    <button
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-stone-900 text-white shadow-[0_24px_50px_-24px_rgba(41,37,36,0.85)] transition hover:-translate-y-0.5 hover:bg-stone-800 sm:bottom-8 sm:right-8"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      type="button"
    >
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path d="M12 18V6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        <path d="m6.75 11.25 5.25-5.25 5.25 5.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    </button>
  )
}

function AppShell({ children, onStart, onNavigate, consentAccepted }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(13,148,136,0.14),_transparent_24%),linear-gradient(180deg,_#f8f3eb_0%,_#fcfaf6_48%,_#f1ebe0_100%)] text-stone-800">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-20 mb-8">
          <div className="rounded-[28px] border border-white/60 bg-white/75 px-5 py-4 shadow-[0_30px_80px_-40px_rgba(87,63,38,0.45)] backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <button className="text-left" onClick={() => onNavigate('/')} type="button">
                  <p className="font-display text-2xl text-stone-900">PathWeave</p>
                  <p className="text-sm text-stone-500">Narrative-first portfolio storytelling</p>
                </button>
              </div>
              <nav className="flex flex-wrap gap-2">
                {[
                  { path: '/', label: 'Showcase' },
                  { path: '/example', label: 'Example' },
                  { path: '/about', label: 'About' },
                  { path: '/builder', label: 'Builder' },
                ].map((item) => (
                  <button
                    key={item.path}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      location.pathname === item.path
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                    onClick={() => (item.path === '/builder' && !consentAccepted ? onStart() : onNavigate(item.path))}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-stone-200/70 py-8 text-sm text-stone-500">
          PathWeave is a First Nations-informed concept prototype designed to support culturally responsive storytelling.
        </footer>
      </div>
      <ScrollToTopButton />
    </div>
  )
}

function LandingPage({ onStart, onSeeExample, onGoAbout, profile, stories }) {
  const exampleStories = stories.slice(0, 2)
  const exampleTags = [...new Set(stories.flatMap((story) => story.acceptedTags || story.tags || []))].slice(0, 4)

  return (
    <div className="space-y-24 pb-6">
      <section className="grid min-h-[90vh] content-center gap-12 py-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-0">
        <div className="max-w-2xl self-center">
          <p className="text-xs uppercase tracking-[0.34em] text-stone-500">Narrative Sovereignty</p>
          <h1 className="mt-6 font-display text-6xl leading-[0.96] text-stone-900 md:text-7xl xl:text-[5.5rem]">
            PathWeave
          </h1>
          <p className="mt-6 max-w-xl font-display text-3xl leading-tight text-stone-800 md:text-4xl">
            Share your story in your own way, not just as a resume.
          </p>
          <p className="mt-8 max-w-xl text-lg leading-8 text-stone-600">
            PathWeave is a storytelling and portfolio platform designed to support more respectful, non-linear ways of
            representing experience.
          </p>
          <div className="mt-6 max-w-xl text-sm leading-7 text-stone-500">
            A concept platform for narrative portfolios, community-held context, and careful user-controlled sharing.
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              className="linear-button-sheen rounded-full border border-white/20 bg-stone-900 px-6 py-3 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_16px_36px_-20px_rgba(26,26,26,0.6)] transition hover:-translate-y-0.5 hover:bg-black"
              onClick={onStart}
              type="button"
            >
              Start your PathWeave
            </button>
            <button
              className="precision-panel-quiet rounded-full px-6 py-3 text-sm font-medium text-stone-700 transition hover:-translate-y-0.5"
              onClick={onSeeExample}
              type="button"
            >
              See example
            </button>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <Badge tone="accent">Story before format</Badge>
            <Badge tone="soft">Community-aware</Badge>
            <Badge>User control</Badge>
          </div>
        </div>

        <div className="relative self-center">
          <WeaveVisual stories={stories} />
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Why This Is Different"
          title="A different way to represent experience"
          description="PathWeave stays grounded in story, context, and connection instead of collapsing experience into titles, bullet points, or keyword logic."
        />
        <TridentSection />
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="How It Works"
          title="How PathWeave works"
          description="The process stays simple and guided, so the experience feels calm and lightweight from the beginning."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <StepCard
            index="01"
            title="Start with your story"
            text="Write a short narrative about your experience."
          />
          <StepCard
            index="02"
            title="Add connections"
            text="Include people, community, and meaning behind your story."
          />
          <StepCard
            index="03"
            title="Shape your PathWeave"
            text="Your stories become a shareable portfolio."
          />
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Example Preview"
          title="What your PathWeave can look like"
          description="This is an example. Your PathWeave can look different."
        />
        <div className="rounded-[40px] border border-stone-200/80 bg-white/80 p-6 shadow-soft sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="font-display text-4xl text-stone-900">{profile.name}</p>
              <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600">{profile.narrativeIntro}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {exampleTags.map((tag) => (
                  <Badge key={tag} tone="soft">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] bg-stone-50 p-6 ring-1 ring-stone-200">
              <p className="text-sm uppercase tracking-[0.22em] text-stone-400">Portfolio structure</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[22px] bg-white px-4 py-4 ring-1 ring-stone-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Community</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    {profile.communityContribution ||
                      'Community contribution can hold care, responsibility, collaboration, and support.'}
                  </p>
                </div>
                <div className="rounded-[22px] bg-white px-4 py-4 ring-1 ring-stone-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Pathways</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {splitValue(profile.futurePathways || '').map((item) => (
                      <Badge key={item} tone="accent">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-h-[110px] rounded-[22px] bg-[linear-gradient(150deg,_rgba(251,243,227,0.9),_rgba(255,255,255,0.72))] ring-1 ring-stone-200" />
                  <div className="min-h-[110px] rounded-[22px] bg-[linear-gradient(150deg,_rgba(220,242,239,0.72),_rgba(255,255,255,0.7))] ring-1 ring-stone-200" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {exampleStories.map((story) => (
              <article
                key={story.id}
                className="rounded-[30px] bg-stone-50 p-6 ring-1 ring-stone-200 transition hover:-translate-y-1 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-2xl text-stone-900">{story.title}</h3>
                  <span className="text-xs uppercase tracking-[0.22em] text-stone-400">{story.location}</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-stone-600">{story.narrative}</p>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <button
              className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition hover:-translate-y-0.5 hover:border-stone-400 hover:bg-stone-50"
              onClick={onSeeExample}
              type="button"
            >
              View example
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Export / Output"
          title="Share your PathWeave in different ways"
          description="Outputs stay secondary to story, with options that support different sharing contexts."
        />
        <div className="grid gap-6 md:grid-cols-3">
          <OutputCard title="Full PathWeave" text="A complete narrative portfolio." />
          <OutputCard title="Summary" text="A shorter version that still keeps your story." />
          <OutputCard title="Structured" text="A format that can connect with external systems." />
        </div>
      </section>

      <ShowcaseClosingSection />
    </div>
  )
}

function EntrySafetyModal({ open, onClose, onLearnMore }) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/58 backdrop-blur-xl">
      <div className="absolute inset-0 bg-weave-grid opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,151,69,0.1),_transparent_32%),linear-gradient(180deg,rgba(18,18,17,0.1),rgba(18,18,17,0.24))]" />
      <div className="relative grid min-h-screen place-items-center px-4 py-8">
        <div className="precision-panel relative w-full max-w-3xl overflow-hidden rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(248,247,243,0.7))] text-center shadow-[0_40px_100px_-35px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,151,69,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(129,148,134,0.12),_transparent_30%)]" />
          <div className="absolute left-[-8%] top-10 h-24 w-[40%] rotate-[8deg] rounded-full bg-amber-200/20 blur-2xl" />
          <div className="absolute right-[-10%] bottom-10 h-24 w-[42%] -rotate-[12deg] rounded-full bg-white/35 blur-2xl" />
          <div className="relative p-8 sm:p-12">
            <p className="text-sm uppercase tracking-[0.36em] text-stone-500">Respectful storytelling notice</p>
            <h2 className="mt-5 font-display text-3xl text-stone-900 sm:text-4xl">Respecting story and cultural context</h2>
            <div className="mx-auto mt-6 max-w-2xl space-y-4 text-base leading-8 text-stone-600">
            <p>
              PathWeave is a concept platform designed to support respectful storytelling and self-representation.
            </p>
            <p>
              Some stories, images, audio, video, names, or cultural knowledge may be personal, sensitive, or
              community-held.
            </p>
            <p>Please only share what feels appropriate to share in this space.</p>
            <p>
              You remain in control of your story, and nothing should be interpreted as replacing its original meaning
              or context.
            </p>
            </div>

            <ul className="mx-auto mt-8 max-w-xl space-y-3 text-sm text-stone-700">
            {[
              'You choose what to share',
              'You can keep content private',
              'Meaning stays with the storyteller',
            ].map((item) => (
              <li key={item} className="flex items-start justify-center gap-3 text-left">
                <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-amberline" />
                <span>{item}</span>
              </li>
            ))}
            </ul>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <button
                className="precision-panel-quiet rounded-full border border-black/8 px-5 py-3 text-sm text-stone-700 transition hover:-translate-y-0.5"
                onClick={onLearnMore}
                type="button"
              >
                Learn more
              </button>
              <button
                className="rounded-full border border-stone-900 bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-stone-800"
                onClick={onClose}
                type="button"
              >
                I understand
              </button>
            </div>
            <p className="mt-5 text-sm tracking-[0.02em] text-stone-500">
              You can learn more about our approach in the About section.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AboutPage({ onStart, onBack, onGoHome, onGoExample }) {
  return (
    <div className="space-y-24 pb-6">
      <section className="rounded-[40px] border border-white/70 bg-white/55 px-6 py-10 shadow-soft backdrop-blur sm:px-8 sm:py-12 lg:px-12">
        <div className="max-w-4xl">
          <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Our approach</p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-stone-900 md:text-6xl">About PathWeave</h1>
          <p className="mt-6 text-xl leading-8 text-stone-700">
            PathWeave is a storytelling and portfolio concept designed to support more respectful, narrative-based ways
            of sharing experience, contribution, and future pathways.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600">
            It explores alternatives to standard resume formats by creating space for story, connection, multimodal
            expression, and user-controlled sharing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-700" onClick={onBack} type="button">
              Back
            </button>
            <button className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white" onClick={onStart} type="button">
              Start your PathWeave
            </button>
          </div>
        </div>
      </section>

      <EditorialSplit
        eyebrow="Why PathWeave Was Created"
        title="Why PathWeave was created"
        body={
          <>
            <p>
              Standard resume systems often prioritise titles, timelines, and individual achievement. They can leave
              little room for story, context, relationships, care, contribution, and future direction.
            </p>
            <p className="mt-5">
              PathWeave explores a different approach. It asks what happens when digital self-representation is shaped
              less like a checklist and more like a portfolio of stories, media, connections, and pathways.
            </p>
          </>
        }
        visual={<ComparisonPanel />}
      />

      <section className="space-y-10">
        <div className="max-w-5xl">
          <SectionHeading
            className="max-w-5xl"
            descriptionClassName="lg:whitespace-nowrap"
            eyebrow="What We Stand For"
            title="What we stand for"
            description="These principles shape the way PathWeave approaches storytelling, representation, and sharing."
          />
        </div>
        <div className="rounded-[38px] bg-[linear-gradient(155deg,_rgba(251,243,227,0.94),_rgba(255,255,255,0.82)),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.18),_transparent_34%)] p-6 shadow-soft ring-1 ring-stone-200 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="rounded-[30px] border border-white/80 bg-white/55 p-6 sm:p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-stone-400">Shared direction</p>
              <h3 className="mt-4 font-display text-3xl leading-tight text-stone-900">
                Story, relationship, care, and choice remain visible together.
              </h3>
              <p className="mt-5 max-w-xl text-base leading-8 text-stone-600">
                PathWeave does not treat experience as a list to optimise. It creates space for narrative, connection,
                and careful sharing so that representation can stay more human and contextual.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Badge tone="accent">Narrative-led</Badge>
                <Badge tone="soft">Community-aware</Badge>
                <Badge>User control</Badge>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <AboutValueCard
                title="Story"
                text="We believe experience can be shared through narrative, reflection, and lived context, not only through job titles and bullet points."
              />
              <AboutValueCard
                title="Community"
                text="We recognise that contribution often happens through connection, care, responsibility, and relationships with others."
              />
              <AboutValueCard
                title="Control"
                text="Users should decide what to share, what to keep private, and how their stories are represented."
              />
              <AboutValueCard
                title="Respect"
                text="Digital systems should make space for different ways of expression, rather than forcing everyone into one standard format."
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="grid gap-8 rounded-[40px] border border-stone-200/80 bg-[#f2ede4] p-8 shadow-soft lg:grid-cols-[1fr_0.95fr]"
        id="respecting-story"
      >
        <div>
          <SectionHeading
            eyebrow="Respecting Story And Cultural Context"
            title="Respecting story and cultural context"
            description="PathWeave is designed to support careful and thoughtful sharing."
          />
          <div className="mt-6 space-y-5 text-base leading-8 text-stone-600">
            <p>
              Some stories, media, and forms of knowledge may be personal, sensitive, or community-held. Not
              everything meaningful should automatically become public, downloadable, or translated into standardised
              language.
            </p>
            <p>PathWeave is designed so that:</p>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-stone-700">
            {[
              'users remain in control of what they include',
              'stories can remain private',
              'media is not automatically shared',
              'translation into employer-readable tags is optional',
              'original narrative meaning stays primary',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-[28px] bg-white/75 p-6 ring-1 ring-stone-200">
            <p className="text-sm uppercase tracking-[0.24em] text-stone-400">Sharing and privacy</p>
            <p className="mt-4 text-base leading-8 text-stone-600">
              Every story, image, audio clip, and video can be reviewed before it is shown or exported. PathWeave is
              designed around user choice rather than automatic disclosure.
            </p>
          </div>
        </div>
        <PrivacyMockup />
      </section>

      <EditorialSplit
        eyebrow="Research And Design Context"
        title="Research and design context"
        body={
          <>
            <p>
              PathWeave is an academic concept prototype exploring more culturally responsive alternatives to
              traditional resume-based systems.
            </p>
            <p className="mt-5">
              Its design is informed by research on narrative expression, multimodal storytelling, user-controlled
              sharing, community-aware representation, and respectful digital design.
            </p>
            <p className="mt-5">
              It does not claim to represent all communities or protocols. Instead, it offers a reflective design
              direction for thinking differently about how stories, contribution, and future pathways might be shared
              online.
            </p>
          </>
        }
        reverse
        visual={
          <div className="rounded-[34px] border border-stone-200/80 bg-white/85 p-7 shadow-soft">
            <p className="text-sm uppercase tracking-[0.24em] text-stone-400">Design principles</p>
            <ul className="mt-6 space-y-4">
              {[
                'story before format',
                'user control',
                'multimodal expression',
                'community-aware representation',
                'optional translation layer',
              ].map((item) => (
                <li key={item} className="rounded-[22px] bg-stone-50 px-4 py-4 text-sm text-stone-700 ring-1 ring-stone-200">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        }
      />

      <footer className="border-t border-stone-200/70 pt-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <FooterLink label="Home" onClick={onGoHome} />
            <FooterLink label="About" onClick={onBack} />
            <FooterLink label="Example" onClick={onGoExample} />
            <FooterLink label="Contact" />
          </div>
          <p className="text-sm text-stone-500">PathWeave is a concept prototype for narrative portfolio design.</p>
        </div>
      </footer>
    </div>
  )
}

function AboutEntryModal({ open, onClose, onLearnMore }) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/55 px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[36px] border border-white/10 bg-white shadow-[0_40px_100px_-35px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.13),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.12),_transparent_30%)]" />
        <div className="relative p-8 sm:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Respectful notice</p>
          <h2 className="mt-4 font-display text-3xl text-stone-900 sm:text-4xl">Respecting story and cultural context</h2>
          <div className="mt-6 space-y-4 text-base leading-8 text-stone-600">
            <p>PathWeave is a concept platform designed to support respectful storytelling and self-representation.</p>
            <p>
              Some stories, images, audio, video, names, or cultural knowledge may be personal, sensitive, or
              community-held.
            </p>
            <p>Please only share what feels appropriate to share in this space.</p>
            <p>
              You remain in control of your story, and nothing here should be interpreted as replacing its original
              meaning or context.
            </p>
          </div>
          <ul className="mt-7 space-y-3 text-sm text-stone-700">
            {[
              'You choose what to share',
              'You can keep content private',
              'Meaning stays with the storyteller',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button
              className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-700 transition hover:bg-stone-50"
              onClick={onLearnMore}
              type="button"
            >
              Learn more
            </button>
            <button
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
              onClick={onClose}
              type="button"
            >
              I understand
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditorialSplit({ eyebrow, title, body, visual, reverse = false }) {
  return (
    <section className={`grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center ${reverse ? '' : ''}`}>
      <div className={reverse ? 'lg:order-2' : ''}>
        <SectionHeading eyebrow={eyebrow} title={title} description="" />
        <div className="mt-6 text-base leading-8 text-stone-600">{body}</div>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>{visual}</div>
    </section>
  )
}

function PortfolioMockup() {
  return (
    <div className="relative rounded-[40px] bg-[linear-gradient(155deg,_rgba(251,243,227,0.9),_rgba(255,255,255,0.82)),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.16),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.2),_transparent_32%)] p-7 shadow-soft ring-1 ring-stone-200">
      <div className="absolute -right-4 top-8 h-24 w-24 rounded-full bg-amber-200/30 blur-2xl" />
      <div className="absolute -left-4 bottom-8 h-28 w-28 rounded-full bg-teal-200/30 blur-2xl" />
      <div className="relative grid gap-4 rounded-[32px] border border-white/70 bg-white/45 p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-3xl text-stone-900">PathWeave preview</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">Narrative portfolio, story card, image area, and optional audio.</p>
          </div>
          <button className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white" type="button">
            Audio intro
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
          <div className="grid gap-3">
            <div className="min-h-[220px] rounded-[28px] bg-white/65 ring-1 ring-white/70" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 rounded-[20px] bg-white/55 ring-1 ring-white/70" />
              <div className="h-20 rounded-[20px] bg-white/40 ring-1 ring-white/70" />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[28px] bg-white/70 p-5 ring-1 ring-white/70">
              <p className="font-medium text-stone-900">Story card</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                A story stays connected to its meaning, people, place, and optional translation.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="accent">community-aware</Badge>
                <Badge tone="soft">story-first</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] bg-white/70 p-4 ring-1 ring-white/70">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Pathways</p>
                <p className="mt-2 text-sm text-stone-700">Creative work, mentoring, contribution</p>
              </div>
              <div className="rounded-[22px] bg-white/55 p-4 ring-1 ring-white/70">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Control</p>
                <p className="mt-2 text-sm text-stone-700">Share, review, or keep private</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComparisonPanel() {
  return (
    <div className="rounded-[36px] border border-stone-200/80 bg-white/85 p-6 shadow-soft">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <div className="rounded-[28px] bg-stone-50 p-6 ring-1 ring-stone-200">
          <p className="font-display text-3xl text-stone-900">Traditional resume</p>
          <ul className="mt-5 space-y-3 text-sm text-stone-600">
            {['chronological', 'role/title-focused', 'text-heavy', 'individualised'].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="grid place-items-center">
          <div className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm uppercase tracking-[0.3em] text-stone-400">vs</div>
        </div>
        <div className="rounded-[28px] bg-stone-900 p-6 text-white">
          <p className="font-display text-3xl">PathWeave</p>
          <ul className="mt-5 space-y-3 text-sm text-white/82">
            {['narrative-led', 'community-aware', 'multimodal', 'pathway-oriented'].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function AboutValueCard({ title, text }) {
  return (
    <article className="rounded-[32px] border border-stone-200/80 bg-white/82 p-7 shadow-soft">
      <h2 className="font-display text-3xl text-stone-900">{title}</h2>
      <p className="mt-4 text-base leading-8 text-stone-600">{text}</p>
    </article>
  )
}

function PrivacyMockup() {
  return (
    <div className="rounded-[36px] border border-stone-200/80 bg-white/80 p-6 shadow-soft">
      <div className="grid gap-4 rounded-[30px] bg-stone-50 p-5 ring-1 ring-stone-200">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-3xl text-stone-900">Review panel</p>
          <Badge tone="soft">User control</Badge>
        </div>
        <div className="rounded-[24px] bg-white p-5 ring-1 ring-stone-200">
          <p className="text-sm font-medium text-stone-900">Original story</p>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Narrative remains primary and visible in its own language and context.
          </p>
        </div>
        <div className="grid gap-3">
          {['Include story', 'Include media', 'Include tags'].map((item, index) => (
            <div key={item} className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3 ring-1 ring-stone-200">
              <span className="text-sm text-stone-700">{item}</span>
              <span className={`h-3 w-3 rounded-full ${index === 2 ? 'bg-stone-300' : 'bg-teal-500'}`} />
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-white p-5 ring-1 ring-stone-200">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Optional tags</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="accent">translation layer</Badge>
              <Badge>optional</Badge>
            </div>
          </div>
          <div className="rounded-[24px] bg-white p-5 ring-1 ring-stone-200">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Sharing controls</p>
            <p className="mt-4 text-sm leading-7 text-stone-600">Review media, privacy, and export choices before anything is shown.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProcessCard({ number, title, text }) {
  return (
    <article className="rounded-[32px] border border-stone-200/80 bg-white/82 p-6 shadow-soft transition hover:-translate-y-1 hover:bg-white">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
          {number}
        </div>
        <div className="h-px flex-1 bg-stone-200" />
      </div>
      <h3 className="mt-6 font-display text-2xl text-stone-900">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-stone-600">{text}</p>
    </article>
  )
}

function FooterLink({ label, onClick }) {
  return (
    <button
      className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 transition hover:border-stone-300 hover:bg-stone-50"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function ShowcaseClosingSection() {
  return (
    <section className="rounded-[40px] bg-[#23211f] px-8 py-14 text-stone-100 shadow-soft sm:px-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-xs uppercase tracking-[0.34em] text-stone-400">OUR APPROACH</p>
        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="text-left">
            <h2 className="font-display text-3xl text-stone-100 md:text-4xl">Respectful storytelling</h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-stone-200/88">
              <p>
                PathWeave supports more respectful ways of sharing experience, identity, and future pathways.
              </p>
              <p>
                It values narrative, connection, and user control, rather than standardised self-presentation.
              </p>
            </div>
          </div>
          <div className="text-left">
            <h2 className="font-display text-3xl text-stone-100 md:text-4xl">Research-informed design</h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-stone-200/88">
              <p>
                PathWeave is an academic concept prototype exploring culturally responsive alternatives to traditional
                resume systems.
              </p>
              <p>
                It does not claim to represent all communities, but offers a reflective and respectful design
                direction.
              </p>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-12 max-w-3xl text-center text-sm leading-7 text-stone-400">
          PathWeave is a First Nations-informed concept prototype designed to support culturally responsive
          storytelling.
        </p>
      </div>
    </section>
  )
}

function GeometryIcon({ variant }) {
  if (variant === 'roles') {
    return (
      <svg aria-hidden="true" className="h-10 w-10 text-stone-500" fill="none" viewBox="0 0 40 40">
        <rect height="18" rx="9" stroke="currentColor" strokeWidth="1" width="18" x="4.5" y="11" />
        <path d="M23 20h12" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
        <path d="M27 14h8" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
        <path d="M27 26h8" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
      </svg>
    )
  }

  if (variant === 'story') {
    return (
      <svg aria-hidden="true" className="h-10 w-10 text-stone-500" fill="none" viewBox="0 0 40 40">
        <path d="M9 10.5h15.5c3.3 0 6 2.7 6 6v13H15.5c-3.3 0-6-2.7-6-6v-13Z" stroke="currentColor" strokeWidth="1" />
        <path d="M14 17h11" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
        <path d="M14 22h8" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
        <path d="M14 27h11" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="h-10 w-10 text-stone-500" fill="none" viewBox="0 0 40 40">
      <circle cx="11" cy="14" r="4.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="29" cy="12" r="3.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="27" cy="28" r="5.5" stroke="currentColor" strokeWidth="1" />
      <path d="M15 15.5 25.5 13" stroke="currentColor" strokeWidth="1" />
      <path d="M14 18.5 23 25" stroke="currentColor" strokeWidth="1" />
      <path d="M28.5 15.5v7" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function OutputCard({ title, text }) {
  return (
    <article className="precision-panel-quiet rounded-[28px] p-6 transition hover:-translate-y-1">
      <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Output</p>
      <h3 className="mt-4 font-display text-2xl text-stone-900">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-stone-600">{text}</p>
    </article>
  )
}

function TridentPanel({ title, text, variant }) {
  return (
    <article className="group relative min-h-[280px] overflow-hidden px-2 py-6 sm:px-6">
      <div className="absolute inset-0 bg-transparent transition duration-500 group-hover:weave-focus" />
      <div className="relative">
        <GeometryIcon variant={variant} />
        <h3 className="mt-10 font-display text-[2rem] leading-tight text-stone-900">{title}</h3>
        <p className="mt-5 max-w-sm text-sm leading-7 text-stone-600">{text}</p>
      </div>
    </article>
  )
}

function TridentSection() {
  return (
    <div className="precision-panel overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(248,247,243,0.68))]">
      <div className="grid divide-y divide-black/6 md:grid-cols-3 md:divide-x md:divide-y-0">
        <TridentPanel
          title="Not just roles and titles"
          text="Share experiences and stories instead of listing job positions."
          variant="roles"
        />
        <TridentPanel
          title="Stories stay stories"
          text="Your narrative is not reduced into bullet points or keywords."
          variant="story"
        />
        <TridentPanel
          title="Community matters"
          text="Show connections, contribution, and relationships."
          variant="community"
        />
      </div>
    </div>
  )
}

function StepCard({ index, title, text }) {
  return (
    <article className="rounded-[30px] border border-stone-200/80 bg-white/75 p-6 shadow-soft transition hover:-translate-y-1 hover:bg-white">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-sm font-medium text-amber-900 ring-1 ring-amber-200">
          {index}
        </div>
        <div className="h-px flex-1 bg-stone-200" />
      </div>
      <h3 className="mt-6 font-display text-2xl text-stone-900">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-stone-600">{text}</p>
    </article>
  )
}

function ExampleProfilePage({ example, onBack, onStart }) {
  const mediaCards = example.gallery || []
  const contributionCards = example.contributionCards || []

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Example profile</p>
          <h1 className="mt-3 font-display text-4xl text-stone-900 md:text-5xl">
            This is an example PathWeave. Your version can look different.
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="rounded-full border border-stone-300 px-5 py-3 text-sm" onClick={onBack} type="button">
            Back
          </button>
          <button className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white" onClick={onStart} type="button">
            Start your own
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[40px] border border-stone-200/80 bg-white/80 shadow-soft">
        <div className="grid gap-0 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="p-8 sm:p-10">
            <Badge tone="soft">Visual narrative portfolio</Badge>
            <h2 className="mt-6 font-display text-5xl text-stone-900 md:text-6xl">{example.name}</h2>
            <p className="mt-5 text-xl leading-8 text-stone-700">{example.identityLine}</p>
            <p className="mt-4 max-w-xl text-base leading-8 text-stone-600">{example.placeConnection}</p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600">{example.narrativeIntro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-stone-800"
                type="button"
              >
                {example.audioIntroLabel}
              </button>
              {example.values.map((value) => (
                <Badge key={value}>{value}</Badge>
              ))}
            </div>
          </div>
          <div className="relative min-h-[380px] bg-[linear-gradient(160deg,_rgba(251,243,227,0.92),_rgba(243,236,223,0.85)),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.22),_transparent_34%)] p-8 sm:p-10">
            <div className="absolute inset-6 rounded-[32px] border border-white/70" />
            <div className="relative flex h-full flex-col justify-between rounded-[34px] bg-white/40 p-6 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-stone-500">{example.heroMediaLabel}</p>
              <div className="grid gap-4">
                <div className="h-48 rounded-[28px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.58),_rgba(255,255,255,0.12))] ring-1 ring-white/60" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-[22px] bg-white/55 ring-1 ring-white/60" />
                  <div className="h-20 rounded-[22px] bg-white/35 ring-1 ring-white/60" />
                  <div className="h-20 rounded-[22px] bg-white/55 ring-1 ring-white/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[36px] border border-stone-200/80 bg-white/80 p-8 shadow-soft">
          <SectionHeading
            eyebrow="My Story"
            title="A narrative that stays whole"
            description={example.storyParagraph}
          />
        </div>
        <blockquote className="rounded-[36px] bg-stone-900 p-8 text-white shadow-soft">
          <p className="font-display text-3xl leading-tight">“{example.supportingQuote}”</p>
          <p className="mt-6 text-sm uppercase tracking-[0.24em] text-white/55">{example.name}</p>
        </blockquote>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Featured Stories"
          title="Large story sections with context and relationships"
          description="Each story combines narrative, media, people, place, and optional tags in a portfolio-like layout."
        />
        <div className="space-y-8">
          {example.stories.map((story, index) => (
            <article
              key={story.id}
              className="grid gap-8 rounded-[40px] border border-stone-200/80 bg-white/80 p-6 shadow-soft lg:grid-cols-2 lg:p-8"
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex h-full min-h-[280px] flex-col justify-between rounded-[32px] bg-[linear-gradient(160deg,_rgba(251,243,227,0.9),_rgba(255,255,255,0.72)),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.18),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.24),_transparent_36%)] p-6 ring-1 ring-stone-200">
                  <p className="text-sm uppercase tracking-[0.24em] text-stone-500">{story.media}</p>
                  <div className="space-y-4">
                    <div className="h-40 rounded-[26px] bg-white/60 ring-1 ring-white/70" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-16 rounded-[20px] bg-white/45 ring-1 ring-white/70" />
                      <div className="h-16 rounded-[20px] bg-white/65 ring-1 ring-white/70" />
                    </div>
                  </div>
                </div>
              </div>
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-3xl text-stone-900">{story.title}</h3>
                  <Badge>{story.location}</Badge>
                </div>
                <p className="mt-5 text-base leading-8 text-stone-600">{story.narrative}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Involved</p>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{story.involved}</p>
                  </div>
                  <div className="rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Who benefited</p>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{story.benefited}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {(story.acceptedTags || []).map((tag) => (
                    <Badge key={tag} tone="accent">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Community And Contribution"
          title="Contribution shown as relationships, care, and shared effort"
          description={example.communityContribution}
        />
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[36px] border border-stone-200/80 bg-white/80 p-8 shadow-soft">
            <div className="relative grid min-h-[320px] place-items-center rounded-[30px] bg-stone-50 p-8 ring-1 ring-stone-200">
              <div className="absolute left-10 top-12 rounded-full bg-amber-100 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                Younger people
              </div>
              <div className="absolute right-10 top-16 rounded-full bg-teal-100 px-4 py-3 text-sm text-teal-900 ring-1 ring-teal-200">
                Family spaces
              </div>
              <div className="absolute bottom-12 left-16 rounded-full bg-white px-4 py-3 text-sm text-stone-700 ring-1 ring-stone-200">
                Community hall
              </div>
              <div className="absolute bottom-16 right-14 rounded-full bg-white px-4 py-3 text-sm text-stone-700 ring-1 ring-stone-200">
                Local markets
              </div>
              <div className="relative z-10 grid h-28 w-28 place-items-center rounded-full bg-stone-900 text-center text-sm text-white">
                {example.name}
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {contributionCards.map((card) => (
              <div key={card.title} className="rounded-[28px] bg-white/80 p-6 shadow-soft ring-1 ring-stone-200">
                <p className="font-display text-2xl text-stone-900">{card.title}</p>
                <p className="mt-3 text-sm leading-7 text-stone-600">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Media And Artifacts"
          title="Images, audio, video, and making traces"
          description="PathWeave can hold more than text, allowing story to stay connected to media, process, and artifacts."
        />
        <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {mediaCards.map((item, index) => (
              <div
                key={item}
                className={`rounded-[28px] p-5 shadow-soft ring-1 ring-stone-200 ${
                  index === 0 ? 'sm:col-span-2 min-h-[220px]' : 'min-h-[160px]'
                } bg-[linear-gradient(150deg,_rgba(251,243,227,0.92),_rgba(255,255,255,0.82))]`}
              >
                <div className="flex h-full flex-col justify-between">
                  <span className="text-xs uppercase tracking-[0.22em] text-stone-400">Image</span>
                  <p className="font-display text-2xl text-stone-900">{item}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4">
            <div className="rounded-[28px] bg-white/80 p-6 shadow-soft ring-1 ring-stone-200">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Audio</p>
              <p className="mt-3 font-display text-2xl text-stone-900">{example.audioCard}</p>
              <button className="mt-5 rounded-full bg-stone-900 px-4 py-2 text-sm text-white" type="button">
                Play audio
              </button>
            </div>
            <div className="rounded-[28px] bg-white/80 p-6 shadow-soft ring-1 ring-stone-200">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Video</p>
              <div className="mt-4 flex min-h-[170px] items-end rounded-[24px] bg-[linear-gradient(160deg,_rgba(20,184,166,0.16),_rgba(251,243,227,0.76))] p-5 ring-1 ring-stone-200">
                <p className="font-display text-2xl text-stone-900">{example.videoCard}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(example.artifacts || []).map((item) => (
                <div key={item} className="rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Artifact</p>
                  <p className="mt-3 text-sm leading-7 text-stone-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Future Pathways"
          title="Aspirations held softly"
          description="Future pathways are shown as possibilities and directions, not as a single job objective statement."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {example.futurePathways.map((item) => (
            <div key={item} className="rounded-[28px] bg-white/80 p-6 shadow-soft ring-1 ring-stone-200">
              <p className="font-display text-2xl text-stone-900">{item}</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                A pathway that can keep care, creativity, learning, and contribution in relationship.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[36px] border border-stone-200/80 bg-white/80 p-8 shadow-soft">
        <SectionHeading
          eyebrow="Optional Translation Layer"
          title="Approved tags only"
          description="These tags can support translation for different audiences, but they do not replace the story."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          {example.optionalTags.map((tag) => (
            <Badge key={tag} tone="accent">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="mt-6 text-sm leading-7 text-stone-500">Tags are optional and secondary. Meaning stays with the story itself.</p>
      </section>
    </div>
  )
}

function CulturalSafetyModal({ open, onConfirm }) {
  const [expanded, setExpanded] = useState(false)

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[36px] border border-white/70 bg-white p-8 shadow-[0_40px_100px_-35px_rgba(0,0,0,0.45)]">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Cultural safety</p>
        <h2 className="mt-3 font-display text-3xl text-stone-900">Respecting story and cultural safety</h2>
        <p className="mt-5 leading-8 text-stone-600">PathWeave supports respectful storytelling.</p>
        <p className="mt-2 leading-8 text-stone-600">
          You are in control of what you choose to share. Some knowledge or stories may be private, sensitive, or
          community-held.
        </p>
        <p className="mt-2 leading-8 text-stone-600">Please only share what feels appropriate.</p>
        <ul className="mt-6 space-y-3 text-sm text-stone-700">
          {[
            'You choose what to share',
            'You can keep things private',
            'Tags are optional',
            'Story meaning stays with you',
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {expanded ? (
          <div className="mt-6 rounded-[24px] bg-stone-50 p-5 text-sm leading-7 text-stone-600">
            PathWeave treats story as something contextual, relational, and not always for public translation. Privacy
            controls, optional tags, and export review are included so users can decide what stays visible and what
            does not.
          </div>
        ) : null}
        <div className="mt-8 flex justify-end gap-3">
          <button className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-700" onClick={() => setExpanded((current) => !current)} type="button">
            Learn more
          </button>
          <button className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white" onClick={onConfirm} type="button">
            I understand
          </button>
        </div>
      </div>
    </div>
  )
}

function BuilderPage({
  profile,
  setProfile,
  stories,
  setStories,
  draftStory,
  setDraftStory,
  showTagsInProfile,
  setShowTagsInProfile,
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [reviewTab, setReviewTab] = useState('portfolio')
  const [shareMode, setShareMode] = useState('shared')
  const [shareConfig, setShareConfig] = useState({
    selectedStories: stories.map((story) => story.id),
    includeTags: showTagsInProfile,
    includeMedia: true,
  })

  useEffect(() => {
    setShareConfig((current) => ({
      ...current,
      selectedStories: stories.map((story) => story.id),
      includeTags: showTagsInProfile,
    }))
  }, [stories, showTagsInProfile])

  const step = wizardSteps[currentStep]
  const selectedStories = stories.filter((story) => shareConfig.selectedStories.includes(story.id))

  const addStory = () => {
    if (!draftStory.title.trim() || !draftStory.narrative.trim()) {
      return
    }

    setStories((current) => [
      ...current,
      {
        ...draftStory,
        id: `story-${Date.now()}`,
        involved: profile.involvedPeople || draftStory.involved || '',
        benefited: profile.benefitedPeople || draftStory.benefited || '',
        media: [draftStory.image, draftStory.audio, draftStory.video].filter(Boolean).join(' / ') || 'Story media',
        tags: [],
        suggestedTags: suggestedTagLibrary.slice(0, 3),
        acceptedTags: suggestedTagLibrary.slice(0, 2),
      },
    ])
    setDraftStory(defaultDraftStory)
  }

  const updateAcceptedTags = (storyId, nextTags) => {
    setStories((current) => current.map((story) => (story.id === storyId ? { ...story, acceptedTags: nextTags } : story)))
  }

  const updateStoryField = (storyId, field, value) => {
    setStories((current) => current.map((story) => (story.id === storyId ? { ...story, [field]: value } : story)))
  }

  const nextStep = () => setCurrentStep((current) => Math.min(current + 1, wizardSteps.length - 1))
  const prevStep = () => setCurrentStep((current) => Math.max(current - 1, 0))

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0">
        <div className="relative overflow-hidden rounded-[36px] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(252,248,242,0.84))] p-6 shadow-soft sm:p-8">
          <WeaveBands />
          <div className="relative flex flex-col gap-5 border-b border-stone-200/80 pb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-stone-500">Guided builder</p>
                <h1 className="mt-3 font-display text-3xl text-stone-900 md:text-4xl">{step.label}</h1>
                <p className="mt-2 text-sm leading-6 text-stone-500">{step.phase}</p>
              </div>
              <span className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-600">
                Step {currentStep + 1} of {wizardSteps.length}
              </span>
            </div>
            <div className="space-y-4">
              <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-stone-900 transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / wizardSteps.length) * 100}%` }}
                />
              </div>
              <div className="relative grid gap-3 md:grid-cols-6">
                <div className="pointer-events-none absolute left-0 right-0 top-5 hidden h-px bg-[linear-gradient(90deg,rgba(245,158,11,0.35),rgba(20,184,166,0.3),rgba(245,158,11,0.2))] md:block" />
                {wizardSteps.map((item, index) => (
                  <button
                    key={item.id}
                    className={`relative rounded-[24px] px-3 py-3 text-left transition ${
                      index === currentStep
                        ? 'bg-stone-900 text-white'
                        : index < currentStep
                          ? 'bg-teal-50 text-teal-900 ring-1 ring-teal-200'
                          : 'bg-stone-50 text-stone-500 ring-1 ring-stone-200'
                    }`}
                    onClick={() => setCurrentStep(index)}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <ThreadMarker active={index === currentStep} completed={index < currentStep} index={index} />
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.24em] opacity-70">0{index + 1}</p>
                        <p className="mt-2 text-sm font-medium">{item.label}</p>
                        <p className={`mt-1 text-xs leading-5 ${index === currentStep ? 'text-white/70' : index < currentStep ? 'text-teal-900/75' : 'text-stone-400'}`}>
                          {item.phase}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mt-8 min-h-[560px] transition-all duration-300">
            {currentStep === 0 ? <StoryStep profile={profile} setProfile={setProfile} /> : null}
            {currentStep === 1 ? <ConnectionsStep profile={profile} setProfile={setProfile} /> : null}
            {currentStep === 2 ? <PathwaysStep profile={profile} setProfile={setProfile} /> : null}
            {currentStep === 3 ? <StoriesStep addStory={addStory} draftStory={draftStory} setDraftStory={setDraftStory} stories={stories} /> : null}
            {currentStep === 4 ? (
              <ReviewStep
                reviewTab={reviewTab}
                selectedStories={selectedStories}
                setReviewTab={setReviewTab}
                setShareConfig={setShareConfig}
                setShowTagsInProfile={setShowTagsInProfile}
                showTagsInProfile={showTagsInProfile}
                stories={stories}
                updateAcceptedTags={updateAcceptedTags}
                updateStoryField={updateStoryField}
              />
            ) : null}
            {currentStep === 5 ? (
              <ShareStep
                profile={profile}
                selectedStories={selectedStories}
                setShareConfig={setShareConfig}
                setShareMode={setShareMode}
                shareConfig={shareConfig}
                shareMode={shareMode}
                stories={stories}
              />
            ) : null}
          </div>

          <div className="relative mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/80 pt-6">
            <div>
              <p className="text-sm font-medium text-stone-900">{step.label}</p>
              <p className="text-sm text-stone-500">
                {currentStep < wizardSteps.length - 1 ? `Next: ${wizardSteps[currentStep + 1].label}` : 'Ready to share your PathWeave'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-700 disabled:opacity-40"
                disabled={currentStep === 0}
                onClick={prevStep}
                type="button"
              >
                Back
              </button>
              <button
                className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white"
                onClick={nextStep}
                type="button"
              >
                {currentStep === wizardSteps.length - 1 ? 'Finish review' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside className="hidden xl:block">
        <div className="sticky top-28">
          <WeaveProgressPanel
            currentStep={currentStep}
            profile={profile}
            shareConfig={shareConfig}
            shareMode={shareMode}
            showTagsInProfile={showTagsInProfile}
            stories={stories}
          />
        </div>
      </aside>
    </div>
  )
}

function StepIntro({ eyebrow = 'Weaving step', title, description, chips, note }) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-stone-200/80 bg-[linear-gradient(155deg,_rgba(251,243,227,0.9),_rgba(255,255,255,0.8))] p-6 shadow-soft">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-7 h-16 w-56 rotate-[9deg] rounded-full bg-amber-200/38 blur-xl" />
        <div className="absolute right-[-2.5rem] top-12 h-16 w-52 -rotate-[12deg] rounded-full bg-teal-200/28 blur-xl" />
        <div className="absolute left-[22%] bottom-5 h-12 w-40 -rotate-[18deg] rounded-full bg-white/70 blur-lg" />
        <div className="absolute right-[18%] bottom-7 h-12 w-40 rotate-[16deg] rounded-full bg-white/55 blur-lg" />
      </div>
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl text-stone-900">{title}</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">{description}</p>
        {chips?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {chips.map((chip, index) => (
              <span
                key={chip}
                className={`rounded-full px-4 py-2 text-sm ${
                  index % 3 === 0
                    ? 'bg-white/85 text-stone-700 ring-1 ring-stone-200'
                    : index % 3 === 1
                      ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
                      : 'bg-teal-50 text-teal-900 ring-1 ring-teal-200'
                }`}
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
        {note ? <p className="mt-5 max-w-2xl text-sm leading-6 text-stone-500">{note}</p> : null}
      </div>
    </div>
  )
}

function StoryStep({ profile, setProfile }) {
  const promptChips = [
    'I learn through care and community',
    'My pathway has been shaped by people and place',
    'I want my story to stay connected to meaning',
  ]

  return (
    <div className="space-y-8">
      <StepIntro
        eyebrow="Thread 1 of 6"
        title="Start with your voice"
        description="Begin with a narrative introduction so the process starts with expression rather than form-filling."
        chips={['narrative intro', 'prompted gently', 'story-first']}
        note="This first step establishes the opening thread of your PathWeave."
      />
      <div className="grid gap-5">
        <div className="flex flex-wrap gap-2">
          {promptChips.map((chip) => (
            <button
              key={chip}
              className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-200"
              onClick={() =>
                setProfile((current) => ({
                  ...current,
                  narrativeIntro: current.narrativeIntro ? `${current.narrativeIntro} ${chip}` : chip,
                }))
              }
              type="button"
            >
              {chip}
            </button>
          ))}
        </div>
        <Field
          label="Narrative intro"
          multiline
          placeholder="In a few sentences, how would you like to introduce your story?"
          value={profile.narrativeIntro}
          onChange={(value) => setProfile((current) => ({ ...current, narrativeIntro: value }))}
        />
      </div>
    </div>
  )
}

function ConnectionsStep({ profile, setProfile }) {
  return (
    <div className="space-y-8">
      <StepIntro
        eyebrow="Thread 2 of 6"
        title="Add connection and context"
        description="Expand the story beyond the individual by making relationships, contribution, and place visible."
        chips={['connected with', 'involved', 'benefited', 'place']}
        note="Here the weave widens from personal story toward people, community, and place."
      />
      <div className="grid gap-5">
        <Field
          label="Who are you connected with"
          multiline
          placeholder="Family, community, collaborators, mentors, groups"
          value={profile.connectedWith || ''}
          onChange={(value) => setProfile((current) => ({ ...current, connectedWith: value, communityConnections: value }))}
        />
        <Field
          label="Who was involved"
          placeholder="Who helped shape the work or experience?"
          value={profile.involvedPeople || ''}
          onChange={(value) => setProfile((current) => ({ ...current, involvedPeople: value }))}
        />
        <Field
          label="Who benefited"
          placeholder="Who gained from the story or contribution?"
          value={profile.benefitedPeople || ''}
          onChange={(value) => setProfile((current) => ({ ...current, benefitedPeople: value }))}
        />
        <Field
          label="Place / community"
          multiline
          placeholder="What places or communities shape the story?"
          value={profile.placeConnection}
          onChange={(value) => setProfile((current) => ({ ...current, placeConnection: value }))}
        />
      </div>
    </div>
  )
}

function PathwaysStep({ profile, setProfile }) {
  return (
    <div className="space-y-8">
      <StepIntro
        eyebrow="Thread 3 of 6"
        title="Shape what matters next"
        description="Move gently from present experience toward interests, aspirations, and future directions."
        chips={['interests', 'aspirations', 'future directions', 'pathways']}
        note="Pathways stay open here. This is about direction and possibility, not a career objective."
      />
      <div className="grid gap-5">
        <Field
          label="Interests"
          placeholder="creative facilitation, mentoring, community work"
          value={profile.interests || ''}
          onChange={(value) => setProfile((current) => ({ ...current, interests: value }))}
        />
        <Field
          label="Aspirations"
          multiline
          placeholder="What futures, possibilities, or directions matter to you?"
          value={profile.aspirations || ''}
          onChange={(value) => setProfile((current) => ({ ...current, aspirations: value }))}
        />
        <Field
          label="Future directions / pathways"
          placeholder="learning, work, enterprise, community pathways"
          value={profile.futurePathways}
          onChange={(value) => setProfile((current) => ({ ...current, futurePathways: value }))}
        />
      </div>
    </div>
  )
}

function StoriesStep({ draftStory, setDraftStory, stories, addStory }) {
  return (
    <div className="space-y-8">
      <StepIntro
        eyebrow="Thread 4 of 6"
        title="Stories and media"
        description="Build story cards and keep media embedded inside each story rather than treating it as a separate upload area."
        chips={['story title', 'narrative', 'image', 'audio', 'video']}
        note="Stories and media are woven together so the material stays attached to meaning and context."
      />
      <div className="grid gap-5">
        <Field
          label="Title"
          placeholder="What would you call this story?"
          value={draftStory.title}
          onChange={(value) => setDraftStory((current) => ({ ...current, title: value }))}
        />
        <Field
          label="Narrative"
          multiline
          placeholder="Tell the story in your own words."
          value={draftStory.narrative}
          onChange={(value) => setDraftStory((current) => ({ ...current, narrative: value }))}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Image"
            placeholder="Image label or placeholder"
            value={draftStory.image}
            onChange={(value) => setDraftStory((current) => ({ ...current, image: value }))}
          />
          <Field
            label="Audio"
            placeholder="Audio introduction or reflection"
            value={draftStory.audio}
            onChange={(value) => setDraftStory((current) => ({ ...current, audio: value }))}
          />
          <Field
            label="Video"
            placeholder="Video clip or walkthrough"
            value={draftStory.video}
            onChange={(value) => setDraftStory((current) => ({ ...current, video: value }))}
          />
          <Field
            label="Location"
            placeholder="Where did this happen?"
            value={draftStory.location}
            onChange={(value) => setDraftStory((current) => ({ ...current, location: value }))}
          />
          <SelectField
            label="Privacy"
            options={['Share in my PathWeave', 'Only for selected sharing', 'Keep private for now']}
            value={draftStory.privacy}
            onChange={(value) => setDraftStory((current) => ({ ...current, privacy: value }))}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white" onClick={addStory} type="button">
            Add story
          </button>
          <p className="text-sm text-stone-500">{stories.length} stories in your PathWeave</p>
        </div>
      </div>
    </div>
  )
}

function ReviewStep({
  stories,
  selectedStories,
  setShareConfig,
  updateAcceptedTags,
  updateStoryField,
  showTagsInProfile,
  setShowTagsInProfile,
  reviewTab,
  setReviewTab,
}) {
  return (
    <div className="space-y-8">
      <StepIntro
        eyebrow="Thread 5 of 6"
        title="Review"
        description="Check the portfolio view first, then review optional tags and visibility before moving to export."
        chips={['Story & Portfolio', 'Tags & Sharing']}
        note="This is where the weave is checked carefully, without assuming everything should be shown."
      />
      <div className="flex gap-2 rounded-full bg-stone-100 p-1">
        {[
          ['portfolio', 'Story & Portfolio'],
          ['tags', 'Tags & Sharing'],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`rounded-full px-4 py-2 text-sm ${reviewTab === id ? 'bg-stone-900 text-white' : 'text-stone-600'}`}
            onClick={() => setReviewTab(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      {reviewTab === 'portfolio' ? (
        <div className="space-y-5">
          <div className="rounded-[28px] bg-stone-50 p-6 ring-1 ring-stone-200">
            <p className="text-sm uppercase tracking-[0.24em] text-stone-400">Portfolio preview</p>
            <div className="mt-4 grid gap-4">
              {selectedStories.map((story) => (
                <article key={story.id} className="rounded-[24px] bg-white p-5 ring-1 ring-stone-200">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-display text-2xl text-stone-900">{story.title}</p>
                    <Badge>{story.location}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{story.narrative}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-stone-400">Choose which stories appear in the portfolio</p>
            {stories.map((story) => (
              <label key={story.id} className="flex items-start gap-4 rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
                <input
                  checked={selectedStories.some((item) => item.id === story.id)}
                  className="mt-1"
                  onChange={() =>
                    setShareConfig((current) => ({
                      ...current,
                      selectedStories: current.selectedStories.includes(story.id)
                        ? current.selectedStories.filter((item) => item !== story.id)
                        : [...current.selectedStories, story.id],
                    }))
                  }
                  type="checkbox"
                />
                <div>
                  <p className="font-medium text-stone-900">{story.title}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{story.narrative}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      ) : null}
      {reviewTab === 'tags' ? (
        <div className="space-y-5">
          <label className="flex items-center justify-between rounded-[24px] bg-stone-50 px-5 py-4 ring-1 ring-stone-200">
            <div>
              <p className="font-medium text-stone-900">Show tags in my profile</p>
              <p className="text-sm text-stone-500">Stories remain visible even when tags are hidden.</p>
            </div>
            <button
              className={`relative h-8 w-14 rounded-full transition ${showTagsInProfile ? 'bg-stone-900' : 'bg-stone-300'}`}
              onClick={() => setShowTagsInProfile((current) => !current)}
              type="button"
            >
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${showTagsInProfile ? 'left-7' : 'left-1'}`} />
            </button>
          </label>
          <div className="space-y-5">
            {stories.map((story) => (
              <TagReviewCard
                key={story.id}
                onChange={updateAcceptedTags}
                onPrivacyChange={(value) => updateStoryField(story.id, 'privacy', value)}
                story={story}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ShareStep({ profile, stories, selectedStories, shareMode, setShareMode, shareConfig, setShareConfig }) {
  const [reviewOpen, setReviewOpen] = useState(false)
  const exportPayload = buildExportPayload(profile, selectedStories, shareConfig)

  return (
    <div className="space-y-8">
      <StepIntro
        eyebrow="Thread 6 of 6"
        title="Choose how to share"
        description="Generate the output format here, then confirm content in a final export review modal."
        chips={['shared view', 'summary export', 'structured json']}
        note="Sharing happens last, after the weave has been gathered and reviewed."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {Object.entries(exportModeDetails).map(([key, info]) => (
          <button
            key={key}
            className={`rounded-[28px] border p-5 text-left transition ${
              shareMode === key ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-stone-50 text-stone-800'
            }`}
            onClick={() => setShareMode(key)}
            type="button"
          >
            <p className="text-xs uppercase tracking-[0.24em] opacity-70">{info.label}</p>
            <p className="mt-3 font-display text-2xl">{info.title}</p>
            <p className="mt-3 text-sm leading-6 opacity-80">{info.description}</p>
          </button>
        ))}
      </div>
      <div className="rounded-[28px] bg-stone-50 p-6 ring-1 ring-stone-200">
        <p className="text-sm uppercase tracking-[0.24em] text-stone-400">Selected output</p>
        <p className="mt-3 font-display text-3xl text-stone-900">{exportModeDetails[shareMode].title}</p>
        <p className="mt-3 text-sm leading-7 text-stone-600">{exportModeDetails[shareMode].description}</p>
      </div>
      {shareMode === 'shared' ? <SharedViewOutput payload={exportPayload} /> : null}
      {shareMode === 'summary' ? <SummaryExportOutput payload={exportPayload} /> : null}
      <div className="flex flex-wrap gap-3">
        <button className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white" onClick={() => setReviewOpen(true)} type="button">
          Review export
        </button>
        <p className="self-center text-sm text-stone-500">Open the export review modal to confirm stories, media, tags, and export mode.</p>
      </div>
      {shareMode === 'structured' ? (
        <pre className="overflow-x-auto rounded-[28px] bg-stone-900 p-6 text-sm leading-7 text-white">
          {JSON.stringify(exportPayload, null, 2)}
        </pre>
      ) : null}
      <ExportReviewModal
        open={reviewOpen}
        setReviewOpen={setReviewOpen}
        setShareConfig={setShareConfig}
        setShareMode={setShareMode}
        shareConfig={shareConfig}
        shareMode={shareMode}
        stories={stories}
      />
    </div>
  )
}

function SharedViewOutput({ payload }) {
  return (
    <section className="rounded-[32px] border border-stone-200/80 bg-white/90 p-6 shadow-soft sm:p-8">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.24em] text-stone-400">Shared View</p>
        <h3 className="mt-3 font-display text-4xl text-stone-900">{payload.name}</h3>
        <p className="mt-5 text-base leading-8 text-stone-600">
          {payload.intro || 'A full narrative portfolio will appear here, keeping story, community, and pathways visible together.'}
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          {payload.stories.length ? (
            payload.stories.map((story, index) => (
              <article key={`${story.title}-${index}`} className="rounded-[28px] bg-stone-50 p-5 ring-1 ring-stone-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl text-stone-900">{story.title}</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.22em] text-stone-400">{story.location || 'Story location'}</p>
                  </div>
                  {(story.image || story.audio || story.video) && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-stone-500 ring-1 ring-stone-200">
                      {story.image ? 'Image' : story.audio ? 'Audio' : 'Video'}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-7 text-stone-600">{story.narrative}</p>
                <div className="mt-4 grid gap-3 text-sm text-stone-600 md:grid-cols-2">
                  <div className="rounded-[20px] bg-white px-4 py-3 ring-1 ring-stone-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Involved</p>
                    <p className="mt-2">{story.involved.join(', ') || 'Shared by the storyteller'}</p>
                  </div>
                  <div className="rounded-[20px] bg-white px-4 py-3 ring-1 ring-stone-200">
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Who benefited</p>
                    <p className="mt-2">{story.benefited.join(', ') || 'Community connections and future audiences'}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[28px] bg-stone-50 p-6 text-sm leading-7 text-stone-500 ring-1 ring-stone-200">
              Select at least one story to generate the full shared portfolio view.
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[28px] bg-[#f3ede3] p-5 ring-1 ring-stone-200">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Connections</p>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              {payload.connections.community || 'Community contribution and context will appear here in the shared view.'}
            </p>
          </div>
          <div className="rounded-[28px] bg-stone-50 p-5 ring-1 ring-stone-200">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Future pathways</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[...payload.pathways.interests, ...payload.pathways.aspirations, ...payload.pathways.futureDirections].length ? (
                [...payload.pathways.interests, ...payload.pathways.aspirations, ...payload.pathways.futureDirections].map((item) => (
                  <Badge key={item} tone="accent">
                    {item}
                  </Badge>
                ))
              ) : (
                <Badge tone="accent">Future pathways</Badge>
              )}
            </div>
          </div>
          {payload.tags.length ? (
            <div className="rounded-[28px] bg-stone-50 p-5 ring-1 ring-stone-200">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Approved tags</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {payload.tags.map((tag) => (
                  <Badge key={tag} tone="soft">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

function SummaryExportOutput({ payload }) {
  return (
    <section className="rounded-[32px] border border-stone-200/80 bg-stone-50 p-6 ring-1 ring-stone-200 sm:p-8">
      <p className="text-sm uppercase tracking-[0.24em] text-stone-400">Summary Export</p>
      <h3 className="mt-3 font-display text-3xl text-stone-900">{payload.name}</h3>
      <div className="mt-6 space-y-5 text-sm leading-7 text-stone-600">
        <p>
          {payload.intro
            ? payload.intro.length > 180
              ? `${payload.intro.slice(0, 180).trim()}...`
              : payload.intro
            : 'A shorter version of the narrative introduction will appear here.'}
        </p>
        <div className="rounded-[24px] bg-white p-5 ring-1 ring-stone-200">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Story highlights</p>
          <div className="mt-4 space-y-4">
            {payload.stories.length ? (
              payload.stories.slice(0, 3).map((story, index) => (
                <div key={`${story.title}-${index}`} className="rounded-[20px] bg-stone-50 px-4 py-4 ring-1 ring-stone-200">
                  <p className="font-medium text-stone-900">{story.title}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {story.narrative.length > 140 ? `${story.narrative.slice(0, 140).trim()}...` : story.narrative}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">Choose stories to generate a shortened narrative summary.</p>
            )}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-white p-5 ring-1 ring-stone-200">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Community</p>
            <p className="mt-3">
              {payload.connections.community
                ? payload.connections.community.length > 150
                  ? `${payload.connections.community.slice(0, 150).trim()}...`
                  : payload.connections.community
                : 'A short community summary will appear here.'}
            </p>
          </div>
          <div className="rounded-[24px] bg-white p-5 ring-1 ring-stone-200">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Pathways</p>
            <p className="mt-3">
              {[...payload.pathways.aspirations, ...payload.pathways.futureDirections].join(', ') || 'Future pathways summary'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function WeaveProgressPanel({ currentStep, profile, stories, showTagsInProfile, shareConfig, shareMode }) {
  const selectedStories = stories.filter((story) => shareConfig.selectedStories.includes(story.id))
  const mediaCount = stories.filter((story) => story.image || story.audio || story.video).length
  const privateCount = stories.filter((story) => story.privacy === 'Keep private for now').length
  const allPathways = [...splitValue(profile.interests || ''), ...splitValue(profile.aspirations || ''), ...splitValue(profile.futurePathways || '')]
  const stageNotes = [
    {
      title: 'Story thread',
      detail: firstSentence(profile.narrativeIntro, 'A first introduction has not been woven in yet.'),
    },
    {
      title: 'Connections',
      detail:
        splitValue(profile.connectedWith).length || splitValue(profile.involvedPeople).length || splitValue(profile.benefitedPeople).length || profile.placeConnection
          ? `${splitValue(profile.connectedWith).length} connection groups, ${splitValue(profile.involvedPeople).length} involved, ${splitValue(profile.benefitedPeople).length} benefited.`
          : 'People, community, and place have not been gathered yet.',
    },
    {
      title: 'Pathways',
      detail: allPathways.length ? `${allPathways.length} pathway notes gathered so far.` : 'Interests and future directions are still open.',
    },
    {
      title: 'Stories and media',
      detail: stories.length
        ? `${stories.length} stories added, with media attached to ${mediaCount} of them.`
        : 'No story cards have been added yet.',
    },
    {
      title: 'Review decisions',
      detail:
        currentStep >= 4
          ? `${selectedStories.length} stories currently marked for review, ${showTagsInProfile && shareConfig.includeTags ? 'approved tags visible' : 'tags kept secondary'}, ${privateCount} private.`
          : 'Review decisions happen after the weave is assembled.',
    },
    {
      title: 'Sharing shape',
      detail:
        currentStep >= 5
          ? `${exportModeDetails[shareMode].title} is prepared as the current sharing format.`
          : 'No shared output is prepared yet.',
    },
  ]

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white/85 shadow-[0_36px_90px_-45px_rgba(79,52,29,0.55)] backdrop-blur">
      <div className="border-b border-stone-200/80 bg-stone-900 px-6 py-5 text-white">
        <p className="text-xs uppercase tracking-[0.28em] text-white/60">Weave in progress</p>
        <p className="mt-3 font-display text-2xl text-white">PathWeave in progress</p>
        <p className="mt-3 text-sm leading-6 text-white/70">
          This panel tracks what has been gathered so far. It is not the final shared view.
        </p>
      </div>
      <div className="max-h-[calc(100vh-10rem)] space-y-6 overflow-auto p-6">
        <div className="space-y-4">
          {wizardSteps.map((item, index) => {
            const isCurrent = index === currentStep
            const isComplete = index < currentStep

            return (
              <section
                key={item.id}
                className={`rounded-[24px] p-4 ring-1 transition ${
                  isCurrent
                    ? 'bg-stone-900 text-white ring-stone-900'
                    : isComplete
                      ? 'bg-teal-50 text-teal-950 ring-teal-200'
                      : 'bg-stone-50 text-stone-800 ring-stone-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.24em] ${isCurrent ? 'text-white/60' : isComplete ? 'text-teal-800/70' : 'text-stone-400'}`}>
                      {item.label}
                    </p>
                    <p className={`mt-2 font-medium ${isCurrent ? 'text-white' : 'text-stone-900'}`}>{item.phase}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      isCurrent
                        ? 'bg-white/10 text-white'
                        : isComplete
                          ? 'bg-white/70 text-teal-900 ring-1 ring-teal-200'
                          : 'bg-white text-stone-500 ring-1 ring-stone-200'
                    }`}
                  >
                    {isCurrent ? 'Current' : isComplete ? 'Woven in' : 'Waiting'}
                  </span>
                </div>
                <p className={`mt-4 text-sm leading-6 ${isCurrent ? 'text-white/78' : isComplete ? 'text-teal-950/80' : 'text-stone-600'}`}>
                  {stageNotes[index].detail}
                </p>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ExportReviewModal({ open, stories, shareConfig, setShareConfig, shareMode, setShareMode, setReviewOpen }) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/45 px-4 py-6 backdrop-blur-sm sm:px-6 sm:py-8">
      <div className="flex max-h-[calc(100svh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_40px_100px_-35px_rgba(0,0,0,0.45)] sm:max-h-[calc(100svh-4rem)] sm:rounded-[36px]">
        <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-stone-500">Export review</p>
            <h2 className="mt-3 font-display text-3xl text-stone-900">Review what you share</h2>
            <p className="mt-4 text-base leading-8 text-stone-600">
              Confirm which stories to include, whether media is shown, whether approved tags appear, and which export mode should be used.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl grid gap-4 md:grid-cols-2">
          <ToggleRow
            checked={shareConfig.includeMedia}
            label="Include media"
            onToggle={() => setShareConfig((current) => ({ ...current, includeMedia: !current.includeMedia }))}
          />
          <ToggleRow
            checked={shareConfig.includeTags}
            label="Include approved tags only"
            onToggle={() => setShareConfig((current) => ({ ...current, includeTags: !current.includeTags }))}
          />
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <div className="grid gap-3 lg:grid-cols-3">
              {Object.entries(exportModeDetails).map(([key, info]) => (
                <button
                  key={key}
                  className={`rounded-[24px] border p-4 text-left ${shareMode === key ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-stone-50 text-stone-800'}`}
                  onClick={() => setShareMode(key)}
                  type="button"
                >
                  <p className="text-xs uppercase tracking-[0.22em] opacity-70">{info.label}</p>
                  <p className="mt-2 font-display text-2xl">{info.title}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            <p className="text-center text-sm uppercase tracking-[0.24em] text-stone-400">Which stories to include</p>
            {stories.map((story) => (
              <label key={story.id} className="flex items-start gap-4 rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
                <input
                  checked={shareConfig.selectedStories.includes(story.id)}
                  className="mt-1"
                  onChange={() =>
                    setShareConfig((current) => ({
                      ...current,
                      selectedStories: current.selectedStories.includes(story.id)
                        ? current.selectedStories.filter((item) => item !== story.id)
                        : [...current.selectedStories, story.id],
                    }))
                  }
                  type="checkbox"
                />
                <div>
                  <p className="font-medium text-stone-900">{story.title}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{story.narrative}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-stone-200/80 px-5 py-4 sm:px-8">
          <div className="mx-auto flex max-w-3xl justify-center sm:justify-end">
            <button className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white" onClick={() => setReviewOpen(false)} type="button">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TagReviewCard({ story, onChange, onPrivacyChange }) {
  const [draftTag, setDraftTag] = useState('')

  const addTag = () => {
    const tag = draftTag.trim()
    if (!tag) {
      return
    }
    onChange(story.id, [...new Set([...(story.acceptedTags || []), tag])])
    setDraftTag('')
  }

  return (
    <article className="rounded-[28px] bg-stone-50 p-5 ring-1 ring-stone-200">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="font-display text-2xl text-stone-900">{story.title}</p>
          <p className="mt-3 text-sm leading-7 text-stone-600">{story.narrative}</p>
        </div>
        <div className="rounded-[22px] bg-white p-4 ring-1 ring-stone-200">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Suggested tags</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(story.suggestedTags || []).map((tag) => (
              <button
                key={tag}
                className="rounded-full bg-amber-100 px-3 py-1.5 text-xs text-amber-900"
                onClick={() => onChange(story.id, [...new Set([...(story.acceptedTags || []), tag])])}
                type="button"
              >
                Accept {tag}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-stone-400">Accepted</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(story.acceptedTags || []).map((tag) => (
              <button
                key={tag}
                className="rounded-full bg-stone-900 px-3 py-1.5 text-xs text-white"
                onClick={() => onChange(story.id, (story.acceptedTags || []).filter((item) => item !== tag))}
                type="button"
              >
                Remove {tag}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm"
              onChange={(event) => setDraftTag(event.target.value)}
              placeholder="Edit or add tag"
              value={draftTag}
            />
            <button className="rounded-full border border-stone-300 px-4 py-2 text-sm" onClick={addTag} type="button">
              Add
            </button>
          </div>
          <div className="mt-4">
            <SelectField
              label="Visibility"
              onChange={onPrivacyChange}
              options={['Share in my PathWeave', 'Only for selected sharing', 'Keep private for now']}
              value={story.privacy}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

function Field({ label, value, onChange, placeholder, multiline = false }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-900">{label}</span>
      {multiline ? (
        <textarea
          className="mt-3 min-h-[132px] w-full rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      ) : (
        <input
          className="mt-3 w-full rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      )}
    </label>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-900">{label}</span>
      <select
        className="mt-3 w-full rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function ToggleRow({ checked, label, onToggle }) {
  return (
    <button
      className={`flex items-center justify-between rounded-[24px] px-5 py-4 text-left ${checked ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
      onClick={onToggle}
      type="button"
    >
      <span>{label}</span>
      <span className={`h-3 w-3 rounded-full ${checked ? 'bg-amber-300' : 'bg-stone-400'}`} />
    </button>
  )
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialState = useMemo(() => loadState(), [])
  const [profile, setProfile] = useState(initialState.profile)
  const [stories, setStories] = useState(initialState.stories)
  const [draftStory, setDraftStory] = useState(initialState.draftStory)
  const [showTagsInProfile, setShowTagsInProfile] = useState(initialState.showTagsInProfile)
  const [showConsent, setShowConsent] = useState(false)
  const [showEntryModal, setShowEntryModal] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return location.pathname === '/' && window.localStorage.getItem(ENTRY_MODAL_SEEN_KEY) !== 'true'
  })
  const [consentAccepted, setConsentAccepted] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }
    return window.localStorage.getItem(CONSENT_KEY) === 'true'
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profile,
        stories,
        draftStory,
        showTagsInProfile,
      }),
    )
  }, [profile, stories, draftStory, showTagsInProfile])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setShowEntryModal(location.pathname === '/' && window.localStorage.getItem(ENTRY_MODAL_SEEN_KEY) !== 'true')
  }, [location.pathname])

  const startFlow = () => {
    if (consentAccepted) {
      navigate('/builder')
      return
    }
    setShowConsent(true)
  }

  const confirmConsent = () => {
    setConsentAccepted(true)
    window.localStorage.setItem(CONSENT_KEY, 'true')
    setShowConsent(false)
    navigate('/builder')
  }

  const dismissEntryModal = () => {
    setShowEntryModal(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ENTRY_MODAL_SEEN_KEY, 'true')
    }
  }

  const safeNavigate = (path) => {
    if (path === '/builder' && !consentAccepted) {
      setShowConsent(true)
      return
    }
    navigate(path)
  }

  return (
    <AppShell consentAccepted={consentAccepted} onNavigate={safeNavigate} onStart={startFlow}>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onGoAbout={() => navigate('/about')}
              onSeeExample={() => navigate('/example')}
              onStart={startFlow}
              profile={exampleProfiles[0]}
              stories={exampleProfiles[0].stories}
            />
          }
        />
        <Route
          path="/example"
          element={<ExampleProfilePage example={exampleProfiles[0]} onBack={() => navigate('/')} onStart={startFlow} />}
        />
        <Route
          path="/about"
          element={
            <AboutPage
              onBack={() => navigate('/')}
              onGoExample={() => navigate('/example')}
              onGoHome={() => navigate('/')}
              onStart={startFlow}
            />
          }
        />
        <Route
          path="/builder"
          element={
            <BuilderPage
              draftStory={draftStory}
              profile={profile}
              setDraftStory={setDraftStory}
              setProfile={setProfile}
              setShowTagsInProfile={setShowTagsInProfile}
              setStories={setStories}
              showTagsInProfile={showTagsInProfile}
              stories={stories}
            />
          }
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
      <EntrySafetyModal
        open={location.pathname === '/' && showEntryModal}
        onClose={dismissEntryModal}
        onLearnMore={() => {
          dismissEntryModal()
          navigate('/about')
        }}
      />
      <CulturalSafetyModal open={showConsent} onConfirm={confirmConsent} />
    </AppShell>
  )
}
