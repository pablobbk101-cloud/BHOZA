// Static site build:  node build.mjs  ->  dist/
// Reads /content (JSON + Markdown), renders every page, resizes images, writes SEO files.
// Editing content? You never need to touch this file. See README.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { marked } from 'marked';
import sharp from 'sharp';

process.chdir(path.dirname(fileURLToPath(import.meta.url)));
const OUT = 'dist';
const t0 = Date.now();

/* ------------------------------------------------------------------ content */
const json = (f) => JSON.parse(fs.readFileSync(`content/${f}.json`, 'utf8'));
const md = (f) => {
  const raw = fs.readFileSync(`content/pages/${f}.md`, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return { ...(m ? yaml.load(m[1]) || {} : {}), body: (m ? m[2] : raw).trim() };
};
const site = json('site');
const expertise = json('expertise').items;
const events = json('events').items;
const projects = json('projects').items;
const dj = json('dj');
const speaking = json('speaking');
const P = Object.fromEntries(['home', 'about', 'marketing', 'music', 'events', 'speaking', 'ventures', 'lifestyle', 'contact'].map((k) => [k, md(k)]));

const SITE = (process.env.SITE_URL || site.siteUrl).replace(/\/$/, '');
const YEAR = new Date().getFullYear();
const TODAY = new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ helpers */
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const html = (s = '') => marked.parse(String(s));
const inline = (s = '') => marked.parseInline(String(s));
const ext = (url) => /^https?:/.test(url || '');
const rowArrow = '<span class="idx__a" aria-hidden="true"></span>';
const arrow = '';
const out = '';
const newTab = '<span class="vh"> (opens in a new tab)</span>';
const sample = (on) => (on ? ' <span class="chip">To confirm</span>' : '');

/* ------------------------------------------------------------------ images */
// Any "/images/..." path in content is resized to WebP at build time and served with width/height,
// so swapping a placeholder for a real photo never shifts the layout.
const IMG = new Map();
const WIDTHS = [480, 800, 1200, 1600];
async function prepImage(src) {
  if (!src || IMG.has(src) || ext(src)) return;
  const file = src.replace(/^\//, '');
  if (!fs.existsSync(file)) { console.warn(`! missing image ${src}`); return; }
  const meta = await sharp(file).metadata();
  const base = file.replace(/\.[a-z0-9]+$/i, '');
  const widths = [...WIDTHS.filter((w) => w < meta.width), Math.min(meta.width, 2000)];
  const set = [];
  for (const w of widths) {
    const o = path.join(OUT, `${base}-${w}.webp`);
    fs.mkdirSync(path.dirname(o), { recursive: true });
    if (!fs.existsSync(o) || fs.statSync(o).mtimeMs < fs.statSync(file).mtimeMs) await sharp(file).rotate().resize(w).webp({ quality: 80 }).toFile(o);
    set.push(`/${base}-${w}.webp ${w}w`);
  }
  fs.copyFileSync(file, path.join(OUT, file));
  IMG.set(src, { w: meta.width, h: meta.height, srcset: set.join(', ') });
}
function collectImages(v, acc = new Set()) {
  if (typeof v === 'string' && /^\/images\/.+\.(jpe?g|png|webp|avif)$/i.test(v)) acc.add(v);
  else if (Array.isArray(v)) v.forEach((x) => collectImages(x, acc));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => collectImages(x, acc));
  return acc;
}

// Placeholder block: clearly labelled, same box as the final photo.
const ph = (label, ratio = '4x5', kind = 'Photo') =>
  `<div class="ph r-${ratio}" role="img" aria-label="${esc(`${kind} placeholder: ${label}`)}"><span class="ph__tag" aria-hidden="true">${esc(kind)} to come</span><span class="ph__label" aria-hidden="true">${esc(label)}</span></div>`;

// A real image if one is set, a placeholder if not. Always inside a fixed-ratio box.
function media(src, { alt = '', label = '', ratio = '4x5', sizes = '100vw', eager = false, pos = '' } = {}) {
  if (!src) return ph(label || alt, ratio);
  const i = IMG.get(src);
  if (!i) return ext(src)
    ? `<div class="media r-${ratio}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async"></div>`
    : ph(label || alt, ratio);
  return `<div class="media r-${ratio}${pos ? ` pos-${pos}` : ''}"><img src="${esc(src)}" srcset="${i.srcset}" sizes="${sizes}" width="${i.w}" height="${i.h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></div>`;
}

// Lightbox gallery. Ratios cycle so the grid reads as an editorial spread, not a product wall.
const RATIOS = ['4x5', '1x1', '4x5', '3x2', '4x5', '1x1'];
const gallery = (items, title) => `
<ul class="gal${items.length === 4 ? ' gal--4' : ''}" data-gallery aria-label="${esc(title)} gallery">
  ${items.map((g, i) => `<li class="gal__i gal__i--${i % 6}">
    <button class="gal__btn" type="button" data-lb="${i}"><span class="vh">Open image ${i + 1} of ${items.length}:</span>
      ${media(g.image, { alt: g.alt || g.label, label: g.label, ratio: RATIOS[i % 6], sizes: '(min-width: 900px) 33vw, 50vw' })}
    </button>
    <p class="gal__cap">${esc(g.label)}</p>
  </li>`).join('')}
</ul>`;

// Video: a click-to-load facade, so YouTube/Vimeo never load until someone presses play.
function video(v, label) {
  const title = v.title || label;
  if (v.youtube) return `<div class="video r-16x9" data-video="https://www.youtube-nocookie.com/embed/${esc(v.youtube)}?autoplay=1&amp;rel=0" data-title="${esc(title)}">
    <img src="https://i.ytimg.com/vi/${esc(v.youtube)}/hqdefault.jpg" alt="" loading="lazy" decoding="async" width="480" height="360">
    <button class="video__play" type="button"><span class="video__icon" aria-hidden="true"></span><span class="video__t">Play video<span class="vh">: ${esc(title)}</span></span></button></div>`;
  if (v.vimeo) return `<div class="video r-16x9" data-video="https://player.vimeo.com/video/${esc(v.vimeo)}?autoplay=1&amp;dnt=1" data-title="${esc(title)}">
    <button class="video__play" type="button"><span class="video__icon" aria-hidden="true"></span><span class="video__t">Play video<span class="vh">: ${esc(title)}</span></span></button></div>`;
  return ph(label || title, '16x9', 'Video');
}

/* ------------------------------------------------------------------ partials */
const NAV = [
  ['/about/', 'About'], ['/marketing/', 'Marketing'], ['/music/', 'Music'], ['/events/', 'Events'],
  ['/speaking/', 'Speaking'], ['/ventures/', 'Ventures'], ['/lifestyle/', 'Lifestyle'], ['/contact/', 'Contact'],
];
const NAV_LONG = {
  '/about/': 'About Bhoza', '/marketing/': 'Marketing and strategy', '/music/': 'Music and entertainment', '/events/': 'Events and experiences',
  '/speaking/': 'Speaking and media', '/ventures/': 'Projects and ventures', '/lifestyle/': 'The Bhoza Lifestyle', '/contact/': 'Contact and bookings',
};
const enquire = (key) => `/contact/?type=${key}#enquiry`;
const socials = site.socials.filter((s) => s.url);

const header = (cur) => `
<a class="skip" href="#main">Skip to content</a>
<header class="hd" data-hd>
  <div class="hd__in wrap">
    <a class="hd__brand" href="/"${cur === '/' ? ' aria-current="page"' : ''}><span class="hd__name">Bhoza Mphela</span><span class="hd__tag" aria-hidden="true">${esc(site.tagline)}</span></a>
    <nav class="hd__nav" aria-label="Main">
      <ul>${NAV.slice(0, -1).map(([u, t]) => `<li><a href="${u}"${cur.startsWith(u) ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul>
    </nav>
    <a class="btn btn--sm hd__cta" href="/contact/"${cur === '/contact/' ? ' aria-current="page"' : ''}><span>Work with Bhoza</span></a>
    <button class="hd__menu" type="button" aria-expanded="false" aria-controls="menu" data-menu-btn><span class="hd__menu-t">Menu</span><span class="hd__burger" aria-hidden="true"><i></i><i></i></span></button>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <div class="menu__in wrap">
    <nav aria-label="Menu">
      <ul class="menu__list">
        <li><a href="/"${cur === '/' ? ' aria-current="page"' : ''}>Home</a></li>
        ${NAV.map(([u]) => `<li><a href="${u}"${cur.startsWith(u) ? ' aria-current="page"' : ''}>${NAV_LONG[u]}</a></li>`).join('')}
      </ul>
    </nav>
    <div class="menu__foot">
      <a class="btn" href="/contact/"><span>Work with Bhoza</span>${arrow}</a>
      <a class="tl" href="${enquire('dj')}">Book a set</a>
      <a class="tl" href="${enquire('speaking')}">Speaking enquiry</a>
    </div>
  </div>
</div>`;

const footer = () => `
<footer class="ft on-dark">
  <div class="wrap">
    <div class="ft__top">
      <p class="ft__tag">Soul. Style. Substance.</p>
      <ul class="ft__ctas">
        <li><a class="btn btn--light" href="/contact/"><span>Work with Bhoza</span>${arrow}</a></li>
        <li><a class="btn btn--ghost-light" href="${enquire('dj')}"><span>Book a set</span>${arrow}</a></li>
        <li><a class="btn btn--ghost-light" href="${enquire('speaking')}"><span>Speaking enquiry</span>${arrow}</a></li>
      </ul>
    </div>
    <div class="ft__cols">
      <nav class="ft__col" aria-label="Footer">
        <h2 class="label">Explore</h2>
        <ul><li><a href="/">Home</a></li>${NAV.map(([u]) => `<li><a href="${u}">${NAV_LONG[u]}</a></li>`).join('')}</ul>
      </nav>
      <div class="ft__col">
        <h2 class="label">Enquiries</h2>
        <ul>${site.enquiries.map((e) => `<li><a href="${enquire(e.key)}">${esc(e.label)}</a></li>`).join('')}</ul>
      </div>
      <div class="ft__col">
        <h2 class="label">Follow</h2>
        <ul>${socials.map((s) => `<li><a href="${esc(s.url)}" rel="me noopener" target="_blank">${esc(s.name)}${newTab}</a></li>`).join('')}</ul>
      </div>
      <div class="ft__col">
        <h2 class="label">Contact</h2>
        <ul>
          <li><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
          ${site.phone ? `<li><a href="tel:${esc(site.phone.replace(/\s/g, ''))}">${esc(site.phone)}</a></li>` : ''}
          <li>${esc(site.location)}</li>
        </ul>
      </div>
    </div>
    <div class="ft__base">
      <p>&copy; ${YEAR} ${esc(site.name)}. All rights reserved.</p>
      <p class="ft__credit">${esc(site.credit.text)} | <a href="${esc(site.credit.siteUrl)}" rel="noopener" target="_blank">${esc(site.credit.site)}${newTab}</a> | <a href="tel:${esc(site.credit.phone.replace(/\s/g, ''))}">${esc(site.credit.phone)}</a></p>
    </div>
  </div>
</footer>`;

// Page hero used by inner pages
const pageHead = ({ label, heading, lead, crumbs }) => `
  ${crumbs ? `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map(([u, t], i) => i < crumbs.length - 1 ? `<li><a href="${u}">${esc(t)}</a></li>` : `<li><span aria-current="page">${esc(t)}</span></li>`).join('')}</ol></nav>` : ''}
  <h1 class="h1">${esc(heading)}</h1>
  ${label ? `<p class="meta">${esc(label)}</p>` : ''}
  ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}`;

// Closing call to action band
const ctaBand = ({ title, text, links, tone = 'sand' }) => `
<section class="cta tone-${tone}" aria-labelledby="cta-h">
  <div class="wrap g">
    <h2 class="h2 cta__h" id="cta-h">${title}</h2>
    <div class="cta__b">
      ${text ? `<p>${esc(text)}</p>` : ''}
      <div class="btns">${links.map(([u, t], i) => `<a class="btn${i ? ' btn--ghost' : ''}" href="${u}"><span>${esc(t)}</span>${arrow}</a>`).join('')}</div>
    </div>
  </div>
</section>`;

// Enquiry form. Works without JavaScript (posts and redirects), and with it (inline validation + success state).
const field = (name, label, input, hint = '') => `
<div class="field" data-field="${name}">
  <label for="f-${name}">${label}</label>
  ${hint ? `<p class="field__hint" id="f-${name}-hint">${hint}</p>` : ''}
  ${input}
  <p class="field__err" id="f-${name}-err" hidden></p>
</div>`;
const desc = (n, hint) => `aria-describedby="${hint ? `f-${n}-hint ` : ''}f-${n}-err"`;
const enquiryForm = (preset = '') => `
<div class="enq" id="enquiry">
  <form class="form" data-form data-email="${esc(site.email)}" action="${esc(site.formEndpoint || '/api/contact')}" method="post" novalidate>
    <div class="form__summary" data-summary role="alert" tabindex="-1" hidden></div>
    <div class="form__row">
      ${field('name', 'Your name', `<input id="f-name" name="name" type="text" autocomplete="name" required maxlength="120" ${desc('name')}>`)}
      ${field('email', 'Email address', `<input id="f-email" name="email" type="email" autocomplete="email" required maxlength="200" ${desc('email')}>`)}
    </div>
    <div class="form__row">
      ${field('phone', 'Phone <span class="opt">(optional)</span>', `<input id="f-phone" name="phone" type="tel" autocomplete="tel" maxlength="40" ${desc('phone')}>`)}
      ${field('organisation', 'Organisation <span class="opt">(optional)</span>', `<input id="f-organisation" name="organisation" type="text" autocomplete="organization" maxlength="160" ${desc('organisation')}>`)}
    </div>
    ${field('category', 'What is this about?', `<div class="select"><select id="f-category" name="category" required ${desc('category')} data-preset="${esc(preset)}">
        <option value="">Choose a category</option>
        ${site.enquiries.map((e) => `<option value="${e.key}"${e.key === preset ? ' selected' : ''}>${esc(e.label)}</option>`).join('')}
      </select></div>`)}
    <div class="form__row">
      ${field('date', 'Event date <span class="opt">(if there is one)</span>', `<input id="f-date" name="date" type="date" ${desc('date')}>`)}
      ${field('location', 'City or venue <span class="opt">(optional)</span>', `<input id="f-location" name="location" type="text" maxlength="160" ${desc('location')}>`)}
    </div>
    ${field('message', 'Tell us more', `<textarea id="f-message" name="message" rows="6" required minlength="20" maxlength="5000" ${desc('message', true)}></textarea>`, 'The occasion, the audience, budget range and anything else that helps.')}
    <div class="hp" aria-hidden="true"><label for="f-website">Leave this empty</label><input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
    <div class="form__end">
      <button class="btn" type="submit" data-submit><span>Send enquiry</span>${arrow}</button>
      <p class="form__note">Your details are only used to reply to this enquiry.</p>
    </div>
  </form>
  <div class="form__ok" data-form-ok tabindex="-1" hidden>
    <h2 class="h2">Thank you. Your message is on its way.</h2>
    <p>${esc(P.contact.responseNote || '')} If it is urgent, email <a class="tl" href="mailto:${esc(site.email)}">${esc(site.email)}</a>.</p>
    <button class="btn btn--ghost" type="button" data-form-again><span>Send another enquiry</span></button>
  </div>
</div>`;

/* ------------------------------------------------------------------ layout */
const CSS = fs.readFileSync('src/site.css', 'utf8');
const JS = fs.readFileSync('src/site.js', 'utf8');
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
const V = { css: hash(CSS), js: hash(JS) };
// The only inline script: flags JS before first paint so reveal styles never flash. Its hash goes into the CSP.
const BOOT = "document.documentElement.classList.add('js')";
const BOOT_HASH = crypto.createHash('sha256').update(BOOT).digest('base64');

const person = {
  '@type': 'Person', '@id': `${SITE}/#bhoza`, name: site.name, alternateName: ['DJ Bhoza', 'MissBhoza'],
  url: `${SITE}/`, image: `${SITE}${site.heroImage}`, description: site.intro, email: `mailto:${site.email}`,
  slogan: site.tagline,
  jobTitle: ['Marketing professional', 'DJ', 'MC', 'Artist manager', 'Event curator', 'Speaker', 'Entrepreneur'],
  address: { '@type': 'PostalAddress', addressLocality: 'Johannesburg', addressCountry: 'ZA' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of the Witwatersrand' },
  knowsAbout: ['Marketing strategy', 'Brand positioning', 'Artist management', 'Event curation', 'DJing', 'Public speaking', 'Creative industries'],
  sameAs: socials.map((s) => s.url),
};

const PAGES = [];
function page({ url, title, description, body, ld = [], crumbs, cls = '', image }) {
  PAGES.push(url);
  const canonical = `${SITE}${url}`;
  const og = `${SITE}${image || site.ogImage}`;
  const graph = [...ld];
  // preload the above-the-fold photo so it is the first image the browser fetches
  const hero = body.match(/<img src="[^"]+" srcset="([^"]+)" sizes="([^"]+)"[^>]*fetchpriority="high"/);
  const preload = hero ? `<link rel="preload" as="image" type="image/webp" imagesrcset="${hero[1]}" imagesizes="${hero[2]}" fetchpriority="high">\n` : '';
  if (crumbs) graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs.map(([u, t], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: `${SITE}${u}` })) });
  const doc = `<!doctype html>
<html lang="en-ZA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#F4F0E8">
<meta property="og:type" content="${url === '/' ? 'website' : 'article'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="en_ZA">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(`${site.name}. ${site.tagline}`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@MissBhoza">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${og}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/cormorant.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
${preload}<link rel="stylesheet" href="/assets/site.css?v=${V.css}">
<script>${BOOT}</script>
<script src="/assets/site.js?v=${V.js}" defer></script>
${graph.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body class="${cls}"${site.analytics ? ` data-analytics="${esc(site.analytics)}"` : ''}>
${header(url)}
<main id="main" tabindex="-1">
${body}
</main>
${footer()}
</body>
</html>
`;
  const file = url.endsWith('.html') ? path.join(OUT, url) : path.join(OUT, url, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, doc);
}

