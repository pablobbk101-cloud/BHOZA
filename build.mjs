// Static build: node build.mjs  ->  dist/
import fs from 'fs';
const SITE = 'https://www.bhoza.co.za/';
const EMAIL = 'missbhoza@bhoza.co.za';

/* ---------- content (one place to edit) ---------- */
// side: which half of the tagline the service belongs to. theme: the poster colourway on the home page.
const services = [
  { k: 'marketing', side: 'Business', theme: 't-dark', title: 'Marketing <span class="em">&amp;</span> brand strategy', short: 'Marketing',
    body: 'Who the brand is for, what it says, and where it has to show up for the right people to care.',
    list: ['Brand positioning', 'Campaign strategy', 'Communications', 'Audience engagement'] },
  { k: 'events', side: 'Culture', theme: 't-hot', title: 'Events <span class="em">&amp;</span> experiences', short: 'Events',
    body: 'From the first idea to the last load-out. The concept, the production, the partners who pay for it and the audience who remember it.',
    list: ['Event concepts', 'Production', 'Event marketing', 'Partnerships'] },
  { k: 'artists', side: 'Business', theme: 't-char', title: 'Artist <span class="em">management</span>', short: 'Artist management',
    body: 'Managing artists since 2003. A career needs somebody who knows the rooms, the promoters and the paperwork.',
    list: ['Artist strategy', 'Career development', 'Bookings', 'Industry navigation'] },
  { k: 'social', side: 'Culture', theme: 't-bone', title: 'Social media <span class="em">&amp;</span> content', short: 'Social and content',
    body: 'A plan for what gets posted, when, and why. Stories told in the voice of the brand or the artist.',
    list: ['Social strategy', 'Content planning', 'Storytelling', 'Digital campaigns'] },
  { k: 'consulting', side: 'Business', theme: 't-dark', title: 'Creative industry <span class="em">consulting</span>', short: 'Consulting',
    body: 'Straight advice for creatives, organisations and brands who would rather learn from twenty years of somebody else\'s lessons.',
    list: ['Strategy sessions', 'Creatives and artists', 'Organisations', 'Brands'] },
  { k: 'stage', side: 'Culture', theme: 't-hot', title: 'MC, DJ, <span class="em">speaker</span>', short: 'MC, DJ, speaker',
    body: 'On the mic, behind the decks or in the chair. Hosting the night, playing the set, moderating the panel.',
    list: ['Hosting and MC work', 'DJ sets', 'Panel moderation', 'Talks and workshops'] },
];
// Credits come from her public Music In Africa profile. Confirm every name with Bhoza before launch.
const socials = [
  { n: 'Instagram', h: '@MissBhoza', u: 'https://www.instagram.com/MissBhoza' },
  { n: 'X', h: '@MissBhoza', u: 'https://x.com/MissBhoza' },
  { n: 'TikTok', h: '@MissBhoza01', u: 'https://www.tiktok.com/@MissBhoza01' },
  { n: 'LinkedIn', h: 'MissBhoza' },            // profile URL needed
  { n: 'Facebook', h: 'Bhoza Mphela' },         // profile + page URLs needed
];
const ALT = {
  suit: 'Bhoza Mphela in a black tuxedo suit, seated in a wooden chair under a single studio light, one hand raised to her hair.',
  street: 'Bhoza Mphela in a cap, clear visor glasses, a white printed tee and wide black trousers, standing in front of an old BMW in a parking lot.',
  face: 'Close portrait of Bhoza Mphela in black and white, natural hair, satin tuxedo lapel, looking straight at the camera.',
  top: 'Bhoza Mphela from the waist up in a cap, hoop earrings and a white tee printed with an afro silhouette, one hand on her cap.',
};

