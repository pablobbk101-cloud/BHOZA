# Bhoza Mphela: personal brand website

Concept build of Bhoza Mphela's central digital home: marketing, music, events, speaking, ventures and The Bhoza Lifestyle.
Plain HTML, CSS and vanilla JavaScript, generated from simple content files by a small Node build script. No framework.

- Live concept: https://missbhoza.mrpoint.online
- Design notes: [`DESIGN.md`](DESIGN.md)
- Everything still to be supplied or confirmed: [`TODO.md`](TODO.md)

---

## Editing content (no developer needed)

All words, lists, links and photos live in **`/content`**. Change a file, commit, and Cloudflare Pages rebuilds the site in about a minute.

| File | What it controls |
|---|---|
| `content/site.json` | Name, tagline, home headline and intro, email, phone, social links, store link, enquiry categories, analytics ID, footer credit |
| `content/expertise.json` | The "One name, many rooms" list on the home page |
| `content/events.json` | Soul Connex, The Ultimate Camping Experience, Gospel Brunch: summary, facts, story, gallery, video. Each gets its own page at `/events/<slug>/` |
| `content/projects.json` | Projects and ventures: name, category, role, description, logo, website link |
| `content/dj.json` | DJ Bhoza: sound, appearances, gallery, video, artist roster, industry experience, partners |
| `content/speaking.json` | Talk topics, formats, engagements, interviews and media, videos |
| `content/pages/*.md` | Page headings, intros and longer text (About biography, Marketing services and process, Music sections, Lifestyle text, Contact intro). The part between the `---` lines is settings; below it is ordinary Markdown |

### Common edits

- **Add a photo.** Put the image in `images/uploads/` (JPG or PNG, at least 1600px on the long side), then write its path, e.g. `"/images/uploads/soul-connex-crowd.jpg"`, into the `image` field that currently says `""`. The placeholder block is replaced automatically. The build makes fast WebP versions, so upload the original.
- **Add an appearance, engagement or media feature.** Copy an existing `{ ... }` entry in the list, edit it, and remove `"placeholder": true` once it is confirmed (that flag shows a small "To confirm" tag on the site).
- **Add a video.** Paste the YouTube ID (the part after `v=` in the link) into `"youtube"`, or a Vimeo number into `"vimeo"`. Videos only load when a visitor presses play.
- **Add an event.** Copy one event in `content/events.json`, give it a new `slug` (lowercase, dashes, e.g. `"winter-sessions"`) and it gets its own page.
- **Change the store link.** `shopUrl` in `content/site.json`.
- **Hide a social network.** Leave its `url` empty.

JSON needs straight double quotes and commas between entries. If a build fails after an edit, the Cloudflare build log points to the line.

### Content manager at `/admin` (optional)

[Decap CMS](https://decapcms.org) is wired up at `/admin/`: a simple form-based editor for every file above, with image uploads. It commits to GitHub, which triggers a rebuild.

To switch it on (one-time, about 15 minutes):

1. Create a GitHub OAuth App (GitHub → Settings → Developer settings → OAuth Apps). Callback URL: the OAuth proxy URL below plus `/callback`.
2. Deploy a free Decap OAuth proxy on Cloudflare Workers, e.g. [`sterlingwes/decap-proxy`](https://github.com/sterlingwes/decap-proxy), with the OAuth App's client ID and secret.
3. In `admin/config.yml`, set `base_url:` to the Worker URL and check `repo:` and `branch:`.
4. Give the client a GitHub account with write access to the repository.

---

## Running locally

Needs Node 20 or newer.

```bash
npm install
npm run dev        # builds into dist/ and serves http://localhost:4400 (the contact form works locally and logs enquiries to the terminal)
```

Other scripts:

```bash
npm run build      # build only
npm run qa         # screenshots + accessibility/performance report in .shots/ (needs Playwright with Chromium)
node scripts/icons.mjs   # re-render favicons and the social sharing image (only if the brand changes)
```

## Project structure

```
content/            ← all editable content (JSON + Markdown)
images/             ← photos (originals); images/uploads/ for new ones
src/site.css        ← all styles; design tokens at the top
src/site.js         ← menu, role line, reveals, lightbox, video, form, analytics
src/fonts/ src/icons/
functions/api/contact.js   ← Cloudflare Pages Function for the enquiry form
admin/              ← Decap CMS
build.mjs           ← renders every page, resizes images, writes sitemap, robots, _headers
scripts/            ← local server, QA, icon renderer
dist/               ← build output (not committed)
```

## Contact form

The enquiry form posts to `/api/contact` (a Cloudflare Pages Function) which emails the enquiry through [Resend](https://resend.com) (free tier: 3,000 emails a month). It validates in the browser and on the server, has a spam honeypot, and works without JavaScript.

In Cloudflare Pages → the project → Settings → Variables and Secrets, add:

| Name | Value |
|---|---|
| `RESEND_API_KEY` (secret) | API key from Resend |
| `CONTACT_TO` | **TODO:** Bhoza's enquiries inbox |
| `CONTACT_FROM` | A sender on a domain verified in Resend, e.g. `Bhoza Mphela website <enquiries@bhoza.co.za>` |

Rather use Formspree? Paste the Formspree form URL into `formEndpoint` in `content/site.json`. The function is then ignored.

## Analytics

One value: `analytics` in `content/site.json`.

- A Google Analytics 4 ID (`G-XXXXXXX`) loads GA4.
- Anything else is treated as a Cloudflare Web Analytics token.
- Empty means no analytics. (Cloudflare Web Analytics can also be switched on in the Pages dashboard with no code at all.)

## Deploying to Cloudflare Pages

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → choose this repository.
2. Build settings:
   - Framework preset: **None**
   - Build command: **`npm run build`**
   - Build output directory: **`dist`**
   - Root directory: *(leave empty)*
   - Environment variable: `NODE_VERSION` = `22` (also set by `.nvmrc`)
3. Save and deploy. Every push to the production branch redeploys; other branches get preview URLs.
4. Add the form variables above, then redeploy once.
5. Custom domain: the project → Custom domains → Set up a custom domain → `missbhoza.mrpoint.online`. If `mrpoint.online` is on Cloudflare DNS, the CNAME is added for you; otherwise add a `CNAME` record `missbhoza` → `<project>.pages.dev` at your DNS host.
6. If the final domain changes (e.g. `bhoza.co.za`), update `siteUrl` in `content/site.json`, or set a `SITE_URL` environment variable, so canonical links, the sitemap and social cards use it.

`_headers` (security headers, CSP, caching), `_redirects`, `robots.txt`, `sitemap.xml` and the web manifest are generated on every build.
