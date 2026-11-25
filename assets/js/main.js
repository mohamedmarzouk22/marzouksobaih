/* marzouksobaih.com — tiny vanilla JS: nav, reveal, recent-work (JSON), email assembly, hero canvas, lightbox. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  /* mobile nav */
  var btn = document.querySelector('.menu-btn');
  var list = document.querySelector('.nav ul');
  if (btn && list) {
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    list.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { list.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* reveal on scroll */
  var rev = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add('in'); }); }

  /* active nav link */
  var links = [].slice.call(document.querySelectorAll('.nav ul a[href^="#"]'));
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          links.forEach(function (a) { a.classList.remove('active'); });
          map[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* email assembled in the browser so it is not sitting in the HTML as plain text */
  document.querySelectorAll('[data-u][data-d]').forEach(function (el) {
    var addr = el.getAttribute('data-u') + '@' + el.getAttribute('data-d');
    el.textContent = addr;
    if (el.tagName === 'A') el.setAttribute('href', 'mailto:' + addr);
  });

  /* recent work: rendered from data/recent-work.json (add an entry there, nothing else) */
  var grid = document.getElementById('work-grid');
  if (grid) {
    fetch('data/recent-work.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (items) {
        grid.textContent = '';
        items.forEach(function (it) { grid.appendChild(card(it)); });
      })
      .catch(function () { grid.innerHTML = '<p class="empty">Recent work could not be loaded.</p>'; });
  }
  function el(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt) n.textContent = txt; return n; }
  function card(it) {
    var isVideo = it.type === 'youtube';
    var c = el(isVideo ? 'a' : 'div', 'card reveal in');
    var th = el('div', 'thumb');
    if (isVideo) {
      c.href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(it.id);
      c.target = '_blank'; c.rel = 'noopener';
      var im = new Image(); im.alt = ''; im.loading = 'lazy';
      im.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(it.id) + '/hqdefault.jpg';
      im.onerror = function () { im.remove(); };
      th.appendChild(im); th.appendChild(el('span', 'play'));
    } else {
      th.classList.add('contain');
      var g = new Image(); g.alt = it.title; g.loading = 'lazy'; g.src = it.src; th.appendChild(g);
    }
    c.appendChild(th);
    var b = el('div', 'body');
    b.appendChild(el('h3', '', it.title));
    if (it.description) b.appendChild(el('p', '', it.description));
    if (it.tags && it.tags.length) {
      var ul = el('ul', 'chips');
      it.tags.forEach(function (t) { ul.appendChild(el('li', '', t)); });
      b.appendChild(ul);
    }
    c.appendChild(b);
    return c;
  }

  /* lightbox (personal page) */
  var lb = document.getElementById('lb');
  if (lb) {
    var lbImg = lb.querySelector('img');
    document.querySelectorAll('.gal button').forEach(function (b) {
      b.addEventListener('click', function () { lbImg.src = b.getAttribute('data-full'); lbImg.alt = b.getAttribute('aria-label') || ''; lb.classList.add('open'); });
    });
    lb.addEventListener('click', function () { lb.classList.remove('open'); lbImg.src = ''; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { lb.classList.remove('open'); lbImg.src = ''; } });
  }

  /* hero visual: optional video (set data-video on #hero) else a light canvas "binding" animation */
  var hero = document.getElementById('hero');
  var cv = document.getElementById('hero-canvas');
  if (hero && hero.getAttribute('data-video')) {
    var v = document.createElement('video');
    v.id = 'hero-video'; v.src = hero.getAttribute('data-video');
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute('aria-hidden', 'true');
    hero.insertBefore(v, hero.firstChild);
    if (cv) cv.remove();
    return;
  }
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, DPR, pts = [], pocket = [], t = 0, raf = 0, visible = true;

  function setup() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var n = Math.round(Math.min(80, (W * H) / 15000));
    pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28, r: 1 + Math.random() * 1.5 });
    pocket = [];
    for (var k = 0; k < 8; k++) pocket.push({ a: (k / 8) * Math.PI * 2, r: 62 + (k % 2) * 14 });
  }
  function center() { return { x: W < 700 ? W * .78 : W * .74, y: W < 700 ? H * .13 : H * .5 }; }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    var c = center();
    // ligand: approaches the pocket, binds, then dissociates (slow cycle)
    var d = 18 + 150 * (0.5 + 0.5 * Math.sin(t * 0.35));
    var lx = c.x + Math.cos(t * 0.9) * d, ly = c.y + Math.sin(t * 0.7) * d * 0.7;
    var i, j, p, q, dx, dy, dist;
    for (i = 0; i < pts.length; i++) {
      p = pts[i]; p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      for (j = i + 1; j < pts.length; j++) {
        q = pts[j]; dx = p.x - q.x; dy = p.y - q.y; dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) { ctx.strokeStyle = 'rgba(125,211,252,' + (0.16 * (1 - dist / 120)) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      dx = p.x - lx; dy = p.y - ly; dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) { ctx.strokeStyle = 'rgba(251,191,36,' + (0.35 * (1 - dist / 130)) + ')'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(lx, ly); ctx.stroke(); }
      ctx.fillStyle = 'rgba(125,211,252,.55)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    }
    // pocket residues
    for (i = 0; i < pocket.length; i++) {
      var a = pocket[i].a + t * 0.12, px = c.x + Math.cos(a) * pocket[i].r, py = c.y + Math.sin(a) * pocket[i].r;
      var nx = c.x + Math.cos(pocket[(i + 1) % pocket.length].a + t * 0.12) * pocket[(i + 1) % pocket.length].r;
      var ny = c.y + Math.sin(pocket[(i + 1) % pocket.length].a + t * 0.12) * pocket[(i + 1) % pocket.length].r;
      ctx.strokeStyle = 'rgba(94,234,212,.45)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(nx, ny); ctx.stroke();
      ctx.fillStyle = '#5eead4'; ctx.beginPath(); ctx.arc(px, py, 3.2, 0, 6.2832); ctx.fill();
    }
    // ligand glow
    var g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 18);
    g.addColorStop(0, 'rgba(251,191,36,.95)'); g.addColorStop(1, 'rgba(251,191,36,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly, 18, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(lx, ly, 4.5, 0, 6.2832); ctx.fill();
    t += 0.016;
    if (!reduce && visible) raf = requestAnimationFrame(frame);
  }
  setup(); frame();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { cancelAnimationFrame(raf); setup(); frame(); }, 150); });
  if ('IntersectionObserver' in window && !reduce) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
    }).observe(hero);
  }
})();
