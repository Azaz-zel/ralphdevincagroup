# DESIGN.md: Ralph de Vinca Group

Direction approved on 29 October 2026, after the canvas https://claude.ai/artifact/P3zD6zUTdZtbpjUpY9fyaq.
The look comes from a "Reality, by design" reference: an annotated technical drawing on a warm ground.
Code lives in `client/src/index.css` (tokens and every class) and `client/src/components/` (marks, HUD pieces, layouts).

## Read
A portfolio and landing page for clients and recruiters, in an editorial, technical-annotation language.
The vinca flower the group is named after sits at the centre, and the copy annotates it.

## Tokens
| Role | Value |
|---|---|
| Ground | `#F7F2E7`, fading to `#EEDDBA` at the foot, with a 120px grid at 4.5% ink |
| Ink | `#1B1A17` |
| Secondary text | `#5C564B`. Never lighter: it holds 4.5:1 on the gold end |
| Line | `rgba(27, 26, 23, 0.16)` |
| Accent | `#7A1F2B` burgundy. It is the only accent; Perfumery's mark uses it |
| Danger | `#9B1C1C`, for errors and destructive actions only |
| Easing | `cubic-bezier(0.23, 1, 0.32, 1)` |

## Type
- **Archivo Bold**, uppercase, tight tracking (-0.035em), for headlines.
- **Archivo** for body, 16–19px.
- **IBM Plex Mono** uppercase, 11–12px, for labels, navigation, buttons and annotations.
- Both fonts are self-hosted through `@fontsource`, so nothing is requested from Google. This keeps the privacy page true.

## Marks
- **Perfumery:** five solid petals, 72° apart, in burgundy.
- **Technology:** the same petals drawn faceted, with five square nodes.
- Below 64px the centre and the nodes drop out and the strokes get heavier.
- Source: `client/src/components/marks.tsx`.

## Pieces
- **Stage:** the hero for Home, Perfumery and Technology.
  - A headline at top left and a mark at the centre with a dashed ring and crosshairs.
  - Up to four callouts joined to the mark by elbow leader lines.
  - A window box on the right and a list at bottom left.
  - Below 960px it becomes a plain stack.
- **Window (`.win`):**
  - a 1px ink border;
  - a black title bar holding a mono label and a small square or a `/NN` tag.
- **Section label (`.sl`):** `[ 01 / NAME ]` above an ink rule, with a mono aside on the right.
- **Rows (`.row`):** a 12-column ruled list, used for work, decisions and stages.
- **Photo slot (`.ph`):**
  - Before a photo exists, it shows hatching with the division mark.
  - Case study photos come from the admin.
  - Fixed-page photos are set in `client/src/lib/config.tsx` → `photos`.
- **Buttons:**
  - `.btn` is an ink block with a mono label and a long arrow, and turns burgundy on hover.
  - `.btn.q` is the outline variant.
  - `.chip` is for toggles and filters.
  - `.tl` is an underlined mono link.

## Rules
- Corners are square everywhere.
- Glass appears only on the sticky header.
- Motion:
  - Hover and press: `scale(0.97)` on `:active`, and arrows nudge 6px.
  - The mark swap on Home crossfades with a slight rotation.
  - `prefers-reduced-motion` turns all of it off.
- Touch targets are at least 44px. Focus is a 2px burgundy outline.
- Copy: no em dashes, no invented numbers, no testimonials.
