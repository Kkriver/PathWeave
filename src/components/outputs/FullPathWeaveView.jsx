import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import OutputHeader from './OutputHeader'

const modelConnectionImages = [
  'https://images.unsplash.com/photo-1773601102552-3179f86e7de0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdWx0dXJhbCUyMGdhdGhlcmluZyUyMHBlb3BsZXxlbnwxfHx8fDE3NzYyMzU3NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1764173039259-3cdf3d9a56e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBwb3J0cmFpdCUyMGNvbW11bml0eSUyMGNvbm5lY3Rpb258ZW58MXx8fHwxNzc2MjM1NzM5fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1572519650099-f54063fa9167?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGUlMjBtaW5kZnVsbmVzc3xlbnwxfHx8fDE3NzYyMzU3NDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1760629863094-5b1e8d1aae74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW5ub3ZhdGlvbiUyMGZ1dHVyZXxlbnwxfHx8fDE3NzYxOTkyNzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
]

const modelStoryImages = [
  'https://images.unsplash.com/photo-1773601102552-3179f86e7de0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdWx0dXJhbCUyMGdhdGhlcmluZyUyMHBlb3BsZXxlbnwxfHx8fDE3NzYyMzU3NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1771440048245-9df13f48f8b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMGpvdXJuZXl8ZW58MXx8fHwxNzc2MjM1NzQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1572519650099-f54063fa9167?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGUlMjBtaW5kZnVsbmVzc3xlbnwxfHx8fDE3NzYyMzU3NDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1760629863094-5b1e8d1aae74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwaW5ub3ZhdGlvbiUyMGZ1dHVyZXxlbnwxfHx8fDE3NzYxOTkyNzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1742439351415-47970ac5537b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHdlYXZlJTIwdGFwZXN0cnklMjBwYXR0ZXJufGVufDF8fHx8MTc3NjIzNTczOXww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1764173039259-3cdf3d9a56e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBwb3J0cmFpdCUyMGNvbW11bml0eSUyMGNvbm5lY3Rpb258ZW58MXx8fHwxNzc2MjM1NzM5fDA&ixlib=rb-4.1.0&q=80&w=1080',
]

function Chip({ children, tone = 'light', square = false }) {
  const tones = {
    light: 'border border-stone-200 bg-white/85 text-stone-700',
    accent: 'border border-[#FFD580]/40 bg-[#FFD580]/5 text-stone-800',
    soft: 'border border-[#66CCCC]/40 bg-[#66CCCC]/5 text-stone-800',
    ghost: 'border border-white/15 bg-white/8 text-white/78',
  }

  return (
    <span
      className={`inline-flex px-3 py-1 text-xs tracking-[0.05em] ${square ? 'rounded-sm' : 'rounded-full'} ${tones[tone]}`}
      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
    >
      {children}
    </span>
  )
}

