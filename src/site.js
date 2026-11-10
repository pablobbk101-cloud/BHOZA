/* Bhoza.co.za concept. One clock (gsap.ticker), one driver (the light). */
(() => {
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  const curtain = $('.curtain');

  if (!hasGsap || reduce) {            // static, fully lit version
    html.classList.remove('js');
    initUi();
    $('.head').classList.add('is-solid');
    const bar = $('.cuebar');
    if (bar && 'IntersectionObserver' in window) {   // cue bar still tells you where you are
      const cio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) {
        $('.cuebar__q', bar).textContent = e.target.dataset.cue; $('.cuebar__name', bar).textContent = e.target.dataset.cueName; } }), { rootMargin: '-50% 0px -49% 0px' });
      $$('[data-cue]').forEach((el) => cio.observe(el));
    }
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const EASE = 'expo.out';

  /* smooth scroll on the shared ticker */
  const lenis = new Lenis({ autoRaf: false, lerp: 0.12, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---------- the light ---------- */
  const light = { x: innerWidth * 0.62, y: innerHeight * 0.3, tx: 0, ty: 0, on: 0, beam: 1 };
  light.tx = light.x; light.ty = light.y;
  let lastMove = -1e9, pointerIn = false;
  const lit = new Set();
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting ? lit.add(e.target) : lit.delete(e.target)), { rootMargin: '10% 0px' });
  $$('[data-lit]').forEach((el) => io.observe(el));
  const homes = $$('[data-light-home]');

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    light.tx = e.clientX; light.ty = e.clientY; lastMove = performance.now(); pointerIn = true;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { pointerIn = false; });

  function homePoint() {
    for (const el of homes) {
      const r = el.getBoundingClientRect();
      if (r.bottom > innerHeight * 0.15 && r.top < innerHeight * 0.85) {
        const [fx, fy] = (el.dataset.lightHome || '0.5,0.3').split(',').map(Number);
        return { x: r.left + r.width * fx, y: r.top + r.height * fy, rx: r.width * 0.16, ry: r.height * 0.07 };
      }
    }
    return { x: innerWidth * 0.5, y: innerHeight * 0.42, rx: innerWidth * 0.3, ry: innerHeight * 0.18 };
  }

  gsap.ticker.add((time) => {
    if (document.hidden) return;
    const idle = !pointerIn || performance.now() - lastMove > 2400;
    if (idle) {                           // idle state: a slow figure around the home mark
      const h = homePoint();
      light.tx = h.x + Math.sin(time * 0.42) * h.rx;
      light.ty = h.y + Math.sin(time * 0.67 + 1.2) * h.ry;
    }
    const k = idle ? 0.035 : 0.14;
    light.x += (light.tx - light.x) * k;
    light.y += (light.ty - light.y) * k;
    const s = html.style;
    s.setProperty('--lx', light.x.toFixed(1) + 'px');
    s.setProperty('--ly', light.y.toFixed(1) + 'px');
    s.setProperty('--on', light.on.toFixed(3));
    lit.forEach((el) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (light.x - r.left).toFixed(1) + 'px');
      el.style.setProperty('--my', (light.y - r.top).toFixed(1) + 'px');
    });
  });

  /* ---------- lights up ---------- */
  function lightsUp() {
    const h = homePoint();
    light.x = light.tx = h.x; light.y = light.ty = h.y;
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    tl.set(curtain, { opacity: 0 })
      .to(light, { on: 1, duration: 0.07, ease: 'none' }, 0.12)      // snap on
      .to(light, { on: 0.35, duration: 0.05, ease: 'none' })          // filament dip
      .to(light, { on: 1, duration: 0.5 })
      .fromTo('[data-intro="clip"]', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(-10% 0 -10% 0)', duration: 1.1, stagger: 0.08 }, 0.18)
      .fromTo('[data-intro="in"]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 }, 0.35);
    return tl;
  }

  /* ---------- reveals ---------- */
  function reveals() {
    $$('[data-reveal="lines"]').forEach((el) => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln', autoSplit: true, aria: 'none',
        onSplit: (self) => gsap.from(self.lines, { yPercent: 105, duration: 0.95, ease: EASE, stagger: 0.06,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true } }) });
      el.classList.add('is-in'); void split;
    });
    ScrollTrigger.batch('[data-reveal=""],[data-reveal="in"]', {
      start: 'top 90%', once: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.05, onComplete: () => els.forEach((e) => e.classList.add('is-in')) }),
    });
  }

  /* ---------- cue bar ---------- */
  function cues() {
    const bar = $('.cuebar'); if (!bar) return;
    const q = $('.cuebar__q', bar), name = $('.cuebar__name', bar), state = $('.cuebar__state', bar);
    let goT;
    const set = (el) => {
      q.textContent = el.dataset.cue; name.textContent = el.dataset.cueName;
      bar.classList.add('is-go'); state.textContent = 'Go';
      clearTimeout(goT); goT = setTimeout(() => { bar.classList.remove('is-go'); state.textContent = 'Standby'; }, 900);
    };
    $$('[data-cue]').forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && set(el) }));
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => bar.style.setProperty('--p', s.progress.toFixed(4)) });
  }

  /* ---------- header: steps aside going down, returns going up ---------- */
  function header() {
    const head = $('.head');
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => {
      head.classList.toggle('is-solid', s.scroll() > 40);
      if (!head.classList.contains('is-menu')) head.classList.toggle('is-away', s.direction === 1 && s.scroll() > 400);
    } });
  }

  /* ---------- blackout between pages ---------- */
  function transitions() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]'); if (!a) return;
      const href = a.getAttribute('href');
      if (e.metaKey || e.ctrlKey || e.shiftKey || a.target || !/^[\w-]+\.html(#[\w-]*)?$/.test(href)) return;
      if (href.split('#')[0] === (location.pathname.split('/').pop() || 'index.html')) return;
      e.preventDefault();
      gsap.to(light, { on: 0, duration: 0.18, ease: 'power2.in' });
      gsap.to(curtain, { opacity: 1, duration: 0.26, ease: 'power2.in', onComplete: () => { location.href = href; } });
    });
    addEventListener('pageshow', (e) => { if (e.persisted) { gsap.set(curtain, { opacity: 0 }); light.on = 1; } });
  }

  document.fonts.ready.then(() => {
    initUi(); reveals(); cues(); header(); transitions(); lightsUp();
    ScrollTrigger.refresh();
  });
  setTimeout(() => { if (getComputedStyle(curtain).opacity === '1') gsap.to(curtain, { opacity: 0, duration: 0.3 }); }, 2600);

  /* ---------- plain UI (runs with or without motion) ---------- */
  function initUi() {
    // clock: her local time
    const t = $('.cuebar__clock');
    if (t) {
      const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      let last = -1;
      const tick = () => { const s = Math.floor(Date.now() / 1000); if (s !== last) { last = s; t.textContent = fmt.format(new Date()); } };
      tick(); hasGsap && !reduce ? gsap.ticker.add(tick) : setInterval(tick, 1000);
    }
    // buttons: remember where the pointer came in
    $$('.btn').forEach((b) => b.addEventListener('pointerenter', (e) => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--bx', e.clientX - r.left + 'px'); b.style.setProperty('--by', e.clientY - r.top + 'px');
    }));
    // cue rows: the lamp follows along the row
    $$('.cue').forEach((c) => c.addEventListener('pointermove', (e) => {
      c.style.setProperty('--rx', e.clientX - c.getBoundingClientRect().left + 'px');
    }, { passive: true }));
    // phone menu
    const btn = $('.menu-btn'), nav = $('.nav'), head = $('.head');
    if (btn) {
      const set = (open) => {
        nav.classList.toggle('is-open', open); head.classList.toggle('is-menu', open);
        btn.setAttribute('aria-expanded', open); btn.firstChild.textContent = open ? 'Close' : 'Menu';
        document.body.style.overflow = open ? 'hidden' : '';
      };
      btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
    }
    // booking form: writes the email, never pretends to send it
    const form = $('#book-form');
    if (form) {
      const out = $('#book-out'), pre = $('pre', out), mail = $('#book-mail'), copy = $('#book-copy'), note = $('#book-note');
      const pick = (location.hash || '').slice(1);
      if (pick) { const c = form.querySelector(`input[value][data-k="${pick}"]`); if (c) c.checked = true; }
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const d = new FormData(form), cues = d.getAll('cue');
        const subject = `Booking enquiry: ${cues.length ? cues.join(', ') : 'general'}`;
        const body = [`Hi Bhoza,`, ``, `${d.get('msg') || '(Tell Bhoza about the project here.)'}`, ``,
          `What I need: ${cues.length ? cues.join(', ') : 'not sure yet'}`, `When: ${d.get('when') || 'to be confirmed'}`, ``,
          `${d.get('name') || ''}`, `${d.get('email') || ''}`].join('\n');
        pre.textContent = `To: missbhoza@bhoza.co.za\nSubject: ${subject}\n\n${body}`;
        mail.href = `mailto:missbhoza@bhoza.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        out.classList.add('is-on'); note.textContent = 'Your email is written. Open it in your mail app, or copy it.';
        out.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      });
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(pre.textContent); note.textContent = 'Copied. Paste it into an email to missbhoza@bhoza.co.za.'; }
        catch { note.textContent = 'Copy was blocked here. Select the text above and copy it by hand.'; }
      });
    }
  }
})();
