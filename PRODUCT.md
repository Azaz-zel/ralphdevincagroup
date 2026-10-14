# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Two audiences, weighted equally (owner's answer, 2026-10-14):
- Prospective software clients: businesses and institutions, mostly in Bali, who need a website or an internal system and are judging whether this practice can be trusted with it.
- People interested in fragrance, arriving through the Perfumery division.

Both arrive cold, scan the home page, and decide within the first screen whether to keep reading.

## Product Purpose
Portfolio and front door of Ralph de Vinca Group, an independent group in Bali with two divisions: Perfumery (a platform for understanding fragrance) and Technology (websites and internal systems). Success: a visitor reads to the end, opens a case study, and sends the contact form.

## Positioning
One person, two crafts held to one standard. Each case study shows the constraint and the decisions behind the work, not only the result. Nothing is padded: the work shown is all the work there is.

## Operating Context
- Laravel 12 + Blade + Tailwind v4 + Vite, vanilla JS, no front-end framework.
- One admin account (created with `php artisan admin:create`) reads contact inquiries at `/inbox`.
- Case studies live in the `projects` table and are added, edited and deleted at `/admin/projects` (same single admin login). Uploaded screenshots are re-encoded into 800/1200/1600w JPG + WebP under `public/images/work/`.

## Capabilities and Constraints
- Public pages: home, about, perfumery, technology, work index, work detail, contact (one form), privacy, sitemap.
- Every fact lives in config (`config/site.php`, `config/divisions.php`), never typed into a view. Project counts on pages are derived, never typed.
- Screenshots are served as 800/1200/1600w WebP + JPEG with intrinsic size, so pages never shift while loading.
- Contrast floor: 4.5:1 for text (see token notes in `resources/css/app.css`).

## Brand Commitments
- Name: Ralph de Vinca Group. Wordmark "Ralph de Vinca" with line "GROUP".
- Thesis: "Things that are not seen, but felt." Tagline: "Wisdom that binds, and endures."
- Four principles taken from the name: Composition, Precision, Binding, Endurance. Copy for these is word-for-word identical on Home and About.
- Signature element: the Composition, a three-layer TOP / HEART / BASE block written in the grammar of a perfume formula, used for the group and for each project's stack.
- Accent per division: Perfumery = vinca, Technology = brass.
- Voice: plain, first person, honest about limits ("If it isn't a good fit, I'll say so.").
- Owner decision 2026-10-14: no em dashes in visible copy.

## Evidence on Hand
- Three real projects in `config/projects.php`: Ralph de Vinca Perfumery, Bali Cebelok Gesiuh, PKKMB INSTIKI 2026, with screenshots in `public/images/work/`.
- Real client testimonials exist (owner confirmed) but their text is not yet in the repo. Do not invent quotes; show a testimonial only when the real text is entered.
- No statistics, client logos, or awards. Do not fabricate any.

## Product Principles
1. Show the decision, not only the outcome.
2. Nothing padded: no invented numbers, clients, or quotes.
3. Two divisions, one standard: neither division reads as a side project.
4. Built to hold: content changes in one place and cannot drift between pages.

## Accessibility & Inclusion
WCAG AA contrast, visible focus states, full keyboard use, `prefers-reduced-motion` honoured, content visible without JavaScript.
