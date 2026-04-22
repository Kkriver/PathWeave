import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  defaultDraftStory,
  defaultProfileDraft,
  exampleProfiles,
  exportModeDetails,
  suggestedTagLibrary,
} from './data/mockData'
import PathWeaveOutputs from './components/outputs/PathWeaveOutputs'
import OutputModeSwitcher from './components/outputs/OutputModeSwitcher'
import FullPathWeaveView from './components/outputs/FullPathWeaveView'
import SummaryExportView from './components/outputs/SummaryExportView'
import StructuredJsonView from './components/outputs/StructuredJsonView'
import { buildPathWeaveOutput } from './utils/buildPathWeaveOutput'

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
      stories: defaultProfileDraft.stories.map((story) => normalizeStory(story)),
      draftStory: defaultDraftStory,
      showTagsInProfile: true,
    }
  }

  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')
    return {
      profile: saved.profile || defaultProfileDraft,
      stories: (saved.stories || defaultProfileDraft.stories).map((story) => normalizeStory(story)),
      draftStory: saved.draftStory || defaultDraftStory,
      showTagsInProfile: saved.showTagsInProfile ?? true,
    }
  } catch {
    return {
      profile: defaultProfileDraft,
      stories: defaultProfileDraft.stories.map((story) => normalizeStory(story)),
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

function isTrackedStoryField(value) {
  return Boolean(value) && typeof value === 'object' && 'value' in value
}

function normalizeTrackedStoryField(value) {
  if (isTrackedStoryField(value)) {
    return {
      value: String(value.value || '').trim(),
      isInherited: Boolean(value.isInherited),
    }
  }

  return {
    value: String(value || '').trim(),
    isInherited: false,
  }
}

function createTrackedStoryField(profileValue, draftValue) {
  const storySpecificValue = String(draftValue || '').trim()

  if (storySpecificValue) {
    return { value: storySpecificValue, isInherited: false }
  }

  const inheritedValue = String(profileValue || '').trim()
  return { value: inheritedValue, isInherited: Boolean(inheritedValue) }
}

function normalizeStory(story) {
  if (!story) {
    return story
  }

  return {
    ...story,
    involved: normalizeTrackedStoryField(story.involved),
    benefited: normalizeTrackedStoryField(story.benefited),
    contextSnapshot: String(story.contextSnapshot || '').trim(),
  }
}

function isPristineDraftStory(story) {
  return (
    !String(story?.title || '').trim() &&
    !String(story?.narrative || '').trim() &&
    !String(story?.involved || '').trim() &&
    !String(story?.benefited || '').trim() &&
    !String(story?.location || '').trim() &&
    !String(story?.image || '').trim() &&
    !String(story?.audio || '').trim() &&
    !String(story?.video || '').trim() &&
    (story?.privacy || defaultDraftStory.privacy) === defaultDraftStory.privacy
  )
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

function createDefaultShareConfig(stories, showTagsInProfile) {
  return {
    selectedStories: stories.map((story) => story.id),
    includeTags: showTagsInProfile,
    includeMedia: true,
  }
}

function buildExampleOutput(example) {
  const profile = {
    name: example.name,
    identityDescription: example.identityLine,
    placeConnection: example.placeConnection,
    narrativeIntro: example.narrativeIntro,
    values: Array.isArray(example.values) ? example.values.join(', ') : '',
    connectedWith: example.placeConnection,
    involvedPeople: example.stories.map((story) => story.involved).join(', '),
    benefitedPeople: example.stories.map((story) => story.benefited).join(', '),
    communityConnections: example.communityContribution,
    interests: Array.isArray(example.futurePathways) ? example.futurePathways.slice(0, 2).join(', ') : '',
    aspirations: Array.isArray(example.futurePathways) ? example.futurePathways.slice(1).join(', ') : '',
    futurePathways: Array.isArray(example.futurePathways) ? example.futurePathways.join(', ') : '',
  }

  const stories = example.stories.map((story) => ({
    ...story,
    image: String(story.media || '').toLowerCase().includes('photo') ? story.media : '',
    audio: String(story.media || '').toLowerCase().includes('audio') ? story.media : '',
    video: String(story.media || '').toLowerCase().includes('video') ? story.media : '',
  }))

  return buildPathWeaveOutput(profile, stories, createDefaultShareConfig(stories, true))
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
      className={`relative flex items-center justify-center text-xs font-medium transition-all duration-500 ${
        active
          ? 'thread-blob h-11 w-11 text-stone-900'
          : completed
            ? 'h-3 w-3 rounded-full bg-[rgba(169,143,97,0.7)] text-transparent'
            : 'h-2.5 w-2.5 rounded-full bg-stone-300/85 text-transparent'
      }`}
    >
      {active ? index + 1 : null}
    </div>
  )
}

function BuilderWeaveBackdrop({ progress = 0, pulse = 0 }) {
  const scale = 1 + progress * 0.02
  const shift = progress * 18

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F9F7F2] via-[#F6F2EA] to-[#ECE9E1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,151,69,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(129,148,134,0.12),_transparent_28%)]" />
      <div
        className={`weave-pattern-overlay absolute inset-[-8%] ${pulse ? 'weave-pattern-pulse' : ''}`}
        key={`${progress}-${pulse}`}
        style={{
          opacity: 0.05,
          transform: `translate3d(${shift}px, ${-shift * 0.4}px, 0) scale(${scale})`,
        }}
      >
        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1200 900">
          <defs>
            <pattern id="builder-weave-pattern" width="180" height="120" patternUnits="userSpaceOnUse">
              <path d="M12 34 C46 10, 84 10, 120 34 S196 58, 230 34" fill="none" stroke="rgba(95,76,52,0.9)" strokeWidth="1" />
              <path d="M-18 86 C24 60, 64 60, 106 86 S188 112, 232 86" fill="none" stroke="rgba(95,76,52,0.8)" strokeWidth="0.9" />
              <circle cx="120" cy="34" r="2.4" fill="rgba(201,151,69,0.92)" />
              <circle cx="106" cy="86" r="1.8" fill="rgba(129,148,134,0.88)" />
            </pattern>
          </defs>
          <rect fill="url(#builder-weave-pattern)" height="100%" width="100%" />
        </svg>
      </div>
      <div className="absolute left-[6%] top-[14%] h-32 w-[28%] rotate-[6deg] rounded-full bg-white/50 blur-3xl" />
      <div className="absolute right-[8%] top-[24%] h-28 w-[24%] -rotate-[8deg] rounded-full bg-[#efe6d6]/80 blur-3xl" />
      <div className="absolute bottom-[12%] left-[18%] h-24 w-[22%] rotate-[12deg] rounded-full bg-[#f3e7cf]/70 blur-3xl" />
    </div>
  )
}

function GoldenThreadStepper({ currentStep, onSelectStep }) {
  return (
    <div className="relative pt-6">
      <div className="pointer-events-none absolute left-[20px] right-[20px] top-[27px] h-px bg-[linear-gradient(90deg,rgba(161,138,98,0.18),rgba(161,138,98,0.7),rgba(161,138,98,0.18))]" />
      <div
        className="pointer-events-none absolute left-[20px] top-[27px] h-px bg-[linear-gradient(90deg,rgba(201,151,69,0.8),rgba(160,132,88,0.9))] transition-all duration-700"
        style={{ width: `calc(${(currentStep / (wizardSteps.length - 1 || 1)) * 100}% - 0px)` }}
      />
      <div className="grid gap-4 md:grid-cols-6">
        {wizardSteps.map((item, index) => {
          const isActive = index === currentStep
          const isComplete = index < currentStep

          return (
            <button
              key={item.id}
              className="group relative flex min-w-0 flex-col items-start text-left"
              onClick={() => onSelectStep(index)}
              type="button"
            >
              <div className="flex h-10 items-center">
                <ThreadMarker active={isActive} completed={isComplete} index={index} />
              </div>
              <div className="mt-5 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.36em] text-stone-400">0{index + 1}</p>
                <p
                  className={`mt-2 font-serif text-base tracking-tight transition-colors ${
                    isActive ? 'text-zinc-800' : isComplete ? 'text-stone-700' : 'text-stone-500'
                  }`}
                >
                  {item.label}
                </p>
                <p className="mt-1 max-w-[15ch] text-xs leading-5 text-stone-500/90">{item.phase}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function WeaveTag({ children, active = false, onClick, className = '', type = 'button' }) {
  return (
    <button
      aria-pressed={active}
      className={`group inline-flex items-center gap-2 border-b border-[rgba(95,76,52,0.18)] px-0 py-2 text-sm text-stone-600 transition-all duration-300 hover:-translate-y-[2px] hover:border-[rgba(95,76,52,0.48)] hover:text-stone-900 ${
        active ? 'border-[rgba(95,76,52,0.6)] text-stone-900' : ''
      } ${className}`}
      onClick={onClick}
      type={type}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[rgba(201,151,69,0.72)] transition-transform duration-300 group-hover:scale-125" />
      <span>{children}</span>
    </button>
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

function EditorialMetaTag({ children, className = '' }) {
  return <span className={`editorial-meta-tag ${className}`}>{children}</span>
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

function HomeSnapSection({ children, className = '', contentClassName = '' }) {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') {
      return undefined
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting)
      },
      { threshold: 0.45 },
    )

    observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={`snap-start h-screen w-full ${className}`}>
      <div className={`grid h-full w-full place-items-center px-1 pb-8 pt-32 sm:pb-10 sm:pt-36 ${contentClassName}`}>
        <div className={`fade-in-up w-full ${visible ? 'is-visible' : ''}`}>{children}</div>
      </div>
    </section>
  )
}

function ScrollToTopButton() {
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const homeScrollContainer = document.querySelector('[data-home-scroll="true"]')

    const handleScroll = () => {
      if (location.pathname === '/' && homeScrollContainer) {
        setVisible(homeScrollContainer.scrollTop > 220)
        return
      }

      setVisible(window.scrollY > 480)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    homeScrollContainer?.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      homeScrollContainer?.removeEventListener('scroll', handleScroll)
    }
  }, [location.pathname])

  if (!visible) {
    return null
  }

  return (
    <button
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-stone-900 text-white shadow-[0_24px_50px_-24px_rgba(41,37,36,0.85)] transition hover:-translate-y-0.5 hover:bg-stone-800 sm:bottom-8 sm:right-8"
      onClick={() => {
        const homeScrollContainer = document.querySelector('[data-home-scroll="true"]')

        if (location.pathname === '/' && homeScrollContainer) {
          homeScrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }

        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
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
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F7F2] via-[#F6F2EA] to-[#ECE9E1] text-stone-800">
      <div
        className={`mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 ${
          isHome ? 'relative h-screen overflow-hidden' : 'flex min-h-screen flex-col pb-12'
        }`}
      >
        <header className={isHome ? 'pointer-events-none absolute inset-x-4 top-6 z-20 sm:inset-x-6 lg:inset-x-8' : 'sticky top-4 z-20 mb-8'}>
          <div className="pointer-events-auto rounded-[28px] border border-white/60 bg-white/75 px-5 py-4 shadow-[0_30px_80px_-40px_rgba(87,63,38,0.45)] backdrop-blur">
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
        <main className={isHome ? 'h-full' : 'flex-1'}>{children}</main>
        {!isHome ? (
          <footer className="mt-16 border-t border-stone-200/70 py-8 text-sm text-stone-500">
            PathWeave is a First Nations-informed concept prototype designed to support culturally responsive storytelling.
          </footer>
        ) : null}
      </div>
      <ScrollToTopButton />
    </div>
  )
}

function LandingPage({ onStart, onSeeExample, onGoAbout, profile, stories }) {
  const exampleStories = stories.slice(0, 2)
  const exampleTags = [...new Set(stories.flatMap((story) => story.acceptedTags || story.tags || []))].slice(0, 4)

  return (
    <div className="h-full overflow-y-scroll scroll-smooth scrollbar-hide snap-y snap-mandatory" data-home-scroll="true">
      <HomeSnapSection contentClassName="items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="-mt-10 max-w-2xl self-center lg:-mt-16">
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
          <div className="mt-9 flex flex-wrap gap-4">
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
          </div>

          <div className="relative -mt-8 self-center lg:-mt-14">
            <WeaveVisual stories={stories} />
          </div>
        </div>
      </HomeSnapSection>

      <HomeSnapSection>
        <div className="grid w-full gap-6">
          <SectionHeading
            eyebrow="Why This Is Different"
            title="A different way to represent experience"
            description="PathWeave stays grounded in story, context, and connection instead of collapsing experience into titles, bullet points, or keyword logic."
          />
          <TridentSection />
        </div>
      </HomeSnapSection>

      <HomeSnapSection>
        <div className="grid w-full gap-6">
          <SectionHeading
            eyebrow="How It Works"
            title="How PathWeave works"
            description="The process stays simple and guided, so the experience feels calm and lightweight from the beginning."
          />
          <ContinuousTrajectorySection />
        </div>
      </HomeSnapSection>

      <HomeSnapSection>
        <div className="grid w-full gap-6">
          <SectionHeading
            eyebrow="Export / Output"
            title="Share your PathWeave in different ways"
            description="Outputs stay secondary to story, with options that support different sharing contexts."
          />
          <TransformationExportSection />
        </div>
      </HomeSnapSection>

      <HomeSnapSection contentClassName="items-center">
        <ShowcaseClosingSection />
      </HomeSnapSection>
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
              A concept platform for narrative portfolios, community-held context, and careful user-controlled sharing.
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
    <div className="relative isolate overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <AboutHeroBackdrop />
      <div className="relative mx-auto max-w-6xl pb-12">
        <AboutRevealSection className="min-h-[62vh] flex items-start">
          <div className="w-full">
            <div className="grid items-start gap-12 py-10 sm:py-12 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:gap-16">
              <div className="max-w-2xl">
                <h1 className="font-display text-4xl leading-tight text-stone-900 md:text-5xl">
                  A different way of being seen.
                </h1>
                <p className="mt-6 max-w-2xl text-xl leading-8 text-stone-800 md:text-2xl">
                  PathWeave is not another resume builder. It is a narrative canvas. For context, for community, for
                  choice.
                </p>
                <p className="mt-6 max-w-xl text-base leading-8 text-stone-500">
                  Express your voice, before it is reduced to keywords. Begin your story, gently.
                </p>
                <div className="mt-12 flex flex-wrap gap-4 text-sm text-stone-700">
                  <button
                    className="rounded-full border border-[rgba(95,76,52,0.22)] bg-white/58 px-5 py-2.5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/72 hover:text-stone-900"
                    onClick={onBack}
                    type="button"
                  >
                    Back
                  </button>
                  <button
                    className="precision-panel-quiet rounded-full border border-[rgba(95,76,52,0.16)] bg-[#f6f1e7]/86 px-5 py-2.5 text-stone-800 transition hover:-translate-y-0.5 hover:bg-white/90"
                    onClick={onStart}
                    type="button"
                  >
                    Start your PathWeave
                  </button>
                </div>
              </div>

              <div className="relative -ml-8 -mt-24 hidden lg:block">
                <div className="absolute inset-0 translate-x-5 translate-y-6 rounded-[40px] bg-white/18 blur-2xl" />
                <div className="relative overflow-hidden rounded-[40px] border border-white/35 bg-white/20 backdrop-blur-sm">
                  <img
                    alt="Hands connected by a red thread"
                    className="h-[34rem] w-full object-cover"
                    src="https://images.unsplash.com/photo-1529672425113-d3035c7f4837?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(249,247,242,0.04),rgba(39,39,42,0.16))]" />
                </div>
              </div>
            </div>
          </div>
        </AboutRevealSection>

        <AboutRevealSection className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs uppercase tracking-[0.38em] text-stone-500">The contrast</p>
            <h2 className="mt-5 font-serif text-4xl tracking-tight text-zinc-800 sm:text-5xl">Why it needed another shape</h2>
            <p className="mt-6 text-base leading-loose text-stone-600">
              Traditional CV systems tend to ask for a person in a linear, compressed form. PathWeave asks what happens
              when representation begins with relation, context, and possibility instead.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-4 lg:grid-cols-2">
            <AboutContrastCard
              eyebrow="Traditional CV logic"
              title="Linear"
              text="Timeline first. Achievement separated from context."
            />
            <AboutContrastCard
              eyebrow="Traditional CV logic"
              title="Individualistic"
              text="Contribution framed as personal output, ready for quick comparison."
            />
            <AboutContrastCard
              eyebrow="PathWeave logic"
              title="Relational"
              text="People, place, and shared context remain visible inside the story."
            />
            <AboutContrastCard
              eyebrow="PathWeave logic"
              title="Future-oriented"
              text="Pathways stay open, reflective, and human rather than fixed into a single summary."
            />
          </div>
        </AboutRevealSection>

        <AboutRevealSection className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs uppercase tracking-[0.38em] text-stone-500">The core trinity</p>
            <h2 className="mt-5 font-serif text-4xl tracking-tight text-zinc-800 sm:text-5xl">Story, relationship, choice</h2>
          </div>
          <div className="mt-14 grid gap-10 lg:grid-cols-3">
            <AboutManifestoBlock
              icon={<AboutLineIcon variant="story" />}
              title="Story"
              text="Experience can begin in a person’s own voice, with narrative and reflection carrying meaning before any translation layer appears."
            />
            <AboutManifestoBlock
              icon={<AboutLineIcon variant="relationship" />}
              title="Relationship"
              text="Contribution is often woven through people, community, and place. PathWeave keeps those connections visible instead of stripping them away."
            />
            <AboutManifestoBlock
              icon={<AboutLineIcon variant="choice" />}
              title="Choice"
              text="Users decide what to include, what to keep quiet, and how their story should be shared. Silence is also a valid form of authorship."
            />
          </div>
        </AboutRevealSection>

        <AboutRevealSection className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.38em] text-stone-500">The ethics</p>
            <h2 className="mt-5 font-serif text-4xl tracking-tight text-zinc-800 sm:text-5xl">Silence is a choice.</h2>
            <p className="mt-7 text-base leading-loose text-stone-600">
              Some stories, media, and forms of knowledge are personal, sensitive, or community-held. PathWeave is
              designed around protection before visibility.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-4xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-base leading-loose text-stone-600">
                Review happens before export. Media is optional. Tags are secondary. Original narrative meaning stays
                primary.
              </p>
              <div className="space-y-4">
                {[
                  'Not everything meaningful needs to become public.',
                  'A person can choose privacy without losing dignity.',
                  'Careful sharing is part of the design, not an afterthought.',
                ].map((item) => (
                  <div key={item} className="rounded-[28px] bg-white/22 px-5 py-4 text-sm leading-loose text-stone-700 backdrop-blur-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[34px] bg-[radial-gradient(circle_at_top,#ffffffa8,transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0.12))] p-6 backdrop-blur-md">
              <div className="rounded-[30px] bg-white/26 p-6">
                <p className="text-[11px] uppercase tracking-[0.32em] text-stone-400">Protective logic</p>
                <div className="mt-6 flex justify-center">
                  <svg aria-hidden="true" className="h-36 w-36 text-[rgba(95,76,52,0.4)]" fill="none" viewBox="0 0 144 144">
                    <path d="M72 18 C92 30, 105 34, 118 36 V72 C118 98, 99 119, 72 126 C45 119, 26 98, 26 72 V36 C39 34, 52 30, 72 18Z" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M48 72 C55 60, 64 54, 72 54 C80 54, 89 60, 96 72" stroke="currentColor" strokeLinecap="round" strokeWidth="1.1" />
                    <path d="M60 84 C63 88, 67 90, 72 90 C77 90, 81 88, 84 84" stroke="currentColor" strokeLinecap="round" strokeWidth="1.1" />
                    <circle cx="72" cy="54" fill="currentColor" r="2.5" />
                  </svg>
                </div>
                <p className="mt-6 text-center text-sm leading-loose text-stone-600">
                  The page does not assume disclosure. It makes room for pause, withholding, and user-led boundaries.
                </p>
              </div>
            </div>
          </div>
        </AboutRevealSection>

        <AboutRevealSection className="pb-10 pt-24 sm:pt-32">
          <div className="mx-auto max-w-3xl border-t border-[rgba(95,76,52,0.12)] pt-10">
            <p className="text-xs uppercase tracking-[0.38em] text-stone-500">The context</p>
            <h2 className="mt-5 font-serif text-3xl tracking-tight text-zinc-800">Research-informed, quietly provisional.</h2>
            <p className="mt-6 text-base leading-loose text-stone-600">
              PathWeave is an academic prototype informed by research into narrative expression, respectful digital
              design, and culturally responsive alternatives to resume-style systems. It is not a universal standard,
              and it does not claim to speak for every community or protocol.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 text-sm text-stone-600">
              <button
                className="rounded-full border border-[rgba(95,76,52,0.22)] bg-white/58 px-5 py-2.5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/72 hover:text-stone-900"
                onClick={onGoHome}
                type="button"
              >
                Home
              </button>
              <button
                className="rounded-full border border-[rgba(95,76,52,0.22)] bg-white/58 px-5 py-2.5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/72 hover:text-stone-900"
                onClick={onGoExample}
                type="button"
              >
                Example
              </button>
            </div>
          </div>
        </AboutRevealSection>
      </div>
    </div>
  )
}

function AboutRevealSection({ children, className = '' }) {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sectionRef.current || typeof window === 'undefined') {
      return undefined
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting)
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={`${className}`}>
      <div className={`fade-in-up ${visible ? 'is-visible' : ''}`}>{children}</div>
    </section>
  )
}

function AboutHeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F9F7F2] via-[#F6F2EA] to-[#ECE9E1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,151,69,0.08),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(129,148,134,0.08),_transparent_26%)]" />
      <div className="absolute inset-[-8%] opacity-[0.05]">
        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1600 1200">
          <g fill="none" stroke="rgba(95,76,52,0.95)" strokeLinecap="round">
            <path d="M-80 180 C140 110, 260 250, 470 198 S860 92, 1070 184 S1460 264, 1700 176" strokeWidth="0.75" />
            <path d="M-60 300 C180 214, 320 366, 548 292 S968 180, 1170 284 S1468 370, 1680 286" strokeWidth="0.65" />
            <path d="M-120 446 C108 360, 284 520, 520 450 S930 320, 1140 430 S1450 532, 1700 440" strokeWidth="0.8" />
            <path d="M-80 590 C140 520, 322 676, 548 610 S946 492, 1172 598 S1480 688, 1700 602" strokeWidth="0.7" />
            <path d="M-110 756 C108 666, 308 838, 560 762 S964 644, 1182 748 S1466 844, 1700 760" strokeWidth="0.75" />
            <path d="M-70 906 C168 820, 336 970, 584 910 S980 806, 1200 900 S1508 984, 1700 908" strokeWidth="0.65" />
            <path d="M250 -60 C188 142, 370 254, 324 456 S220 818, 320 1260" strokeWidth="0.55" />
            <path d="M640 -90 C590 134, 760 248, 714 470 S604 844, 698 1260" strokeWidth="0.58" />
            <path d="M1030 -80 C984 126, 1148 256, 1110 468 S1018 850, 1098 1260" strokeWidth="0.52" />
            <path d="M1360 -70 C1300 140, 1460 266, 1420 492 S1324 874, 1380 1260" strokeWidth="0.56" />
          </g>
        </svg>
      </div>
      <div className="absolute left-[10%] top-[16%] h-40 w-[30%] rotate-[8deg] rounded-full bg-white/35 blur-3xl" />
      <div className="absolute right-[8%] top-[26%] h-36 w-[24%] -rotate-[12deg] rounded-full bg-[#efe7d8]/70 blur-3xl" />
      <div className="absolute bottom-[16%] left-[18%] h-28 w-[20%] rotate-[10deg] rounded-full bg-[#f4ead5]/70 blur-3xl" />
    </div>
  )
}

function AboutContrastCard({ eyebrow, title, text }) {
  return (
    <article className="group rounded-[30px] border border-white/35 bg-white/18 p-6 backdrop-blur-sm transition duration-300 hover:bg-white/34">
      <p className="text-[11px] uppercase tracking-[0.34em] text-stone-400 transition-colors duration-300 group-hover:text-stone-500">
        {eyebrow}
      </p>
      <h3 className="mt-4 font-serif text-4xl tracking-tight text-zinc-700 transition-colors duration-300 group-hover:text-zinc-900">
        {title}
      </h3>
      <p className="mt-4 text-base leading-loose text-stone-600 transition-colors duration-300 group-hover:text-stone-800">
        {text}
      </p>
    </article>
  )
}

function AboutLineIcon({ variant }) {
  if (variant === 'story') {
    return (
      <svg aria-hidden="true" className="h-14 w-14 text-current" fill="none" viewBox="0 0 56 56">
        <path d="M14 16.5h17.5c6 0 10.5 4.5 10.5 10.5v13H24.5C18.5 40 14 35.5 14 29.5v-13Z" stroke="currentColor" strokeWidth="1" />
        <path d="M20 24h15M20 29h12M20 34h15" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
      </svg>
    )
  }

  if (variant === 'relationship') {
    return (
      <svg aria-hidden="true" className="h-14 w-14 text-current" fill="none" viewBox="0 0 56 56">
        <circle cx="17" cy="18" r="4.5" stroke="currentColor" strokeWidth="1" />
        <circle cx="39" cy="18" r="4.5" stroke="currentColor" strokeWidth="1" />
        <circle cx="28" cy="36" r="5.5" stroke="currentColor" strokeWidth="1" />
        <path d="M21 20.5 35 20.5M20 22.5 25 31M36 22.5 31 31" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="h-14 w-14 text-current" fill="none" viewBox="0 0 56 56">
      <path d="M28 12 C36 18, 42 20, 46 21 V31 C46 40, 38.5 46.5, 28 49 C17.5 46.5, 10 40, 10 31 V21 C14 20, 20 18, 28 12Z" stroke="currentColor" strokeWidth="1" />
      <path d="M22 28 C24 24.5, 26 23, 28 23 C30 23, 32 24.5, 34 28" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
      <path d="M24.5 33.5 C25.8 35.1, 26.9 35.8, 28 35.8 C29.1 35.8, 30.2 35.1, 31.5 33.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
    </svg>
  )
}

function AboutManifestoBlock({ icon, title, text }) {
  return (
    <article className="group max-w-3xl rounded-[30px] border border-white/28 bg-white/10 p-6 transition duration-300 hover:bg-white/22">
      <div className="transition duration-300 group-hover:text-[rgba(95,76,52,0.82)]">{icon}</div>
      <p className="mt-8 text-[11px] uppercase tracking-[0.34em] text-stone-400">Core thread</p>
      <h3 className="mt-4 font-serif text-4xl tracking-tight text-zinc-800">{title}</h3>
      <p className="mt-6 text-base leading-loose text-stone-600">{text}</p>
    </article>
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

function ExportMiniPreview({ type }) {
  if (type === 'full') {
    return (
      <div className="flex h-16 w-12 flex-col gap-1.5 rounded-[10px] border border-black/6 bg-white/34 p-2">
        <div className="h-2.5 rounded-sm bg-stone-300/60" />
        <div className="h-1.5 rounded-sm bg-stone-200/70" />
        <div className="h-1.5 rounded-sm bg-stone-200/60" />
        <div className="h-1.5 rounded-sm bg-stone-200/55" />
        <div className="mt-auto h-1.5 rounded-sm bg-stone-200/45" />
      </div>
    )
  }

  if (type === 'summary') {
    return (
      <div className="flex h-14 w-20 flex-col justify-center gap-2 rounded-[10px] border border-black/6 bg-white/30 px-3">
        <div className="h-1.5 w-full rounded-sm bg-stone-300/60" />
        <div className="h-1.5 w-4/5 rounded-sm bg-stone-200/70" />
        <div className="h-1.5 w-3/5 rounded-sm bg-stone-200/55" />
      </div>
    )
  }

  return (
    <div className="grid h-14 w-16 place-items-center rounded-[10px] border border-black/6 bg-white/30 text-stone-500">
      <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
        <path d="M8 6.5H6.5V17.5H8" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
        <path d="M16 6.5H17.5V17.5H16" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
        <path d="M10 9h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
        <path d="M10 12h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
        <path d="M10 15h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
      </svg>
    </div>
  )
}

function ExportLens({ item, active, onEnter, onLeave, alignClass, style }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[22px] border border-white/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_18px_35px_-28px_rgba(26,26,26,0.22)] backdrop-blur-[16px] transition duration-300 ${alignClass} ${
        active
          ? 'bg-[linear-gradient(180deg,rgba(255,238,212,0.78),rgba(255,247,235,0.4))]'
          : 'bg-white/28'
      }`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={style}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
      <div className="relative grid gap-5 md:grid-cols-[92px_1fr] md:items-center">
        <div className="flex justify-start md:justify-center">
          <ExportMiniPreview type={item.type} />
        </div>
        <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-stone-500">{item.label}</p>
            <h3 className="mt-3 font-display text-[1.9rem] leading-tight text-stone-900">{item.title}</h3>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-stone-500">Context</p>
            <p className="mt-3 text-sm leading-7 text-stone-600">{item.text}</p>
          </div>
        </div>
      </div>
      {active ? (
        <>
          <div className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-amber-300/55" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,151,69,0.22),transparent_38%)]" />
        </>
      ) : null}
    </article>
  )
}

function TransformationExportSection() {
  const [hovered, setHovered] = useState(null)
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 })
  const items = [
    {
      type: 'full',
      label: 'Portfolio',
      title: 'Digital Presence',
      text: 'An immersive personal page for deeper sharing, self-representation, and narrative presence.',
      alignClass: '',
      path: 'M 154 260 C 250 188, 430 124, 716 128',
    },
    {
      type: 'summary',
      label: 'Print',
      title: 'Focused Narrative',
      text: 'A concise export suited to moments where a quick first impression still needs story and context.',
      alignClass: '',
      path: 'M 154 260 C 292 246, 488 246, 722 266',
    },
    {
      type: 'structured',
      label: 'Data',
      title: 'Data Sovereignty',
      text: 'A structured export that keeps your story data portable for archives, systems, or personal stewardship.',
      alignClass: '',
      path: 'M 154 260 C 264 336, 452 404, 728 404',
    },
  ]

  const handleMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10
    setPointerOffset({ x, y })
  }

  return (
    <div
      className="relative overflow-hidden bg-[radial-gradient(circle,rgba(26,26,26,0.06)_0.6px,transparent_0.6px)] bg-[size:20px_20px] py-6"
      onMouseLeave={() => setPointerOffset({ x: 0, y: 0 })}
      onMouseMove={handleMove}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 1200 520">
        <defs>
          <linearGradient id="export-line-base" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(201,151,69,0.36)" />
            <stop offset="52%" stopColor="rgba(120,112,99,0.16)" />
            <stop offset="100%" stopColor="rgba(201,151,69,0)" />
          </linearGradient>
          <linearGradient id="export-line-active" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(201,151,69,0.76)" />
            <stop offset="55%" stopColor="rgba(201,151,69,0.42)" />
            <stop offset="100%" stopColor="rgba(201,151,69,0)" />
          </linearGradient>
        </defs>
        {items.map((item) => (
          <path
            key={item.type}
            d={item.path}
            fill="none"
            stroke={hovered === item.type ? 'url(#export-line-active)' : 'url(#export-line-base)'}
            strokeLinecap="round"
            strokeWidth={hovered === item.type ? '0.9' : '0.5'}
            style={{
              filter: hovered === item.type ? 'drop-shadow(0 0 4px rgba(201,151,69,0.24))' : 'none',
              opacity: hovered === item.type ? 1 : 0.85,
              transform: `translate(${pointerOffset.x * 0.6}px, ${pointerOffset.y * 0.4}px)`,
              transformOrigin: 'center',
              transition: 'transform 260ms ease-out, opacity 220ms ease-out, stroke-width 220ms ease-out',
            }}
          />
        ))}
      </svg>

      <div className="relative grid gap-10 lg:grid-cols-[320px_1fr] lg:items-center">
        <div className="relative min-h-[420px]">
          <div
            className="precision-panel absolute left-10 top-1/2 grid h-56 w-56 -translate-y-1/2 place-items-center rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.86),rgba(249,249,248,0.56))] transition-transform duration-300 ease-out"
            style={{ transform: `translate3d(${pointerOffset.x * 0.18}px, calc(-50% + ${pointerOffset.y * 0.18}px), 0)` }}
          >
            <div className="grid max-w-[11rem] place-items-center gap-2 text-center">
              <p className="text-[11px] uppercase tracking-[0.34em] text-stone-500">Weave Core</p>
              <p className="font-display text-3xl text-stone-900">Source</p>
              <p className="text-sm leading-6 text-stone-600">One narrative source, radiating into different forms of sharing.</p>
            </div>
          </div>
        </div>

        <div className="relative grid gap-5">
          {items.map((item, index) => (
            <ExportLens
              key={item.type}
              active={hovered === item.type}
              alignClass={item.alignClass}
              item={item}
              onEnter={() => setHovered(item.type)}
              onLeave={() => setHovered(null)}
              style={{
                transform: `translate3d(${pointerOffset.x * (0.08 + index * 0.04)}px, ${pointerOffset.y * (0.1 + index * 0.05)}px, 0)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function NarrativeNode({ active = false }) {
  return (
    <div className="relative h-4 w-4">
      <span
        className={`absolute inset-0 rounded-full transition ${active ? 'bg-amber-300/55 blur-[6px]' : 'bg-stone-300/45 blur-[4px]'}`}
      />
      <span
        className={`absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition ${active ? 'bg-amberline shadow-[0_0_0_3px_rgba(201,151,69,0.16)]' : 'bg-stone-500'}`}
      />
    </div>
  )
}

function TridentPanel({ title, text, variant, active, destination, offsetClass = '', onEnter, onLeave }) {
  return (
    <article
      className={`group relative min-h-[280px] overflow-hidden px-2 py-8 sm:px-6 ${offsetClass}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="absolute inset-0 bg-transparent transition duration-500 group-hover:weave-focus" />
      <div className="relative">
        <NarrativeNode active={active} />
        <GeometryIcon variant={variant} />
        <p className="mt-8 text-[11px] uppercase tracking-[0.34em] text-stone-500">
          {destination ? 'Shared destination' : 'Story pathway'}
        </p>
        <h3 className="mt-4 font-display text-[2rem] leading-tight text-stone-900">{title}</h3>
        <p className="mt-5 max-w-sm text-sm leading-7 text-stone-600">{text}</p>
      </div>
    </article>
  )
}

function TridentSection() {
  const [hovered, setHovered] = useState(null)
  const firstPathActive = hovered === 0 || hovered === 1
  const secondPathActive = hovered === 1 || hovered === 2

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle,rgba(26,26,26,0.06)_0.6px,transparent_0.6px)] bg-[size:20px_20px] py-6">
      <svg aria-hidden="true" className="pointer-events-none absolute left-0 top-0 hidden h-full w-full md:block" viewBox="0 0 1200 360">
        <defs>
          <linearGradient id="narrative-path-base" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(201,151,69,0)" />
            <stop offset="45%" stopColor="rgba(26,26,26,0.18)" />
            <stop offset="55%" stopColor="rgba(201,151,69,0.22)" />
            <stop offset="100%" stopColor="rgba(201,151,69,0)" />
          </linearGradient>
          <linearGradient id="narrative-path-active" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(201,151,69,0)" />
            <stop offset="50%" stopColor="rgba(201,151,69,0.72)" />
            <stop offset="100%" stopColor="rgba(201,151,69,0)" />
          </linearGradient>
        </defs>
        <path
          d="M 146 112 C 256 74, 328 78, 518 144"
          fill="none"
          opacity={firstPathActive ? 1 : 0.72}
          stroke={firstPathActive ? 'url(#narrative-path-active)' : 'url(#narrative-path-base)'}
          strokeLinecap="round"
          strokeWidth={firstPathActive ? '0.8' : '0.5'}
          style={{ filter: firstPathActive ? 'drop-shadow(0 0 2px rgba(201,151,69,0.32))' : 'none' }}
          className={firstPathActive ? 'animate-pulse' : ''}
        />
        <path
          d="M 548 152 C 696 214, 824 202, 1030 164"
          fill="none"
          opacity={secondPathActive ? 1 : 0.72}
          stroke={secondPathActive ? 'url(#narrative-path-active)' : 'url(#narrative-path-base)'}
          strokeLinecap="round"
          strokeWidth={secondPathActive ? '0.8' : '0.5'}
          style={{ filter: secondPathActive ? 'drop-shadow(0 0 2px rgba(201,151,69,0.36))' : 'none' }}
          className={secondPathActive ? 'animate-pulse' : ''}
        />
      </svg>

      <div className="grid gap-6 md:grid-cols-3">
        <TridentPanel
          title="Not just roles and titles"
          text="Share experiences and stories instead of listing job positions."
          variant="roles"
          active={hovered === 0}
          offsetClass="md:pt-0"
          onEnter={() => setHovered(0)}
          onLeave={() => setHovered(null)}
        />
        <TridentPanel
          title="Stories stay stories"
          text="Your narrative is not reduced into bullet points or keywords."
          variant="story"
          active={hovered === 1}
          offsetClass="md:pt-5"
          onEnter={() => setHovered(1)}
          onLeave={() => setHovered(null)}
        />
        <TridentPanel
          title="Community matters"
          text="Show connections, contribution, and relationships."
          variant="community"
          active={hovered === 2}
          destination
          offsetClass="md:pt-10"
          onEnter={() => setHovered(2)}
          onLeave={() => setHovered(null)}
        />
      </div>
    </div>
  )
}

function ContinuousTrajectorySection() {
  const sectionRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 })
  const [pointerRatio, setPointerRatio] = useState(null)

  useEffect(() => {
    const updateProgress = () => {
      if (!sectionRef.current) {
        return
      }

      const rect = sectionRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const visible = Math.min(Math.max((viewportHeight - rect.top) / (rect.height + viewportHeight * 0.25), 0), 1)
      setProgress(visible)
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  const pathLength = 1400
  const dashOffset = pathLength * (1 - progress)
  const pathOpacity = 0.18 + progress * 0.82
  const stepFocusStops = [0.18, 0.5, 0.84]
  const nearestStepIndex =
    pointerRatio == null
      ? null
      : stepFocusStops.reduce(
          (bestIndex, stop, index, arr) =>
            Math.abs(stop - pointerRatio) < Math.abs(arr[bestIndex] - pointerRatio) ? index : bestIndex,
          0,
        )
  const steps = [
    {
      index: '01',
      title: 'Start with your story',
      text: 'Write a short narrative about your experience.',
      align: 'md:max-w-[19rem] md:justify-self-start md:pt-0',
    },
    {
      index: '02',
      title: 'Add connections',
      text: 'Include people, community, and meaning behind your story.',
      align: 'md:max-w-[19rem] md:justify-self-center md:pt-16',
    },
    {
      index: '03',
      title: 'Shape your PathWeave',
      text: 'Your stories become a shareable portfolio.',
      align: 'md:max-w-[19rem] md:justify-self-end md:pt-28',
    },
  ]

  const handleMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 20
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 16
    const ratio = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1)
    setPointerOffset({ x, y })
    setPointerRatio(ratio)
  }

  return (
    <div
      ref={sectionRef}
      className="relative overflow-hidden bg-[radial-gradient(circle,rgba(26,26,26,0.06)_0.6px,transparent_0.6px)] bg-[size:20px_20px] py-10"
      onMouseLeave={() => {
        setPointerOffset({ x: 0, y: 0 })
        setPointerRatio(null)
      }}
      onMouseMove={handleMove}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 1200 520">
        <defs>
          <linearGradient id="trajectory-line" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(249,249,248,0)" />
            <stop offset="40%" stopColor="rgba(152,139,119,0.22)" />
            <stop offset="72%" stopColor="rgba(201,151,69,0.52)" />
            <stop offset="100%" stopColor="rgba(201,151,69,0)" />
          </linearGradient>
          <linearGradient id="trajectory-focus-0" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(201,151,69,0)" />
            <stop offset="10%" stopColor="rgba(201,151,69,0.85)" />
            <stop offset="26%" stopColor="rgba(201,151,69,0)" />
          </linearGradient>
          <linearGradient id="trajectory-focus-1" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="34%" stopColor="rgba(201,151,69,0)" />
            <stop offset="50%" stopColor="rgba(201,151,69,0.85)" />
            <stop offset="66%" stopColor="rgba(201,151,69,0)" />
          </linearGradient>
          <linearGradient id="trajectory-focus-2" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="74%" stopColor="rgba(201,151,69,0)" />
            <stop offset="88%" stopColor="rgba(201,151,69,0.85)" />
            <stop offset="100%" stopColor="rgba(201,151,69,0)" />
          </linearGradient>
        </defs>
        <path
          d="M 72 112 C 232 82, 308 112, 420 190 S 656 312, 760 298 S 970 266, 1120 396"
          fill="none"
          stroke="url(#trajectory-line)"
          strokeLinecap="round"
          strokeWidth="0.8"
          style={{
            opacity: pathOpacity,
            strokeDasharray: pathLength,
            strokeDashoffset: dashOffset,
            transform: `translate(${pointerOffset.x * 0.45}px, ${pointerOffset.y * 0.45}px)`,
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 220ms ease-out, opacity 220ms ease-out, transform 260ms ease-out',
          }}
        />
        {nearestStepIndex != null ? (
          <path
            d="M 72 112 C 232 82, 308 112, 420 190 S 656 312, 760 298 S 970 266, 1120 396"
            fill="none"
            stroke={`url(#trajectory-focus-${nearestStepIndex})`}
            strokeLinecap="round"
            strokeWidth="1.25"
            style={{
              opacity: 0.82,
              strokeDasharray: pathLength,
              strokeDashoffset: dashOffset,
              transform: `translate(${pointerOffset.x * 0.5}px, ${pointerOffset.y * 0.5}px)`,
              transformOrigin: 'center',
              filter: 'drop-shadow(0 0 4px rgba(201,151,69,0.22))',
              transition: 'stroke-dashoffset 220ms ease-out, transform 260ms ease-out, opacity 220ms ease-out',
            }}
          />
        ) : null}
      </svg>

      <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
        {steps.map((step, index) => (
          <article
            key={step.index}
            className={`relative transition-transform duration-300 ease-out ${step.align}`}
            style={{
              transform: `translate3d(${pointerOffset.x * (0.12 + index * 0.08)}px, ${pointerOffset.y * (0.16 + index * 0.05)}px, 0)`,
            }}
          >
            <p className={`font-display text-6xl leading-none md:text-7xl ${nearestStepIndex === index ? 'text-amber-900/45' : 'text-stone-900/40'}`}>{step.index}</p>
            <h3 className="mt-5 font-display text-[2rem] leading-tight text-stone-900">{step.title}</h3>
            <p className="mt-4 max-w-sm text-sm leading-7 text-stone-600">{step.text}</p>
            <div
              aria-hidden="true"
              className="mt-6 h-px w-20 bg-[linear-gradient(90deg,rgba(201,151,69,0),rgba(201,151,69,0.42),rgba(201,151,69,0))]"
              style={{ opacity: (nearestStepIndex === index ? 0.62 : 0.28) + progress * (0.24 + index * 0.08) }}
            />
          </article>
        ))}
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

function ExampleOutputFrame({ eyebrow, title, description, children, actions = null, tone = 'light' }) {
  const tones = {
    light: 'border-white/35 bg-white/18 backdrop-blur-md',
    dark: 'border-white/10 bg-[linear-gradient(180deg,_rgba(24,24,24,0.94),_rgba(40,34,30,0.94))] text-white backdrop-blur-md',
  }

  return (
    <section className={`rounded-[36px] border ${tones[tone]}`}>
      <div className={`flex flex-wrap items-start justify-between gap-4 px-6 py-6 sm:px-8 ${tone === 'dark' ? 'border-b border-white/10' : 'border-b border-[rgba(95,76,52,0.08)]'}`}>
        <div className="max-w-2xl">
          <p className={`text-xs uppercase tracking-[0.3em] ${tone === 'dark' ? 'text-white/45' : 'text-stone-400'}`}>{eyebrow}</p>
          <h2 className={`mt-3 font-serif text-4xl tracking-tight ${tone === 'dark' ? 'text-white' : 'text-zinc-800'}`}>{title}</h2>
          <p className={`mt-4 text-base leading-loose ${tone === 'dark' ? 'text-white/72' : 'text-stone-600'}`}>{description}</p>
        </div>
        {actions}
      </div>
      <div className="px-4 pb-4 pt-4 sm:px-6 sm:pb-6">{children}</div>
    </section>
  )
}

function ExampleOutputThumbnail({ variant, output }) {
  if (variant === 'summary') {
    const storyLines = output.stories.slice(0, 3)

    return (
      <div className="relative aspect-[210/297] w-full overflow-hidden bg-[#FCFAF8] shadow-[0_24px_60px_-30px_rgba(26,26,26,0.34)]">
        <div className="flex h-full flex-col p-[10%] text-[#222222]">
          <div className="mb-[9%] flex items-start justify-between">
            <div>
              <h3 className="font-['Lora'] text-[2.1rem] font-semibold tracking-[-0.05em] text-[#222222]">{output.name}</h3>
              <p className="mt-1 text-[0.52rem] italic text-[#888888]">Created under the PathWeave Respectful Storytelling Protocol.</p>
            </div>
            <div className="h-16 text-right text-[0.4rem] uppercase tracking-[0.22em] text-[#888888]" style={{ writingMode: 'vertical-rl' }}>
              {output.placeConnection || 'Shared context'}
            </div>
          </div>

          <div className="flex-1 space-y-[8%]">
            {storyLines.map((story, index) => (
              <div key={story.id || `${story.title}-${index}`} className="relative flex">
                <div className="w-[24%] pr-[5%] text-right">
                  <p className="text-[0.42rem] font-semibold uppercase tracking-[0.14em] text-[#222222]">
                    {(story.location || 'Context').split(/[,/]/)[0]}
                  </p>
                  <p className="mt-1 text-[0.4rem] text-[#666666]">{story.involved?.[0] || 'PathWeave'}</p>
                  <p className="mt-1 text-[0.36rem] text-[#999999]">Current profile</p>
                </div>
                <div className="relative mr-[5%] w-[2%]">
                  <div className="absolute left-1/2 top-0 h-[130%] w-px -translate-x-1/2 bg-[#DDDDDD]" />
                  <div className="absolute left-1/2 top-1 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#4A3728]" />
                </div>
                <div className="flex-1">
                  <p className="font-['Lora'] text-[0.7rem] font-bold text-[#222222]">{story.title}</p>
                  <p className="mt-1 text-[0.43rem] leading-[1.55] text-[#444444]">
                    {(story.summary || story.narrative || '').slice(0, 120)}
                  </p>
                  <div className="mt-1.5 inline-flex bg-[#F4F1EE] px-1.5 py-0.5 text-[0.34rem] text-[#777777]">
                    [Connection]
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-[8%] border-t border-[#DDDDDD] pt-[6%]">
            <p className="text-[0.44rem] font-semibold uppercase tracking-[0.28em] text-[#AAAAAA]">Pathways & Capabilities</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(output.pathwaysList.length ? output.pathwaysList : output.tags).slice(0, 7).map((item) => (
                <span key={item} className="border border-[#EAE8E5] bg-[#F7F5F2] px-2 py-1 text-[0.4rem] text-[#444444]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'structured') {
    return (
      <div className="relative aspect-[210/297] w-full overflow-hidden bg-[#121212] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.46)]">
        <div className="flex h-full flex-col p-[9%] text-white">
          <p className="text-[0.46rem] uppercase tracking-[0.28em] text-white/45">Structured JSON</p>
          <h3 className="mt-3 font-display text-[1.6rem] text-white">Portable narrative data</h3>
          <div className="mt-6 space-y-3">
            <div className="rounded-[10px] border border-white/10 bg-white/6 p-3 text-[0.46rem] text-white/72">
              Same profile, different form.
            </div>
            <div className="rounded-[10px] border border-white/10 bg-white/6 p-3 text-[0.46rem] text-white/72">
              Copyable, downloadable, portable.
            </div>
          </div>
          <div className="mt-5 flex-1 overflow-hidden rounded-[14px] border border-white/10 bg-black/30 p-3 font-mono text-[0.43rem] leading-[1.55] text-white/84">
            <p>{'{'}</p>
            <p>&nbsp;&nbsp;"name": "{output.name}",</p>
            <p>&nbsp;&nbsp;"stories": [</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;{'{'} "title": "{output.stories[0]?.title || 'Story'}" {'}'},</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;{'{'} "title": "{output.stories[1]?.title || 'Story'}" {'}'}</p>
            <p>&nbsp;&nbsp;],</p>
            <p>&nbsp;&nbsp;"community": "{(output.connections.summary || 'Shared community context').slice(0, 28)}...",</p>
            <p>&nbsp;&nbsp;"pathways": [{(output.pathwaysList.slice(0, 3) || ['pathway']).map((item) => `"${item}"`).join(', ')}],</p>
            <p>&nbsp;&nbsp;"tags": [{(output.tags.slice(0, 3) || ['optional']).map((item) => `"${item}"`).join(', ')}]</p>
            <p>{'}'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-[210/297] w-full overflow-hidden bg-[#F9F9F8] shadow-[0_24px_60px_-30px_rgba(26,26,26,0.34)]">
      <div className="absolute inset-0 opacity-[0.12]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="exampleFullThumbWeave" width="70" height="70" patternUnits="userSpaceOnUse">
              <circle cx="35" cy="35" r="1.1" fill="#1A1A1A" />
              <path d="M0,35 Q17,20 35,35 T70,35 M35,0 Q20,17 35,35 T35,70" fill="none" opacity="0.32" stroke="#1A1A1A" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#exampleFullThumbWeave)" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(255,213,128,0.2),transparent_28%),radial-gradient(circle_at_70%_70%,rgba(102,204,204,0.14),transparent_32%)]" />
      <div className="relative flex h-full flex-col px-[11%] py-[12%] text-center">
        <h3 className="font-display text-[2rem] italic leading-[1.05] text-stone-900">{output.name}, woven with purpose.</h3>
        <p className="mx-auto mt-5 max-w-[82%] font-['Playfair_Display'] text-[0.58rem] leading-[1.8] text-stone-600">
          {(output.introSummary || output.intro || '').slice(0, 130)}
        </p>
        <div className="mt-7 grid gap-2">
          {output.stories.slice(0, 3).map((story, index) => (
            <div
              key={story.id || `${story.title}-${index}`}
              className={`rounded-[12px] border border-[#1A1A1A]/7 bg-white/72 p-3 text-left shadow-[0_10px_30px_-20px_rgba(26,26,26,0.2)] ${
                index === 0 ? 'ml-0 mr-5' : index === 1 ? 'ml-5 mr-0' : 'mx-3'
              }`}
            >
              <p className="font-['Playfair_Display'] text-[0.68rem] text-stone-900">{story.title}</p>
              <p className="mt-1 text-[0.42rem] leading-[1.6] text-stone-600">{(story.summary || '').slice(0, 74)}</p>
            </div>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap justify-center gap-1.5">
          {(output.pathwaysList.length ? output.pathwaysList : output.tags).slice(0, 5).map((item) => (
            <span key={item} className="rounded-full border border-[#FFD580]/30 bg-white/82 px-2 py-1 text-[0.38rem] text-stone-700">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ExamplePreviewWindow({ dark = false, title, children, wide = false }) {
  return (
    <div className={`overflow-hidden rounded-[30px] border ${dark ? 'border-white/10 bg-[#171717]' : 'border-white/45 bg-white/46'} shadow-[0_24px_70px_-40px_rgba(26,26,26,0.28)] backdrop-blur-sm`}>
      <div className={`flex items-center justify-between border-b px-5 py-3 ${dark ? 'border-white/10 bg-white/5' : 'border-white/50 bg-white/40'}`}>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dark ? 'bg-white/35' : 'bg-stone-300'}`} />
          <span className={`h-2.5 w-2.5 rounded-full ${dark ? 'bg-white/20' : 'bg-stone-200'}`} />
          <span className={`h-2.5 w-2.5 rounded-full ${dark ? 'bg-white/12' : 'bg-stone-100'}`} />
        </div>
        <p className={`text-xs uppercase tracking-[0.24em] ${dark ? 'text-white/45' : 'text-stone-400'}`}>{title}</p>
      </div>
      <div className={`${dark ? 'bg-[#111111]' : 'bg-[#f9f9f8]'} p-5 sm:p-6`}>
        <div className={wide ? '' : 'mx-auto max-w-[380px]'}>{children}</div>
      </div>
    </div>
  )
}

function ExampleProfilePage({ example, onBack, onStart }) {
  const exampleOutput = buildExampleOutput(example)

  return (
    <div className="relative isolate overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <AboutHeroBackdrop />
      <div className="relative mx-auto max-w-6xl pb-12">
        <AboutRevealSection className="min-h-[62vh] flex items-start">
          <div className="w-full">
            <div className="grid items-start gap-10 py-8 sm:py-10 lg:grid-cols-[minmax(0,1.54fr)_minmax(480px,1.12fr)] lg:gap-14">
              <div className="max-w-[36rem] -mt-6 pt-0">
                <h1 className="font-display text-4xl leading-tight text-stone-900 md:text-5xl">
                  One story,
                  <br />
                  <span className="whitespace-nowrap">different forms of presence.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-xl leading-8 text-stone-800 md:text-2xl">
                  This example shows how the same PathWeave profile can remain coherent across immersive, concise, and
                  structured outputs.
                </p>
                <p className="mt-6 max-w-xl text-base leading-8 text-stone-500">
                  The form changes. The narrative centre does not.
                </p>
                <div className="mt-12 flex flex-wrap gap-4 text-sm text-stone-700">
                  <button
                    className="rounded-full border border-[rgba(95,76,52,0.22)] bg-white/58 px-5 py-2.5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/72 hover:text-stone-900"
                    onClick={onBack}
                    type="button"
                  >
                    Back
                  </button>
                  <button
                    className="precision-panel-quiet rounded-full border border-[rgba(95,76,52,0.16)] bg-[#f6f1e7]/86 px-5 py-2.5 text-stone-800 transition hover:-translate-y-0.5 hover:bg-white/90"
                    onClick={onStart}
                    type="button"
                  >
                    Start your own
                  </button>
                </div>
              </div>

              <div className="relative -mt-6 hidden lg:block">
                <div className="absolute inset-0 translate-x-5 translate-y-6 rounded-[40px] bg-white/18 blur-2xl" />
                <div className="relative rounded-[40px] border border-white/35 bg-white/20 p-3 backdrop-blur-sm">
                  <img
                    alt="Portrait for example PathWeave profile"
                    className="mx-auto block max-h-[48rem] w-full rounded-[30px] object-contain"
                    src="https://images.unsplash.com/photo-1604872715218-1d3c2264ced5?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  />
                  <div className="pointer-events-none absolute inset-3 rounded-[30px] bg-[linear-gradient(180deg,rgba(249,247,242,0.02),rgba(39,39,42,0.08))]" />
                </div>
              </div>
            </div>
          </div>
        </AboutRevealSection>

        <AboutRevealSection className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs uppercase tracking-[0.38em] text-stone-500">Output 1</p>
            <h2 className="mt-5 font-serif text-4xl tracking-tight text-zinc-800 sm:text-5xl">Full PathWeave</h2>
            <p className="mt-6 text-base leading-loose text-stone-600">
              An immersive narrative page where story, contribution, connection, and pathways remain woven together.
            </p>
          </div>
          <div className="mt-12">
            <ExampleOutputFrame
              eyebrow="Immersive view"
              title="Long-form narrative presence"
              description="This preview follows the same long-scroll language as the dedicated Full PathWeave page, so the reading experience stays editorial and spacious."
              actions={
                <a
                  className="rounded-full border border-[rgba(95,76,52,0.18)] bg-white/38 px-5 py-3 text-sm font-medium text-stone-700 transition hover:-translate-y-0.5 hover:bg-white/55"
                  href="/outputs/full-pathweave?preset=example"
                  rel="noreferrer"
                  target="_blank"
                >
                  Open full page
                </a>
              }
            >
              <ExamplePreviewWindow title="Full PathWeave preview" wide>
                <iframe
                  className="block h-[620px] w-full border-0 lg:h-[680px]"
                  src="/outputs/full-pathweave?preset=example&embedded=1"
                  title="Full PathWeave preview"
                />
              </ExamplePreviewWindow>
            </ExampleOutputFrame>
          </div>
        </AboutRevealSection>

        <AboutRevealSection className="py-24 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs uppercase tracking-[0.38em] text-stone-500">Output 2 and 3</p>
            <h2 className="mt-5 font-serif text-4xl tracking-tight text-zinc-800 sm:text-5xl">Different forms, same source</h2>
            <p className="mt-6 text-base leading-loose text-stone-600">
              A summary can become more concise. Structured data can become more portable. Neither should erase the
              original narrative logic.
            </p>
          </div>
          <div className="mt-12 grid gap-8 xl:grid-cols-2">
            <ExampleOutputFrame
              eyebrow="Summary export"
              title="Concise narrative"
              description="A one-page view that stays readable and print-friendly while keeping story and contribution visible."
              actions={
                <a
                  className="rounded-full border border-[rgba(95,76,52,0.18)] bg-white/38 px-5 py-3 text-sm font-medium text-stone-700 transition hover:-translate-y-0.5 hover:bg-white/55"
                  href="/outputs/summary?preset=example"
                  rel="noreferrer"
                  target="_blank"
                >
                  Open summary
                </a>
              }
            >
              <ExamplePreviewWindow title="Summary Export preview">
                <ExampleOutputThumbnail output={exampleOutput} variant="summary" />
              </ExamplePreviewWindow>
            </ExampleOutputFrame>

            <ExampleOutputFrame
              eyebrow="Structured JSON"
              title="Portable narrative data"
              description="A structured representation of the same profile, framed as portability and user control rather than technical reduction."
              tone="dark"
              actions={
                <a
                  className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/16"
                  href="/outputs/structured?preset=example"
                  rel="noreferrer"
                  target="_blank"
                >
                  Open structured
                </a>
              }
            >
              <ExamplePreviewWindow dark title="Structured JSON preview">
                <ExampleOutputThumbnail output={exampleOutput} variant="structured" />
              </ExamplePreviewWindow>
            </ExampleOutputFrame>
          </div>
        </AboutRevealSection>
      </div>
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
  initialStep = 0,
}) {
  const topRef = useRef(null)
  const previousStepRef = useRef(null)
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [reviewTab, setReviewTab] = useState('portfolio')
  const [shareMode, setShareMode] = useState('shared')
  const [weavePulse, setWeavePulse] = useState(0)
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
  const triggerWeave = () => setWeavePulse((current) => current + 1)

  useEffect(() => {
    setCurrentStep(initialStep)
  }, [initialStep])

  useEffect(() => {
    if (previousStepRef.current === null) {
      previousStepRef.current = currentStep
      return
    }

    if (previousStepRef.current === currentStep) {
      return
    }

    previousStepRef.current = currentStep
    topRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }, [currentStep])

  const addStory = () => {
    if (!draftStory.title.trim() || !draftStory.narrative.trim()) {
      return
    }

    const involved = createTrackedStoryField(profile.involvedPeople, draftStory.involved)
    const benefited = createTrackedStoryField(profile.benefitedPeople, draftStory.benefited)

    setStories((current) => [
      ...current,
      normalizeStory({
        ...draftStory,
        id: `story-${Date.now()}`,
        involved,
        benefited,
        contextSnapshot: String(profile.placeConnection || '').trim(),
        media: [draftStory.image, draftStory.audio, draftStory.video].filter(Boolean).join(' / ') || 'Story media',
        tags: [],
        suggestedTags: suggestedTagLibrary.slice(0, 3),
        acceptedTags: suggestedTagLibrary.slice(0, 2),
      }),
    ])
    setDraftStory(defaultDraftStory)
    triggerWeave()
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
    <div className="relative isolate overflow-hidden rounded-[42px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <BuilderWeaveBackdrop progress={(currentStep + 1) / wizardSteps.length} pulse={weavePulse} />
      <div className="relative grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-14">
        <section className="min-w-0 scroll-mt-28 sm:scroll-mt-32" ref={topRef}>
          <div className="relative">
            <div className="flex flex-col gap-5 pb-8">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.36em] text-stone-500">Guided builder</p>
                  <h1 className="mt-4 font-serif text-4xl tracking-tight text-zinc-800 md:text-5xl">{step.label}</h1>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-600">{step.phase}</p>
                </div>
                <p className="weave-breadcrumb text-sm text-stone-600">
                  Thread {currentStep + 1} of {wizardSteps.length}
                </p>
              </div>
              <GoldenThreadStepper currentStep={currentStep} onSelectStep={setCurrentStep} />
            </div>

            <div className="relative min-h-[560px]">
              <div key={step.id} className="step-canvas-enter">
                {currentStep === 0 ? <StoryStep profile={profile} setProfile={setProfile} triggerWeave={triggerWeave} /> : null}
                {currentStep === 1 ? <ConnectionsStep profile={profile} setProfile={setProfile} triggerWeave={triggerWeave} /> : null}
                {currentStep === 2 ? <PathwaysStep profile={profile} setProfile={setProfile} triggerWeave={triggerWeave} /> : null}
                {currentStep === 3 ? (
                  <StoriesStep
                    addStory={addStory}
                    draftStory={draftStory}
                    profile={profile}
                    setDraftStory={setDraftStory}
                    stories={stories}
                    triggerWeave={triggerWeave}
                  />
                ) : null}
                {currentStep === 4 ? (
                  <ReviewStep
                    reviewTab={reviewTab}
                    selectedStories={selectedStories}
                    setReviewTab={setReviewTab}
                    setShareConfig={setShareConfig}
                    setShowTagsInProfile={setShowTagsInProfile}
                    showTagsInProfile={showTagsInProfile}
                    stories={stories}
                    triggerWeave={triggerWeave}
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
                    triggerWeave={triggerWeave}
                  />
                ) : null}
              </div>
            </div>

            <div className="relative mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(95,76,52,0.12)] pt-6">
              <div>
                <p className="font-serif text-xl tracking-tight text-zinc-800">{step.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-500">
                  {currentStep < wizardSteps.length - 1 ? `Next: ${wizardSteps[currentStep + 1].label}` : 'Ready to share your PathWeave'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  className="rounded-full border border-[rgba(95,76,52,0.18)] bg-white/30 px-5 py-3 text-sm text-stone-700 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/45 disabled:opacity-40"
                  disabled={currentStep === 0}
                  onClick={prevStep}
                  type="button"
                >
                  Back
                </button>
                <button
                  className="rounded-full border border-stone-900 bg-stone-900/90 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_38px_-24px_rgba(41,37,36,0.7)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-stone-800"
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
            pulse={weavePulse}
            profile={profile}
            shareConfig={shareConfig}
            shareMode={shareMode}
            showTagsInProfile={showTagsInProfile}
            stories={stories}
          />
        </div>
        </aside>
      </div>
    </div>
  )
}

function StepIntro({ eyebrow = 'Weaving step', title, description, chips, note }) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/35 bg-white/18 p-6 backdrop-blur-[10px] sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-8 top-8 h-14 w-52 rotate-[9deg] rounded-full bg-[#f2e3c4]/45 blur-xl" />
        <div className="absolute right-[-1.5rem] top-14 h-14 w-44 -rotate-[11deg] rounded-full bg-white/45 blur-xl" />
      </div>
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.34em] text-stone-500">{eyebrow}</p>
        <h2 className="mt-4 font-serif text-4xl tracking-tight text-zinc-800 md:text-[2.8rem]">{title}</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-600 md:text-lg">{description}</p>
        {chips?.length ? (
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {chips.map((chip, index) => (
              <span
                key={chip}
                className={`border-b px-0 py-2 text-sm ${
                  index % 3 === 0
                    ? 'border-[rgba(95,76,52,0.18)] text-stone-700'
                    : index % 3 === 1
                      ? 'border-[rgba(201,151,69,0.28)] text-amber-900'
                      : 'border-[rgba(129,148,134,0.3)] text-teal-900'
                }`}
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
        {note ? <p className="mt-6 max-w-2xl text-sm leading-relaxed text-stone-500">{note}</p> : null}
      </div>
    </div>
  )
}

function StoryStep({ profile, setProfile, triggerWeave }) {
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
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {promptChips.map((chip) => (
            <WeaveTag
              key={chip}
              onClick={() => {
                setProfile((current) => ({
                  ...current,
                  narrativeIntro: current.narrativeIntro ? `${current.narrativeIntro} ${chip}` : chip,
                }))
                triggerWeave()
              }}
            >
              {chip}
            </WeaveTag>
          ))}
        </div>
        <Field
          label="Narrative intro"
          multiline
          placeholder="In a few sentences, how would you like to introduce your story?"
          value={profile.narrativeIntro}
          onChange={(value) => {
            setProfile((current) => ({ ...current, narrativeIntro: value }))
            triggerWeave()
          }}
        />
      </div>
    </div>
  )
}

function ConnectionsStep({ profile, setProfile, triggerWeave }) {
  return (
    <div className="space-y-8">
      <StepIntro
        eyebrow="Thread 2 of 6"
        title="Add connection and context"
        description="Expand the story beyond the individual by making relationships, contribution, and place visible."
        chips={['connected with', 'involved', 'walked alongside', 'place']}
        note="Here the weave widens from personal story toward people, community, and place."
      />
      <div className="grid gap-5">
        <Field
          label="Who are you connected with"
          multiline
          placeholder="Family, community, collaborators, mentors, groups"
          value={profile.connectedWith || ''}
          onChange={(value) => {
            setProfile((current) => ({ ...current, connectedWith: value, communityConnections: value }))
            triggerWeave()
          }}
        />
        <Field
          label="Who was involved"
          placeholder="Who helped shape the work or experience?"
          value={profile.involvedPeople || ''}
          onChange={(value) => {
            setProfile((current) => ({ ...current, involvedPeople: value }))
            triggerWeave()
          }}
        />
        <Field
          label="Who did you walk alongside"
          placeholder="Who shaped this with you?"
          value={profile.benefitedPeople || ''}
          onChange={(value) => {
            setProfile((current) => ({ ...current, benefitedPeople: value }))
            triggerWeave()
          }}
        />
        <Field
          label="Place / community"
          multiline
          placeholder="What places or communities shape the story?"
          value={profile.placeConnection}
          onChange={(value) => {
            setProfile((current) => ({ ...current, placeConnection: value }))
            triggerWeave()
          }}
        />
      </div>
    </div>
  )
}

function PathwaysStep({ profile, setProfile, triggerWeave }) {
  return (
    <div className="space-y-8">
      <StepIntro
        eyebrow="Thread 3 of 6"
        title="Shape what matters next"
        description="Move gently from present experience toward interests, aspirations, and future directions."
        chips={['interests', 'aspirations', 'future directions', 'pathways']}
        note="Pathways stay open here. This is about direction and possibility, not a fixed statement about what comes next."
      />
      <div className="grid gap-5">
        <Field
          label="Interests"
          placeholder="creative facilitation, mentoring, community work"
          value={profile.interests || ''}
          onChange={(value) => {
            setProfile((current) => ({ ...current, interests: value }))
            triggerWeave()
          }}
        />
        <Field
          label="Aspirations"
          multiline
          placeholder="What futures, possibilities, or directions matter to you?"
          value={profile.aspirations || ''}
          onChange={(value) => {
            setProfile((current) => ({ ...current, aspirations: value }))
            triggerWeave()
          }}
        />
        <Field
          label="Future directions / pathways"
          placeholder="learning, work, enterprise, community pathways"
          value={profile.futurePathways}
          onChange={(value) => {
            setProfile((current) => ({ ...current, futurePathways: value }))
            triggerWeave()
          }}
        />
      </div>
    </div>
  )
}

function StoryContextField({
  description,
  fieldKey,
  inheritedValue,
  label,
  overrideMode,
  setDraftStory,
  setOverrideMode,
  storySpecificValue,
  triggerWeave,
}) {
  const hasInheritedValue = Boolean(String(inheritedValue || '').trim())

  return (
    <div className="rounded-[30px] border border-white/40 bg-white/25 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-medium text-stone-900">{label}</p>
        {hasInheritedValue && !overrideMode ? <EditorialMetaTag>From your connections</EditorialMetaTag> : null}
      </div>
      <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>

      {hasInheritedValue && !overrideMode ? (
        <div className="mt-4 space-y-4 rounded-[22px] bg-white/55 px-4 py-4 ring-1 ring-white/60 backdrop-blur-sm">
          <p className="text-sm leading-7 text-stone-700">{inheritedValue}</p>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-stone-900/90 px-4 py-2 text-xs font-medium text-white"
              onClick={() => {
                setOverrideMode(false)
                triggerWeave()
              }}
              type="button"
            >
              Keep as inherited
            </button>
            <button
              className="rounded-full border border-[rgba(95,76,52,0.18)] bg-white/30 px-4 py-2 text-xs font-medium text-stone-700 transition hover:-translate-y-0.5 hover:bg-white/45"
              onClick={() => {
                setOverrideMode(true)
                triggerWeave()
              }}
              type="button"
            >
              Override with story-specific context
            </button>
          </div>
        </div>
      ) : null}

      {!hasInheritedValue || overrideMode ? (
        <div className="mt-4 space-y-3">
          {hasInheritedValue ? (
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full border border-[rgba(95,76,52,0.18)] bg-white/30 px-4 py-2 text-xs font-medium text-stone-700 transition hover:-translate-y-0.5 hover:bg-white/45"
                onClick={() => {
                  setDraftStory((current) => ({ ...current, [fieldKey]: '' }))
                  setOverrideMode(false)
                  triggerWeave()
                }}
                type="button"
              >
                Keep as inherited instead
              </button>
            </div>
          ) : null}
          <Field
            label={label}
            placeholder={hasInheritedValue ? 'Name the people or community specific to this story' : 'Add story-specific context'}
            value={storySpecificValue}
            onChange={(value) => {
              setDraftStory((current) => ({ ...current, [fieldKey]: value }))
              triggerWeave()
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

function StoriesStep({ draftStory, profile, setDraftStory, stories, addStory, triggerWeave }) {
  const [overrideMode, setOverrideMode] = useState({
    involved: Boolean(String(draftStory.involved || '').trim()),
    benefited: Boolean(String(draftStory.benefited || '').trim()),
  })

  useEffect(() => {
    if (isPristineDraftStory(draftStory)) {
      setOverrideMode({ involved: false, benefited: false })
      return
    }

    setOverrideMode((current) => ({
      involved: current.involved || Boolean(String(draftStory.involved || '').trim()),
      benefited: current.benefited || Boolean(String(draftStory.benefited || '').trim()),
    }))
  }, [draftStory])

  const involvedPreview = createTrackedStoryField(profile.involvedPeople, draftStory.involved)
  const benefitedPreview = createTrackedStoryField(profile.benefitedPeople, draftStory.benefited)

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
          onChange={(value) => {
            setDraftStory((current) => ({ ...current, title: value }))
            triggerWeave()
          }}
        />
        <Field
          label="Narrative"
          multiline
          placeholder="Tell the story in your own words."
          value={draftStory.narrative}
          onChange={(value) => {
            setDraftStory((current) => ({ ...current, narrative: value }))
            triggerWeave()
          }}
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <StoryContextField
            description="Keep this connected to the people who walked with you, or name the relationships that belong to this story alone."
            fieldKey="involved"
            inheritedValue={involvedPreview.isInherited ? involvedPreview.value : profile.involvedPeople}
            label="Who walked with you"
            overrideMode={overrideMode.involved}
            setDraftStory={setDraftStory}
            setOverrideMode={(value) => setOverrideMode((current) => ({ ...current, involved: value }))}
            storySpecificValue={draftStory.involved}
            triggerWeave={triggerWeave}
          />
          <StoryContextField
            description="Show who this story held, supported, or opened something up for."
            fieldKey="benefited"
            inheritedValue={benefitedPreview.isInherited ? benefitedPreview.value : profile.benefitedPeople}
            label="Who felt the impact"
            overrideMode={overrideMode.benefited}
            setDraftStory={setDraftStory}
            setOverrideMode={(value) => setOverrideMode((current) => ({ ...current, benefited: value }))}
            storySpecificValue={draftStory.benefited}
            triggerWeave={triggerWeave}
          />
        </div>
        {profile.placeConnection ? (
          <div className="rounded-[28px] border border-amber-200/80 bg-amber-50/80 p-5 text-sm leading-7 text-amber-950">
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-medium">Place carried into this story</p>
              <EditorialMetaTag className="bg-amber-100 text-amber-900 ring-amber-200">Saved as context snapshot</EditorialMetaTag>
            </div>
            <p className="mt-3">{profile.placeConnection}</p>
          </div>
        ) : null}
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Image"
            placeholder="Image label or placeholder"
            value={draftStory.image}
            onChange={(value) => {
              setDraftStory((current) => ({ ...current, image: value }))
              triggerWeave()
            }}
          />
          <Field
            label="Audio"
            placeholder="Audio introduction or reflection"
            value={draftStory.audio}
            onChange={(value) => {
              setDraftStory((current) => ({ ...current, audio: value }))
              triggerWeave()
            }}
          />
          <Field
            label="Video"
            placeholder="Video clip or walkthrough"
            value={draftStory.video}
            onChange={(value) => {
              setDraftStory((current) => ({ ...current, video: value }))
              triggerWeave()
            }}
          />
          <Field
            label="Location"
            placeholder="Where did this happen?"
            value={draftStory.location}
            onChange={(value) => {
              setDraftStory((current) => ({ ...current, location: value }))
              triggerWeave()
            }}
          />
          <SelectField
            label="Privacy"
            options={['Share in my PathWeave', 'Only for selected sharing', 'Keep private for now']}
            value={draftStory.privacy}
            onChange={(value) => {
              setDraftStory((current) => ({ ...current, privacy: value }))
              triggerWeave()
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            className="rounded-full border border-stone-900 bg-stone-900/90 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_38px_-24px_rgba(41,37,36,0.7)] transition hover:-translate-y-0.5 hover:bg-stone-800"
            onClick={addStory}
            type="button"
          >
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
  triggerWeave,
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
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {[
          ['portfolio', 'Story & Portfolio'],
          ['tags', 'Tags & Sharing'],
        ].map(([id, label]) => (
          <WeaveTag
            key={id}
            active={reviewTab === id}
            onClick={() => {
              setReviewTab(id)
              triggerWeave()
            }}
          >
            {label}
          </WeaveTag>
        ))}
      </div>
      {reviewTab === 'portfolio' ? (
        <div className="space-y-5">
          <div className="rounded-[30px] border border-white/35 bg-white/30 p-6 ring-1 ring-white/40 backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-stone-400">Portfolio preview</p>
            <div className="mt-4 grid gap-4">
              {selectedStories.map((story) => (
                <article key={story.id} className="rounded-[24px] bg-white/55 p-5 ring-1 ring-white/70 backdrop-blur-sm">
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
              <label key={story.id} className="flex items-start gap-4 rounded-[24px] bg-white/30 p-4 ring-1 ring-white/50 backdrop-blur-sm">
                <input
                  checked={selectedStories.some((item) => item.id === story.id)}
                  className="mt-1"
                  onChange={() => {
                    setShareConfig((current) => ({
                      ...current,
                      selectedStories: current.selectedStories.includes(story.id)
                        ? current.selectedStories.filter((item) => item !== story.id)
                        : [...current.selectedStories, story.id],
                    }))
                    triggerWeave()
                  }}
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
          <label className="flex items-center justify-between rounded-[24px] bg-white/30 px-5 py-4 ring-1 ring-white/50 backdrop-blur-sm">
            <div>
              <p className="font-medium text-stone-900">Show tags in my profile</p>
              <p className="text-sm text-stone-500">Stories remain visible even when tags are hidden.</p>
            </div>
            <button
              className={`relative h-8 w-14 rounded-full transition ${showTagsInProfile ? 'bg-stone-900' : 'bg-stone-300'}`}
              onClick={() => {
                setShowTagsInProfile((current) => !current)
                triggerWeave()
              }}
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
                triggerWeave={triggerWeave}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ShareStep({ profile, stories, selectedStories, shareMode, setShareMode, shareConfig, setShareConfig, triggerWeave }) {
  const [reviewOpen, setReviewOpen] = useState(false)
  const navigate = useNavigate()
  const outputData = buildPathWeaveOutput(profile, selectedStories, shareConfig)
  const outputModes = Object.entries(exportModeDetails).map(([key, info]) => ({
    key,
    ...info,
  }))

  const handleModeChange = (nextMode) => {
    setShareMode(nextMode)
    triggerWeave()
  }

  return (
    <div className="space-y-8">
      <StepIntro
        eyebrow="Thread 6 of 6"
        title="Choose how to share"
        description="Generate the output format here, then confirm content in a final export review modal."
        chips={['shared view', 'summary export', 'structured json']}
        note="Sharing happens last, after the weave has been gathered and reviewed."
      />
      <OutputModeSwitcher modes={outputModes} onChange={handleModeChange} value={shareMode} />
      <div className="rounded-[30px] border border-white/35 bg-white/30 p-6 ring-1 ring-white/40 backdrop-blur-sm">
        <p className="text-sm uppercase tracking-[0.24em] text-stone-400">Selected output</p>
        <p className="mt-3 font-display text-3xl text-stone-900">{exportModeDetails[shareMode].title}</p>
        <p className="mt-3 text-sm leading-7 text-stone-600">{exportModeDetails[shareMode].description}</p>
      </div>
      {shareMode === 'shared' ? (
        <div className="rounded-[32px] border border-white/35 bg-white/30 p-6 shadow-[0_24px_70px_-42px_rgba(87,63,38,0.3)] backdrop-blur-sm sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Mode 1</p>
          <h3 className="mt-4 font-display text-4xl text-stone-900">Preview Full PathWeave</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600">
            Mode 1 now stays inside the share step first, so you can review it in a display window before choosing to open the dedicated immersive page.
          </p>
          <div className="mt-8 overflow-hidden rounded-[28px] border border-white/50 bg-white/45 shadow-[0_18px_48px_-30px_rgba(26,26,26,0.3)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 border-b border-white/50 px-5 py-3">
              <p className="text-sm uppercase tracking-[0.24em] text-stone-500">Preview</p>
              <p className="text-xs text-stone-500">Full PathWeave preview</p>
            </div>
            <div className="mx-auto aspect-[16/10] w-full max-w-[1080px] bg-[#f9f9f8]">
              <iframe
                className="h-full w-full border-0"
                src="/outputs/full-pathweave?embedded=1"
                title="Full PathWeave preview"
              />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white"
              onClick={() =>
                navigate('/outputs/full-pathweave', {
                  state: {
                    output: outputData,
                    shareConfig,
                    returnTo: '/builder',
                    returnStep: 5,
                  },
                })
              }
              type="button"
            >
              Open Full PathWeave
            </button>
            <p className="self-center text-sm text-stone-500">Summary Export and Structured JSON still render directly here.</p>
          </div>
        </div>
      ) : (
        <PathWeaveOutputs mode={shareMode} output={outputData} />
      )}
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white"
          onClick={() => {
            setReviewOpen(true)
            triggerWeave()
          }}
          type="button"
        >
          Review export
        </button>
        <p className="self-center text-sm text-stone-500">Open the export review modal to confirm stories, media, tags, and export mode.</p>
      </div>
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

function FullPathWeavePage({ profile, stories, showTagsInProfile }) {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const isExamplePreset = params.get('preset') === 'example'
  const isEmbedded = params.get('embedded') === '1'
  const fallbackOutput = isExamplePreset
    ? buildExampleOutput(exampleProfiles[0])
    : buildPathWeaveOutput(profile, stories, createDefaultShareConfig(stories, showTagsInProfile))
  const output = location.state?.output || fallbackOutput
  const returnTo = location.state?.returnTo || '/builder'
  const returnStep = location.state?.returnStep ?? 0

  return (
    <FullPathWeaveView
      onBack={isEmbedded ? null : () => navigate(returnTo, { state: { builderStep: returnStep } })}
      onBackLabel={returnStep === 5 ? 'Back to share' : 'Back to builder'}
      output={output}
      standalone
    />
  )
}

function SummaryExportPage({ profile, stories, showTagsInProfile }) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const isExamplePreset = params.get('preset') === 'example'
  const isEmbedded = params.get('embedded') === '1'
  const output = isExamplePreset
    ? buildExampleOutput(exampleProfiles[0])
    : buildPathWeaveOutput(profile, stories, createDefaultShareConfig(stories, showTagsInProfile))

  return <SummaryExportView onBack={isEmbedded ? null : null} output={output} standalone />
}

function StructuredJsonPage({ profile, stories, showTagsInProfile }) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const isExamplePreset = params.get('preset') === 'example'
  const output = isExamplePreset
    ? buildExampleOutput(exampleProfiles[0])
    : buildPathWeaveOutput(profile, stories, createDefaultShareConfig(stories, showTagsInProfile))

  return (
    <div className="min-h-screen bg-[#111111] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <StructuredJsonView output={output} />
      </div>
    </div>
  )
}

function mirrorSectionState(sectionStep, currentStep) {
  if (currentStep < sectionStep) {
    return 'hidden'
  }

  if (currentStep === sectionStep) {
    return 'active'
  }

  return 'visible'
}

function mirrorSectionClass(sectionStep, currentStep, pulse) {
  const state = mirrorSectionState(sectionStep, currentStep)

  if (state === 'hidden') {
    return 'translate-y-4 opacity-0'
  }

  if (state === 'active') {
    return pulse % 2 === 0
      ? 'relative z-30 -mx-2 translate-y-0 scale-[1.2] opacity-100 brightness-[1.06] saturate-[1.1] ring-[2.5px] ring-black/78 shadow-[0_0_0_1px_rgba(24,24,24,0.16),0_22px_54px_rgba(34,27,20,0.16),0_0_40px_rgba(0,0,0,0.08)]'
      : 'relative z-30 -mx-3 translate-y-0 scale-[1.26] opacity-100 brightness-[1.1] saturate-[1.18] ring-[3px] ring-black/92 shadow-[0_0_0_1px_rgba(24,24,24,0.22),0_28px_70px_rgba(34,27,20,0.22),0_0_56px_rgba(0,0,0,0.12)]'
  }

  return 'translate-y-0 opacity-100'
}

function ghostSectionClass(hidden) {
  return hidden ? 'opacity-30 blur-[1.6px] saturate-[0.75]' : ''
}

function TriptychOutputGallery({ output, shareMode, pulse }) {
  const modes = [
    { key: 'shared', title: 'Full View', label: 'Narrative portfolio' },
    { key: 'summary', title: 'Summary View', label: 'Concise narrative' },
    { key: 'structured', title: 'Structured Data', label: 'Portable record' },
  ]
  const orderedModes = [
    ...modes.filter((mode) => mode.key === shareMode),
    ...modes.filter((mode) => mode.key !== shareMode),
  ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden px-5 pt-14">
      <div aria-hidden="true" className="absolute inset-x-6 top-14 h-24 rounded-[32px] bg-[radial-gradient(circle_at_center,rgba(214,180,126,0.18),transparent_72%)] blur-2xl" />
      <div className="relative">
        <div className="mb-5 px-1 text-center">
          <p className="text-[10px] uppercase tracking-[0.34em] text-stone-500">Final package</p>
          <p className="mt-2 text-xs leading-6 text-stone-500">Three forms of the same weave, ready for careful sharing.</p>
        </div>
        <div className="relative mx-auto h-[390px] max-w-[220px]">
          {orderedModes.map((mode, index) => {
            const active = shareMode === mode.key
            return (
              <article
                key={mode.key}
                className={`absolute left-1/2 w-[210px] -translate-x-1/2 overflow-hidden rounded-[24px] border bg-white/84 px-3 py-3 transition-all duration-500 ${
                  active
                    ? pulse % 2 === 0
                      ? 'scale-[1.08] border-[#d2ab67]/78 shadow-[0_0_0_1px_rgba(210,171,103,0.22),0_0_30px_rgba(210,171,103,0.26)]'
                      : 'scale-[1.13] border-[#d2ab67]/92 shadow-[0_0_0_1px_rgba(210,171,103,0.3),0_0_42px_rgba(210,171,103,0.34)]'
                    : 'border-black/5 shadow-[0_18px_36px_-28px_rgba(57,44,28,0.35)]'
                }`}
                style={{
                  top: `${index * 92}px`,
                  zIndex: active ? 30 : 20 - index,
                  transform: `translateX(-50%) rotate(${active ? 0 : index === 1 ? -2.4 : 2.2}deg) ${active ? 'scale(1.13)' : index === 1 ? 'scale(0.96)' : 'scale(0.92)'}`,
                }}
              >
                <p className="text-[9px] uppercase tracking-[0.28em] text-stone-500">{mode.label}</p>
                <h4 className="mt-2 font-serif text-lg leading-none text-zinc-900">{mode.title}</h4>
                <div className="mt-4">
                  {mode.key === 'shared' ? (
                    <div className="rounded-[16px] border border-stone-200/80 bg-[#fcfaf4] p-2.5">
                      <div className="h-11 rounded-[12px] bg-[linear-gradient(135deg,rgba(250,241,220,0.96),rgba(237,232,223,0.84))]" />
                      <div className="mt-2.5 space-y-1.5">
                        <div className="h-2 w-4/5 rounded-full bg-stone-300/75" />
                        <div className="h-2 w-3/5 rounded-full bg-stone-200/85" />
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="h-10 rounded-[10px] bg-white" />
                          <div className="h-10 rounded-[10px] bg-[#f5f1e9]" />
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {mode.key === 'summary' ? (
                    <div className="rounded-[16px] border border-stone-200/80 bg-[#fcfaf4] p-2.5">
                      <div className="space-y-1.5">
                        <div className="h-2 w-2/3 rounded-full bg-stone-400/65" />
                        <div className="h-2 w-full rounded-full bg-stone-200/90" />
                        <div className="h-2 w-11/12 rounded-full bg-stone-200/80" />
                        <div className="h-2 w-4/5 rounded-full bg-stone-200/80" />
                      </div>
                      <div className="mt-3 rounded-[10px] bg-white p-2">
                        <div className="h-2 w-3/4 rounded-full bg-stone-300/70" />
                        <div className="mt-1.5 h-2 w-full rounded-full bg-stone-200/80" />
                        <div className="mt-1.5 h-2 w-5/6 rounded-full bg-stone-200/80" />
                      </div>
                    </div>
                  ) : null}
                  {mode.key === 'structured' ? (
                    <div className="rounded-[16px] border border-white/8 bg-[#171513] p-2.5 text-[9px] leading-4 text-white/72">
                      <div className="mb-2 flex gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                        <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
                      </div>
                      <p>{'{'}</p>
                      <p className="pl-2 text-[#d4a373]">"name"</p>
                      <p className="pl-4 text-white/86">"{output.name}"</p>
                      <p className="pl-2 text-[#d4a373]">"stories"</p>
                      <p className="pl-4 text-[#66CCCC]">[{output.stories.length}]</p>
                      <p className="pl-2 text-[#d4a373]">"tags"</p>
                      <p className="pl-4 text-[#66CCCC]">[{output.tags.length}]</p>
                      <p>{'}'}</p>
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function NarrativeMirrorDocument({ currentStep, output, pulse, shareMode, allStories, shareConfig, showTagsInProfile }) {
  const visibleStories = output.stories.slice(0, currentStep >= 3 ? 2 : 0)
  const visibleMedia = output.media.slice(0, currentStep >= 3 ? 3 : 0)
  const selectedIds = new Set(shareConfig.selectedStories || [])
  const hiddenStories = allStories.filter((story) => !selectedIds.has(story.id) || story.privacy === 'Keep private for now')
  const visibleStoryCount = allStories.filter((story) => selectedIds.has(story.id) && story.privacy !== 'Keep private for now').length
  const mirrorOffsets = [96, -138, -318, -474, -566, -418]
  const mirrorScales = [0.655, 0.69, 0.75, 0.79, 0.78, 0.69]
  const translateY = mirrorOffsets[currentStep] ?? mirrorOffsets[0]
  const scale = mirrorScales[currentStep] ?? mirrorScales[0]

  if (currentStep === 5) {
    return <TriptychOutputGallery output={output} pulse={pulse} shareMode={shareMode} />
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(210,171,103,0.56),transparent)]" />
      <div aria-hidden="true" className="absolute inset-x-8 top-1/2 h-36 -translate-y-1/2 rounded-[40px] bg-[radial-gradient(circle_at_center,rgba(214,180,126,0.16),transparent_72%)] blur-xl" />
      <div aria-hidden="true" className="absolute inset-x-7 top-1/2 h-[176px] -translate-y-1/2 rounded-[40px] border border-[#d2ab67]/26" />
      <div
        className="absolute left-1/2 top-0 w-[328px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(-50%) translateY(${translateY}px) scale(${scale})`, transformOrigin: 'top center' }}
      >
        <div className="absolute inset-0 rounded-[38px] bg-[radial-gradient(circle_at_top,rgba(214,180,126,0.18),transparent_44%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.48),transparent_42%)] blur-2xl" />
        <div className="relative overflow-visible rounded-[38px] border border-white/70 bg-[#fbfaf6]/90 p-6 shadow-[0_36px_80px_-42px_rgba(53,41,28,0.58)] backdrop-blur-md">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(96,78,57,0.08) 0.8px, transparent 0.8px), radial-gradient(circle at top, rgba(244,225,188,0.4), transparent 32%)',
              backgroundSize: '22px 22px, auto',
            }}
          />
          <div className="relative space-y-3">
            <section className={`rounded-[30px] border border-black/5 bg-white/72 px-5 py-4 transition-all duration-500 ease-out ${mirrorSectionClass(0, currentStep, pulse)}`}>
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Full PathWeave</p>
              <h3 className="mt-3 font-serif text-[2.2rem] leading-[0.92] tracking-tight text-zinc-900">{output.name}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{output.identityLine}</p>
              {output.placeConnection ? <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-stone-500">{output.placeConnection}</p> : null}
              <div className="mt-4 h-24 overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,rgba(250,244,231,0.96),rgba(238,234,227,0.84))]">
                <div className="flex h-full items-end justify-between px-5 pb-4">
                  <div className="w-20 rounded-t-[1.75rem] bg-[#1f1b18] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/88">Audio</div>
                  <div className="h-10 w-10 rounded-full border border-[#ecd7ab] bg-white/55" />
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600">{output.introSummary || 'Your story begins with a first line of narrative and context.'}</p>
            </section>

            <section className={`rounded-[28px] border border-black/5 bg-white/66 px-4 py-3.5 transition-all duration-500 ease-out ${mirrorSectionClass(1, currentStep, pulse)}`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Connections</p>
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d6b47e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#b8c9c6]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d8d0c3]" />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-[1fr_1fr] gap-3">
                <div className="rounded-[22px] bg-[#faf6ee] p-3">
                  <div className="relative h-16">
                    <span className="absolute left-3 top-10 h-2 w-14 rounded-full bg-[#d8c3a0]/60" />
                    <span className="absolute left-14 top-4 h-4 w-4 rounded-full bg-[#d2ab67]/90 shadow-[0_0_18px_rgba(210,171,103,0.32)]" />
                    <span className="absolute right-8 top-12 h-3 w-3 rounded-full bg-[#9cbab5]/90" />
                    <span className="absolute bottom-2 left-9 h-3 w-3 rounded-full bg-[#b6afa1]/90" />
                  </div>
                </div>
                <div className="rounded-[22px] bg-white/78 p-3 text-xs leading-5 text-zinc-600">
                  <p>{output.connections.connectedWith.slice(0, 2).join(', ') || 'Community and place appear here.'}</p>
                  <p className="mt-2 line-clamp-2 text-stone-500">{output.connections.summary || 'This section reflects who shaped the story with you.'}</p>
                </div>
              </div>
            </section>

            <section className={`rounded-[28px] border border-black/5 bg-white/66 px-4 py-3.5 transition-all duration-500 ease-out ${mirrorSectionClass(2, currentStep, pulse)}`}>
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Pathways</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(output.pathwaysList.length ? output.pathwaysList : ['Future directions', 'Learning pathways', 'Contribution']).slice(0, 4).map((item) => (
                  <span key={item} className="rounded-full border border-[#dfcfb4] bg-[#fcf8ef] px-3 py-1.5 text-xs text-zinc-700">
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className={`rounded-[28px] border border-black/5 bg-white/66 px-4 py-3.5 transition-all duration-500 ease-out ${mirrorSectionClass(3, currentStep, pulse)}`}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Stories</p>
                <p className="text-[11px] text-stone-500">{visibleStoryCount} woven in</p>
              </div>
              <div className="mt-3 space-y-2.5">
                {visibleStories.length ? (
                  visibleStories.map((story, index) => (
                    <article key={story.id} className="grid grid-cols-[54px_1fr] gap-2.5 rounded-[20px] bg-[#fcfaf4] p-2.5">
                      <div className={`rounded-[14px] ${index % 2 === 0 ? 'bg-[linear-gradient(135deg,#faf1dc,#f2ece2)]' : 'bg-[linear-gradient(135deg,#e8ece8,#f5f1e7)]'}`} />
                      <div>
                        <h4 className="font-serif text-sm leading-none text-zinc-900">{story.title}</h4>
                        <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-zinc-600">{story.summary}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[20px] bg-[#fcfaf4] p-3 text-[11px] leading-5 text-stone-500">Story cards appear here as narrative and media are added.</div>
                )}
                {currentStep >= 4
                  ? hiddenStories.slice(0, 1).map((story) => (
                      <article key={`ghost-${story.id}`} className={`grid grid-cols-[54px_1fr] gap-2.5 rounded-[20px] bg-[#f5f1e9] p-2.5 transition-all duration-500 ${ghostSectionClass(true)}`}>
                        <div className="rounded-[14px] bg-[linear-gradient(135deg,#ece7dd,#f5f1e7)]" />
                        <div>
                          <h4 className="font-serif text-sm leading-none text-zinc-700">{story.title}</h4>
                          <p className="mt-1.5 text-[10px] leading-4 text-zinc-500">Hidden from the shared weave</p>
                        </div>
                      </article>
                    ))
                  : null}
              </div>
            </section>

            <section className={`rounded-[28px] border border-black/5 bg-white/66 px-4 py-3.5 transition-all duration-500 ease-out ${mirrorSectionClass(4, currentStep, pulse)}`}>
              <div className="grid grid-cols-[1fr_1fr] gap-3">
                <div className={`rounded-[20px] bg-[#fcfaf4] p-3 transition-all duration-500 ${ghostSectionClass(!shareConfig.includeMedia)}`}>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Media</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {(visibleMedia.length ? visibleMedia : [{ label: 'Image' }, { label: 'Audio' }, { label: 'Video' }]).map((item, index) => (
                      <div key={`${item.label}-${index}`} className="h-10 rounded-[12px] bg-[linear-gradient(135deg,rgba(250,241,220,0.95),rgba(233,229,220,0.82))]" />
                    ))}
                  </div>
                  {!shareConfig.includeMedia ? <p className="mt-2 text-[10px] text-stone-500">Hidden in export</p> : null}
                </div>
                <div className={`rounded-[20px] bg-white/78 p-3 transition-all duration-500 ${ghostSectionClass(!(shareConfig.includeTags && showTagsInProfile))}`}>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Approved tags</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(output.tags.length ? output.tags : ['Optional tags']).slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] text-zinc-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {!(shareConfig.includeTags && showTagsInProfile) ? <p className="mt-2 text-[10px] text-stone-500">Hidden in export</p> : null}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function WeaveProgressPanel({ currentStep, pulse, profile, stories, showTagsInProfile, shareConfig, shareMode }) {
  const navigate = useNavigate()
  const output = useMemo(
    () =>
      buildPathWeaveOutput(profile, stories, {
        selectedStories: shareConfig.selectedStories,
        includeMedia: shareConfig.includeMedia,
        includeTags: shareConfig.includeTags && showTagsInProfile,
      }),
    [profile, stories, shareConfig.selectedStories, shareConfig.includeMedia, shareConfig.includeTags, showTagsInProfile],
  )
  const canOpenPreview = currentStep !== 5

  return (
    <div className="relative min-h-[720px] px-3 py-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-8 h-32 rounded-full bg-[#efd9aa]/22 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-4 top-32 h-72 w-48 rounded-full bg-white/22 blur-3xl" />

      <div className="relative">
        <div className="max-w-[18rem]">
          <p className="text-[11px] uppercase tracking-[0.34em] text-stone-500/85">Live narrative mirror</p>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            A miniature weave of the final PathWeave, updating as story, connection, pathways, and sharing choices take shape.
          </p>
        </div>

        <button
          className={`group relative mt-8 block w-full text-left ${canOpenPreview ? '' : 'cursor-default'}`}
          onClick={
            canOpenPreview
              ? () =>
                  navigate('/outputs/full-pathweave?preview=true', {
                    state: {
                      output,
                      returnTo: '/builder',
                      returnStep: currentStep,
                    },
                  })
              : undefined
          }
          title={canOpenPreview ? 'Click to see full-screen weave' : 'Final package preview'}
          type="button"
        >
          <span className="pointer-events-none absolute inset-x-10 top-8 h-[92%] rounded-[42px] bg-[radial-gradient(circle_at_top,rgba(214,180,126,0.22),transparent_44%)] opacity-80 blur-2xl transition duration-300 group-hover:opacity-100" />
          <div className={`relative overflow-hidden rounded-[42px] border border-white/55 bg-white/18 px-3 py-4 shadow-[0_26px_80px_-46px_rgba(57,44,28,0.62)] backdrop-blur-[8px] transition duration-300 ${canOpenPreview ? 'group-hover:-translate-y-1 group-hover:border-[#e2c791]/70' : ''}`}>
            <div className="flex items-center justify-between px-2 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">Floating weave</p>
                <p className="mt-1 text-xs text-stone-500">{canOpenPreview ? 'Click to see full-screen weave' : 'Final package preview'}</p>
              </div>
              {canOpenPreview ? (
                <span className="rounded-full border border-white/65 bg-white/58 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-700 transition group-hover:bg-[#fff7e8]">
                  Preview
                </span>
              ) : (
                <span className="rounded-full border border-white/65 bg-white/58 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-zinc-700">
                  Package
                </span>
              )}
            </div>

            <div className="relative h-[560px] overflow-hidden rounded-[36px] border border-white/60 bg-[linear-gradient(180deg,rgba(252,250,245,0.96),rgba(246,242,236,0.88))]">
              <NarrativeMirrorDocument
                allStories={stories}
                currentStep={currentStep}
                output={output}
                pulse={pulse}
                shareConfig={shareConfig}
                shareMode={shareMode}
                showTagsInProfile={showTagsInProfile}
              />
            </div>
          </div>
        </button>
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

function TagReviewCard({ story, onChange, onPrivacyChange, triggerWeave }) {
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
    <article className="rounded-[28px] bg-white/28 p-5 ring-1 ring-white/45 backdrop-blur-sm">
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="font-display text-2xl text-stone-900">{story.title}</p>
          <p className="mt-3 text-sm leading-7 text-stone-600">{story.narrative}</p>
        </div>
        <div className="rounded-[22px] bg-white/55 p-4 ring-1 ring-white/65 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Suggested tags</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {(story.suggestedTags || []).map((tag) => (
              <WeaveTag
                key={tag}
                onClick={() => {
                  onChange(story.id, [...new Set([...(story.acceptedTags || []), tag])])
                  triggerWeave()
                }}
              >
                Accept {tag}
              </WeaveTag>
            ))}
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-stone-400">Accepted</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {(story.acceptedTags || []).map((tag) => (
              <WeaveTag
                key={tag}
                active
                onClick={() => {
                  onChange(story.id, (story.acceptedTags || []).filter((item) => item !== tag))
                  triggerWeave()
                }}
              >
                Remove {tag}
              </WeaveTag>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-full border border-white/55 bg-white/45 px-4 py-2 text-sm backdrop-blur-sm outline-none transition focus:border-[rgba(95,76,52,0.28)] focus:bg-white/70"
              onChange={(event) => setDraftTag(event.target.value)}
              placeholder="Edit or add tag"
              value={draftTag}
            />
            <button
              className="rounded-full border border-[rgba(95,76,52,0.18)] bg-white/30 px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:bg-white/45"
              onClick={() => {
                addTag()
                triggerWeave()
              }}
              type="button"
            >
              Add
            </button>
          </div>
          <div className="mt-4">
            <SelectField
              label="Visibility"
              onChange={(value) => {
                onPrivacyChange(value)
                triggerWeave()
              }}
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
      <span className="text-sm font-medium tracking-[0.01em] text-stone-900">{label}</span>
      {multiline ? (
        <textarea
          className="mt-3 min-h-[132px] w-full rounded-[26px] border border-white/60 bg-white/35 px-4 py-4 text-sm leading-relaxed text-stone-800 outline-none backdrop-blur-sm transition focus:border-[rgba(95,76,52,0.26)] focus:bg-white/60"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      ) : (
        <input
          className="mt-3 w-full rounded-[26px] border border-white/60 bg-white/35 px-4 py-4 text-sm text-stone-800 outline-none backdrop-blur-sm transition focus:border-[rgba(95,76,52,0.26)] focus:bg-white/60"
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
      <span className="text-sm font-medium tracking-[0.01em] text-stone-900">{label}</span>
      <select
        className="mt-3 w-full rounded-[26px] border border-white/60 bg-white/35 px-4 py-4 text-sm text-stone-800 outline-none backdrop-blur-sm transition focus:border-[rgba(95,76,52,0.26)] focus:bg-white/60"
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
  const isStandaloneOutputRoute = location.pathname.startsWith('/outputs/')
  const builderInitialStep = location.state?.builderStep ?? 0
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
    if (typeof window === 'undefined' || !('scrollRestoration' in window.history)) {
      return undefined
    }

    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

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

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setShowEntryModal(location.pathname === '/' && window.localStorage.getItem(ENTRY_MODAL_SEEN_KEY) !== 'true')
  }, [location.pathname])

  const resetPagePosition = () => {
    if (typeof window === 'undefined') {
      return
    }

    const homeScrollContainer = document.querySelector('[data-home-scroll="true"]')
    if (homeScrollContainer) {
      homeScrollContainer.scrollTop = 0
    }

    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    window.scrollTo(0, 0)
  }

  const startFlow = () => {
    if (consentAccepted) {
      resetPagePosition()
      navigate('/builder')
      return
    }
    setShowConsent(true)
  }

  const confirmConsent = () => {
    setConsentAccepted(true)
    window.localStorage.setItem(CONSENT_KEY, 'true')
    setShowConsent(false)
    resetPagePosition()
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

    resetPagePosition()
    navigate(path)
  }

  const routes = (
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
            initialStep={builderInitialStep}
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
      <Route
        path="/outputs/full-pathweave"
        element={<FullPathWeavePage profile={profile} showTagsInProfile={showTagsInProfile} stories={stories} />}
      />
      <Route
        path="/outputs/summary"
        element={<SummaryExportPage profile={profile} showTagsInProfile={showTagsInProfile} stories={stories} />}
      />
      <Route
        path="/outputs/structured"
        element={<StructuredJsonPage profile={profile} showTagsInProfile={showTagsInProfile} stories={stories} />}
      />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )

  if (isStandaloneOutputRoute) {
    return routes
  }

  return (
    <AppShell consentAccepted={consentAccepted} onNavigate={safeNavigate} onStart={startFlow}>
      {routes}
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
