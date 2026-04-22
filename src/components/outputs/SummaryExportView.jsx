function SummaryExperienceItem({ country, community, dates, headline, narrative, reflection, isLast = false }) {
  return (
    <div className={`relative mb-12 flex w-full ${isLast ? 'mb-0' : ''}`}>
      <div className="summary-export-divider absolute left-[130px] top-0 bottom-[-48px] w-[0.5pt] bg-[#DDDDDD]">
        <div className="summary-export-divider absolute left-1/2 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full bg-[#4A3728]" />
      </div>

      <div className="flex w-[110px] flex-col items-end pr-4 pt-0.5 text-right">
        <span
          className="mb-1 uppercase tracking-wider text-[#222222]"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '8.5pt', fontWeight: 700 }}
        >
          {country}
        </span>
        <span
          className="mb-1 text-[#666666]"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '8.5pt', fontWeight: 400 }}
        >
          {community}
        </span>
        <span
          className="text-[#999999]"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '7.5pt', fontWeight: 300 }}
        >
          {dates}
        </span>
      </div>

      <div className="w-[40px]" />

      <div className="flex-1 pl-4 pt-0">
        <h3
          className="mb-3 text-[#222222]"
          style={{ fontFamily: 'Lora, serif', fontSize: '14pt', fontWeight: 700 }}
        >
          {headline}
        </h3>
        <p
          className="mb-3 leading-relaxed text-[#444444]"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '10pt' }}
        >
          {narrative}
        </p>
        <div
          className="inline-block rounded-sm bg-[#F4F1EE] px-2 py-0.5 text-[#777777]"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '7pt', letterSpacing: '0.02em' }}
        >
          {`[Connection: ${reflection}]`}
        </div>
      </div>
    </div>
  )
}

function formatSummaryStories(output) {
  const stories = output.stories.length
    ? output.stories
    : [
        {
          id: 'placeholder',
          title: 'Story threads will appear here',
          narrative: 'Add stories in the builder to generate a summary export that keeps each narrative visible.',
          location: output.placeConnection || 'Shared context',
          involved: output.connections.connectedWith,
          privacy: 'Current profile',
        },
      ]

  return stories.slice(0, 3).map((story, index) => {
    const countryBase =
      (story.location || output.placeConnection || 'Community context')
        .split(/[,/]/)[0]
        .trim()
        .toUpperCase() || 'COMMUNITY CONTEXT'

    const communityBase =
      story.location ||
      story.involved?.[0] ||
      output.connections.connectedWith?.[0] ||
      output.connections.community ||
      'PathWeave'

    const reflectionBase =
      story.involved?.[0] ||
      story.benefited?.[0] ||
      output.connections.benefited?.[0] ||
      'Shared context'

    const datesBase =
      story.privacy === 'Keep private for now'
        ? 'Private story'
        : story.privacy === 'Only for selected sharing'
          ? 'Selected sharing'
          : 'Current profile'

    return {
      id: story.id || `${story.title}-${index}`,
      country: countryBase,
      community: communityBase,
      dates: datesBase,
      headline: story.title,
      narrative: story.summary || story.narrative,
      reflection: reflectionBase,
    }
  })
}

