# DESIGN.md: Bhoza Mphela, v3 (brand brief)

Locked system for this site. New pages reuse these tokens, type roles and components; `src/site.css` is the source of truth.
(v1 "run of show" and v2 "gig poster" concepts are in git history at `56d1b64`. v3 replaces them to follow the client's brand brief.)

## Brief

- **Subject:** Bhoza Mphela, Johannesburg. Marketer, DJ, MC, artist manager (since 2003), event curator, speaker, businesswoman. Tagline: Soul. Style. Substance.
- **Audience:** brands, event organisers, conference bookers, media, collaborators.
- **Job:** enquire and book. Three primary actions everywhere: Work with Bhoza, Book a set, Speaking enquiry.
- **Constraints from the brief:** fixed palette and fonts, editorial and spacious, distinctly African without stereotypes, subtle motion only, no stock or AI imagery, not an e-commerce site.
- **Material:** *real* = name, tagline, headline, roles, Johannesburg, 2003, radio/roster/Wits/Female DJ Network credits (to confirm), event and venture names, two real photos. *Pictures* = studio portrait (hero, About, OG), street look (Lifestyle). *Absent* = event, DJ and stage photos, logos, metrics, testimonials, case studies. All absent material is a labelled slot, never invented.

## Concepts considered

1. **Not one title** (her positioning taken literally). Her name stays fixed, and the line beside it never settles on one job. Anchor: the brief's core message that she is not defined by one title. Orig 4, fit 5, feasible 5, portable 2. **Picked.**
2. **The programme.** Each page set like a printed event programme with running order and credits. Anchor: she curates and MCs. Orig 3, fit 4, feasible 4, portable 3. Too close to the v1 run-of-show idea the client moved away from.
3. **Two sides.** Business and culture split screens. Anchor: her tagline. Already done in v2; the client asked for calmer.

## Concept card

```
Idea:        Bhoza Mphela is not one job title, so her name stays still while her roles take turns beside it.
Metaphor:    A magazine profile: one portrait, a name in serif, the roles as the standfirst.
Signature:   Hero role line: "Bhoza Mphela, marketer." The italic role settles up and is replaced every 2.4s (DJ, MC, artist manager...). The same words become the "One name, many rooms" index that links to each discipline.
Emotion:     Composed, confident, warm. A portrait you trust before you read.
Motion verb: Settle. Things rise 10px and come to rest (600-700ms, one ease). Gold lines draw across. Nothing bounces.
Screenshot:  Ivory page, "Creative Industry Big Sista." in Cormorant with "Big Sista." in gold italic, the black-and-white tuxedo portrait beside it.
```

## System

- **Palette (tokens in `:root`):** charcoal `#252522` (text, nav, dark bands), ivory `#F4F0E8` (ground), antique gold `#A58A5C` (hairlines, hover fills, accents on dark), sage `#737866` → `--sage-deep #4E5245` for the Lifestyle band, warm sand `#D6C9B8` (secondary sections, placeholders).
  AA fixes: gold text on ivory uses `--gold-ink #7A6440` (4.96:1); secondary text `--muted #5C5B54` (6:1); on charcoal `--muted-dark #B8B2A6` (7.3:1). Sections re-map role tokens (`--fg`, `--fg-2`, `--accent-ink`, `--rule`) through `.tone-*` and `.on-dark`.
- **Type:** Cormorant Garamond (variable, self-hosted) for display, headings, leads and lists of names; Inter (variable) for body, UI and labels. Fluid scale: display 3.1–7rem, h1 2.6–5.75rem, h2 2–3.6rem, h3 1.5–1.95rem, lead 1.35–1.85rem serif, body 17px/1.6. Negative tracking on display only. Labels are Inter 14px sentence case, never tracked caps. Italic is used for multi-word phrases only. Metric-matched fallbacks (`size-adjust`) keep CLS at 0 while fonts load.
- **Grid:** 12 columns, `minmax(0, 1fr)`, gutter 16–32px, side margin 20–80px, container capped at 1440px. Recurring split: heading in columns 1–4 (sticky on desktop), content in 5–12.
- **Shape:** square corners everywhere (`--radius: 0`). Hairline rules (1px) do the structural work.
- **Rhythm:** sections alternate ivory, sand, charcoal and sage-deep; never two photo-led sections in a row.
- **Motion:** one ease `cubic-bezier(.22,.7,.18,1)`. Buttons: gold fill settles up from the bottom edge. Index rows: title shifts 0.6rem, gold rule draws across, arrow nudges. Text links: gold line draws over a resting underline. Cards: image scales to 1.03. Reveals: opacity + 10px, once. Under `prefers-reduced-motion`: no reveals, no role cycling (the full role list shows as text), no smooth scroll.
- **Idle:** the role line is the only thing that moves at rest; it pauses on hover, off screen and in background tabs.

## Components

`btn` (solid / ghost / light / ghost-light), `tl` text link, `al` action link, `idx` index rows (linked or static), `rows` (date / title / meta lists), `facts` (dl), `media` + `ph` (fixed-ratio image or labelled placeholder: swapping a real photo never shifts layout), `gal` + lightbox (`<dialog>`, keyboard, swipe), `video` facade (YouTube nocookie / Vimeo, loads on click), `cta` band, enquiry `form` (inline validation, error summary, success state, no-JS fallback).

## Pages

Home (hero / statement / expertise index / featured experiences + ventures strip / credits / Lifestyle band / enquiry index) · About (split hero / bio sections with sticky headings / quote band / milestones / achievements / CTA) · Marketing (wide hero / services rows / dark process 01–05 / selected work) · Music (dark hero + in-page nav / DJ + appearances / gallery + video / MC on sand / management roster / experience / partners) · Events (capabilities / alternating features) + one page per event (facts, story, gallery, video, next event) · Speaking (topics / formats / engagements + media / videos / embedded enquiry form) · Ventures (logo slot + details per venture, Lifestyle last) · Lifestyle (editorial only, store link opens the separate shop) · Contact (enquiry picker + form) · 404.

## Hallmark picks

- **Shape:** profile site, genre editorial, job: enquire/book; actions in the header, hero, footer and every page's closing band.
- **Theme:** custom by brief. Ivory-dominant, charcoal and sand bands, one gold accent; serif voice over Inter; flat surfaces, hairline rules.
- **Chrome:** sticky ivory header with name and tagline, seven links and a "Work with Bhoza" button (menu below 1200px); charcoal footer with tagline, three CTAs, four link columns, credit line.
- **Hero:** text left (headline, role line, one sentence, three actions), portrait right; all visible at 1280×800.
- **Signature:** the role line beside the portrait.
- **Material:** see Brief.
- **Sweep:** Floor checked by hand (no Hallmark lint scripts bundled). 0 colour literals past the token block, no `transition: all`, `overflow-x: clip` on html and body, focus-visible on every control, reduced-motion fallbacks, no eyebrows or tracked caps, no arrows glued to link text, no middots, no invented metrics or logos.
