# Bhoza.co.za concept site

Concept redesign for Bhoza Mphela (bhoza.co.za). Static HTML, CSS and JS. No framework.

Concept: "Bhoza" is the one in charge, so the site is the tagline taken literally: Bhoza means business, and Bhoza means culture. Gig-poster layout. See `DESIGN.md`.

## Deploy (Cloudflare Pages)

- Build command: none
- Build output directory: `dist`

`dist/` is committed, so Pages can serve it as-is.

## Edit

All copy lives at the top of `build.mjs` (services, socials); page copy is in the page blocks below it. Styles are in `src/site.css`, behaviour in `src/site.js`.

```bash
npm install
node prep.mjs     # only when the portrait or libraries change: crops images, copies fonts and libraries into dist/
node build.mjs    # writes the pages into dist/
node shoot.mjs    # optional QA: screenshots + accessibility report in .shots/ (needs: npx playwright install chromium)
```

## Before launch

- Confirm the credits with Bhoza (artists, brands, radio, Wits, Female DJ Network). They come from her public Music In Africa profile.
- Confirm the line "In kasi slang, a bhoza is the one in charge".
- Add LinkedIn and Facebook profile URLs in `build.mjs` (only the handles were on the old site).
- Swap in a high-resolution original of the portrait (`src/portrait-original.jpg`, `src/street-original.jpg`) and confirm photo credits.
- The merch strip on the home page is a placeholder until the store is live.