/* ---------- partials ---------- */
const arr = '<span class="arr" aria-hidden="true">&rarr;</span>';
const sq = '<i class="sq" aria-hidden="true"></i>';
const LOGO = (f) => fs.readFileSync(`src/logo/${f}`, 'utf8');
const nav = [['work.html', 'What I do'], ['about.html', 'About'], ['book.html', 'Book Bhoza']];
const pic = (base, w, h, alt, { eager = false, sizes = '100vw', srcset, cls = '', par = false } = {}) =>
  `<picture><source type="image/webp" srcset="${srcset || `assets/img/${base}.webp`}" sizes="${sizes}"><img${cls ? ` class="${cls}"` : ''} src="assets/img/${base}.jpg" width="${w}" height="${h}" alt="${alt}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${par ? ' data-par' : ''}></picture>`;
const fig = (cls, inner) => `<figure class="fig ${cls}" data-reveal="img">${inner}</figure>`;
const SUIT = 'assets/img/bhoza-portrait-640.webp 640w, assets/img/bhoza-portrait-1006.webp 1006w';
const STREET = 'assets/img/bhoza-street-600.webp 600w, assets/img/bhoza-street-911.webp 911w';

const ticker = () => { const items = ['Marketing', 'Events', 'Artist management', 'Social', 'MC', 'DJ', 'Speaker', 'Consulting'];
  const run = (hide) => `<span${hide ? ' aria-hidden="true"' : ''}>${items.map((i) => `${i}${sq}`).join('')}</span>`;
  return `<div class="mq" aria-label="Services"><div class="mq__band"><div class="mq__track">${run(false)}${run(true)}</div></div></div>`; };

const footer = () => `
<footer class="foot wrap t-hot" data-dock="Book">
  <p class="foot__call" aria-hidden="true">Let's <span class="em">connect.</span></p>
  <div class="grid foot__row">
    <div class="foot__mail">
      <h2 class="vh">Let's connect</h2>
      <a class="tlink" href="mailto:${EMAIL}">${EMAIL}</a><br>
      <a class="btn btn--solid" href="book.html">Book Bhoza ${arr}</a>
    </div>
    <nav class="foot__col" aria-label="Footer">
      <h2 class="mono">Pages</h2>
      <ul><li><a href="index.html">Home</a></li>${nav.map(([u, t]) => `<li><a href="${u}">${t}</a></li>`).join('')}</ul>
    </nav>
    <div class="foot__col">
      <h2 class="mono">Find me online</h2>
      <ul>${socials.map((s) => s.u ? `<li><a href="${s.u}" rel="me noopener">${s.n} <span class="h">${s.h}</span></a></li>` : `<li>${s.n} <span class="h">${s.h}</span></li>`).join('')}</ul>
    </div>
  </div>
  <div class="foot__base mono">
    <span>&copy; 2026 Bhoza Mphela. Johannesburg, <span class="clock">00:00</span> SAST.</span>
    <span>Concept site by <a href="https://mrpoint.online" rel="noopener">Mr Point</a>.</span>
  </div>
</footer>`;

