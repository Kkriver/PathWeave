import { useMemo, useState } from 'react'

const FIELD_TOOLTIPS = {
  name: 'The name carried into this export.',
  identityLine: 'A concise line describing identity and orientation.',
  placeConnection: 'The land that grounds this narrative.',
  intro: 'The full opening narrative.',
  introSummary: 'A shorter narrative bridge for lighter sharing contexts.',
  values: 'Values named by the storyteller.',
  connections: 'Relational weaving of community and place.',
  connectedWith: 'People, groups, or communities this story stays connected to.',
  involved: 'Those who shaped this experience directly.',
  benefited: 'Those walked alongside through this story.',
  place: 'Place held within the relational context.',
  community: 'Community context carried into the export.',
  summary: 'A compact relational summary.',
  pathways: 'Future directions held as open pathways.',
  interests: 'Areas of curiosity and ongoing learning.',
  aspirations: 'Aspirations that shape what comes next.',
  futureDirections: 'Future directions without forcing a fixed destination.',
  pathwaysList: 'A merged list of pathways for translation across outputs.',
  stories: 'The story threads selected for sharing.',
  title: 'A named story thread.',
  narrative: 'The full narrative attached to this story.',
  location: 'Place or context linked to the story.',
  involvedSource: 'Whether this context came from the profile or the story itself.',
  benefitedSource: 'Where the walked-alongside context was inherited from.',
  privacy: 'Original privacy note attached to the story.',
  image: 'Image reference included only when media sharing is allowed.',
  audio: 'Audio reference included only when media sharing is allowed.',
  video: 'Video reference included only when media sharing is allowed.',
  tags: 'Optional approved translation tags.',
  contextSnapshot: 'A retained place or context snapshot.',
  mediaLabel: 'A lightweight indication of attached media type.',
  media: 'Media references available in this export.',
  type: 'The media type carried with this reference.',
  label: 'The stored label or URL for the media reference.',
  storyTitle: 'The story this media belongs to.',
  shareConfig: 'Sharing controls used when generating this export.',
  selectedStories: 'The IDs selected before export.',
  includeMedia: 'Whether media references were included.',
  includeTags: 'Whether approved tags were included.',
  _sovereignty_protocol: 'Export protocol asserting user ownership and stewardship.',
  ownership: 'States who retains ownership of the exported narrative data.',
  usage: 'Describes the intended stewardship boundaries of this export.',
  exportedAt: 'Timestamp for when the export was generated.',
  format: 'The export mode used for this data object.',
}

const COMMENT_BY_KEY = {
  _sovereignty_protocol: 'Sovereignty protocol and export provenance.',
  connections: 'Relational weaving of community and place.',
  pathways: 'Open directions that continue beyond linear timelines.',
  pathwaysList: 'Flattened pathway layer for interoperability.',
  stories: 'Story threads selected for this sharing context.',
  media: 'Media references preserved under current sharing settings.',
  shareConfig: 'Visibility choices active at export time.',
}

function getExportDateParts() {
  const now = new Date()
  const isoDate = now.toISOString().slice(0, 10)
  const isoTimestamp = now.toISOString()
  return { isoDate, isoTimestamp }
}

function sanitizeFileSegment(value) {
  return String(value || 'User')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
}

function createExportPayload(output) {
  const { isoTimestamp } = getExportDateParts()

  return {
    _sovereignty_protocol: {
      ownership: 'This exported narrative data remains under the control of the storyteller.',
      usage: 'Sharing, storage, and interpretation should remain aligned with the original context and user intent.',
      exportedAt: isoTimestamp,
      format: 'The Loom Data',
    },
    ...output,
  }
}

