/* Bhoza Mphela site behaviour. Vanilla JS, no dependencies.
   Everything here is an enhancement: the site reads and works with scripting off. */
(() => {
  const d = document;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- header: hairline once the page has scrolled */
  const hd = $('[data-hd]');
  if (hd && 'IntersectionObserver' in window) {
    const s = d.createElement('div');
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
    d.body.prepend(s);
    new IntersectionObserver(([e]) => hd.classList.toggle('is-scrolled', !e.isIntersecting)).observe(s);
  }

  /* ---------- mobile menu */
  const btn = $('[data-menu-btn]');
  const menu = $('[data-menu]');
  const outside = () => $$('main, footer');
  const setMenu = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    $('.hd__menu-t', btn).textContent = open ? 'Close' : 'Menu';
    menu.hidden = !open;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    outside().forEach((el) => (open ? el.setAttribute('inert', '') : el.removeAttribute('inert')));
    if (open) $('a', menu)?.focus();
  };
  if (btn && menu) {
    btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); }
    });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    matchMedia('(min-width: 1200px)').addEventListener('change', (m) => { if (m.matches && !menu.hidden) setMenu(false); });
  }

  /* ---------- the role line: one title at a time (the signature) */
  const roles = $('[data-roles]');
  if (roles) {
    const words = $$('.roles__w', roles);
    let i = 0, timer = 0, visible = true;
    const step = () => {
      const cur = words[i];
      i = (i + 1) % words.length;
      const nxt = words[i];
      cur.removeAttribute('data-on'); cur.classList.add('is-out');
      nxt.classList.remove('is-out'); nxt.setAttribute('data-on', '');
      setTimeout(() => cur.classList.remove('is-out'), 750);
    };
    const run = () => {
      clearInterval(timer);
      if (!reduce.matches && visible && !d.hidden) timer = setInterval(step, 2400);
    };
    const mode = () => { roles.classList.toggle('is-cycling', !reduce.matches); run(); };
    mode();
    reduce.addEventListener('change', mode);
    d.addEventListener('visibilitychange', run);
    roles.addEventListener('mouseenter', () => clearInterval(timer));
    roles.addEventListener('mouseleave', run);
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }).observe(roles);
  }

  /* ---------- reveals: settle in once, then stay */
  const rv = $$('[data-rv]');
  if ('IntersectionObserver' in window && !reduce.matches) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    rv.forEach((el) => io.observe(el));
  } else rv.forEach((el) => el.classList.add('is-in'));

  /* ---------- lightbox */
  let lb, lbItems = [], lbIndex = 0, lbOpener = null;
  const buildLb = () => {
    lb = d.createElement('dialog');
    lb.className = 'lb';
    lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML = `<div class="lb__bar"><p class="lb__count" aria-live="polite"></p><div class="lb__nav">
      <button type="button" data-lb-prev aria-label="Previous image">Prev</button>
      <button type="button" data-lb-next aria-label="Next image">Next</button>
      <button type="button" data-lb-close aria-label="Close image viewer">Close</button></div></div>
      <div class="lb__stage"><figure class="lb__fig"></figure></div><p class="lb__cap"></p>`;
    d.body.append(lb);
    $('[data-lb-prev]', lb).addEventListener('click', () => show(lbIndex - 1));
    $('[data-lb-next]', lb).addEventListener('click', () => show(lbIndex + 1));
    $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb__stage')) lb.close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(lbIndex + 1);
      if (e.key === 'ArrowLeft') show(lbIndex - 1);
    });
    lb.addEventListener('close', () => { d.body.classList.remove('menu-open'); lbOpener?.focus(); });
    let x0 = null;
    lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(lbIndex + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  };
  const show = (n) => {
    lbIndex = (n + lbItems.length) % lbItems.length;
    const item = lbItems[lbIndex];
    const src = $('.media, .ph', item);
    const clone = src.cloneNode(true);
    const img = $('img', clone);
    if (img) {
      img.removeAttribute('loading');
      img.sizes = '100vw';
      clone.style.setProperty('--ar', (img.width / img.height) || 0.8);
      img.alt = $('img', src).alt;
    }
    $('.lb__fig', lb).replaceChildren(clone);
    $('.lb__cap', lb).textContent = item.closest('li').querySelector('.gal__cap')?.textContent || '';
    $('.lb__count', lb).textContent = `${lbIndex + 1} of ${lbItems.length}`;
  };
  d.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lb]');
    if (!b) return;
    if (!lb) buildLb();
    lbItems = $$('[data-lb]', b.closest('[data-gallery]'));
    lbOpener = b;
    show(+b.dataset.lb);
    lb.showModal();
    d.body.classList.add('menu-open');
    $('[data-lb-close]', lb).focus();
  });

  /* ---------- video facades: the player loads only when asked */
  d.addEventListener('click', (e) => {
    const b = e.target.closest('.video__play');
    if (!b) return;
    const v = b.closest('[data-video]');
    const f = d.createElement('iframe');
    f.src = v.dataset.video;
    f.title = v.dataset.title || 'Video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    v.replaceChildren(f);
    f.focus();
  });

  /* ---------- enquiry form */
  const params = new URLSearchParams(location.search);
  $$('[data-form]').forEach((form) => {
    const wrap = form.closest('.enq');
    const ok = $('[data-form-ok]', wrap);
    const sum = $('[data-summary]', form);
    const submit = $('[data-submit]', form);
    const cat = $('#f-category', form);
    const picks = $$('[data-pick]');

    const setPick = (key) => picks.forEach((p) => p.setAttribute('aria-current', String(p.dataset.pick === key)));
    const type = params.get('type');
    if (type && $(`option[value="${CSS.escape(type)}"]`, cat)) cat.value = type;
    setPick(cat.value);
    cat.addEventListener('change', () => setPick(cat.value));
    picks.forEach((p) => p.addEventListener('click', (e) => {
      e.preventDefault();
      cat.value = p.dataset.pick;
      setPick(cat.value);
      clearErr(cat);
      history.replaceState(null, '', `?type=${p.dataset.pick}#enquiry`);
      wrap.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
      $('#f-name', form).focus({ preventScroll: true });
    }));

    if (params.get('sent') === '1') { form.hidden = true; ok.hidden = false; }

    const MSG = {
      name: 'Please tell us your name.',
      email: 'Please enter an email address, like name@example.com.',
      category: 'Please choose what your enquiry is about.',
      message: 'Please add a few more details (at least 20 characters).',
    };
    const check = (el) => {
      const v = el.value.trim();
      if (el.required && !v) return MSG[el.name];
      if (el.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return MSG.email;
      if (el.minLength > 0 && v && v.length < el.minLength) return MSG[el.name];
      return '';
    };
    const showErr = (el, msg) => {
      const p = $(`#${el.id}-err`, form);
      el.setAttribute('aria-invalid', 'true');
      p.textContent = msg; p.hidden = false;
    };
    const clearErr = (el) => {
      const p = $(`#${el.id}-err`, form);
      el.removeAttribute('aria-invalid');
      if (p) { p.textContent = ''; p.hidden = true; }
    };
    const fields = $$('input:not([name="website"]), select, textarea', form);
    fields.forEach((el) => {
      el.addEventListener('blur', () => { if (el.value.trim()) { const m = check(el); m ? showErr(el, m) : clearErr(el); } });
      el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') && !check(el)) clearErr(el); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bad = [];
      fields.forEach((el) => { const m = check(el); if (m) { showErr(el, m); bad.push([el, m]); } else clearErr(el); });
      if (bad.length) {
        sum.innerHTML = `<p><strong>Please fix ${bad.length === 1 ? 'one thing' : `${bad.length} things`} before sending:</strong></p><ul>${bad.map(([el, m]) => `<li><a href="#${el.id}">${m}</a></li>`).join('')}</ul>`;
        sum.hidden = false;
        sum.focus();
        return;
      }
      sum.hidden = true;
      submit.disabled = true; submit.classList.add('is-loading');
      $('span', submit).textContent = 'Sending';
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.ok === false) throw new Error(data.error || 'send failed');
        form.hidden = true; ok.hidden = false;
        ok.scrollIntoView({ block: 'start', behavior: reduce.matches ? 'auto' : 'smooth' }); ok.focus({ preventScroll: true });
        form.reset(); setPick('');
        if (window.gtag) gtag('event', 'generate_lead', { category: cat.value });
      } catch (err) {
        sum.innerHTML = `<p><strong>Sorry, your enquiry did not send.</strong> Please try again, or email <a href="mailto:${form.dataset.email || ''}">${form.dataset.email || 'us directly'}</a>.</p>`;
        sum.hidden = false; sum.focus();
      } finally {
        submit.disabled = false; submit.classList.remove('is-loading');
        $('span', submit).textContent = 'Send enquiry';
      }
    });
    $('[data-form-again]', wrap)?.addEventListener('click', () => {
      ok.hidden = true; form.hidden = false;
      history.replaceState(null, '', location.pathname + '#enquiry');
      $('#f-name', form).focus();
    });
  });

  /* ---------- analytics: one value in content/site.json ("G-..." = Google Analytics 4, anything else = Cloudflare Web Analytics token) */
  const id = d.body.dataset.analytics;
  if (id) {
    const s = d.createElement('script');
    s.defer = true;
    if (/^G-/.test(id)) {
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag('js', new Date()); gtag('config', id, { anonymize_ip: true });
    } else {
      s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      s.dataset.cfBeacon = JSON.stringify({ token: id });
    }
    d.head.append(s);
  }
})();