const DOCK = { 'index.html': 'Bhoza', 'work.html': 'What I do', 'about.html': 'About', 'book.html': 'Book', '404.html': 'Lost' };
const layout = ({ file, title, desc, body }) => `<!DOCTYPE html>
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
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/bricolage.woff2" as="font" type="font/woff2" crossorigin>
<script>document.documentElement.classList.add('js');setTimeout(function(){if(!window.__ok)document.documentElement.classList.remove('js')},3500)</script>
<link rel="stylesheet" href="assets/css/site.css">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: 'Bhoza Mphela', alternateName: 'MissBhoza', url: SITE, email: EMAIL,
    jobTitle: 'Marketer, event producer, artist manager, MC and DJ', address: { '@type': 'PostalAddress', addressLocality: 'Johannesburg', addressCountry: 'ZA' },
    sameAs: socials.filter((s) => s.u).map((s) => s.u) })}</script>
</head>
<body class="t-dark">
<a class="skip" href="#main">Skip to content</a>
<header class="head">
  <a class="mark" href="index.html" aria-label="Bhoza, home">${LOGO('header-a.svg').replace('aria-label="Bhoza"','aria-hidden="true"').replace(' role="img"','')}</a>
  <nav class="nav" id="nav" aria-label="Main">
    ${nav.map(([u, t], i) => `<a href="${u}"${u === file ? ' aria-current="page"' : ''}${i === 2 ? ' class="btn"' : ''}>${t}</a>`).join('\n    ')}
  </nav>
</header>
<aside class="dock" aria-label="Quick controls" data-dock-default="${DOCK[file] || 'Bhoza'}">
  <button class="dock__menu" type="button" aria-expanded="false" aria-controls="nav"><span>Menu</span><i aria-hidden="true"></i></button>
  <p class="dock__side" aria-hidden="true" data-side=""><span class="dock__dot"></span><span class="dock__txt">${DOCK[file] || 'Bhoza'}</span></p>
  ${file === 'book.html' ? `<a class="dock__book" href="work.html">What I do ${arr}</a>` : `<a class="dock__book" href="book.html">Book ${arr}</a>`}
</aside>
<main id="main">
${body}
</main>
${footer()}
<div class="curtain" aria-hidden="true"><span>${LOGO('name-ca.svg')}</span></div>
<script src="assets/js/gsap.min.js" defer></script>
<script src="assets/js/ScrollTrigger.min.js" defer></script>
<script src="assets/js/SplitText.min.js" defer></script>
<script src="assets/js/lenis.min.js" defer></script>
<script src="assets/js/site.js" defer></script>
</body>
</html>`;