function buildRenderableLines(value, depth = 0, keyName = null) {
  const indent = '  '.repeat(depth)
  const lines = []

  if (keyName && COMMENT_BY_KEY[keyName]) {
    lines.push({
      type: 'comment',
      indent,
      text: `// ${COMMENT_BY_KEY[keyName]}`,
    })
  }

  if (Array.isArray(value)) {
    lines.push({ type: 'punctuation', indent, text: '[' })

    value.forEach((item, index) => {
      const itemLines = buildRenderableLines(item, depth + 1)
      if (itemLines.length) {
        const lastLine = itemLines[itemLines.length - 1]
        if (index < value.length - 1 && (lastLine.type === 'punctuation' || lastLine.type === 'value')) {
          lastLine.trailingComma = true
        }
      }
      lines.push(...itemLines)
    })

    lines.push({ type: 'punctuation', indent, text: ']' })
    return lines
  }

  if (value && typeof value === 'object') {
    lines.push({ type: 'punctuation', indent, text: '{' })

    const entries = Object.entries(value)
    entries.forEach(([childKey, childValue], index) => {
      const childIndent = '  '.repeat(depth + 1)

      if (COMMENT_BY_KEY[childKey]) {
        lines.push({
          type: 'comment',
          indent: childIndent,
          text: `// ${COMMENT_BY_KEY[childKey]}`,
        })
      }

      if (Array.isArray(childValue) || (childValue && typeof childValue === 'object')) {
        lines.push({
          type: 'property-start',
          indent: childIndent,
          key: childKey,
          bracket: Array.isArray(childValue) ? '[' : '{',
        })

        const nestedEntries = Array.isArray(childValue)
          ? childValue.flatMap((item, itemIndex) => {
              const nestedLines = buildRenderableLines(item, depth + 2)
              if (nestedLines.length) {
                const lastNestedLine = nestedLines[nestedLines.length - 1]
                if (
                  itemIndex < childValue.length - 1 &&
                  (lastNestedLine.type === 'punctuation' || lastNestedLine.type === 'value')
                ) {
                  lastNestedLine.trailingComma = true
                }
              }
              return nestedLines
            })
          : Object.entries(childValue).flatMap(([nestedKey, nestedValue], nestedIndex, nestedEntriesList) => {
              const block = buildRenderableObjectProperty(nestedKey, nestedValue, depth + 2)
              if (block.length) {
                const lastNestedLine = block[block.length - 1]
                if (nestedIndex < nestedEntriesList.length - 1 && (lastNestedLine.type === 'punctuation' || lastNestedLine.type === 'value')) {
                  lastNestedLine.trailingComma = true
                }
              }
              return block
            })

        lines.push(...nestedEntries)
        lines.push({
          type: 'property-end',
          indent: childIndent,
          bracket: Array.isArray(childValue) ? ']' : '}',
          trailingComma: index < entries.length - 1,
        })
      } else {
        lines.push({
          type: 'value',
          indent: childIndent,
          key: childKey,
          value: childValue,
          trailingComma: index < entries.length - 1,
        })
      }
    })

    lines.push({ type: 'punctuation', indent, text: '}' })
    return lines
  }

  lines.push({
    type: 'raw',
    indent,
    value,
  })

  return lines
}

function buildRenderableObjectProperty(key, value, depth) {
  const indent = '  '.repeat(depth)

  if (Array.isArray(value) || (value && typeof value === 'object')) {
    return [
      {
        type: 'property-start',
        indent,
        key,
        bracket: Array.isArray(value) ? '[' : '{',
      },
      ...buildRenderableLines(value, depth + 1),
      {
        type: 'property-end',
        indent,
        bracket: Array.isArray(value) ? ']' : '}',
      },
    ]
  }

  return [
    {
      type: 'value',
      indent,
      key,
      value,
    },
  ]
}

function renderPrimitive(value) {
  if (typeof value === 'string') {
    return {
      text: `"${value}"`,
      className: 'text-[#F2F2F0]',
    }
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return {
      text: String(value),
      className: 'text-[#66CCCC]',
    }
  }

  if (value === null) {
    return {
      text: 'null',
      className: 'text-[#66CCCC]',
    }
  }

  return {
    text: `"${String(value)}"`,
    className: 'text-[#F2F2F0]',
  }
}

function KeyToken({ name }) {
  return (
    <span className="group relative inline-flex cursor-help items-center text-[#D4A373]">
      <span>"{name}"</span>
      <span className="pointer-events-none absolute left-full top-1/2 z-10 ml-2 hidden w-44 -translate-y-1/2 rounded-md border border-white/10 bg-[#1C1C1C]/95 px-2.5 py-1.5 text-[10px] leading-4 text-white/72 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.7)] backdrop-blur-md group-hover:block">
        {FIELD_TOOLTIPS[name] || 'PathWeave export field.'}
      </span>
    </span>
  )
}