/* ================================================================== PAGES */

/* ---------- Home */
function home() {
  const h = P.home;
  const [lead, ...rest] = events;
  const roles = site.roles;
  page({
    url: '/', title: h.title, description: h.description, cls: 'p-home',
    ld: [person, { '@type': 'WebSite', '@id': `${SITE}/#site`, url: `${SITE}/`, name: site.name, publisher: { '@id': `${SITE}/#bhoza` } }],
    body: `
<section class="hero wrap g" aria-labelledby="hero-h">
  <div class="hero__text">
    <h1 class="display" id="hero-h">Creative Industry <em>Big Sista.</em></h1>
    <p class="roles" data-roles>
      <span class="roles__lead">${esc(site.name)},</span>
      <span class="roles__all">${roles.map(esc).join(', ')}.</span>
      <span class="roles__swap" aria-hidden="true">${roles.map((r, i) => `<span class="roles__w"${i ? '' : ' data-on'}>${esc(r)}.</span>`).join('')}</span>
    </p>
    <p class="hero__intro">${esc(site.intro)}</p>
    <div class="btns">
      <a class="btn" href="/contact/"><span>Work with Bhoza</span>${arrow}</a>
      <a class="btn btn--ghost" href="${enquire('dj')}"><span>Book a set</span>${arrow}</a>
      <a class="tl hero__tl" href="${enquire('speaking')}">Speaking enquiry</a>
    </div>
  </div>
  <figure class="hero__fig">
    ${media(site.heroImage, { alt: site.heroImageAlt, ratio: '3x4', eager: true, sizes: '(min-width: 900px) 40vw, 100vw', pos: 'top' })}
    <figcaption class="cap">Johannesburg. In the creative industries since ${esc(site.since)}.</figcaption>
  </figure>
</section>

<section class="statement wrap g" aria-label="Introduction">
  <div class="statement__b">
    <p class="statement__t" data-rv>${esc(h.statement)}</p>
    <a class="al" href="/about/" data-rv><span>Read her story</span>${arrow}</a>
  </div>
</section>

<section class="expertise wrap g" aria-labelledby="exp-h">
  <div class="expertise__head">
    <h2 class="h2" id="exp-h">One name, <em>many rooms.</em></h2>
    <p class="muted">Seven disciplines, one standard. Choose a room to see the work.</p>
  </div>
  <ul class="idx">
    ${expertise.map((e) => `<li data-rv><a class="idx__row" href="${esc(e.link)}"><span class="idx__t">${esc(e.title)}</span><span class="idx__l">${esc(e.line)}</span>${rowArrow}</a></li>`).join('')}
  </ul>
</section>

<section class="featured tone-sand" aria-labelledby="feat-h">
  <div class="wrap">
    <div class="sec-head g">
      <h2 class="h2" id="feat-h">Featured experiences</h2>
      <a class="al sec-head__a" href="/events/"><span>All events and experiences</span>${arrow}</a>
    </div>
    <div class="feat g">
      <a class="card card--lg" href="/events/${lead.slug}/" data-rv>
        ${media(lead.image, { label: lead.imageLabel, ratio: '4x3', sizes: '(min-width: 900px) 55vw, 100vw' })}
        <span class="card__t">${esc(lead.title)}</span>
        <span class="card__k">${esc(lead.kind)}</span>
        <span class="card__s">${esc(lead.summary)}</span>
      </a>
      <div class="feat__side">
        ${rest.map((e) => `<a class="card" href="/events/${e.slug}/" data-rv>
          ${media(e.image, { label: e.imageLabel, ratio: '3x2', sizes: '(min-width: 900px) 35vw, 100vw' })}
          <span class="card__t">${esc(e.title)}</span>
          <span class="card__k">${esc(e.kind)}</span>
        </a>`).join('')}
      </div>
    </div>
    <div class="ventures-strip g">
      <h3 class="ventures-strip__h label">Projects and ventures</h3>
      <ul>
        ${projects.slice(0, 3).map((v) => `<li><a href="/ventures/#${slug(v.title)}"><span class="vs__t">${esc(v.title)}</span><span class="vs__c">${esc(v.category)}</span>${rowArrow}</a></li>`).join('')}
      </ul>
    </div>
  </div>
</section>

<section class="credits wrap g" aria-labelledby="cred-h">
  <h2 class="label credits__h" id="cred-h">On air, on the roster and in the network</h2>
  <ul class="credits__list" data-rv>${h.credits.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
</section>

<section class="life tone-sage on-dark" aria-labelledby="life-h">
  <div class="wrap g">
    <figure class="life__fig" data-rv>
      ${media('/images/bhoza-lifestyle-close.jpg', { alt: 'Bhoza Mphela in a black cap, hoop earrings and a white tee printed with an afro silhouette, one hand on her cap.', ratio: '4x5', sizes: '(min-width: 900px) 40vw, 100vw' })}
    </figure>
    <div class="life__b">
      <h2 class="h2" id="life-h">${esc(h.lifestyleTitle)}</h2>
      <p class="life__t">${esc(h.lifestyleText)}</p>
      <div class="btns">
        <a class="btn btn--light" href="${esc(site.shopUrl)}" target="_blank" rel="noopener"><span>Visit the store</span>${out}${newTab}</a>
        <a class="tl" href="/lifestyle/">About the collection</a>
      </div>
    </div>
  </div>
</section>

<section class="enquire wrap g" aria-labelledby="enq-h">
  <div class="enquire__head">
    <h2 class="h2" id="enq-h">How can we <em>work together?</em></h2>
    <p class="muted">Choose the kind of enquiry and it goes straight to the right desk.</p>
    <a class="tl" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
  </div>
  <ul class="idx idx--compact">
    ${site.enquiries.map((e) => `<li><a class="idx__row" href="${enquire(e.key)}"><span class="idx__t">${esc(e.label)}</span><span class="idx__l">${esc(e.desc)}</span>${rowArrow}</a></li>`).join('')}
  </ul>
</section>`,
  });
}

