// Static build: node build.mjs  ->  dist/
import fs from 'fs';
const SITE = 'https://www.bhoza.co.za/';
const EMAIL = 'missbhoza@bhoza.co.za';

/* ---------- content (one place to edit) ---------- */
const cues = [
  { k: 'q1', q: 'Q1', phase: 'Before doors', title: 'Marketing and brand strategy', short: 'Marketing',
    note: 'Brand positioning, campaign strategy, communications and audience engagement.',
    body: 'The work that happens before anyone queues. Who the brand is for, what it says, and where it has to show up for the right people to care.',
    list: ['Brand positioning', 'Campaign strategy', 'Communications', 'Audience engagement'] },
  { k: 'q2', q: 'Q2', phase: 'The line-up', title: 'Artist management', short: 'Artist management',
    note: 'Artist strategy, career development, bookings, positioning and industry navigation.',
    body: 'Managing artists since 2003. A career needs somebody who knows the rooms, the promoters and the paperwork, and who will say no on the artist\'s behalf.',
    list: ['Artist strategy', 'Career development', 'Bookings', 'Positioning', 'Industry navigation'] },
  { k: 'q3', q: 'Q3', phase: 'The build', title: 'Events and experiences', short: 'Events',
    note: 'Event concepts, production, marketing, partnerships and audience experiences.',
    body: 'From the first idea to the last load-out. The concept, the production, the partners who pay for it and the audience who remember it.',
    list: ['Event concepts', 'Production', 'Event marketing', 'Partnerships', 'Audience experiences'] },
  { k: 'q4', q: 'Q4', phase: 'The noise', title: 'Social media and content', short: 'Social and content',
    note: 'Social media strategy, content planning, storytelling and digital campaigns.',
    body: 'A plan for what gets posted, when, and why. Stories told in the voice of the brand or the artist, with campaigns that give people a reason to turn up.',
    list: ['Social media strategy', 'Content planning', 'Storytelling', 'Digital campaigns'] },
  { k: 'q5', q: 'Q5', phase: 'Showtime', title: 'MC, DJ, speaker', short: 'MC, DJ, speaker',
    note: 'Hosting, DJing, moderating conversations and sharing practical creative-industry knowledge.',
    body: 'On the mic, behind the decks or in the chair. Hosting the night, playing the set, moderating the panel and passing on what the industry actually teaches you.',
    list: ['Hosting and MC work', 'DJ sets', 'Panel moderation', 'Talks and workshops'] },
  { k: 'q6', q: 'Q6', phase: 'The debrief', title: 'Creative industry consulting', short: 'Consulting',
    note: 'Strategic support for creatives, organisations and brands working across the creative economy.',
    body: 'For the people who would rather learn from somebody else\'s twenty years than spend their own. Straight advice for creatives, organisations and brands.',
    list: ['Strategy sessions', 'Creatives and artists', 'Organisations', 'Brands in the creative economy'] },
];
// placeholder:true = taken from her public Music In Africa profile, to be confirmed by Bhoza before launch
const credits = [
  { role: 'Artists managed', names: ['DJ Ganyani', 'DJ Josi Chave', 'Ismail Abrahams'], placeholder: true },
  { role: 'Brand work', names: ['Sorbet', 'Clinique', 'Five Roses'], placeholder: true },
  { role: 'On air', names: ['Audwax', 'DYR'], placeholder: true },
  { role: 'Partner', names: ['Female DJ Network'], placeholder: true },
  { role: 'Studied', names: ['Music industry, Wits University'], placeholder: true },
];
const socials = [
  { n: 'Instagram', h: '@MissBhoza', u: 'https://www.instagram.com/MissBhoza' },
  { n: 'X', h: '@MissBhoza', u: 'https://x.com/MissBhoza' },
  { n: 'TikTok', h: '@MissBhoza01', u: 'https://www.tiktok.com/@MissBhoza01' },
  { n: 'LinkedIn', h: 'MissBhoza' },            // profile URL needed
  { n: 'Facebook', h: 'Bhoza Mphela' },         // profile + page URLs needed
];

/* ---------- partials ---------- */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const arr = '<span class="arr" aria-hidden="true">&rarr;</span>';
const nav = [['work.html', 'What I do'], ['about.html', 'About'], ['book.html', 'Book Bhoza']];