function GhostAction({ children, onClick, active = false }) {
  return (
    <button
      className={`inline-flex items-center rounded-lg border px-4 py-2.5 text-xs tracking-[0.18em] uppercase transition duration-200 ${
        active
          ? 'scale-[1.03] border-[#66CCCC]/35 bg-[#66CCCC]/10 text-[#EDEBE6]'
          : 'border-white/10 bg-white/5 text-white/72 hover:border-white/20 hover:bg-white/8'
      } backdrop-blur-md`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

export default function StructuredJsonView({ output }) {
  const [copied, setCopied] = useState(false)
  const exportPayload = useMemo(() => createExportPayload(output), [output])
  const jsonValue = useMemo(() => JSON.stringify(exportPayload, null, 2), [exportPayload])
  const renderableLines = useMemo(() => buildRenderableLines(exportPayload), [exportPayload])
  const { isoDate } = useMemo(() => getExportDateParts(), [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonValue)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([jsonValue], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `PathWeave_Export_${sanitizeFileSegment(output.name)}_${isoDate}.json`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <section className="relative flex h-[760px] flex-col overflow-hidden rounded-[28px] border border-white/14 bg-[#050505] p-6 text-white shadow-[0_34px_90px_-50px_rgba(0,0,0,0.86)] sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 10px 10px, rgba(255,255,255,0.16) 0.6px, transparent 0.7px), url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.15\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.18\'/%3E%3C/svg%3E")',
          backgroundSize: '20px 20px, 180px 180px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(255,255,255,0.05), transparent 24%), radial-gradient(circle at bottom left, rgba(255,255,255,0.035), transparent 20%)',
        }}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Structured Export</p>
            <h2
              className="mt-3 text-[2.4rem] leading-none text-[#F3EFE6]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              The Loom Data
            </h2>
          </div>

          <p className="font-mono text-[11px] tracking-[0.16em] text-white/46">
            Status: Encrypted &amp; Sovereign
          </p>
        </header>

        <div className="mb-6 grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-4 overflow-auto pr-1">
            <div className="rounded-lg border border-white/12 bg-[#101010] p-4 backdrop-blur-md">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/44">Protocol</p>
              <p className="mt-3 text-sm leading-7 text-white/72">
                This export represents a user-held narrative object. The JSON remains structured, but the meaning stays
                attached to the storyteller and the original context of sharing.
              </p>
            </div>
            <div className="rounded-lg border border-white/12 bg-[#101010] p-4 backdrop-blur-md">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/44">Current scope</p>
              <ul className="mt-3 space-y-2 text-sm text-white/72">
                <li>{output.stories.length} story threads retained</li>
                <li>{output.media.length} media references included</li>
                <li>{output.pathwaysList.length} pathway notes woven in</li>
                <li>{output.tags.length} approved tags available</li>
              </ul>
            </div>
          </div>

          <div className="flex min-h-0 flex-col rounded-lg border border-white/12 bg-[#121212] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              </div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-white/36">PathWeave / JSON / sovereign</p>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-0 py-2 font-mono text-[12px] leading-7 text-white/90 sm:text-[13px]">
              {renderableLines.map((line, index) => {
                if (line.type === 'comment') {
                  return (
                    <div key={`comment-${index}`} className="grid grid-cols-[56px_minmax(0,1fr)] px-4">
                      <span className="select-none pr-4 text-right text-white/22">{index + 1}</span>
                      <span className="whitespace-pre text-[#8C8A85]">{`${line.indent}${line.text}`}</span>
                    </div>
                  )
                }

                if (line.type === 'punctuation') {
                  return (
                    <div key={`punctuation-${index}`} className="grid grid-cols-[56px_minmax(0,1fr)] px-4">
                      <span className="select-none pr-4 text-right text-white/22">{index + 1}</span>
                      <span className="whitespace-pre text-white/54">
                        {line.indent}
                        {line.text}
                        {line.trailingComma ? ',' : ''}
                      </span>
                    </div>
                  )
                }

                if (line.type === 'property-start') {
                  return (
                    <div key={`property-start-${index}`} className="grid grid-cols-[56px_minmax(0,1fr)] px-4">
                      <span className="select-none pr-4 text-right text-white/22">{index + 1}</span>
                      <span className="whitespace-pre">
                        <span className="text-white/54">{line.indent}</span>
                        <KeyToken name={line.key} />
                        <span className="text-white/54">: {line.bracket}</span>
                      </span>
                    </div>
                  )
                }

                if (line.type === 'property-end') {
                  return (
                    <div key={`property-end-${index}`} className="grid grid-cols-[56px_minmax(0,1fr)] px-4">
                      <span className="select-none pr-4 text-right text-white/22">{index + 1}</span>
                      <span className="whitespace-pre text-white/54">
                        {line.indent}
                        {line.bracket}
                        {line.trailingComma ? ',' : ''}
                      </span>
                    </div>
                  )
                }

                if (line.type === 'value') {
                  const primitive = renderPrimitive(line.value)

                  return (
                    <div key={`value-${index}`} className="grid grid-cols-[56px_minmax(0,1fr)] px-4">
                      <span className="select-none pr-4 text-right text-white/22">{index + 1}</span>
                      <span className="whitespace-pre">
                        <span className="text-white/54">{line.indent}</span>
                        <KeyToken name={line.key} />
                        <span className="text-white/54">: </span>
                        <span className={primitive.className}>{primitive.text}</span>
                        <span className="text-white/54">{line.trailingComma ? ',' : ''}</span>
                      </span>
                    </div>
                  )
                }

                const primitive = renderPrimitive(line.value)

                return (
                  <div key={`raw-${index}`} className="grid grid-cols-[56px_minmax(0,1fr)] px-4">
                    <span className="select-none pr-4 text-right text-white/22">{index + 1}</span>
                    <span className="whitespace-pre">
                      <span className="text-white/54">{line.indent}</span>
                      <span className={primitive.className}>{primitive.text}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <footer className="mt-auto flex flex-wrap items-center justify-end gap-3 border-t border-white/8 pt-5">
          <GhostAction active={copied} onClick={handleCopy}>
            {copied ? 'Verified' : 'Copy JSON'}
          </GhostAction>
          <GhostAction onClick={handleDownload}>Download .json</GhostAction>
        </footer>
      </div>
    </section>
  )
}
