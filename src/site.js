/* Bhoza.co.za concept v2. One clock (gsap.ticker). Scroll drives the concept; nothing follows the pointer. */
(() => {
  window.__ok = true;
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && typeof SplitText !== 'undefined' && typeof Lenis !== 'undefined';
  const curtain = $('.curtain');

  /* fit a line of type to the width of its box (poster lines, the masthead) */
  function fit() {
    $$('.fit').forEach((el) => {
      if (el.dataset.fitMin && innerWidth < +el.dataset.fitMin) { el.style.fontSize = ''; return; }
      const inn = el.firstElementChild; if (!inn) return;
      el.style.fontSize = '100px';
      const w = inn.getBoundingClientRect().width; if (!w) { el.style.fontSize = ''; return; }
      const max = el.dataset.fitMax ? innerHeight * parseFloat(el.dataset.fitMax) : 1e5;
      el.style.fontSize = Math.min((100 * el.clientWidth) / w, max).toFixed(2) + 'px';
    });
  }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 150); });

  if (!hasGsap || reduce) {            // static version: all content visible, no motion
    html.classList.remove('js');
    initUi();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
    $('.head').classList.add('is-solid');
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const EASE = 'expo.out';

  const lenis = new Lenis({ autoRaf: false, lerp: 0.12, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* signature: scroll cuts the suit to the street, business to culture */
  function hero() {
    const el = $('[data-sides]'); if (!el) return;
    let lastSide = 'Business';
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true,
        onUpdate: (self) => { const v = self.progress > 0.5 ? 'Culture' : 'Business'; if (v !== lastSide) { lastSide = v; document.dispatchEvent(new CustomEvent('bhoza:side', { detail: v })); } } } })
      .to('.sides__img--a', { scale: 1.08, duration: 0.8 }, 0)
      .fromTo('.sides__img--b', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55 }, 0.2)
      .to('.swap__a', { yPercent: -115, duration: 0.16, ease: 'power2.in' }, 0.36)
      .fromTo('.swap__b', { yPercent: 115 }, { yPercent: 0, duration: 0.22, ease: 'power2.out' }, 0.5)
      .to({}, { duration: 0.2 });
  }

  /* first frame: the gold sheet lifts, the photo cuts in, the name rises */
  function enter() {
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    tl.fromTo(curtain, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.75, ease: 'expo.inOut' }, 0.1);
    if ($('[data-intro="fade"]')) tl.fromTo('[data-intro="fade"]', { opacity: 0 }, { opacity: 1, duration: 1.3, ease: 'power2.out' }, 0.35);
    if ($('[data-intro="wipe"]')) tl.fromTo('[data-intro="wipe"]', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(-10% 0% -10% 0%)', duration: 1.1 }, 0.45);
    $$('[data-intro="lines"]').forEach((el) => {
      const s = SplitText.create(el, { type: 'lines', mask: 'lines', aria: 'none' });
      tl.from(s.lines, { yPercent: 108, duration: 1, stagger: 0.07 }, 0.5);
    });
    if ($('[data-intro="clip"]')) tl.fromTo('[data-intro="clip"]', { yPercent: 108 }, { yPercent: 0, duration: 1.05, stagger: 0.09 }, 0.55);
    if ($('.dock')) tl.fromTo('.dock', { yPercent: 140, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, clearProps: 'transform' }, 1.1);
    if ($('[data-intro="in"]')) tl.fromTo('[data-intro="in"]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 }, 0.8);
  }

  function reveals() {
    $$('[data-reveal="lines"]').forEach((el) => {
      SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true, aria: 'none',
        onSplit: (self) => gsap.from(self.lines, { yPercent: 108, duration: 0.95, ease: EASE, stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 88%', once: true } }) });
      el.classList.add('is-in');
    });
    ScrollTrigger.batch('[data-reveal=""]', { start: 'top 90%', once: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.05 }) });
    ScrollTrigger.batch('[data-reveal="img"]', { start: 'top 85%', once: true,
      onEnter: (els) => gsap.fromTo(els, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: EASE, stagger: 0.12 }) });
    $$('[data-par]').forEach((img) => {
      gsap.set(img, { scale: 1.16 });
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* idle state: the ticker band keeps rolling, and leans into the scroll */
  function ticker() {
    $$('.mq__track').forEach((t) => {
      let x = 0, on = false;
      new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(t.parentElement);
      gsap.ticker.add((time, dt) => {
        if (!on || document.hidden) return;
        x -= (dt / 1000) * (2.6 + Math.min(Math.abs(lenis.velocity || 0), 60) * 0.3);
        if (x <= -50) x += 50;
        gsap.set(t, { xPercent: x });
      });
    });
  }

  function header() {
    const head = $('.head');
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => {
      head.classList.toggle('is-solid', s.scroll() > 40);
      if (!head.classList.contains('is-menu')) head.classList.toggle('is-away', s.direction === 1 && s.scroll() > 400);
    } });
  }

  function transitions() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]'); if (!a) return;
      const href = a.getAttribute('href');
      if (e.metaKey || e.ctrlKey || e.shiftKey || a.target || !/^[\w-]+\.html(#[\w-]*)?$/.test(href)) return;
      if (href.split('#')[0] === (location.pathname.split('/').pop() || 'index.html')) return;
      e.preventDefault();
      gsap.fromTo(curtain, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'expo.inOut', onComplete: () => { location.href = href; } });
    });
    addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(curtain, { clipPath: 'inset(0% 0% 100% 0%)' }); });
  }

  document.fonts.ready.then(() => {
    fit(); initUi(); hero(); reveals(); ticker(); header(); transitions(); enter();
    ScrollTrigger.refresh();
  });

  /* ---------- plain UI (runs with or without motion) ---------- */
  function initUi() {
    const t = $('.clock');
    if (t) {
      const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Johannesburg', hour: '2-digit', minute: '2-digit', hour12: false });
      const tick = () => { t.textContent = fmt.format(new Date()); };
      tick(); setInterval(tick, 15000);
    }
    const btn = $('.dock__menu'), nav = $('.nav'), head = $('.head');
    const buzz = (ms = 8) => { try { if (!reduce && navigator.vibrate && matchMedia('(max-width:900px)').matches && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(ms); } catch (e) {} };
    if (btn && nav) {
      const set = (open) => {
        nav.classList.toggle('is-open', open); head.classList.toggle('is-menu', open);
        btn.setAttribute('aria-expanded', open); btn.firstElementChild.textContent = open ? 'Close' : 'Menu';
        document.body.style.overflow = open ? 'hidden' : '';
      };
      btn.addEventListener('click', () => { buzz(10); set(btn.getAttribute('aria-expanded') !== 'true'); });
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
    }

    /* phone dock: a live label that follows where you are (business or culture), and a rail for the six posters */
    const dock = $('.dock');
    if (dock) {
      const side = $('.dock__side', dock), txt = $('.dock__txt', dock), def = dock.dataset.dockDefault || 'Bhoza';
      const st = { sec: null, sides: 'Business', rail: 'Business' };
      let shown = txt.textContent;
      const render = () => {
        const v = st.sec === 'sides' ? st.sides : st.sec === 'rail' ? st.rail : st.sec || def;
        if (v === shown) return;
        shown = v; txt.textContent = v;
        side.dataset.side = v === 'Business' || v === 'Culture' ? v : '';
        if (hasGsap && !reduce) gsap.fromTo(txt, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'expo.out', overwrite: true });
      };
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { st.sec = e.target.dataset.dock; render(); } }), { rootMargin: '-50% 0px -50% 0px' });
        $$('[data-dock]').forEach((el) => io.observe(el));
      }
      document.addEventListener('bhoza:side', (e) => { st.sides = e.detail; if (st.sec === 'sides') { buzz(14); render(); } });
      const r = $('.stack'), segs = $$('[data-rail-ui] a'), hint = $('.rail__hint');
      if (r && 'IntersectionObserver' in window) {
        const cards = $$('.poster', r); let cur = -1;
        const set = (i, user) => {
          if (i === cur || i < 0) return; cur = i;
          segs.forEach((a, j) => { a.classList.toggle('is-on', j === i); j === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
          st.rail = cards[i].dataset.side; render();
          const ls = $('[data-rail-side]'), ln = $('[data-rail-name]'); if (ls) ls.textContent = st.rail; if (ln) ln.textContent = $('.poster__tab span:nth-child(2)', cards[i]).textContent;
          if (user) { buzz(8); if (hint) hint.classList.add('is-gone'); }
        };
        const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) set(cards.indexOf(e.target), cur !== -1); }), { root: r, threshold: 0.6 });
        cards.forEach((c) => rio.observe(c));
        segs.forEach((a, i) => a.addEventListener('click', (e) => {
          e.preventDefault(); buzz(6);
          r.scrollTo({ left: cards[i].offsetLeft - parseFloat(getComputedStyle(r).paddingLeft), behavior: reduce ? 'auto' : 'smooth' });
        }));
      }
      /* the soft keyboard eats the screen: step the dock aside while a field is open */
      document.addEventListener('focusin', (e) => { if (e.target.matches('input,textarea,select')) dock.classList.add('is-off'); });
      document.addEventListener('focusout', () => dock.classList.remove('is-off'));
    }
    // booking form: writes the email, never pretends to send it
    const form = $('#book-form');
    if (form) {
      const out = $('#book-out'), pre = $('pre', out), mail = $('#book-mail'), copy = $('#book-copy'), note = $('#book-note');
      const pick = (location.hash || '').slice(1);
      if (pick) { const c = form.querySelector(`input[data-k="${pick.replace(/[^\w-]/g, '')}"]`); if (c) c.checked = true; }
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const d = new FormData(form), picks = d.getAll('need');
        const subject = `Booking enquiry: ${picks.length ? picks.join(', ') : 'general'}`;
        const body = ['Hi Bhoza,', '', `${d.get('msg') || '(Tell Bhoza about the project here.)'}`, '',
          `What I need: ${picks.length ? picks.join(', ') : 'not sure yet'}`, `When: ${d.get('when') || 'to be confirmed'}`, '',
          `${d.get('name') || ''}`, `${d.get('email') || ''}`].join('\n');
        pre.textContent = `To: missbhoza@bhoza.co.za\nSubject: ${subject}\n\n${body}`;
        mail.href = `mailto:missbhoza@bhoza.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        out.classList.add('is-on'); note.textContent = 'Your email is written. Open it in your mail app, or copy it.';
        out.scrollIntoView({ block: 'nearest' });
      });
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(pre.textContent); note.textContent = 'Copied. Paste it into an email to missbhoza@bhoza.co.za.'; }
        catch { note.textContent = 'Copy was blocked here. Select the text above and copy it by hand.'; }
      });
    }
  }
})();
