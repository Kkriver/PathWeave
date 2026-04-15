# PathWeave

PathWeave is a React + Tailwind concept prototype for a culturally responsive storytelling and narrative portfolio platform.

It is intentionally not a resume builder. The experience is designed around story, community, pathways, and careful sharing rather than bullet points, chronology, or keyword-first self-presentation.

## Overview

PathWeave explores a different way to represent experience:

- narrative instead of bullet points
- community instead of only individual achievement
- pathways instead of linear job history
- translation and export as optional layers rather than the main goal

The current prototype includes:

- a showcase-first landing page
- a dedicated About page
- an example narrative portfolio
- a 6-step guided builder
- optional tag review and privacy controls
- multiple export formats

## Experience Flow

The product follows a show-first, then-create structure:

1. Showcase landing page
2. Example portfolio
3. Respectful storytelling notice
4. Guided builder
5. Review and optional tags
6. Share and export

## Design Philosophy

- **Show first, then create**: users meet the product through a polished landing page and example profile before seeing any input fields.
- **Narrative-first UI**: stories are written as human-centred cards with place, people, impact, media, and privacy together.
- **Community-aware framing**: contribution, connection, and responsibility are visible alongside individual growth.
- **Non-linear pathways**: journey views avoid resume chronology and instead show relationships between stories, aspirations, and contribution.
- **Modern, not corporate**: the interface uses warm materials, editorial typography, rounded layouts, and portfolio-style composition rather than ATS or LinkedIn patterns.

## Cultural Safety Approach

PathWeave is described as a First Nations-informed concept prototype, not a universal cultural model.

The prototype includes respectful storytelling prompts and review controls that remind users:

- they choose what to share
- some knowledge may be private, sensitive, or community-held
- tags are optional
- story meaning stays with the user

This idea continues through the product via privacy settings on story cards, optional tag display, and an export review modal that asks users to confirm what is included before sharing.

## Export System

The export layer is intentionally secondary to story. Current export modes are:

- **Shared View**: the main export, keeping the full narrative and portfolio structure.
- **Summary Export**: a shorter version that preserves story rather than flattening it into bullet points.
- **Structured Export**: a JSON preview for interoperability and future systems.

Before previewing or sharing exports, users can open the review modal to:

- select specific stories
- include or exclude tags
- include or exclude media

The structured preview uses this shape:

```json
{
  "name": "...",
  "stories": [...],
  "community": "...",
  "pathways": [...],
  "tags": [...]
}
```

## Builder Steps

The guided builder is organised into six steps:

1. **Story**: begin with a narrative introduction
2. **Connections**: add people, place, and who was involved or benefited
3. **Pathways**: describe interests, aspirations, and future directions
4. **Stories**: add story cards with embedded media
5. **Review**: check story visibility, privacy, and optional tags
6. **Share**: choose an output format and confirm export content

## Demo Content

The prototype is seeded with example content grounded in:

- a mentoring story
- a community support story
- a creative work story

This makes the app feel complete on first load while still allowing users to edit, review, and extend the content.

## Tech Stack

- React
- React Router
- Tailwind CSS
- Vite
- local component state with `localStorage` persistence

## Getting Started

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

## Repository Notes

- Main branch: `main`
- This repository is intended as a concept prototype, not a production deployment