/* ---------- pages ---------- */
const home = `
<section class="hero t-dark" data-dock="Bhoza">
  <figure class="hero__fig" data-intro="fade">${pic('bhoza-portrait-1006', 1006, 1648, ALT.suit, { eager: true, sizes: '(max-width:900px) 100vw, 42vw', srcset: SUIT })}</figure>
  <div class="hero__copy">
    <p class="hero__kicker mono" data-intro="in"><span>Creative industry. Business. Culture.</span><span>Johannesburg</span></p>
    <p class="hero__lede" data-intro="in">Bhoza Mphela manages the artists, builds the night, fills the room, then walks on stage and hosts it.</p>
    <div class="hero__cta" data-intro="in">
      <a class="btn btn--solid" href="book.html">Book Bhoza ${arr}</a>
      <a class="btn" href="#do-h">See what I do</a>
    </div>
  </div>
  <h1 class="hero__word" data-intro="wipe">Bhoza</h1>
  <p class="hero__meta mono" data-intro="in">Marketing / Events / Artist management<br>Social / MC, DJ, speaker / Consulting</p>
</section>

<section class="sec wrap t-bone" style="padding-bottom:0" data-dock="Bhoza">
  <div class="grid">
    <h2 class="state__big" data-reveal="lines">In kasi slang, a bhoza is the one in charge. Bhoza Mphela is that in two rooms: <span class="em">the boardroom</span> and <span class="em">the dance floor.</span></h2>
    <p class="state__label mono" data-reveal>Managing artists since 2003</p>
    <p class="state__small lede" data-reveal>For more than twenty years she has worked both sides of South African music, events, marketing and media, usually on the same project.</p>
  </div>
</section>
<div class="t-bone">${ticker()}</div>

<section class="sides t-dark" data-sides data-dock="sides" aria-label="Bhoza means business and culture">
  <div class="sides__stage">
    <figure class="sides__frame"><div class="sides__pics">
      ${pic('bhoza-face-690', 690, 860, ALT.face, { sizes: '(max-width:900px) 100vw, 46vw', cls: 'sides__img--a' })}
      ${pic('bhoza-street-911', 911, 1726, '', { sizes: '(max-width:900px) 100vw, 46vw', srcset: STREET, cls: 'sides__img--b' })}
    </div></figure>
    <p class="sides__tag mono">Two sides.<br>One Bhoza.</p>
    <div class="sides__side"><p>The suit writes the strategy and signs the deal. The cap runs the night.</p></div>
    <div class="sides__title"><h2><span class="sides__pre"><span class="vh">Bhoza</span>${LOGO('name-ca.svg').replace(' role="img"',' aria-hidden="true"')} means</span><span class="swap"><span class="swap__a">business.</span><span class="swap__b">culture.</span></span></h2></div>
  </div>
</section>

<section class="t-bone" aria-labelledby="do-h">
  <div class="wrap grid do__head" data-dock="What I do">
    <h2 class="display d2" id="do-h" data-reveal="lines">Six ways to <span class="em">put me to work</span></h2>
    <p class="lede" data-reveal>Three for the business. Three for the culture. Book one or the whole stack.</p>
  </div>
  <p class="rail__hint mono" aria-hidden="true"><span>Swipe the posters</span>${arr}</p>
  <div class="stack" data-dock="rail">
    ${services.map((s, i) => `<article class="poster ${s.theme}" id="svc-${s.k}" data-side="${s.side}" style="--i:${i}">
      <div class="poster__tab grid mono"><span>${s.side}</span><span>${s.short}</span><span>${i + 1} / ${services.length}</span></div>
      <div class="poster__body">
        <h3 class="poster__title">${s.title}</h3>
        <div class="grid poster__row">
          <p class="lede">${s.body}</p>
          <ul class="tags">${s.list.map((l) => `<li>${l}</li>`).join('')}</ul>
          <a class="btn btn--solid" href="work.html#${s.k}" aria-label="More on ${s.short}">More ${arr}</a>
        </div>
      </div>
    </article>`).join('\n    ')}
  </div>
  <nav class="rail__ui" aria-label="Pick a service" data-rail-ui>
    <div class="rail__bar">${services.map((s, i) => `<a href="#svc-${s.k}" data-side="${s.side}" aria-label="${s.short}, ${i + 1} of ${services.length}"><i></i></a>`).join('')}</div>
    <p class="rail__lab mono" aria-hidden="true"><span data-rail-side>${services[0].side}</span><span data-rail-name>${services[0].short}</span></p>
  </nav>
</section>

<section class="sec wrap t-dark bill" data-dock="Line-up" aria-labelledby="bill-h">
  <div class="bill__head">
    <h2 class="mono" id="bill-h">The line-up so far</h2>
    <p class="mono muted">Artists, brands and stations, 2003 to now</p>
  </div>
  <ul>
    <li class="bill__line bill__line--a"><span class="mono bill__role">Artists managed</span><span class="fit" data-fit-min="901" data-fit-max=".42"><span class="fit__in">DJ Ganyani</span></span></li>
    <li class="bill__line bill__line--b"><span class="vh">Artists managed: </span><span class="fit" data-fit-min="901"><span class="fit__in">DJ Josi Chave ${sq} Ismail Abrahams</span></span></li>
    <li class="bill__line bill__line--c"><span class="mono bill__role">Brand work</span><span class="fit" data-fit-min="901"><span class="fit__in">Sorbet ${sq} Clinique ${sq} Five Roses</span></span></li>
    <li class="bill__line bill__line--d"><span class="mono bill__role">On air, partner, studied</span><span class="fit" data-fit-min="901"><span class="fit__in">Audwax ${sq} DYR ${sq} Female DJ Network ${sq} Wits</span></span></li>
  </ul>
  <p class="bill__foot mono"><span>Plus actors and actresses</span><span>More names on request</span></p>
</section>

<section class="sec wrap t-bone" data-dock="Story">
  <div class="grid">
    ${fig('story__fig', pic('bhoza-street-911', 911, 1726, ALT.street, { sizes: '(max-width:900px) 100vw, 48vw', srcset: STREET, par: true }))}
    <div class="story__copy">
      <h2 class="display" data-reveal="lines">Radio first. Then clubs, artists, brands <span class="em">and stages.</span></h2>
      <p class="lede" data-reveal>How a presenter became the person the whole night gets routed through.</p>
      <a class="btn btn--solid" href="about.html" data-reveal>Read the story ${arr}</a>
      <div class="merch" data-reveal>
        <p>Bhoza tees are on the way. The online store opens soon.</p>
        <a class="btn" href="book.html">Ask about the drop ${arr}</a>
      </div>
    </div>
  </div>
</section>`;