function ConnectionIcon({ type }) {
  if (type === 'community') {
    return (
      <svg aria-hidden="true" className="h-4 w-4 text-[#FFD580]" fill="none" viewBox="0 0 16 16">
        <path d="M5 6.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Zm6 0a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM2.7 12.8c0-1.9 1.4-3 3.3-3s3.3 1.1 3.3 3M8.7 12.8c0-1.6 1.1-2.5 2.8-2.5 1.7 0 2.8.9 2.8 2.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.1" />
      </svg>
    )
  }

  if (type === 'place') {
    return (
      <svg aria-hidden="true" className="h-4 w-4 text-[#FFD580]" fill="none" viewBox="0 0 16 16">
        <path d="M8 13.4s3-3 3-5.5A3 3 0 0 0 5 7.9c0 2.5 3 5.5 3 5.5Z" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="8" cy="7.6" fill="currentColor" r="0.8" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="h-4 w-4 text-[#FFD580]" fill="none" viewBox="0 0 16 16">
      <path d="M8 13s-4-2.4-4-5.4a2.3 2.3 0 0 1 4-1.5 2.3 2.3 0 0 1 4 1.5C12 10.6 8 13 8 13Z" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

function StoryTypeIcon({ type }) {
  if (type === 'video') {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
        <path d="M3.2 4.2h6.3c.8 0 1.3.5 1.3 1.3v5c0 .8-.5 1.3-1.3 1.3H3.2c-.8 0-1.3-.5-1.3-1.3v-5c0-.8.5-1.3 1.3-1.3Z" stroke="currentColor" strokeWidth="1.1" />
        <path d="m7 6.5 2.2 1.3L7 9.1V6.5Z" fill="currentColor" />
      </svg>
    )
  }

  if (type === 'audio') {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
        <path d="M4.1 9.5V7.2c0-1.8 1.3-3.1 3.1-3.1h1.6c1.8 0 3.1 1.3 3.1 3.1v2.3M3.1 9.5h2v2.3h-2c-.6 0-1-.4-1-1v-.3c0-.6.4-1 1-1Zm7.8 0h2c.6 0 1 .4 1 1v.3c0 .6-.4 1-1 1h-2V9.5Z" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <rect height="9" rx="1.2" stroke="currentColor" strokeWidth="1.1" width="11" x="2.5" y="3.5" />
      <path d="M6 6.5h4M6 9h2.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.1" />
    </svg>
  )
}

function getStoryType(story) {
  const media = String(story.mediaLabel || '').toLowerCase()

  if (media.includes('video')) {
    return 'video'
  }

  if (media.includes('audio')) {
    return 'audio'
  }

  return 'gallery'
}

function getStorySize(index) {
  if (index === 0) {
    return 'large'
  }

  if (index % 4 === 1) {
    return 'medium'
  }

  return 'small'
}

function StoryTypeBadge({ type }) {
  const labels = {
    video: 'video',
    audio: 'audio',
    gallery: 'gallery',
  }

  return (
    <div className="absolute left-3 top-3 flex items-center gap-2 rounded-sm bg-white/90 px-2 py-1 backdrop-blur-sm">
      <span className="text-[#FFD580]">
        <StoryTypeIcon type={type} />
      </span>
      <span className="text-xs uppercase tracking-wider text-stone-900" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
        {labels[type]}
      </span>
    </div>
  )
}

function StoryGalleryCard({ story, index, image }) {
  const type = getStoryType(story)
  const size = getStorySize(index)
  const sizeClasses = {
    small: 'md:col-span-1 md:row-span-1',
    medium: 'md:col-span-2 md:row-span-1',
    large: 'md:col-span-2 md:row-span-2',
  }

  const imageTone =
    type === 'video'
      ? 'from-[#FFD580]/18 via-[#f2e8d3] to-[#e7f7f4]'
      : type === 'audio'
        ? 'from-[#66CCCC]/18 via-[#f3f6f5] to-[#f8efe0]'
        : 'from-stone-100 via-white to-[#f7f3eb]'

  return (
    <article
      className={`group relative overflow-hidden rounded border border-[#1A1A1A]/5 bg-white/80 backdrop-blur-md transition-all duration-500 hover:border-[#FFD580]/30 ${sizeClasses[size]} ${index % 3 === 0 ? 'weave-card-float' : ''}`}
      style={{
        boxShadow:
          'inset 0 1px 2px rgba(26, 26, 26, 0.03), 0 8px 32px rgba(255, 213, 128, 0.08)',
      }}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {image ? (
          <img
            alt={story.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            src={image}
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br transition-transform duration-700 group-hover:scale-[1.04] ${imageTone}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,213,128,0.1),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <StoryTypeBadge type={type} />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs uppercase tracking-[0.22em] text-white/70" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
            {story.location || 'Shared context'}
          </p>
        </div>
      </div>

      <div className="p-6">
        <h3
          className="mb-4 text-stone-900"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: size === 'large' ? '1.5rem' : '1.125rem',
            lineHeight: '1.4',
          }}
        >
          {story.title}
        </h3>

        <p className="text-sm leading-7 text-stone-600">{story.summary || story.narrative}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {story.tags.slice(0, 2).map((tag, tagIndex) => (
            <Chip key={`${tag}-${tagIndex}`} square tone={tagIndex === 0 ? 'accent' : 'soft'}>
              {tag}
            </Chip>
          ))}
        </div>
      </div>
    </article>
  )
}

function EmbeddedContextPanel({ output, isVisible = false }) {
  const quote = output.stories[0]?.narrative || output.introSummary || output.intro

  return (
    <section className="relative px-8 py-32">
      <div
        className="relative mx-auto max-w-6xl overflow-hidden rounded border border-[#1A1A1A]/10 bg-white/60 p-8 backdrop-blur-xl sm:p-12"
        style={{
          boxShadow: 'inset 0 2px 4px rgba(26, 26, 26, 0.04), 0 8px 48px rgba(102, 204, 204, 0.08)',
        }}
      >
        <div className="absolute right-0 top-0 h-32 w-32 rounded-tr border-r border-t border-[#FFD580]/20" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-bl border-b border-l border-[#66CCCC]/20" />

        <div className="relative z-10 grid gap-12 md:grid-cols-2">
          <div className={`weave-reveal-left ${isVisible ? 'weave-visible' : ''}`}>
            <div className="relative aspect-square overflow-hidden rounded border border-[#1A1A1A]/5 bg-gradient-to-br from-[#FFD580]/10 to-[#66CCCC]/10">
              <img
                alt="Embedded audio context"
                className="h-full w-full object-cover opacity-40"
                src="https://images.unsplash.com/photo-1771440048245-9df13f48f8b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMGpvdXJuZXl8ZW58MXx8fHwxNzc2MjM1NzQwfDA&ixlib=rb-4.1.0&q=80&w=1080"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.04]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_40%)]" />
              <div className="absolute inset-x-8 bottom-8 rounded bg-white/95 p-6 backdrop-blur-sm">
                <h3
                  className="mb-4 text-stone-900"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.25rem',
                  }}
                >
                  Story context and careful sharing
                </h3>

                <div className="mb-4 flex h-12 items-end gap-1">
                  {Array.from({ length: 40 }).map((_, index) => (
                    <span
                      key={index}
                      className={`flex-1 rounded-full bg-[#FFD580] transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-40'}`}
                      style={{
                        height: `${20 + ((index * 17) % 42)}%`,
                        opacity: 0.3 + ((index * 7) % 24) / 100,
                        transitionDelay: `${index * 18}ms`,
                      }}
                    />
                  ))}
                </div>

                <button className="flex items-center gap-3 rounded bg-stone-900 px-4 py-2 text-white transition hover:bg-stone-800" type="button">
                  <svg aria-hidden="true" className="h-4 w-4" fill="white" viewBox="0 0 16 16">
                    <path d="m5 3.8 7 4.2-7 4.2V3.8Z" />
                  </svg>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' }}>Play story note</span>
                </button>
              </div>
            </div>
          </div>

          <div className={`flex flex-col justify-center weave-reveal-right ${isVisible ? 'weave-visible' : ''}`}>
            <div className="mb-6 flex w-fit items-center gap-2 rounded-sm border border-[#66CCCC]/30 bg-[#66CCCC]/10 px-3 py-2">
              <span className="h-4 w-4 rounded-full border border-[#66CCCC]/70" />
              <span className="text-xs uppercase tracking-wider text-stone-900" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                Cultural Safety Protocol
              </span>
            </div>

            <h3
              className="mb-4 text-stone-900"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.5rem',
              }}
            >
              Respectful Storytelling
            </h3>

            <div className="space-y-4 text-stone-600" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
              <p className="leading-loose">
                This page keeps the story connected to people, place, and future direction. It treats the portfolio like a cultural and narrative field, not a compressed professional card.
              </p>
              <p className="leading-loose">
                <em className="text-stone-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  "{quote || 'A living weave of experience, contribution, and future pathways.'}"
                </em>
              </p>
              <p className="leading-loose">
                {output.connections.community ||
                  'Community contribution remains visible here, so meaning is not separated from the story itself.'}
              </p>

              <div className="mt-6 border-t border-[#1A1A1A]/10 pt-4">
                <p className="text-xs uppercase tracking-wider text-stone-500">Featured in: Full PathWeave immersive narrative mode</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DarkShareSection({ output, isVisible = false }) {
  const secondaryAction =
    output.media.length > 0
      ? `Review ${output.media.length} media references`
      : `Review ${output.stories.length} selected stories`

  const socialLinks = ['Email', 'LinkedIn', 'GitHub', 'Twitter']

  const renderSocialGlyph = (label) => {
    if (label === 'Email') {
      return (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20">
          <path d="M3.5 5.5h13v9h-13z" stroke="currentColor" strokeWidth="1.2" />
          <path d="m4.5 6.6 5.5 4.3 5.5-4.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        </svg>
      )
    }

    if (label === 'LinkedIn') {
      return (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20">
          <rect height="13" rx="1.8" stroke="currentColor" strokeWidth="1.2" width="13" x="3.5" y="3.5" />
          <path d="M7 8.2v5.2M7 6.7h.01M10 13.4V10.6c0-1 .7-1.6 1.5-1.6.9 0 1.5.6 1.5 1.6v2.8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        </svg>
      )
    }

    if (label === 'GitHub') {
      return (
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20">
          <path d="M10 16.3c3.4 0 6.2-2.7 6.2-6.1S13.4 4 10 4 3.8 6.8 3.8 10.2s2.8 6.1 6.2 6.1Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7.3 12.8c.7.3 1.2.3 1.7.2v-1c-1.3.3-1.7-.5-1.8-.9-.2-.4-.4-.7-.7-.8M12.7 12.8c-.7.3-1.2.3-1.7.2v-1c1.3.3 1.7-.5 1.8-.9.2-.4.4-.7.7-.8M7.7 7.8c.8-.5 1.7-.7 2.3-.7.7 0 1.5.2 2.3.7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        </svg>
      )
    }

    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20">
        <path d="M15.4 6.2c-.4.2-.8.3-1.2.4.4-.2.8-.6.9-1.1-.4.2-.9.4-1.4.5a2.2 2.2 0 0 0-3.7 2c-1.8-.1-3.5-.9-4.6-2.2-.6 1.1-.3 2.4.7 3-.3 0-.7-.1-1-.3 0 1.1.8 2.2 1.9 2.4-.3.1-.6.1-.9 0 .2 1 1.1 1.7 2.2 1.8-.8.6-1.8 1-2.8 1 2.1 1.3 4.8 1.4 7 .4 2.7-1.3 4.1-4.2 3.8-7.1.4-.3.8-.6 1.1-1Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.1" />
      </svg>
    )
  }

  return (
    <section className="relative overflow-hidden bg-[#1A1A1A] px-8 py-32 text-white">
      <div className="absolute inset-0 opacity-5">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern height="100" id="darkWeavePathWeave" patternUnits="userSpaceOnUse" width="100">
              <circle cx="50" cy="50" fill="white" r="1" />
              <path d="M0,50 L100,50 M50,0 L50,100" fill="none" opacity="0.3" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect fill="url(#darkWeavePathWeave)" height="100%" width="100%" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2
          className={`mb-6 weave-reveal-up ${isVisible ? 'weave-visible' : ''}`}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontStyle: 'italic',
          }}
        >
          Continue the Conversation
        </h2>

        <p
          className={`mx-auto mb-16 max-w-2xl text-white/70 weave-reveal-up ${isVisible ? 'weave-visible' : ''}`}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            lineHeight: '1.8',
            letterSpacing: '0.02em',
            fontWeight: 300,
            transitionDelay: '120ms',
          }}
        >
          This PathWeave keeps narrative, relationships, and pathways together. If this page resonates, you can continue with a lighter summary export or a structured version of the same story.
        </p>

        <div className={`mb-20 flex flex-col justify-center gap-4 sm:flex-row weave-reveal-up ${isVisible ? 'weave-visible' : ''}`} style={{ transitionDelay: '220ms' }}>
          <button
            className="group flex items-center justify-center gap-3 rounded border border-white/30 bg-transparent px-8 py-4 transition-all duration-300 hover:border-[#FFD580] hover:bg-[#FFD580]/5"
            style={{ boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.05)' }}
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20">
              <path d="M10 3.8v8.6M6.7 9.1 10 12.4l3.3-3.3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
              <path d="M4.2 14.4h11.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" />
            </svg>
            <span className="transition-colors group-hover:text-[#FFD580]" style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', letterSpacing: '0.1em', fontWeight: 300 }}>
              Download Summary PDF
            </span>
          </button>

          <button
            className="group flex items-center justify-center gap-3 rounded border border-white/30 bg-transparent px-8 py-4 transition-all duration-300 hover:border-[#66CCCC] hover:bg-[#66CCCC]/5"
            style={{ boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.05)' }}
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20">
              <path d="M7 6.1H5.4v7.8H7M13 6.1h1.6v7.8H13M8.7 8.4h2.6M8.7 10.1h2.6M8.7 11.8h2.6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
            </svg>
            <span className="transition-colors group-hover:text-[#66CCCC]" style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', letterSpacing: '0.1em', fontWeight: 300 }}>
              Get Structured JSON
            </span>
          </button>
        </div>

        <div className={`weave-reveal-up ${isVisible ? 'weave-visible' : ''}`} style={{ transitionDelay: '320ms' }}>
          <p className="mb-8 text-xs uppercase tracking-[0.3em] text-white/50" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
            Connect with me
          </p>

          <div className="flex justify-center gap-6">
            {socialLinks.map((label) => (
              <span
                key={label}
                className="group rounded border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:border-white/40 hover:bg-white/10"
                aria-label={label}
              >
                <span className="block text-white transition-transform group-hover:scale-110">{renderSocialGlyph(label)}</span>
              </span>
            ))}
          </div>
        </div>

        <div className={`mt-20 border-t border-white/10 pt-12 weave-reveal-up ${isVisible ? 'weave-visible' : ''}`} style={{ transitionDelay: '420ms' }}>
          <p className="text-xs italic text-white/40" style={{ fontFamily: "'Playfair Display', serif" }}>
            Designed with intention, woven with care. © 2026 PathWeave
          </p>
          {output.tags.length ? (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {output.tags.map((tag) => (
                <Chip key={tag} tone="ghost" square>
                  {tag}
                </Chip>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function StandaloneFullPathWeave({ output, onBack = null, onBackLabel = 'Back', embedded = false }) {
  const [mounted, setMounted] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hoveredStoryId, setHoveredStoryId] = useState(null)
  const [visibleSections, setVisibleSections] = useState({
    hero: false,
    connections: false,
    stories: false,
    embedded: false,
    share: false,
  })
  const heroRef = useRef(null)
  const connectionsRef = useRef(null)
  const storiesRef = useRef(null)
  const embeddedRef = useRef(null)
  const shareRef = useRef(null)
  const openingLine =
    output.intro ||
    output.introSummary ||
    'Every thread in this tapestry represents a moment of connection, a lesson learned, or a dream pursued.'
  const identityParagraph =
    output.placeConnection ||
    output.identityLine ||
    'Through storytelling that honors both individual journeys and collective wisdom, this page invites a slower and more contextual reading.'
  const connectionCards = [
    {
      label: output.connections.connectedWith[0] || 'Community connection',
      body: output.connections.summary || output.connections.community || 'A vibrant set of relationships and shared spaces shaping the story.',
      tone: 'amber',
    },
    {
      label: output.connections.involved[0] || 'People involved',
      body: output.connections.involved.join(', ') || 'People who walked alongside the work remain visible here.',
      tone: 'stone',
    },
    {
      label: output.placeConnection || 'Place',
      body: output.placeConnection || 'Places and environments remain part of the weave, not detached from the story.',
      tone: 'stone',
    },
    {
      label: output.connections.benefited[0] || 'Future direction',
      body: output.pathwaysList.join(', ') || 'Interests and future directions remain open and visible here.',
      tone: 'teal',
    },
  ]
  const connectionCardsWithImages = connectionCards.map((item, index) => ({
    ...item,
    image: modelConnectionImages[index % modelConnectionImages.length],
  }))
  const galleryStories = output.stories.map((story, index) => ({
    ...story,
    image: modelStoryImages[index % modelStoryImages.length],
  }))

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const nextProgress = documentHeight > 0 ? window.scrollY / documentHeight : 0
      setScrollProgress(Math.max(0, Math.min(1, nextProgress)))
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const sectionRefs = [
      ['hero', heroRef],
      ['connections', connectionsRef],
      ['stories', storiesRef],
      ['embedded', embeddedRef],
      ['share', shareRef],
    ]

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const key = entry.target.getAttribute('data-section')
          if (!key) {
            return
          }

          if (entry.isIntersecting) {
            setVisibleSections((current) => ({ ...current, [key]: true }))
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '-10% 0px -10% 0px',
      },
    )

    sectionRefs.forEach(([key, ref]) => {
      if (ref.current) {
        ref.current.setAttribute('data-section', key)
        observer.observe(ref.current)
      }
    })

    return () => observer.disconnect()
  }, [])

  const backgroundY = `${scrollProgress * 30}%`
  const backgroundOpacity =
    scrollProgress < 0.3
      ? 1 - scrollProgress * 0.66
      : scrollProgress < 0.7
        ? 0.8 - (scrollProgress - 0.3) * 0.5
        : 0.6 - (scrollProgress - 0.7) * 0.66

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F9F9F8]">
      <div
        className="fixed inset-0 pointer-events-none weave-ambient-breathe"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255, 213, 128, 0.055) 0%, transparent 52%),
            radial-gradient(circle at 80% 80%, rgba(102, 204, 204, 0.05) 0%, transparent 52%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")
          `,
          backgroundSize: '100% 100%, 100% 100%, 200px 200px',
        }}
      />

      {mounted ? (
        <div
          className="fixed inset-0 pointer-events-none weave-ambient-drift"
          style={{
            transform: `translate3d(0, ${backgroundY}, 0)`,
            opacity: Math.max(0.4, backgroundOpacity),
          }}
        >
          <svg height="120%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="120" id="standaloneGlobalWeave" patternUnits="userSpaceOnUse" width="120">
                <circle cx="60" cy="60" fill="#1A1A1A" r="1.5" />
                <path d="M0,60 Q30,40 60,60 T120,60 M60,0 Q40,30 60,60 T60,120" fill="none" opacity="0.3" stroke="#1A1A1A" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect fill="url(#standaloneGlobalWeave)" height="100%" width="100%" />
          </svg>
        </div>
      ) : null}

      <main className="relative z-10">
        {!embedded && onBack ? (
          <div className="fixed left-6 top-6 z-20">
            <button
              className="rounded-full border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-stone-700 shadow-[0_18px_36px_-26px_rgba(26,26,26,0.24)] backdrop-blur-md transition hover:bg-white/85"
              onClick={onBack}
              type="button"
            >
              {onBackLabel}
            </button>
          </div>
        ) : null}

        <section ref={heroRef} className="relative flex min-h-screen items-center justify-center overflow-hidden px-8">
          <svg className="absolute inset-0 h-full w-full opacity-5" preserveAspectRatio="none">
            <path
              className={visibleSections.hero ? 'weave-line-draw' : ''}
              d="M0,400 Q400,200 800,400 T1600,400"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="0.5"
            />
            <path
              className={visibleSections.hero ? 'weave-line-draw-delayed' : ''}
              d="M0,600 Q600,400 1200,600 T2400,600"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="0.5"
            />
            <path
              className={visibleSections.hero ? 'weave-line-draw-late' : ''}
              d="M800,100 Q1000,500 1200,900"
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="0.5"
            />
          </svg>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,213,128,0.12),transparent_18%),radial-gradient(circle_at_center,rgba(255,255,255,0.48),transparent_54%)]" />
          <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FFD580]/30 bg-white/10 backdrop-blur-sm weave-orb-pulse" />

          <div className={`relative z-10 mx-auto max-w-4xl text-center weave-reveal-up ${visibleSections.hero ? 'weave-visible' : ''}`}>
            <h1
              className="mb-16 tracking-tight text-stone-900"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                lineHeight: '1.2',
                fontStyle: 'italic',
              }}
            >
              {output.name}, woven with purpose.
            </h1>

            <div className={`space-y-8 transition-opacity duration-1000 ${visibleSections.hero ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '220ms' }}>
              <p
                className="mx-auto max-w-3xl text-[#666666]"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.25rem',
                  lineHeight: '2',
                  letterSpacing: '0.01em',
                }}
              >
                {openingLine}
              </p>

              <p
                className="mx-auto max-w-2xl text-[#666666]"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.25rem',
                  lineHeight: '2',
                  letterSpacing: '0.01em',
                }}
              >
                {identityParagraph}
              </p>
            </div>
          </div>
        </section>

        <section ref={connectionsRef} className="relative bg-white/40 px-8 py-32 backdrop-blur-sm">
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'radial-gradient(circle, #1A1A1A 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="grid gap-16 md:grid-cols-2">
              <div className={`weave-reveal-left ${visibleSections.connections ? 'weave-visible' : ''}`}>
                <h2
                  className="mb-8 uppercase tracking-[0.3em] text-[#1A1A1A]"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 300 }}
                >
                  Community & Places
                </h2>

                <div className="space-y-3">
                  {connectionCardsWithImages.slice(0, 4).map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className={`group relative flex items-center gap-4 rounded-sm border p-4 transition-all duration-500 ${
                        item.tone === 'amber'
                          ? 'border-[#FFD580]/40 bg-white/60'
                          : item.tone === 'teal'
                            ? 'border-[#66CCCC]/40 bg-white/60'
                            : 'border-[#1A1A1A]/5 bg-white/60'
                      } backdrop-blur-md ${visibleSections.connections ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-[#1A1A1A]/5">
                        <img alt={item.label} className="h-full w-full object-cover" src={item.image} />
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[#FFD580]">
                            <ConnectionIcon type={item.tone === 'amber' ? 'community' : item.tone === 'teal' ? 'place' : 'person'} />
                          </span>
                          <p className="truncate text-sm text-[#1A1A1A]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                            {item.label}
                          </p>
                        </div>
                        <p className="mt-2 text-xs text-[#666666]" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {item.body}
                        </p>
                      </div>
                      <div className="absolute right-0 top-1/2 h-px w-8 -translate-y-1/2 bg-gradient-to-r from-[#FFD580]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              </div>

              <div className={`weave-reveal-right ${visibleSections.connections ? 'weave-visible' : ''}`} style={{ transitionDelay: '140ms' }}>
                <h2
                  className="mb-8 uppercase tracking-[0.3em] text-[#1A1A1A]"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 300 }}
                >
                  Interests & Future Directions
                </h2>

                <div className="flex flex-wrap gap-3">
                  {(output.pathwaysList.length ? output.pathwaysList : ['Pathways to be added']).map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className={`cursor-default rounded-sm border bg-transparent px-4 py-2 transition-all duration-500 hover:bg-[#66CCCC]/5 ${
                        index % 2 === 0 ? 'border-[#66CCCC]/30' : 'border-[#FFD580]/30'
                      } ${visibleSections.connections ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                      style={{
                        boxShadow: index % 2 === 0 ? 'inset 0 1px 2px rgba(102, 204, 204, 0.1)' : 'inset 0 1px 1px rgba(26, 26, 26, 0.02)',
                        transitionDelay: `${300 + index * 60}ms`,
                      }}
                    >
                      <span
                        className="text-sm text-[#1A1A1A]"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, letterSpacing: '0.05em' }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={storiesRef} className="relative overflow-hidden px-8 py-32">
          <div className="absolute inset-0 opacity-[0.015]">
            <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern height="80" id="standaloneStoryGrid" patternUnits="userSpaceOnUse" width="80">
                  <path d="M 80 0 L 0 80 M 0 0 L 80 80" fill="none" stroke="#1A1A1A" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect fill="url(#standaloneStoryGrid)" height="100%" width="100%" />
            </svg>
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className={`mb-20 text-center weave-reveal-up ${visibleSections.stories ? 'weave-visible' : ''}`}>
              <h2
                className="mb-4 text-[#1A1A1A]"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontStyle: 'italic',
                }}
              >
                The Weave: Stories in Motion
              </h2>
              <p
                className="mx-auto max-w-2xl text-[#666666]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.875rem',
                  letterSpacing: '0.05em',
                  fontWeight: 300,
                }}
              >
                Each story is a thread in the larger tapestry, connected by shared values and aspirations.
              </p>
            </div>

            {output.stories.length ? (
              <div className={`relative transition-all duration-1000 ${visibleSections.stories ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '140ms' }}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:auto-rows-[280px]">
                  {galleryStories.map((story, index) => (
                    <div
                      key={story.id || story.title}
                      onMouseEnter={() => setHoveredStoryId(story.id || story.title)}
                      onMouseLeave={() => setHoveredStoryId(null)}
                      style={{ transitionDelay: `${index * 70}ms` }}
                    >
                      <StoryGalleryCard image={story.image} index={index} story={story} />
                    </div>
                  ))}
                </div>

                <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: 5 }}>
                  {hoveredStoryId ? (
                    <>
                      <path
                        className="weave-line-draw"
                        d="M100,100 Q400,200 600,150"
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="1"
                        style={{ opacity: 0.3 }}
                      />
                      <path
                        className="weave-line-draw-delayed"
                        d="M200,300 Q500,250 800,350"
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="1"
                        style={{ opacity: 0.3 }}
                      />
                    </>
                  ) : null}
                </svg>
              </div>
            ) : (
              <div className="rounded-sm border border-[#1A1A1A]/5 bg-white/70 p-8 text-center text-sm text-stone-500 backdrop-blur-sm">
                Select at least one story to generate the story gallery for Full PathWeave.
              </div>
            )}
          </div>
        </section>

        <div ref={embeddedRef}>
          <EmbeddedContextPanel isVisible={visibleSections.embedded} output={output} />
        </div>
        <div ref={shareRef}>
          <DarkShareSection isVisible={visibleSections.share} output={output} />
        </div>
      </main>

      <svg height="0" style={{ position: 'absolute' }} width="0">
        <defs>
          <linearGradient id="lineGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD580" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFD580" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#66CCCC" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="reverseLineGradient" x1="100%" x2="0%" y1="100%" y2="0%">
            <stop offset="0%" stopColor="#66CCCC" stopOpacity="0" />
            <stop offset="50%" stopColor="#66CCCC" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFD580" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function EmbeddedFullPathWeave({ output, embedded = false }) {
  return (
    <section className="rounded-[34px] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,247,243,0.86))] p-6 shadow-soft sm:p-8">
      {!embedded ? (
        <OutputHeader
          eyebrow="Full PathWeave"
          title="Immersive digital presence"
          description="A story-led portfolio view that keeps identity, context, contribution, and future direction woven together in one continuous page."
        />
      ) : null}

      <div className={`${embedded ? '' : 'mt-8'} rounded-[32px] border border-stone-200/80 bg-white/72 p-6 backdrop-blur-sm sm:p-8`}>
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Full PathWeave</p>
        <h3 className="mt-4 font-display text-4xl text-stone-900">{output.name}</h3>
        <p className="mt-5 max-w-3xl text-base leading-8 text-stone-600">{output.introSummary || output.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {(output.pathwaysList.length ? output.pathwaysList.slice(0, 6) : ['Narrative-led', 'Community-aware']).map((item, index) => (
            <Chip key={`${item}-${index}`} tone={index % 2 === 0 ? 'soft' : 'accent'}>
              {item}
            </Chip>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {output.stories.slice(0, 2).map((story, index) => (
            <div key={story.id || story.title} className="rounded-[24px] border border-stone-200/80 bg-stone-50 p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-stone-400">{getStoryType(story)}</p>
              <p className="mt-3 font-display text-2xl text-stone-900">{story.title}</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">{story.summary || story.narrative}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {story.tags.slice(0, 2).map((tag, tagIndex) => (
                  <Chip key={`${tag}-${tagIndex}`} square tone={tagIndex === 0 ? 'accent' : 'soft'}>
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function FullPathWeaveView({ output, standalone = false, onBack = null, onBackLabel = 'Back' }) {
  const [searchParams] = useSearchParams()
  const embedded = searchParams.get('embedded') === '1'

  if (standalone) {
    return <StandaloneFullPathWeave embedded={embedded} onBack={onBack} onBackLabel={onBackLabel} output={output} />
  }

  return <EmbeddedFullPathWeave embedded={embedded} output={output} />
}
