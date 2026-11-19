# DESIGN.md: Ralph de Vinca Group

Direction "Ember", approved on 18 November 2026 after the canvas https://claude.ai/artifact/CfBcuGL9CbmG8rjQHcETix.
Motion follows two references the owner chose: a home page that plays as a scroll-pinned sequence inside one frame,
and case studies shown as slides on a turning wheel. The style is RDV's own.
Code lives in `client/src/index.css` (tokens and every class) and `client/src/components/` (ember, marks, slides, layouts).

Dial: ENERGY 3 / RHYTHM 3 / MOTION 3.

## Tokens
| Role | Value |
|---|---|
| Ground | `#F1EADF`, a cream-to-gold page gradient |
| Paper | `#FFFDF9`, for cards that hold forms and messages |
| Ink | `#1B1A17` |
| Text | `#3F3A31`; muted `#5E574B`. Both hold 4.5:1 on the ground |
| Gold (text) | `#7A5718`, the accent for words and links |
| Gold (light) | `#C89236` with a soft glow, only on the bar under what is current and the unread dot |
| Gold (fill) | `#CFA257`, the cover slide |
| Night | `#1D1B17`, the decisions slide and deck |
| Danger | `#8E1B1B`, errors and destructive actions only |
| Easing | `cubic-bezier(0.23, 1, 0.32, 1)` |

## Type
- **Archivo** at width 125, weight 520, uppercase, for headlines (`.disp`).
- **Archivo** for body, 15 to 20px.
- **IBM Plex Mono** uppercase 11px for labels, navigation and buttons (`.mono`).
- Both fonts are self-hosted through `@fontsource`.

## Pieces
- **Ember** (`components/ember.tsx`): the home object. A five-lobed mesh, the vinca's petal count, with embers inside. A 2D canvas, no library. It burns hottest in the second scene and stops drawing when covered or off screen.
- **Home sequence** (`pages/Home.tsx`): one glass frame pinned while 520vh scrolls past. Hero lifts away, ember grows, statement fades in, cream panels wipe up (Divisions, Work, Contact), cards rise in turn, embossed marks catch a light sweep, the gold bar follows the scene. Below 900px wide, under 640px tall, or with reduced motion, the same scenes stack as a normal page.
- **Slide** (`.slide`, `SlideBody`): every case study has three, cover (gold), decisions (night), result (paper). Used on the wheel, the home fan and the admin preview.
- **Wheel** (`pages/Work.tsx`): slides on a 900px-radius arc, 16° apart, turned by page scroll with a snap point per slide, mouse drag, or the arrow buttons. The facing slide sits on top.
- **Emboss mark** (`EmbossMark`): a division mark pressed into a card with a gold edge; a band of light crosses it once.
- **Buttons**: `.btn.ink` (ink pill with a gold rim), `.btn.line`, `.btn.danger`. `:active` scales to 0.97.

## Admin
Sidebar, inbox with the list and the open message side by side, status tabs with counts, Undo after every status change, projects ordered with up and down buttons (`PATCH /admin/projects/order`), and an editor with a section list that ticks off finished parts, inline errors, a live wheel preview, drag-and-drop photo upload, and a native `<dialog>` to confirm a delete.

## Rules
- No kicker above a heading and no decorative section numbers. A part's name (Situation, Result) sits under its heading as a gold mono caption. Numbers stay only where order is information: process stages, decisions, case-study numbers.
- Page edge: `--gut` (16px to 64px) and `--max` (1760px). Body copy keeps its own measure (about 60ch) inside wider columns.
- Home panels stay in the accessibility tree; focus that lands in an off-screen panel scrolls the sequence to it. The frame uses `overflow: clip` so focus can never scroll it internally.
- Scroll-driven motion writes CSS variables (`--rot` on the wheel, scene values on the home frame); React re-renders only when the current scene or slide changes.
- Glass only on the sticky header, the home frame and the login card.
- Glow only on the current-item bar, the unread dot and the ink button rim.
- `prefers-reduced-motion`: no pinned sequence, a still ember, no shimmer, no light sweep.
- Touch targets at least 44px. Focus is a 2px gold-ink outline.
- Copy: no em dashes, no invented numbers, no testimonials.