const litImg = ({ base, w, h, alt, cls = '', home = '', eager = false, sizes = '100vw', srcset }) => `
<figure class="lit ${cls}" data-lit${home ? ` data-light-home="${home}"` : ''}>
  <picture><source type="image/webp" srcset="${srcset || `assets/img/${base}.webp`}" sizes="${sizes}">
    <img class="lit__dim" src="assets/img/${base}.jpg" width="${w}" height="${h}" alt="${alt}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></picture>
  <picture aria-hidden="true"><source type="image/webp" srcset="${srcset || `assets/img/${base}.webp`}" sizes="${sizes}">
    <img class="lit__on" src="assets/img/${base}.jpg" width="${w}" height="${h}" alt=""${eager ? '' : ' loading="lazy"'} decoding="async"></picture>
</figure>`;

const footer = () => `
<footer class="foot wrap" data-cue="END" data-cue-name="House lights">
  <p class="foot__call lit-text" data-lit aria-hidden="true">Let's connect.</p>
  <div class="grid foot__row">
    <div class="foot__mail" data-reveal>
      <h2 class="vh">Let's connect</h2>
      <a class="tlink" href="mailto:${EMAIL}">${EMAIL}</a><br>
      <a class="btn btn--solid" href="book.html">Book Bhoza ${arr}</a>
    </div>
    <nav class="foot__col" aria-label="Footer" data-reveal>
      <h2 class="mono">Running order</h2>
      <ul><li><a href="index.html">Home</a></li>${nav.map(([u, t]) => `<li><a href="${u}">${t}</a></li>`).join('')}</ul>
    </nav>
    <div class="foot__col" data-reveal>
      <h2 class="mono">Find me online</h2>
      <ul>${socials.map((s) => s.u ? `<li><a href="${s.u}" rel="me noopener">${s.n} <span class="h">${s.h}</span></a></li>` : `<li>${s.n} <span class="h">${s.h}</span></li>`).join('')}</ul>
    </div>
  </div>
  <div class="foot__base mono">
    <span>&copy; 2026 Bhoza Mphela. Johannesburg, South Africa.</span>
    <span>Concept site by <a href="https://mrpoint.online" rel="noopener">Mr Point</a>. Portrait supplied by Bhoza.</span>
  </div>
</footer>`;

const layout = ({ file, title, desc, body, cue0 = ['Q0', 'House open'] }) => `<!DOCTYPE html>
<html lang="en-ZA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${SITE}${file === 'index.html' ? '' : file}">
<meta name="theme-color" content="#0b0a09">
<meta property="og:type" content="website"><meta property="og:site_name" content="Bhoza">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
<meta property="og:url" content="${SITE}${file === 'index.html' ? '' : file}"><meta property="og:image" content="${SITE}assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@MissBhoza">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/bricolage.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="assets/css/site.css">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: 'Bhoza Mphela', alternateName: 'MissBhoza', url: SITE, email: EMAIL,
    jobTitle: 'Marketer, event producer, artist manager, MC and DJ', address: { '@type': 'PostalAddress', addressLocality: 'Johannesburg', addressCountry: 'ZA' },
    sameAs: socials.filter((s) => s.u).map((s) => s.u) })}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="head">
  <a class="mark" href="index.html" aria-label="Bhoza, home"><i class="lamp" aria-hidden="true"></i>Bhoza</a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav"><span>Menu</span><i class="lamp" aria-hidden="true"></i></button>
  <nav class="nav" id="nav" aria-label="Main">
    ${nav.map(([u, t], i) => `<a href="${u}"${u === file ? ' aria-current="page"' : ''}${i === 2 ? ' class="btn"' : ''}>${t}</a>`).join('\n    ')}
  </nav>
</header>
<div class="pool" aria-hidden="true"></div>
<main id="main">
${body}
</main>
${footer()}
<aside class="cuebar mono" aria-label="Running order position and Johannesburg time">
  <span class="cuebar__prog" aria-hidden="true"></span>
  <span class="cuebar__now"><i class="lamp" aria-hidden="true"></i><span class="cuebar__state">Standby</span><span class="cuebar__q">${cue0[0]}</span><span class="cuebar__name">${cue0[1]}</span></span>
  <span class="cuebar__time"><span class="cuebar__tz">Johannesburg </span><span class="cuebar__clock">00:00:00</span> SAST</span>
</aside>
<div class="curtain" aria-hidden="true"></div>
<script src="assets/js/gsap.min.js" defer></script>
<script src="assets/js/ScrollTrigger.min.js" defer></script>
<script src="assets/js/SplitText.min.js" defer></script>
<script src="assets/js/lenis.min.js" defer></script>
<script src="assets/js/site.js" defer></script>
</body>
</html>`;

