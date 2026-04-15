# PathWeave

PathWeave is a React + Tailwind concept prototype for a culturally responsive storytelling and portfolio platform. It is intentionally not a resume builder. The product starts by showing the experience first, then invites people to create their own version with narrative, community, and future pathways at the centre.

## Concept

PathWeave explores a different framing for representing experience:

- narrative instead of bullet points
- community instead of only individual achievement
- pathways instead of linear job history
- translation and export as optional layers rather than the main goal

The prototype follows this flow:

1. Landing page showcase
2. Example profile
3. Cultural safety modal
4. Profile creation
5. Story builder
6. Journey view
7. Portfolio view
8. Tag review
9. Export system

## Design Philosophy

- **Show first, then create**: users meet the product through a polished landing page and example profile before seeing any input fields.
- **Narrative-first UI**: stories are written as human-centred cards with place, people, impact, media, and privacy together.
- **Community-aware framing**: contribution, connection, and responsibility are visible alongside individual growth.
- **Non-linear pathways**: journey views avoid resume chronology and instead show relationships between stories, aspirations, and contribution.
- **Modern, not corporate**: the interface uses warm materials, editorial typography, rounded layouts, and portfolio-style composition rather than ATS or LinkedIn patterns.

## Cultural Safety Approach

PathWeave is described as a First Nations-informed concept prototype, not a universal cultural model.

The prototype includes a cultural safety modal before creation begins. It reminds users that:

- they choose what to share
- some knowledge may be private, sensitive, or community-held
- tags are optional
- story meaning stays with the user

This idea continues through the product via privacy settings on story cards, optional tag display, and an export review modal that asks users to confirm what is included before sharing.

## Export System

The export layer is intentionally secondary to story.

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

## Demo Data

The app is seeded with example profile content grounded in:

- a mentoring story
- a community support story
- a creative work story

The seeded draft profile gives the prototype enough content to feel complete on first load while still letting users edit the narrative and add new story cards.

## Tech

- React
- React Router
- Tailwind CSS
- Vite
- local component state with `localStorage` persistence

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```