const sideBlock = (side, theme, word, img, note) => `
<section class="side wrap ${theme}" aria-labelledby="side-${word}">
  <div class="grid">
    <div class="side__label">
      <h2 class="side__word" id="side-${word}" data-reveal>${side}</h2>
      ${img}
      <span class="mono">${note}</span>
    </div>
    <div class="side__list">
      ${services.filter((s) => s.side === side).map((s) => `<article class="svc" id="${s.k}">
        <h3 data-reveal="lines">${s.title}</h3>
        <p class="lede" data-reveal>${s.body}</p>
        <ul class="tags" data-reveal>${s.list.map((l) => `<li>${l}</li>`).join('')}</ul>
        <a class="btn" href="book.html#${s.k}" data-reveal>Book this ${arr}</a>
      </article>`).join('\n      ')}
    </div>
  </div>
</section>`;
const work = `
<section class="page-top wrap t-dark">
  <span class="mono" data-intro="in">What I do</span>
  <h1 class="display d1" data-intro="lines">Business on one side. <span class="em">Culture on the other.</span></h1>
  <p class="lede" data-intro="in">Six services, split the way my tagline splits them. Most projects end up needing something from both.</p>
</section>
${sideBlock('Business', 't-dark', 'business', fig('', pic('bhoza-face-690', 690, 860, ALT.face, { sizes: '(max-width:900px) 60vw, 22rem' })), 'Strategy, management, advice')}
${sideBlock('Culture', 't-bone', 'culture', fig('', pic('bhoza-street-top-640', 640, 800, ALT.top, { sizes: '(max-width:900px) 60vw, 22rem' })), 'Events, content, the stage')}`;

const about = `
<section class="page-top wrap t-dark">
  <span class="mono" data-intro="in">About</span>
  <h1 class="display d1" data-intro="lines">The one <span class="em">in charge.</span></h1>
</section>
<section class="wrap grid dip t-dark">
  <div class="dip__a">${fig('', pic('bhoza-portrait-1006', 1006, 1648, ALT.suit, { eager: true, sizes: '(max-width:900px) 50vw, 40vw', srcset: SUIT, par: true }))}<p class="cap mono"><span>Business</span><span>The boardroom</span></p></div>
  <div class="dip__b">${fig('', pic('bhoza-street-911', 911, 1726, ALT.street, { sizes: '(max-width:900px) 50vw, 40vw', srcset: STREET, par: true }))}<p class="cap mono"><span>Culture</span><span>The dance floor</span></p></div>
</section>
<section class="sec wrap t-bone">
  <div class="grid">
    <p class="bio__lead" data-reveal="lines">Bhoza Mphela works where South African music, events, marketing and media <span class="em">overlap.</span></p>
    <div class="bio__body">
      <p data-reveal>She started on air, presenting at Audwax and DYR. In 2003 she began managing artists and has not stopped. DJ Ganyani, DJ Josi Chave and Ismail Abrahams have been on her roster, along with actors and actresses.</p>
      <p data-reveal>Alongside management came the nights themselves. She promoted clubs and venues, organised events, and became a voice brands trusted, Sorbet, Clinique and Five Roses among them. She also runs social media for clients.</p>
      <p data-reveal>She holds a music industry qualification from Wits University and is a partner at the Female DJ Network.</p>
      <p data-reveal>Today the same person can write the strategy, manage the artist, build the event, run the socials and take the mic. That is the whole point of calling her Bhoza.</p>
    </div>
  </div>
</section>
<section class="sec wrap t-hot">
  <div class="grid">
    <blockquote class="quote" data-reveal="lines">A creative industry platform built around marketing, events, entertainment, people, ideas and meaningful experiences.</blockquote>
    <p class="quote__by mono" data-reveal>Bhoza Mphela, on what bhoza.co.za is for</p>
  </div>
</section>
<section class="sec wrap t-dark">
  <h2 class="display d2" data-reveal="lines">How she got here</h2>
  <dl class="hist">
    <div class="hist__row grid" data-reveal><dt>First</dt><dd>Radio. Presenter at Audwax and DYR.</dd></div>
    <div class="hist__row grid" data-reveal><dt>2003</dt><dd>Starts managing artists. Still does.</dd></div>
    <div class="hist__row grid" data-reveal><dt>Then</dt><dd>Promotes clubs and venues, organises events, studies the music industry at Wits University.</dd></div>
    <div class="hist__row grid" data-reveal><dt>Brands</dt><dd>Influencer and social media work for Sorbet, Clinique, Five Roses and others.</dd></div>
    <div class="hist__row grid" data-reveal><dt>Now</dt><dd>Partner at the Female DJ Network. Marketer, event producer, manager, MC, DJ, speaker and consultant.</dd></div>
  </dl>
</section>`;