function buildPrintDocument(output) {
  const stories = formatSummaryStories(output)
  const pathways = output.pathwaysList.length
    ? output.pathwaysList
    : output.tags.length
      ? output.tags
      : ['Pathways to be added']

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${output.name} — Summary Export</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 48px;
            background: #E5E5E5;
            overflow: auto;
          }
          .canvas {
            position: relative;
            width: 210mm;
            height: 297mm;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: #FCFAF8;
            color: #222222;
            box-shadow: 0 25px 60px rgba(0,0,0,0.14);
            padding: 25mm 15mm 20mm 15mm;
            box-sizing: border-box;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20mm;
          }
          h1 {
            margin: 0 0 -3px 0;
            color: #222222;
            font-family: Lora, serif;
            font-size: 48pt;
            font-weight: 600;
            letter-spacing: -0.04em;
          }
          .protocol {
            font-family: Inter, sans-serif;
            font-size: 9pt;
            font-style: italic;
            color: #888888;
          }
          .ack {
            writing-mode: vertical-rl;
            height: 100px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            text-align: right;
            opacity: 0.6;
            font-family: Inter, sans-serif;
            font-size: 7pt;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            line-height: 1.35;
          }
          .stories {
            flex-grow: 1;
          }
          .item {
            position: relative;
            display: flex;
            width: 100%;
            margin-bottom: 12mm;
          }
          .thread {
            position: absolute;
            left: 130px;
            top: 0;
            bottom: -12mm;
            width: 0.5pt;
            background: #DDDDDD;
          }
          .dot {
            position: absolute;
            top: 1.5mm;
            left: 50%;
            transform: translateX(-50%);
            width: 2mm;
            height: 2mm;
            border-radius: 999px;
            background: #4A3728;
          }
          .left {
            width: 110px;
            padding-right: 4mm;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            text-align: right;
            padding-top: 0.5mm;
          }
          .country {
            margin-bottom: 1mm;
            color: #222222;
            font-family: Inter, sans-serif;
            font-size: 8.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }
          .community {
            margin-bottom: 1mm;
            color: #666666;
            font-family: Inter, sans-serif;
            font-size: 8.5pt;
          }
          .dates {
            color: #999999;
            font-family: Inter, sans-serif;
            font-size: 7.5pt;
            font-weight: 300;
          }
          .gap {
            width: 40px;
          }
          .right {
            flex: 1;
            padding-left: 4mm;
          }
          .headline {
            margin: 0 0 3mm 0;
            color: #222222;
            font-family: Lora, serif;
            font-size: 14pt;
            font-weight: 700;
          }
          .narrative {
            margin: 0 0 3mm 0;
            color: #444444;
            font-family: Inter, sans-serif;
            font-size: 10pt;
            line-height: 1.65;
          }
          .reflection {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 2px;
            background: #F4F1EE;
            color: #777777;
            font-family: Inter, sans-serif;
            font-size: 7pt;
            letter-spacing: 0.02em;
          }
          .pathways {
            margin-top: 12mm;
            padding-top: 12mm;
            border-top: 0.5pt solid #DDDDDD;
          }
          .label {
            margin-bottom: 6mm;
            color: #AAAAAA;
            font-family: Inter, sans-serif;
            font-size: 8pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3em;
          }
          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .tag {
            padding: 8px 12px;
            background: #F7F5F2;
            border: 0.5pt solid #EAE8E5;
            font-family: Inter, sans-serif;
            font-size: 8.5pt;
            color: #444444;
            letter-spacing: 0.02em;
          }
          .footer {
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            opacity: 0.4;
            font-family: Inter, sans-serif;
            font-size: 7pt;
            letter-spacing: 0.1em;
          }
        </style>
      </head>
      <body>
        <div class="canvas">
          <header class="header">
            <div>
              <h1>${output.name}</h1>
              <p class="protocol">Created under the PathWeave Respectful Storytelling Protocol.</p>
            </div>
            <div class="ack">Acknowledging ${output.placeConnection || 'the places and communities where this journey continues.'}</div>
          </header>
          <section class="stories">
            ${stories
              .map(
                (story) => `
                  <div class="item">
                    <div class="thread"><div class="dot"></div></div>
                    <div class="left">
                      <span class="country">${story.country}</span>
                      <span class="community">${story.community}</span>
                      <span class="dates">${story.dates}</span>
                    </div>
                    <div class="gap"></div>
                    <div class="right">
                      <h3 class="headline">${story.headline}</h3>
                      <p class="narrative">${story.narrative}</p>
                      <div class="reflection">[Connection: ${story.reflection}]</div>
                    </div>
                  </div>
                `,
              )
              .join('')}
          </section>
          <section class="pathways">
            <h4 class="label">Pathways & Capabilities</h4>
            <div class="tags">${pathways.map((item) => `<div class="tag">${item}</div>`).join('')}</div>
          </section>
          <footer class="footer">
            <span>CONFIDENTIAL · SUMMARY EXPORT 0.3.1</span>
            <span>© 2026 PATHWEAVE</span>
          </footer>
        </div>
      </body>
    </html>
  `
}

export default function SummaryExportView({ output, standalone = false, onBack = null }) {
  const stories = formatSummaryStories(output)
  const pathways = output.pathwaysList.length
    ? output.pathwaysList
    : output.tags.length
      ? output.tags
      : ['Pathways to be added']

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=1100,height=900')

    if (!printWindow) {
      return
    }

    printWindow.document.write(buildPrintDocument(output))
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const canvas = (
    <div
      className="relative flex flex-col overflow-hidden bg-[#FCFAF8] shadow-2xl"
      style={{
        width: '210mm',
        height: '297mm',
        color: '#222222',
        padding: '25mm 15mm 20mm 15mm',
      }}
    >
      <header className="mb-20 flex items-start justify-between">
        <div className="flex flex-col">
          <h1
            className="-mb-1 text-[#222222]"
            style={{
              fontFamily: 'Lora, serif',
              fontSize: '48pt',
              fontWeight: 600,
              letterSpacing: '-0.04em',
            }}
          >
            {output.name}
          </h1>
          <p
            className="italic text-[#888888]"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '9pt' }}
          >
            Created under the PathWeave Respectful Storytelling Protocol.
          </p>
        </div>

        <div
          className="flex h-[100px] flex-col items-end text-right opacity-60"
          style={{ writingMode: 'vertical-rl' }}
        >
          <p
            className="uppercase tracking-[0.2em] leading-tight"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '7pt' }}
          >
            {`Acknowledging ${output.placeConnection || 'the places and communities where this journey continues.'}`}
          </p>
        </div>
      </header>

      <section className="flex-grow">
        {stories.map((story, index) => (
          <SummaryExperienceItem
            key={story.id}
            community={story.community}
            country={story.country}
            dates={story.dates}
            headline={story.headline}
            isLast={index === stories.length - 1}
            narrative={story.narrative}
            reflection={story.reflection}
          />
        ))}
      </section>

      <section className="mt-12 border-t-[0.5pt] border-[#DDDDDD] pt-12">
        <h4
          className="mb-6 uppercase tracking-[0.3em] text-[#AAAAAA]"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '8pt', fontWeight: 600 }}
        >
          Pathways & Capabilities
        </h4>
        <div className="flex flex-wrap gap-2">
          {pathways.map((skill, index) => (
            <div
              key={`${skill}-${index}`}
              className="border-[0.5pt] border-[#EAE8E5] bg-[#F7F5F2] px-3 py-2 transition-colors hover:bg-white"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '8.5pt',
                color: '#444444',
                letterSpacing: '0.02em',
              }}
            >
              {skill}
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto flex items-end justify-between opacity-40">
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '7pt', letterSpacing: '0.1em' }}>
          CONFIDENTIAL · SUMMARY EXPORT 0.3.1
        </span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '7pt', letterSpacing: '0.1em' }}>
          © 2026 PATHWEAVE
        </span>
      </footer>
    </div>
  )

  if (standalone) {
    return (
      <div className="summary-export-view relative min-h-screen overflow-auto bg-[#E5E5E5] p-12">
        {onBack ? (
          <div className="fixed left-6 top-6 z-20">
            <button
              className="summary-export-interactive rounded-full border border-black/10 bg-white/70 px-4 py-2.5 text-sm text-stone-700 shadow-[0_18px_36px_-26px_rgba(26,26,26,0.24)] backdrop-blur-md transition hover:bg-white/85"
              onClick={onBack}
              type="button"
            >
              Back to builder
            </button>
          </div>
        ) : null}

        <div className="mx-auto flex max-w-[220mm] flex-col items-center gap-6">
          <div className="flex w-full justify-end">
            <button
              className="summary-export-interactive summary-export-print-trigger rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:-translate-y-0.5 hover:bg-stone-50"
              onClick={handlePrint}
              type="button"
            >
              Print / Save PDF
            </button>
          </div>
          {canvas}
        </div>
      </div>
    )
  }

  return <div className="summary-export-view flex min-h-full items-start justify-center bg-[#E5E5E5] p-4 sm:p-6">{canvas}</div>
}