/* ---------- pages ---------- */
const home = `
<section class="hero" data-cue="Q0" data-cue-name="House open">
  ${litImg({ base: 'bhoza-portrait-1006', w: 1006, h: 1648, cls: 'hero__fig', home: '0.6,0.17', eager: true, sizes: '(max-width:820px) 100vw, 42vw',
    srcset: 'assets/img/bhoza-portrait-640.webp 640w, assets/img/bhoza-portrait-1006.webp 1006w',
    alt: 'Bhoza Mphela in a black tuxedo suit, seated in a wooden chair under a single studio light, one hand raised to her hair.' })}
  <div class="hero__copy">
    <p class="hero__kicker mono" data-intro="in"><span>Creative industry. Business. Culture.</span><span>Johannesburg</span></p>
    <p class="hero__lede" data-intro="in">Bhoza Mphela manages the artists, builds the night, fills the room, then walks on stage and hosts it.</p>
    <div class="hero__cta" data-intro="in">
      <a class="btn btn--solid" href="book.html">Book Bhoza ${arr}</a>
      <a class="btn" href="#running-order">See the running order</a>
    </div>
  </div>
  <h1 class="hero__word lit-text" data-lit data-intro="clip">Bhoza</h1>
  <p class="hero__meta mono" data-intro="in">Marketing / Events / Artist management<br>Social / MC, DJ, speaker / Consulting</p>
</section>

<section class="sec wrap" data-cue="Q0" data-cue-name="Who is in charge">
  <div class="grid">
    <h2 class="state__big" data-reveal="lines">In kasi slang, a bhoza is the one in charge. <em>In this industry, that is whoever holds the running order.</em></h2>
    <p class="state__label mono" data-reveal>Managing artists since 2003</p>
    <p class="state__small lede" data-reveal>For more than twenty years Bhoza Mphela has held it for artists, brands, venues and audiences across South African music, events, marketing and media.</p>
  </div>
</section>

<section class="sec wrap" id="running-order" data-cue="Q1 to Q6" data-cue-name="The running order" style="padding-top:0">
  <div class="ro__head">
    <h2 class="display d2" data-reveal="lines">The running order</h2>
    <p class="lede muted" data-reveal style="max-width:22em">Six things I do, in the order a night actually needs them.</p>
  </div>
  <ol class="ro__list">
    ${cues.map((c) => `<li data-reveal><a class="cue" href="work.html#${c.k}">
      <span class="cue__q mono"><i class="lamp" aria-hidden="true"></i>${c.q}</span>
      <span class="cue__phase mono">${c.phase}</span>
      <span class="cue__title">${c.title}</span>
      <span class="cue__note">${c.note}</span>
      <span class="cue__go mono" aria-hidden="true">Go &rarr;</span>
    </a></li>`).join('\n    ')}
  </ol>
</section>

<section class="sec wrap on-paper" data-cue="Q7" data-cue-name="On the bill">
  <div class="grid">
    <h2 class="display d2 credits__title" data-reveal="lines">On the bill</h2>
    <p class="credits__intro lede" data-reveal>Some of the people, brands and stations behind the last two decades.</p>
    <dl class="credits__roll">
      ${credits.map((c) => `<div class="credit" data-reveal><dt class="mono">${c.role}</dt><dd>${c.names.map((n) => `<span>${n}</span>`).join('')}</dd></div>`).join('\n      ')}
    </dl>
  </div>
</section>

<section class="sec wrap" data-cue="Q8" data-cue-name="Off stage">
  <div class="grid">
    ${litImg({ base: 'bhoza-detail-1006', w: 1006, h: 640, cls: 'off__fig', home: '0.55,0.45', sizes: '(max-width:820px) 100vw, 56vw',
      alt: 'Detail of the same portrait: crossed legs and the wooden chair in hard studio light.' })}
    <div class="off__copy">
      <h2 class="display d3" data-reveal="lines">Radio first. Then clubs, artists, brands and stages.</h2>
      <p class="muted" data-reveal style="margin-top:1.25rem">The short version of how a presenter became the person the whole night gets routed through.</p>
      <a class="btn" href="about.html" data-reveal>Read the story ${arr}</a>
    </div>
  </div>
</section>

<section class="wrap" aria-label="Merchandise">
  <div class="strip" data-reveal>
    <p>Bhoza tees are on the way. The online store opens soon.</p>
    <a class="btn" href="book.html">Ask about the drop ${arr}</a>
  </div>
</section>`;