const book = `
<section class="page-top wrap t-dark">
  <span class="mono" data-intro="in">Book Bhoza</span>
  <h1 class="display d1" data-intro="lines">Tell me what you are <span class="em">building.</span></h1>
  <p class="lede" data-intro="in">Tick what you need and this page writes the email for you to send.</p>
</section>
<section class="wrap t-dark" style="padding-bottom:clamp(5rem,11vw,10rem)">
  <div class="grid">
    <form class="book__form" id="book-form" novalidate>
      <label class="field"><span class="mono">Your name</span><input type="text" name="name" autocomplete="name" placeholder="Name and company"></label>
      <label class="field"><span class="mono">Your email</span><input type="email" name="email" autocomplete="email" placeholder="you@example.com"></label>
      <fieldset class="field"><legend class="mono">What do you need</legend>
        <div class="chips">${services.map((s) => `<label class="chip"><input type="checkbox" name="need" value="${s.short}" data-k="${s.k}"><span>${s.short}</span></label>`).join('')}</div>
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
<section class="lost wrap t-dark">
  <h1 class="fit" data-fit-max=".6"><span class="fit__in" data-intro="clip"><span class="vh">Page not found. Error </span>404</span></h1>
  <div class="lost__row">
    <p data-intro="in">Wrong door.</p>
    <a class="btn btn--solid" href="index.html" data-intro="in">Back to the front ${arr}</a>
  </div>
</section>`;

const pages = [
  { file: 'index.html', title: 'Bhoza Mphela | Creative industry. Business. Culture.', desc: 'Bhoza Mphela: marketing, events, artist management, social media, MC, DJ, speaker and creative industry consulting. Johannesburg, since 2003.', body: home },
  { file: 'work.html', title: 'What I do | Bhoza Mphela', desc: 'Six services on two sides: marketing, artist management and consulting for the business; events, content and the stage for the culture.', body: work },
  { file: 'about.html', title: 'About | Bhoza Mphela', desc: 'From radio presenter to artist manager, event producer, brand voice and host. The story of Bhoza Mphela, managing artists since 2003.', body: about },
  { file: 'book.html', title: 'Book Bhoza | Bhoza Mphela', desc: 'Book Bhoza Mphela for marketing, events, artist management, social media, MC, DJ, speaking or consulting. Email missbhoza@bhoza.co.za.', body: book },
  { file: '404.html', title: 'Wrong door | Bhoza Mphela', desc: 'This page could not be found.', body: lost },
];
for (const p of pages) fs.writeFileSync(`dist/${p.file}`, layout(p));
fs.copyFileSync('src/site.css', 'dist/assets/css/site.css');
fs.copyFileSync('src/site.js', 'dist/assets/js/site.js');
fs.copyFileSync('src/logo/favicon.svg', 'dist/assets/img/favicon.svg'); fs.copyFileSync('src/logo/apple-touch-icon.png', 'dist/assets/img/apple-touch-icon.png');
fs.writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
fs.writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((p) => p.file !== '404.html').map((p) => `  <url><loc>${SITE}${p.file === 'index.html' ? '' : p.file}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('built', pages.map((p) => p.file).join(', '));
