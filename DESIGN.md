# Bhoza.co.za concept — DESIGN.md

## Brief
Subject: Bhoza Mphela (@MissBhoza), Johannesburg. Marketing, events, artist management, social, MC/DJ/speaker, consulting.
Audience: brands, event organisers, artists, conference bookers. Job: get booked.
Assets: one black and white studio portrait (supplied), copy from the current holding page, public Music In Africa bio.
Stack: hand-written static HTML/CSS/JS built by `build.mjs` (GSAP + Lenis, self-hosted fonts). Reason: content-only showcase, deploys to Cloudflare Pages as-is, no framework runtime.

## Concepts considered
1. Run of show (name + profession): "bhoza" = the one in charge; she holds the running order. Site is a stage manager's run sheet lit by one follow-spot. Anchor: she manages, builds, markets AND hosts the night. Orig 4 / fit 5 / feasible 5 / portable 2. PICKED.
2. Mixing desk: six services as six channel faders. Anchor: she DJs. Orig 3 / fit 3 / feasible 4 / portable 4 (any DJ).
3. Contact sheet: film-strip of the portrait session. Anchor: the photo. Orig 2 / fit 2 / feasible 5 / portable 5.
Picked 1: only someone who both runs the night and hosts it can own it.

## Concept card
Idea:        Bhoza is the one in charge, so her site is the running order of a show, lit by a single follow-spot.
Metaphor:    Stage management: cues, standby/go, house lights, one lamp.
Signature:   The follow-spot. One light position drives the portrait reveal, the lit headline, row highlights and the footer; it drifts on its own when the pointer rests.
Emotion:     House lights drop, a lamp snaps onto her. Presence.
Motion verb: Cut like a lighting cue: snap on fast, fade out slow.
Screenshot:  Dark stage, her face in the beam, BHOZA across the floor.

## System
Palette: ground #0b0a09, ink #f2ede4, muted #9a9388, line #2b2824, paper #e8e1d3 (+ paper-ink #14120f), standby #ff4a2b, go #42d77d (cue lights only).
Type: Bricolage Grotesque variable (display at wdth 75 / wght 800, body at wdth 100 / wght 400); DM Mono for cue labels and the clock.
Grid: 12 col, 24px gutter, 4vw margin. Everything hangs off column 1 or column 7.
Shape: square corners everywhere; the only circles are the beam and the cue lamps.
Motion: expo.out 0.5-0.9s in, power2.in 0.25s out; stagger 40-60ms. One clock (gsap.ticker).
Idle: the spot drifts in a slow figure around its home mark. Reduced motion: full wash, no drift, no smooth scroll.

## Composition
Home: hero (portrait right, word across the floor) / statement (big text col 1-10) / running order (6 cue rows) / credits on paper (2-col end credits) / off stage (detail crop + text) / merch strip / footer call.
What I do: title / six cue blocks alternating col 1 and col 7 / call.
About: split portrait + bio / pull quote / cue history table.
Book: split form + direct lines.
404: the spot searching an empty stage.

## Change log
- Pointer-tracking follow-spot switched off at the client's request (`SPOT = false` in src/site.js). Portraits and headlines are evenly lit; the code path is kept so it can return later.

## v2 (client feedback: sections looked generic; keep the hero)
Idea:        Her own tagline, taken literally: Bhoza means business, and Bhoza means culture.
Metaphor:    A gig poster. Flat colour blocks, condensed caps against a fashion italic, a line-up set like a festival bill.
Signature:   The pinned "two sides" section: scroll cuts the suit to the street and "business." to "culture."
Motion verb: Cut. Straight-edged wipes from the bottom edge (curtain, images, buttons). Nothing follows the pointer.
Idle:        The ticker band keeps rolling.
Palette:     black #0b0a09, charcoal #1c1a17, bone #ece6d9, hot red #ff4a2b (the hero's lamp colour, now the block colour).
Type:        Bricolage Grotesque condensed 800 (poster caps), Bodoni Moda italic (the second voice), DM Mono (labels).
Kept:        v1 hero, unchanged in layout, at the client's request. Dropped: cue bar, running-order list, feet crop.
Sections:    hero / statement + ticker / two sides (pinned) / six stacked posters tagged Business or Culture / line-up bill / story with street photo / red footer.

## Mobile layer (phone only, 900px and below)
- The dock: fixed thumb-zone bar. Menu (opens a bottom-aligned red sheet) | live side label (Business / Culture, follows the pinned section and the poster rail) | Book. Steps aside when a form field is focused. Haptic tick on side flips and poster snaps (Android).
- The rail: six services as a swipe deck (CSS scroll-snap, works without JS). Segmented bar below alternates black (business) and red (culture) to mirror the stack's order. Hint arrow nudges until first swipe.
- Desktop and the v1 hero are untouched.
