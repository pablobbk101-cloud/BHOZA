# TODO: placeholders and things to confirm

Everything below is visible on the concept site as a labelled placeholder block ("Photo to come", "Video to come", "Logo to come"), a "To confirm" tag, or sample copy. Nothing here is presented as fact until Bhoza confirms it.
File paths say where to make the change. See README.md for how.

## 1. Before launch (blocking)

- [ ] **Enquiries inbox.** Set `CONTACT_TO` (and `RESEND_API_KEY`, `CONTACT_FROM`) in Cloudflare Pages, or a Formspree URL in `content/site.json` → `formEndpoint`. The fallback in `functions/api/contact.js` is a dummy address.
- [ ] **Public email.** `missbhoza@bhoza.co.za` is carried over from the previous holding page. Confirm. `content/site.json` → `email`
- [ ] **Public phone.** Empty, so hidden. Add if wanted. `content/site.json` → `phone`
- [ ] **Store URL.** `https://shop.bhoza.co.za` is a placeholder. `content/site.json` → `shopUrl`
- [ ] **Social links.** LinkedIn, Facebook and YouTube URLs are missing (hidden in the footer, "Link to come" on Contact). Confirm Instagram, X and TikTok handles. `content/site.json` → `socials`
- [ ] **Analytics.** Add a GA4 ID or Cloudflare Web Analytics token. `content/site.json` → `analytics`
- [ ] **Decap CMS login.** Deploy the OAuth proxy and set `base_url`. `admin/config.yml`
- [ ] **Reply time.** "Enquiries are usually answered within two working days" is an assumption. `content/pages/contact.md` → `responseNote`

## 2. Photography (real photos only, no stock, no AI)

Two real photos are in use: the studio portrait (home hero, About, social card) and the street look (Lifestyle). Confirm photographer credits and that both are cleared for web use.

| Where | Placeholder | Suggested shot | File / field |
|---|---|---|---|
| Marketing | Wide 21:9 | Bhoza leading a strategy session with a brand team | `content/pages/marketing.md` → `image`, `imageAlt` |
| Music hero | 4:5 | DJ Bhoza behind the decks, mid-set | `content/dj.json` → `profileImage` |
| Music, "From the booth" gallery | 4 photos | Behind the decks, crowd from the booth, hands on the mixer, on the mic | `content/dj.json` → `gallery[].image` |
| Speaking hero | 4:5 | Bhoza on stage at a conference | `content/pages/speaking.md` → `image`, `imageAlt` |
| Soul Connex | Main 21:9 + 6 gallery | Crowd at peak, booth, dance floor, arrivals, mic, decor, end of night | `content/events.json` → `image`, `gallery[]` |
| The Ultimate Camping Experience | Main 21:9 + 6 gallery | Campsite at dusk, sunset set, long-table dinner, coffee, fire, group photo | `content/events.json` |
| Gospel Brunch | Main 21:9 + 6 gallery | Choir and tables, live performance, guests, food, full room | `content/events.json` |
| Lifestyle lookbook | 3 photos | Signature tee, headwear, full outfit | `content/pages/lifestyle.md` → `looks[].image` |
| Marketing, selected work | 3 case-study images | One per case study | `content/pages/marketing.md` → `cases` |

## 3. Logos

- [ ] Lawyers for the Arts South Africa logo + website link: `content/projects.json`
- [ ] Rise Limpopo logo + website link
- [ ] Female DJ Network logo + website link
- [ ] Two further creative industry projects (names, descriptions, logos, links). Currently "Creative industry project" placeholders
- [ ] Partner and collaborator names for Music → Partnerships: `content/dj.json` → `partners` (placeholders are hidden; the page shows "will be listed here once confirmed")

## 4. Facts to confirm with Bhoza

Taken from her public Music In Africa profile and the previous site:

- [ ] On air as a presenter at Audwax and DYR
- [ ] Managing artists since 2003; roster has included DJ Ganyani, DJ Josi Chave, Ismail Abrahams, plus actors and actresses
- [ ] Music industry qualification from Wits University (also used in the JSON-LD as `alumniOf`)
- [ ] Partner at the Female DJ Network
- [ ] Her role at Lawyers for the Arts South Africa and Rise Limpopo (currently "Role to confirm")
- [ ] "Creative Industry Big Sista" and the About copy on leadership and advocacy
- [ ] About → Milestones: years for every row marked "Year to confirm": `content/pages/about.md`
- [ ] About → Selected achievements: four placeholder lines to replace: `content/pages/about.md` → `achievements`

## 5. Sample copy to replace or approve

- [ ] **Event descriptions.** Summaries, stories and facts (format, venue, year, role) for all three events were written for the concept: `content/events.json` (`"placeholder": true` shows a note on each event page)
- [ ] **DJ sound.** "Soulful, deep and afro house…": `content/dj.json` → `sound`
- [ ] **DJ appearances.** Six sample rows: `content/dj.json` → `appearances`
- [ ] **Speaking topics.** Five suggested talks: `content/speaking.json` → `topics`
- [ ] **Engagements.** Four sample rows: `content/speaking.json` → `engagements`
- [ ] **Interviews and media.** Three sample rows, including the Music In Africa profile link: `content/speaking.json` → `media`
- [ ] **Marketing case studies.** Three "Case study to come" entries: `content/pages/marketing.md`
- [ ] **Lifestyle text.** `content/pages/lifestyle.md` and `content/pages/home.md` → `lifestyleText`
- [ ] Review all page intros and the home statement for voice

## 6. Video

- [ ] DJ Bhoza live set: `content/dj.json` → `video.youtube` or `video.vimeo`
- [ ] Speaking: keynote or panel clip, interview clip: `content/speaking.json` → `videos`
- [ ] One highlights film per event: `content/events.json` → `video`

## 7. Domain

- [ ] If the site moves from `missbhoza.mrpoint.online` to `bhoza.co.za`: update `siteUrl` in `content/site.json` (canonical URLs, sitemap, social cards) and `site_url` in `admin/config.yml`.