/* ---------- About */
function about() {
  const a = P.about;
  const sections = a.body.split(/^## /m).filter(Boolean).map((s) => { const [t, ...b] = s.split('\n'); return { t: t.trim(), b: b.join('\n') }; });
  page({
    url: '/about/', title: a.title, description: a.description, crumbs: [['/', 'Home'], ['/about/', 'About']], ld: [person], cls: 'p-about',
    body: `
<section class="phead wrap g">
  <div class="phead__t">${pageHead({ label: `${site.location.split(',')[0]}, since ${site.since}`, heading: a.heading, lead: a.lead })}</div>
  <figure class="phead__fig">${media(a.image, { alt: a.imageAlt, ratio: '4x5', eager: true, sizes: '(min-width: 900px) 33vw, 100vw', pos: 'top' })}</figure>
</section>
<div class="bio wrap">
  ${sections.map((s, i) => `<section class="bio__s g" aria-labelledby="bio-${i}">
    <h2 class="h3 bio__h" id="bio-${i}">${esc(s.t)}</h2>
    <div class="prose" data-rv>${html(s.b)}</div>
  </section>`).join('')}
</div>
<section class="quote on-dark tone-dark" aria-label="Tagline">
  <div class="wrap"><p class="quote__t" data-rv>${esc(a.quote)}</p></div>
</section>
<section class="miles wrap g" aria-labelledby="miles-h">
  <h2 class="h2 miles__h" id="miles-h">Milestones</h2>
  <ol class="miles__list">
    ${a.milestones.map((m) => `<li data-rv><span class="miles__w label">${esc(m.when)}</span><span class="miles__t">${esc(m.what)}</span></li>`).join('')}
  </ol>
</section>
<section class="ach tone-sand" aria-labelledby="ach-h">
  <div class="wrap g">
    <h2 class="h2 ach__h" id="ach-h">Selected achievements <em>and contributions</em></h2>
    <ul class="ach__list">${a.achievements.map((x) => `<li data-rv>${esc(x)}</li>`).join('')}</ul>
  </div>
</section>
${ctaBand({ title: 'Work with Bhoza', text: 'Marketing, music, events or a voice for your stage. Start with a short enquiry.', links: [['/contact/', 'Start an enquiry'], [enquire('speaking'), 'Speaking enquiry']], tone: 'ivory' })}`,
  });
}

/* ---------- Marketing */
function marketing() {
  const m = P.marketing;
  page({
    url: '/marketing/', title: m.title, description: m.description, crumbs: [['/', 'Home'], ['/marketing/', 'Marketing and strategy']], cls: 'p-mkt',
    body: `
<section class="phead phead--wide wrap g">
  <div class="phead__t">${pageHead({ heading: m.heading })}</div>
  <p class="lead phead__lead">${esc(m.lead)}</p>
  <figure class="phead__wide">${media(m.image, { alt: m.imageAlt, label: m.imageLabel, ratio: '21x9', sizes: '100vw' })}</figure>
</section>
<section class="svc wrap" aria-labelledby="svc-h">
  <h2 class="h2" id="svc-h">What she <em>does for brands</em></h2>
  <ul class="svc__list">
    ${m.services.map((s) => `<li class="svc__i g" data-rv><h3 class="h3 svc__t">${esc(s.title)}</h3><p class="svc__b">${esc(s.body)}</p></li>`).join('')}
  </ul>
</section>
<section class="process tone-dark on-dark" aria-labelledby="proc-h">
  <div class="wrap">
    <h2 class="h2" id="proc-h">How a project runs</h2>
    <ol class="process__list">
      ${m.process.map((p, i) => `<li data-rv><span class="process__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3 class="h3">${esc(p.title)}</h3><p>${esc(p.body)}</p></li>`).join('')}
    </ol>
  </div>
</section>
<section class="cases wrap g" aria-labelledby="cases-h">
  <div class="cases__head">
    <h2 class="h2" id="cases-h">Selected work</h2>
    <p class="muted">${esc(m.casesIntro)}</p>
  </div>
  <ul class="cases__list">
    ${m.cases.map((c) => `<li class="cases__i" data-rv>${ph(`${c.note} case study image`, '3x2')}<h3 class="h3">${esc(c.title)}</h3><p class="meta">${esc(c.note)}${sample(c.placeholder)}</p><p class="muted">${esc(c.client)}</p></li>`).join('')}
  </ul>
</section>
${ctaBand({ title: 'Have a brand that needs <em>a sharper story?</em>', text: 'Tell us about the business, the audience and the moment you are planning for.', links: [[enquire('marketing'), 'Work with Bhoza'], [enquire('partnerships'), 'Partnership enquiry']] })}`,
  });
}

/* ---------- Music */
function music() {
  const m = P.music;
  page({
    url: '/music/', title: m.title, description: m.description, crumbs: [['/', 'Home'], ['/music/', 'Music and entertainment']], cls: 'p-music',
    body: `
<div class="tone-dark on-dark mhero">
  <section class="phead wrap g">
    <div class="phead__t">${pageHead({ heading: m.heading, lead: m.lead })}
      <nav class="subnav" aria-label="On this page"><ul>
        <li><a href="#dj">DJ Bhoza</a></li><li><a href="#mc">MC and hosting</a></li><li><a href="#management">Artist management</a></li><li><a href="#experience">Industry experience</a></li><li><a href="#partners">Partnerships</a></li>
      </ul></nav>
    </div>
    <figure class="phead__fig">${media(dj.profileImage, { label: dj.profileImageLabel, ratio: '4x5', eager: true })}</figure>
  </section>
</div>
<section class="dj wrap g" id="dj" aria-labelledby="dj-h">
  <div class="dj__b">
    <h2 class="h2" id="dj-h">${esc(m.djHeading)}</h2>
    <p class="lead-s">${esc(m.djText)}</p>
    <dl class="facts"><div><dt class="label">Sound</dt><dd>${esc(dj.sound)}${sample(dj.soundPlaceholder)}</dd></div><div><dt class="label">Plays</dt><dd>Clubs, festivals, brand activations, private events</dd></div></dl>
    <div class="btns"><a class="btn" href="${enquire('dj')}"><span>Book a set</span>${arrow}</a></div>
  </div>
  <div class="dj__apps">
    <h3 class="h3">Selected appearances</h3>
    <ul class="rows">${dj.appearances.map((a) => `<li class="rows__i" data-rv><span class="rows__d label">${esc(a.date)}</span><span class="rows__t">${esc(a.event)}${sample(a.placeholder)}</span><span class="rows__m">${esc(a.place)}</span></li>`).join('')}</ul>
  </div>
</section>
<section class="wrap block" aria-labelledby="djg-h">
  <h3 class="h3 block__h" id="djg-h">From the booth</h3>
  ${gallery(dj.gallery, 'DJ Bhoza')}
  <div class="vid-wrap">${video(dj.video, 'DJ Bhoza live set')}</div>
</section>
<section class="mc tone-sand" id="mc" aria-labelledby="mc-h">
  <div class="wrap g">
    <div class="mc__b">
      <h2 class="h2" id="mc-h">${esc(m.mcHeading)}</h2>
      <p class="lead-s">${esc(m.mcText)}</p>
      <div class="btns"><a class="btn" href="${enquire('mc')}"><span>Book an MC</span>${arrow}</a></div>
    </div>
    <ul class="mc__list">${m.mcList.map((x) => `<li data-rv>${esc(x)}</li>`).join('')}</ul>
  </div>
</section>
<section class="mgmt wrap g" id="management" aria-labelledby="mg-h">
  <div class="mgmt__b">
    <h2 class="h2" id="mg-h">${esc(m.managementHeading)}</h2>
    <p class="lead-s">${esc(m.managementText)}</p>
  </div>
  <div class="mgmt__roster">
    <h3 class="label">On the roster over the years</h3>
    <ul class="roster">${dj.roster.map((r) => `<li data-rv>${esc(r)}</li>`).join('')}</ul>
  </div>
</section>
<section class="exp wrap g" id="experience" aria-labelledby="ex-h">
  <h2 class="h2 exp__h" id="ex-h">${esc(m.experienceHeading)}</h2>
  <ul class="rows exp__rows">${dj.experience.map((x) => `<li class="rows__i" data-rv><span class="rows__t">${esc(x.title)}</span><span class="rows__m">${esc(x.note)}</span></li>`).join('')}</ul>
</section>
<section class="partners wrap g" id="partners" aria-labelledby="pa-h">
  <div class="partners__head"><h2 class="h2" id="pa-h">${esc(m.partnersHeading)}</h2><p class="muted">${esc(m.partnersText)}</p></div>
  ${dj.partners.filter((p) => !p.placeholder).length
    ? `<ul class="rows partners__rows">${dj.partners.filter((p) => !p.placeholder).map((p) => `<li class="rows__i"><span class="rows__t">${esc(p.title)}</span><span class="rows__m">${esc(p.note)}</span></li>`).join('')}</ul>`
    : '<p class="empty">Partner and collaborator names will be listed here once confirmed.</p>'}
</section>
${ctaBand({ title: 'Book DJ Bhoza <em>or an MC who holds the room</em>', text: 'Share the date, the venue and the kind of night you are planning.', links: [[enquire('dj'), 'Book a set'], [enquire('mc'), 'Book an MC']], tone: 'dark' })}`,
  });
}

/* ---------- Events */
function eventsPage() {
  const e = P.events;
  page({
    url: '/events/', title: e.title, description: e.description, crumbs: [['/', 'Home'], ['/events/', 'Events and experiences']], cls: 'p-events',
    body: `
<section class="phead wrap g">
  <div class="phead__t">${pageHead({ heading: e.heading, lead: e.lead })}</div>
</section>
<section class="caps wrap" aria-label="What she does">
  <ul class="caps__list">${e.capabilities.map((c) => `<li data-rv><h2 class="h3">${esc(c.title)}</h2><p>${esc(c.body)}</p></li>`).join('')}</ul>
</section>
<div class="evlist">
  ${events.map((ev, i) => `<section class="ev wrap g${i % 2 ? ' ev--flip' : ''}" aria-labelledby="ev-${ev.slug}">
    <a class="ev__fig" href="/events/${ev.slug}/" tabindex="-1" aria-hidden="true" data-rv>${media(ev.image, { label: ev.imageLabel, ratio: '4x3', sizes: '(min-width: 900px) 58vw, 100vw' })}</a>
    <div class="ev__b" data-rv>
      <h2 class="h2" id="ev-${ev.slug}">${esc(ev.title)}</h2>
      <p class="meta">${esc(ev.kind)}</p>
      <p class="lead-s">${esc(ev.summary)}</p>
      <a class="al" href="/events/${ev.slug}/"><span>Explore ${esc(ev.title)}</span>${arrow}</a>
    </div>
  </section>`).join('')}
</div>
${ctaBand({ title: 'Bring your brand <em>into the room</em>', text: 'Sponsorships, co-productions and new experiences. Let us build the next one together.', links: [[enquire('events'), 'Event collaboration'], [enquire('partnerships'), 'Sponsorship enquiry']] })}`,
  });

  events.forEach((ev, i) => {
    const next = events[(i + 1) % events.length];
    page({
      url: `/events/${ev.slug}/`, title: `${ev.title} | Events by Bhoza Mphela`, description: ev.summary, cls: 'p-event',
      crumbs: [['/', 'Home'], ['/events/', 'Events'], [`/events/${ev.slug}/`, ev.title]],
      ld: [{ '@type': 'EventSeries', name: ev.title, description: ev.summary, url: `${SITE}/events/${ev.slug}/`, organizer: { '@id': `${SITE}/#bhoza` } }],
      body: `
<section class="phead wrap g">
  <div class="phead__t">${pageHead({ label: ev.kind, heading: ev.title, lead: ev.summary, crumbs: [['/events/', 'Events'], ['', ev.title]] })}</div>
  <figure class="phead__wide">${media(ev.image, { label: ev.imageLabel, ratio: '21x9', eager: true })}</figure>
</section>
<section class="evd wrap g" aria-label="About ${esc(ev.title)}">
  <dl class="facts facts--col">${ev.facts.map((f) => `<div><dt class="label">${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>
  <div class="prose prose--lg" data-rv>${html(ev.body)}${ev.placeholder ? '<p class="note">Placeholder copy. To be confirmed with Bhoza.</p>' : ''}</div>
</section>
<section class="wrap block" aria-labelledby="g-h">
  <h2 class="h2 block__h" id="g-h">Gallery</h2>
  ${gallery(ev.gallery, ev.title)}
</section>
<section class="wrap block" aria-labelledby="v-h">
  <h2 class="h3 block__h" id="v-h">Watch</h2>
  <div class="vid-wrap">${video(ev.video, `${ev.title} film`)}</div>
</section>
<nav class="next wrap" aria-label="Next event">
  <a class="next__a" href="/events/${next.slug}/"><span class="label">Next experience</span><span class="next__t">${esc(next.title)}</span>${rowArrow}</a>
</nav>
${ctaBand({ title: `Partner on the next <em>${esc(ev.title)}</em>`, text: 'Sponsorship, hospitality, media and brand partnerships.', links: [[enquire('events'), 'Event collaboration'], [enquire('partnerships'), 'Sponsorship enquiry']] })}`,
    });
  });
}

/* ---------- Speaking */
function speakingPage() {
  const s = P.speaking;
  page({
    url: '/speaking/', title: s.title, description: s.description, crumbs: [['/', 'Home'], ['/speaking/', 'Speaking and media']], cls: 'p-speak',
    body: `
<section class="phead wrap g">
  <div class="phead__t">${pageHead({ heading: s.heading, lead: s.lead })}
    <div class="btns"><a class="btn" href="#enquiry"><span>Speaking enquiry</span>${arrow}</a></div>
  </div>
  <figure class="phead__fig">${media(s.image, { alt: s.imageAlt, label: s.imageLabel, ratio: '4x5', eager: true, sizes: '(min-width: 900px) 33vw, 100vw' })}</figure>
</section>
<section class="topics wrap g" aria-labelledby="top-h">
  <h2 class="h2 topics__h" id="top-h">Talks and topics</h2>
  <ul class="idx idx--static">${speaking.topics.map((t) => `<li class="idx__row" data-rv><span class="idx__t">${esc(t.title)}</span><span class="idx__l">${esc(t.line)}</span></li>`).join('')}</ul>
</section>
<section class="formats tone-sand" aria-labelledby="fmt-h">
  <div class="wrap g">
    <h2 class="h3 formats__h" id="fmt-h">Formats</h2>
    <ul class="formats__list">${speaking.formats.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
  </div>
</section>
<section class="wrap g engs" aria-labelledby="eng-h">
  <div class="engs__col">
    <h2 class="h3" id="eng-h">Engagements</h2>
    <ul class="rows">${speaking.engagements.map((e) => `<li class="rows__i" data-rv><span class="rows__d label">${esc(e.date)}</span><span class="rows__t">${esc(e.title)}${sample(e.placeholder)}</span><span class="rows__m">${esc(e.org)}<br>${esc(e.kind)}</span></li>`).join('')}</ul>
  </div>
  <div class="engs__col">
    <h2 class="h3">Interviews and media</h2>
    <ul class="rows">${speaking.media.map((x) => `<li class="rows__i" data-rv><span class="rows__d label">${esc(x.kind)}</span><span class="rows__t">${x.url ? `<a class="tl" href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}${newTab}</a>` : esc(x.title)}${sample(x.placeholder)}</span><span class="rows__m">${esc(x.outlet)}</span></li>`).join('')}</ul>
  </div>
</section>
<section class="wrap block" aria-labelledby="sv-h">
  <h2 class="h3 block__h" id="sv-h">On video</h2>
  <div class="vids">${speaking.videos.map((v) => video(v, v.label)).join('')}</div>
</section>
<section class="tone-sand enq-sec" aria-labelledby="se-h">
  <div class="wrap g">
    <div class="enq-sec__head">
      <h2 class="h2" id="se-h">Speaking and appearance enquiries</h2>
      <p class="lead-s">Tell us about the event, the audience and the format. Keynote, panel, workshop, moderation or interview.</p>
    </div>
    ${enquiryForm('speaking')}
  </div>
</section>`,
  });
}

/* ---------- Ventures */
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function venturesPage() {
  const v = P.ventures;
  const seen = {};
  const id = (t) => { const s = slug(t); seen[s] = (seen[s] || 0) + 1; return seen[s] > 1 ? `${s}-${seen[s]}` : s; };
  page({
    url: '/ventures/', title: v.title, description: v.description, crumbs: [['/', 'Home'], ['/ventures/', 'Projects and ventures']], cls: 'p-ventures',
    body: `
<section class="phead wrap g"><div class="phead__t">${pageHead({ heading: v.heading, lead: v.lead })}</div></section>
<ul class="vlist wrap">
  ${projects.map((p) => `<li class="vent g" id="${id(p.title)}" data-rv>
    <div class="vent__logo">${p.logo && IMG.get(p.logo) ? `<img src="${esc(p.logo)}" alt="${esc(p.title)} logo" width="${IMG.get(p.logo).w}" height="${IMG.get(p.logo).h}" loading="lazy">` : `<div class="logo-ph" role="img" aria-label="Logo placeholder: ${esc(p.title)}"><span aria-hidden="true">${esc(p.title)}</span><small aria-hidden="true">Logo to come</small></div>`}</div>
    <div class="vent__b">
      <h2 class="h2 vent__t">${esc(p.title)}</h2>
      <p class="meta">${esc(p.category)}</p>
      <p class="vent__d">${esc(p.description)}</p>
      <p class="vent__r"><span class="label">Role</span> ${esc(p.role)}${sample(p.placeholder)}</p>
      ${p.url ? `<a class="al" href="${esc(p.url)}" target="_blank" rel="noopener"><span>Visit ${esc(p.title)}</span>${out}${newTab}</a>` : '<p class="muted small">Website link to come</p>'}
    </div>
  </li>`).join('')}
  <li class="vent g" id="the-bhoza-lifestyle" data-rv>
    <div class="vent__logo"><div class="logo-ph logo-ph--dark" role="img" aria-label="The Bhoza Lifestyle"><span aria-hidden="true">The Bhoza Lifestyle</span></div></div>
    <div class="vent__b">
      <h2 class="h2 vent__t">The Bhoza Lifestyle</h2>
      <p class="meta">Lifestyle brand</p>
      <p class="vent__d">${esc(P.home.lifestyleText)}</p>
      <p class="vent__r"><span class="label">Role</span> Founder</p>
      <a class="al" href="/lifestyle/"><span>About the collection</span>${arrow}</a>
    </div>
  </li>
</ul>
${ctaBand({ title: 'Partner with <em>a venture</em>', text: 'Sponsorships, programmes and collaborations across her initiatives.', links: [[enquire('partnerships'), 'Partnership enquiry'], [enquire('general'), 'General enquiry']] })}`,
  });
}

/* ---------- Lifestyle */
function lifestylePage() {
  const l = P.lifestyle;
  page({
    url: '/lifestyle/', title: l.title, description: l.description, crumbs: [['/', 'Home'], ['/lifestyle/', 'The Bhoza Lifestyle']], cls: 'p-life',
    body: `
<section class="lhero wrap g">
  <figure class="lhero__fig">${media(l.image, { alt: l.imageAlt, ratio: '3x4', eager: true, sizes: '(min-width: 900px) 45vw, 100vw' })}</figure>
  <div class="lhero__b">
    ${pageHead({ heading: l.heading })}
    <p class="lhero__lead">${esc(l.lead)}</p>
    <div class="prose">${html(l.body)}</div>
    <div class="btns"><a class="btn" href="${esc(site.shopUrl)}" target="_blank" rel="noopener"><span>Visit the store</span>${out}${newTab}</a></div>
    <p class="muted small">The store is a separate site with its own look and checkout. It opens in a new tab.</p>
  </div>
</section>
<section class="look wrap" aria-labelledby="look-h">
  <h2 class="h2" id="look-h">From the lookbook</h2>
  <ul class="look__list">${l.looks.map((x, i) => `<li class="look__i look__i--${i}" data-rv>${media(x.image, { label: x.label, alt: x.alt || x.label, ratio: i === 1 ? '3x4' : '4x5' })}</li>`).join('')}</ul>
</section>
${ctaBand({ title: 'Wear the attitude', text: 'New drops, restocks and the full collection live in the store.', links: [[esc(site.shopUrl), 'Visit the store']], tone: 'sage' }).replace('class="btn" href', 'class="btn btn--light" target="_blank" rel="noopener" href')}`,
  });
}

/* ---------- Contact */
function contactPage() {
  const c = P.contact;
  page({
    url: '/contact/', title: c.title, description: c.description, crumbs: [['/', 'Home'], ['/contact/', 'Contact and bookings']], cls: 'p-contact',
    ld: [{ '@type': 'ContactPage', name: c.title, url: `${SITE}/contact/`, about: { '@id': `${SITE}/#bhoza` } }],
    body: `
<section class="phead wrap g"><div class="phead__t">${pageHead({ heading: c.heading, lead: c.lead })}</div></section>
<section class="contact wrap g" aria-label="Enquiry">
  <div class="contact__side">
    <h2 class="h3">Kinds of enquiry</h2>
    <ul class="picks">${site.enquiries.map((e) => `<li><a class="pick" href="?type=${e.key}#enquiry" data-pick="${e.key}"><span class="pick__t">${esc(e.label)}</span><span class="pick__d">${esc(e.desc)}</span></a></li>`).join('')}</ul>
  </div>
  <div class="contact__form">
    ${enquiryForm('')}
  </div>
  <div class="contact__direct">
    <h2 class="h3">Direct</h2>
    <ul class="direct">
      <li><span class="label">Email</span><a class="tl" href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
      ${site.phone ? `<li><span class="label">Phone</span><a class="tl" href="tel:${esc(site.phone.replace(/\s/g, ''))}">${esc(site.phone)}</a></li>` : ''}
      <li><span class="label">Based in</span>${esc(site.location)}</li>
    </ul>
    <h2 class="h3">Social</h2>
    <ul class="direct">${site.socials.map((s) => `<li><span class="label">${esc(s.name)}</span>${s.url ? `<a class="tl" href="${esc(s.url)}" target="_blank" rel="me noopener">${esc(s.handle)}${newTab}</a>` : '<span class="muted">Link to come</span>'}</li>`).join('')}</ul>
  </div>
</section>`,
  });
}

/* ---------- 404 */
function notFound() {
  page({
    url: '/404.html', title: 'Page not found | Bhoza Mphela', description: 'This page could not be found.', cls: 'p-404',
    body: `
<section class="nf wrap g">
  <div class="nf__b">
    <h1 class="display">This page has <em>left the room.</em></h1>
    <p class="meta">Error 404</p>
    <p class="lead">It may have moved, or the link may be mistyped. These rooms are still open:</p>
    <ul class="idx idx--compact">${[['/', 'Home', 'Start at the beginning'], ...NAV.map(([u]) => [u, NAV_LONG[u], ''])].map(([u, t, l]) => `<li><a class="idx__row" href="${u}"><span class="idx__t">${esc(t)}</span><span class="idx__l">${esc(l)}</span>${rowArrow}</a></li>`).join('')}</ul>
  </div>
</section>`,
  });
  PAGES.pop(); // not in the sitemap
}

/* ------------------------------------------------------------------ static files */
function writeStatic() {
  const cp = (a, b) => { fs.mkdirSync(path.dirname(path.join(OUT, b)), { recursive: true }); fs.copyFileSync(a, path.join(OUT, b)); };
  fs.mkdirSync(`${OUT}/assets`, { recursive: true });
  fs.writeFileSync(`${OUT}/assets/site.css`, CSS);
  fs.writeFileSync(`${OUT}/assets/site.js`, JS);
  for (const f of fs.readdirSync('src/fonts')) cp(`src/fonts/${f}`, `assets/fonts/${f}`);
  for (const f of fs.readdirSync('src/icons')) cp(`src/icons/${f}`, f === 'favicon.ico' ? 'favicon.ico' : `assets/icons/${f}`);
  if (fs.existsSync('images/og.jpg')) cp('images/og.jpg', 'images/og.jpg');
  // Decap CMS
  cp('admin/index.html', 'admin/index.html');
  cp('admin/config.yml', 'admin/config.yml');

  fs.writeFileSync(`${OUT}/site.webmanifest`, JSON.stringify({
    name: site.name, short_name: 'Bhoza', start_url: '/', display: 'browser', background_color: '#F4F0E8', theme_color: '#252522',
    icons: [{ src: '/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' }],
  }, null, 2));
  fs.writeFileSync(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);
  fs.writeFileSync(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod><priority>${u === '/' ? '1.0' : u.split('/').length > 3 ? '0.6' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`);
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'sha256-${BOOT_HASH}' https://www.googletagmanager.com https://static.cloudflareinsights.com`,
    "style-src 'self'",
    "img-src 'self' data: https://i.ytimg.com https://*.google-analytics.com https://*.googletagmanager.com",
    "font-src 'self'",
    "connect-src 'self' https://formspree.io https://cloudflareinsights.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
    'frame-src https://www.youtube-nocookie.com https://player.vimeo.com',
    "form-action 'self' https://formspree.io",
    "base-uri 'self'", "object-src 'none'", "frame-ancestors 'self'",
  ].join('; ');
  fs.writeFileSync(`${OUT}/_headers`, `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
  X-Frame-Options: SAMEORIGIN
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: ${csp}

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400

/admin/*
  ! Content-Security-Policy
  X-Robots-Tag: noindex
  Cache-Control: no-store
`);
  fs.writeFileSync(`${OUT}/_redirects`, `/about.html /about/ 301\n/work.html /marketing/ 301\n/book.html /contact/ 301\n/home /  301\n`);
}

/* ------------------------------------------------------------------ run */
fs.rmSync(OUT, { recursive: true, force: true, maxRetries: 2 });
fs.mkdirSync(OUT, { recursive: true });
const all = collectImages([site, events, projects, dj, speaking, P, '/images/bhoza-lifestyle-close.jpg']);
for (const src of all) await prepImage(src);
home(); about(); marketing(); music(); eventsPage(); speakingPage(); venturesPage(); lifestylePage(); contactPage(); notFound();
writeStatic();
console.log(`Built ${PAGES.length + 1} pages and ${IMG.size} images into ${OUT}/ in ${Date.now() - t0} ms`);