const work = `
<section class="page-top wrap" data-cue="Q0" data-cue-name="What I do">
  <span class="mono" data-intro="in">What I do</span>
  <h1 class="display d1 lit-text" data-lit data-intro="clip">Six cues.<br>One running order.</h1>
  <p class="lede" data-intro="in">Book a single cue or hand over the whole night. Each one is listed in the order a project usually needs it.</p>
</section>
<div class="wrap">
${cues.map((c) => `<section class="block grid" id="${c.k}" data-cue="${c.q}" data-cue-name="${c.phase}: ${c.short}">
  <div class="block__side mono"><span class="q"><i class="lamp" aria-hidden="true"></i>${c.q}</span><span>${c.phase}</span></div>
  <div class="block__main">
    <h2 class="display d2" data-reveal="lines">${c.title}</h2>
    <p class="lede" data-reveal>${c.body}</p>
    <a class="btn" href="book.html#${c.k}" data-reveal>Book this cue ${arr}</a>
  </div>
  <div class="block__list" data-reveal><h3 class="mono">On the sheet</h3><ul>${c.list.map((l) => `<li>${l}</li>`).join('')}</ul></div>
</section>`).join('\n')}
</div>`;

const about = `
<section class="page-top wrap" data-cue="Q0" data-cue-name="About Bhoza">
  <span class="mono" data-intro="in">About</span>
  <h1 class="display d1 lit-text" data-lit data-intro="clip">The one holding the running order.</h1>
</section>
<section class="wrap" style="padding-bottom:clamp(5rem,12vw,11rem)" data-cue="Q1" data-cue-name="The story">
  <div class="grid">
    ${litImg({ base: 'bhoza-face-690', w: 690, h: 860, cls: 'about__fig', home: '0.45,0.3', eager: true, sizes: '(max-width:820px) 100vw, 40vw',
      alt: 'Close portrait of Bhoza Mphela in black and white, natural hair, satin tuxedo lapel, looking straight at the camera.' })}
    <div class="about__copy">
      <p data-reveal="lines">Bhoza Mphela works where South African music, events, marketing and media overlap.</p>
      <p data-reveal>She started on air, presenting at Audwax and DYR. In 2003 she began managing artists and has not stopped. DJ Ganyani, DJ Josi Chave and Ismail Abrahams have been on her roster, along with actors and actresses.</p>
      <p data-reveal>Alongside management came the nights themselves. She promoted clubs and venues, organised events, and became a voice brands trusted, Sorbet, Clinique and Five Roses among them. She also runs social media for clients.</p>
      <p data-reveal>She holds a music industry qualification from Wits University and is a partner at the Female DJ Network.</p>
      <p data-reveal>Today the same person can write the strategy, manage the artist, build the event, run the socials and take the mic on the night. That is the whole point of calling her Bhoza.</p>
      <p data-reveal><a class="btn btn--solid" href="book.html">Book Bhoza ${arr}</a></p>
    </div>
  </div>
</section>
<section class="sec wrap on-paper" data-cue="Q2" data-cue-name="In her words">
  <div class="grid">
    <blockquote class="quote" data-reveal="lines">A creative industry platform built around marketing, events, entertainment, people, ideas and meaningful experiences.</blockquote>
    <p class="quote__by mono" data-reveal>Bhoza Mphela, on what bhoza.co.za is for</p>
  </div>
</section>
<section class="sec wrap" data-cue="Q3" data-cue-name="Cue history">
  <h2 class="display d2" data-reveal="lines">Cue history</h2>
  <dl class="hist">
    <div class="hist__row" data-reveal><dt class="mono">First</dt><dd>Radio. Presenter at Audwax and DYR.</dd></div>
    <div class="hist__row" data-reveal><dt class="mono">2003</dt><dd>Starts managing artists. Still does.</dd></div>
    <div class="hist__row" data-reveal><dt class="mono">Alongside</dt><dd>Promotes clubs and venues, organises events, studies the music industry at Wits University.</dd></div>
    <div class="hist__row" data-reveal><dt class="mono">Brands</dt><dd>Influencer and social media work for Sorbet, Clinique, Five Roses and others.</dd></div>
    <div class="hist__row" data-reveal><dt class="mono">Now</dt><dd>Partner at the Female DJ Network. Marketer, event producer, manager, MC, DJ, speaker and consultant.</dd></div>
  </dl>
</section>`;

const book = `
<section class="page-top wrap" data-cue="Q0" data-cue-name="Book Bhoza">
  <span class="mono" data-intro="in">Book Bhoza</span>
  <h1 class="display d1 lit-text" data-lit data-intro="clip">Book Bhoza.</h1>
  <p class="lede" data-intro="in">Tell me what you are building. Tick the cues you need and this page writes the email for you to send.</p>
</section>
<section class="wrap" style="padding-bottom:clamp(5rem,12vw,11rem)" data-cue="Q1" data-cue-name="The brief">
  <div class="grid">
    <form class="book__form" id="book-form" novalidate>
      <label class="field"><span class="mono">Your name</span><input type="text" name="name" autocomplete="name" placeholder="Name and company"></label>
      <label class="field"><span class="mono">Your email</span><input type="email" name="email" autocomplete="email" placeholder="you@example.com"></label>
      <fieldset class="field"><legend class="mono">What do you need</legend>
        <div class="chips">${cues.map((c) => `<label class="chip"><input type="checkbox" name="cue" value="${c.short}" data-k="${c.k}"><span>${c.short}</span></label>`).join('')}</div>
      </fieldset>
      <label class="field"><span class="mono">When</span><input type="text" name="when" placeholder="Date, month or deadline"></label>
      <label class="field"><span class="mono">The brief</span><textarea name="msg" placeholder="The event, artist, brand or problem. A few lines is enough."></textarea></label>
      <div class="book__actions"><button class="btn btn--solid" type="submit">Write my email ${arr}</button><span class="mono muted">Nothing is sent from this page.</span></div>
      <div class="out" id="book-out" aria-live="polite">
        <p class="mono muted" id="book-note"></p>
        <pre></pre>
        <div class="out__row"><a class="btn btn--solid" id="book-mail" href="mailto:${EMAIL}">Open in mail app ${arr}</a><button class="btn" type="button" id="book-copy">Copy email</button></div>
      </div>
    </form>
    <div class="book__side">
      <section><h2 class="mono">Direct</h2><p class="big"><a class="tlink" href="mailto:${EMAIL}">${EMAIL}</a></p><p class="muted" style="margin-top:.75rem">Based in Johannesburg. Works across South Africa.</p></section>
      <section><h2 class="mono">Find me online</h2>
        <ul>${socials.map((s) => `<li><span>${s.n}</span>${s.u ? `<a href="${s.u}" rel="me noopener">${s.h}</a>` : `<span>${s.h}</span>`}</li>`).join('')}</ul>
      </section>
    </div>
  </div>
</section>`;

const lost = `
<section class="lost wrap" data-cue="Q?" data-cue-name="Not on the sheet">
  <h1 class="lit-text" data-lit data-intro="clip"><span class="vh">Page not found. Error </span>404</h1>
  <div class="lost__row">
    <p class="lede" data-intro="in">Wrong cue. This page is not on the running order.</p>
    <a class="btn btn--solid" href="index.html" data-intro="in">Back to the top of the show ${arr}</a>
  </div>
</section>`;

const pages = [
  { file: 'index.html', title: 'Bhoza Mphela | Creative industry. Business. Culture.', desc: 'Bhoza Mphela: marketing, events, artist management, social media, MC, DJ, speaker and creative industry consulting. Johannesburg, since 2003.', body: home },
  { file: 'work.html', title: 'What I do | Bhoza Mphela', desc: 'Six services in running order: marketing and brand strategy, artist management, events, social media and content, MC, DJ and speaking, and consulting.', body: work, cue0: ['Q0', 'What I do'] },
  { file: 'about.html', title: 'About | Bhoza Mphela', desc: 'From radio presenter to artist manager, event producer, brand voice and host. The story of Bhoza Mphela, managing artists since 2003.', body: about, cue0: ['Q0', 'About Bhoza'] },
  { file: 'book.html', title: 'Book Bhoza | Bhoza Mphela', desc: 'Book Bhoza Mphela for marketing, events, artist management, social media, MC, DJ, speaking or consulting. Email missbhoza@bhoza.co.za.', body: book, cue0: ['Q0', 'Book Bhoza'] },
  { file: '404.html', title: 'Not on the running order | Bhoza Mphela', desc: 'This page could not be found.', body: lost, cue0: ['Q?', 'Not on the sheet'] },
];
for (const p of pages) fs.writeFileSync(`dist/${p.file}`, layout(p));
fs.copyFileSync('src/site.css', 'dist/assets/css/site.css');
fs.copyFileSync('src/site.js', 'dist/assets/js/site.js');
fs.writeFileSync('dist/assets/img/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0b0a09"/><circle cx="16" cy="16" r="7" fill="#ff4a2b"/></svg>`);
fs.writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
fs.writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((p) => p.file !== '404.html').map((p) => `  <url><loc>${SITE}${p.file === 'index.html' ? '' : p.file}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('built', pages.map((p) => p.file).join(', '));
void esc;
