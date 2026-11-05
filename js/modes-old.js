/* Тайные режимы рудик.рф: набрать на клавиатуре «нг», «снег», «дождь», «тыква», «гав» (раскладка не важна) — включить/выключить.
   Тайная кнопка: клик по копирайту внизу — выбор режима. Режим живёт только в этой вкладке (sessionStorage). */
(function () {
  'use strict';
  var MODES = {
    ng:      { word: 'нг',    name: 'Новогодний',      ico: '🎄' },
    snow:    { word: 'снег',  name: 'Снежный',         ico: '❄️' },
    rain:    { word: 'дождь', name: 'Дождливый',       ico: '🌧️' },
    pumpkin: { word: 'тыква', name: 'Хеллоуин',        ico: '🎃' },
    dogs:    { word: 'гав',   name: 'Летающие собаки', ico: '🐶' }
  };
  var DOG_SPRITES = ['/img/dog-fly.webp?v=1'];          /* сюда можно добавить новые прозрачные спрайты собак */
  var EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`", RU = 'йцукенгшщзхъфывапролджэячсмитьбюё';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = Math.min(screen.width, innerWidth) <= 640;
  var mode = null, cv = null, ctx = null, W = 0, H = 0, DPR = 1, parts = [], raf = 0, tint = null, last = 0, dogImgs = null, t0 = 0;

  /* ---------- холст ---------- */
  function ensure() {
    if (cv) return;
    cv = document.createElement('canvas'); cv.className = 'rd-fx'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv); ctx = cv.getContext('2d');
    tint = document.createElement('div'); tint.className = 'rd-fx-tint'; tint.setAttribute('aria-hidden', 'true'); document.body.appendChild(tint);
    addEventListener('resize', size, { passive: true }); size();
  }
  function size() { if (!cv) return; DPR = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  function R(a, b) { return a + Math.random() * (b - a); }
  function count(n) { return Math.round(n * Math.min(1.4, (W * H) / (1280 * 720)) * (mobile ? .6 : 1)); }

  function flake(any) { return { k: 'f', x: R(0, W), y: any ? R(0, H) : R(-40, -5), r: R(1.2, 3.6), vy: R(25, 70), dx: R(0, 6.28), a: R(.55, .95) }; }
  function drop(any) { return { k: 'r', x: R(-60, W), y: any ? R(0, H) : R(-80, -10), l: R(10, 22), vy: R(650, 950), a: R(.4, .7) }; }
  function bat() { var l = Math.random() < .5; return { k: 'b', l: l, x: l ? -40 : W + 40, y: R(H * .08, H * .6), vx: (l ? 1 : -1) * R(90, 170), s: R(12, 22), ph: R(0, 6.28), dy: R(0, 6.28) }; }
  function dog() { var l = Math.random() < .5, s = R(.28, .6) * (mobile ? .7 : 1); return { k: 'd', l: l, x: l ? -200 : W + 200, y: R(H * .1, H * .75), vx: (l ? 1 : -1) * R(160, 300), s: s, ph: R(0, 6.28), rot: R(-.15, .15) }; }

  function setup() {
    parts = [];
    if (mode === 'snow') for (var i = 0; i < count(110); i++) parts.push(flake(true));
    if (mode === 'ng') for (i = 0; i < count(45); i++) parts.push(flake(true));
    if (mode === 'rain') for (i = 0; i < count(130); i++) parts.push(drop(true));
    if (mode === 'pumpkin') for (i = 0; i < 3; i++) { var b = bat(); b.x = R(0, W); parts.push(b); }
    if (mode === 'dogs') { if (!dogImgs) dogImgs = DOG_SPRITES.map(function (s) { var im = new Image(); im.src = s; return im; }); parts.push(dog()); }
  }

  function garland(t) {
    var n = Math.max(10, Math.round(W / 46)), sag = 18, cols = ['#ff3b3b', '#ffd23b', '#3bff7a', '#3bb8ff', '#ff5bd6'];
    ctx.strokeStyle = 'rgba(40,60,40,.85)'; ctx.lineWidth = 1.6; ctx.beginPath();
    for (var x = 0; x <= W; x += 8) { var u = (x % (W / 4)) / (W / 4); ctx.lineTo(x, 4 + Math.sin(u * Math.PI) * sag); } ctx.stroke();
    for (var i = 0; i < n; i++) {
      var bx = (i + .5) * W / n, uu = (bx % (W / 4)) / (W / 4), by = 4 + Math.sin(uu * Math.PI) * sag + 7;
      var on = .45 + .55 * Math.abs(Math.sin(t * 1.7 + i * 1.3)), c = cols[i % cols.length];
      ctx.globalAlpha = on * .35; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(bx, by, 9, 0, 6.28); ctx.fill();
      ctx.globalAlpha = .5 + on * .5; ctx.beginPath(); ctx.ellipse(bx, by, 3.6, 5.2, 0, 0, 6.28); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function batShape(p, t) {
    var f = Math.sin(t * 14 + p.ph) * .6, s = p.s;
    ctx.save(); ctx.translate(p.x, p.y + Math.sin(t * 2 + p.dy) * 14); ctx.fillStyle = 'rgba(25,10,30,.9)'; ctx.beginPath();
    ctx.moveTo(0, 0); ctx.quadraticCurveTo(-s * .6, -s * (.5 + f), -s * 1.4, -s * f * .8); ctx.quadraticCurveTo(-s * .8, s * .1, -s * .3, s * .25);
    ctx.lineTo(0, s * .12); ctx.lineTo(s * .3, s * .25); ctx.quadraticCurveTo(s * .8, s * .1, s * 1.4, -s * f * .8); ctx.quadraticCurveTo(s * .6, -s * (.5 + f), 0, 0); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -s * .05, s * .22, 0, 6.28); ctx.fill(); ctx.restore();
  }
  function pumpkins() {
    var fs = mobile ? 34 : 52; ctx.font = fs + 'px serif'; ctx.textBaseline = 'bottom';
    ctx.fillText('🎃', 8, H - 6); ctx.fillText('🎃', W - fs - 14, H - 6);
    if (!mobile) { ctx.font = (fs * .7) + 'px serif'; ctx.fillText('🎃', fs + 12, H - 6); }
  }

  function frame(now) {
    raf = 0; if (!mode) return;
    var dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now; var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      if (p.k === 'f') {
        p.y += p.vy * dt; p.dx += dt; p.x += Math.sin(p.dx) * 12 * dt;
        if (p.y > H + 5) parts[i] = flake(false);
        ctx.globalAlpha = p.a; ctx.fillStyle = '#e4eef9'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
        ctx.globalAlpha = p.a; ctx.strokeStyle = 'rgba(95,125,170,.75)'; ctx.lineWidth = .9; ctx.stroke();
      } else if (p.k === 'r') {
        p.y += p.vy * dt; p.x += p.vy * .12 * dt;
        if (p.y > H + 20) parts[i] = drop(false);
        ctx.globalAlpha = p.a; ctx.strokeStyle = '#5a7aa0'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.l * .12, p.y + p.l); ctx.stroke();
      } else if (p.k === 'b') {
        p.x += p.vx * dt; if (p.x < -80 || p.x > W + 80) parts[i] = bat(); batShape(p, t);
      } else if (p.k === 'd') {
        p.x += p.vx * dt; var im = dogImgs[0];
        if (p.x < -260 || p.x > W + 260) { parts.splice(i, 1); continue; }
        if (im.complete && im.naturalWidth) {
          var w = im.naturalWidth * p.s, hh = im.naturalHeight * p.s;
          ctx.save(); ctx.translate(p.x, p.y + Math.sin(t * 3 + p.ph) * 22); ctx.rotate(p.rot + Math.sin(t * 4 + p.ph) * .08);
          if (!p.l) ctx.scale(-1, 1); ctx.globalAlpha = 1; ctx.drawImage(im, -w / 2, -hh / 2, w, hh);
          ctx.font = Math.round(22 * p.s * 2.4) + 'px sans-serif'; ctx.fillStyle = '#c0392b'; ctx.globalAlpha = .9;
          if (Math.sin(t * 2.2 + p.ph) > .6) { ctx.scale(p.l ? 1 : -1, 1); ctx.fillText('гав!', (p.l ? 1 : -1) * w * .35, -hh * .45); }
          ctx.restore();
        }
      }
    }
    ctx.globalAlpha = 1;
    if (mode === 'dogs' && parts.length < (mobile ? 2 : 4) && Math.random() < dt * 1.1) parts.push(dog());
    if (mode === 'pumpkin') { if (parts.length < (mobile ? 3 : 5) && Math.random() < dt * .4) parts.push(bat()); pumpkins(); }
    if (mode === 'ng') garland(t);
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  function run() { if (!raf && mode && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else run(); });

  function set(m, quiet) {
    if (m && !MODES[m]) m = null;
    mode = m; try { m ? sessionStorage.setItem('rdMode', m) : sessionStorage.removeItem('rdMode'); } catch (e) {}
    document.documentElement.setAttribute('data-rd-mode', m || '');
    if (!m) { stop(); if (cv) { ctx.clearRect(0, 0, W, H); cv.style.display = 'none'; } if (!quiet) toast('Обычный режим'); return; }
    ensure(); cv.style.display = ''; size(); setup(); t0 = performance.now(); stop();
    if (reduce) frame(performance.now()); else run();
    if (!quiet) toast(MODES[m].ico + ' ' + MODES[m].name + ' режим');
  }
  function toggle(m) { set(mode === m ? null : m); }
  window.RUDIK_MODE = function (m) { if (m === undefined) return mode; set(m); };

  var tt = null, ttT = 0;
  function toast(s) {
    if (!tt) { tt = document.createElement('div'); tt.className = 'rd-toast'; tt.setAttribute('role', 'status'); document.body.appendChild(tt); }
    tt.textContent = s; tt.classList.add('on'); clearTimeout(ttT); ttT = setTimeout(function () { tt.classList.remove('on'); }, 1800);
  }

  /* ---------- секретные слова ---------- */
  var buf = '';
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var k = (e.key || '').toLowerCase(), cd = e.code || '';
    if (!/[а-яё]/.test(k)) {                                   /* не кириллица — берём физическую клавишу (раскладка не важна) */
      var CODES = { Semicolon: ';', Quote: "'", BracketLeft: '[', BracketRight: ']', Comma: ',', Period: '.', Backquote: '`' };
      var en = /^Key[A-Z]$/.test(cd) ? cd.slice(3).toLowerCase() : CODES[cd] || (k.length === 1 ? k : '');
      var j = EN.indexOf(en); k = j >= 0 ? RU[j] : en;
    }
    if (k.length !== 1) return;
    if (k === 'ё') k = 'е';
    buf = (buf + k).slice(-8);
    for (var m in MODES) if (buf.slice(-MODES[m].word.length) === MODES[m].word) {
      /* «нг» не путать с концом другого слова (например «снег» не кончается на «нг», но страхуемся) */
      buf = ''; toggle(m); break;
    }
  });

  /* ---------- тайная кнопка: копирайт ---------- */
  var menu = null;
  function openMenu(anchor) {
    if (!menu) {
      menu = document.createElement('div'); menu.className = 'rd-modes'; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-label', 'Выбор режима');
      var h = '<div class="rd-modes-t">Тайные режимы</div>';
      for (var m in MODES) h += '<button type="button" data-m="' + m + '"><span>' + MODES[m].ico + '</span>' + MODES[m].name + '</button>';
      h += '<button type="button" data-m=""><span>✨</span>Обычный</button>';
      menu.innerHTML = h; document.body.appendChild(menu);
      menu.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; e.stopPropagation(); set(b.getAttribute('data-m') || null); closeMenu(); });
    }
    [].forEach.call(menu.querySelectorAll('button'), function (b) { b.classList.toggle('cur', (b.getAttribute('data-m') || null) === mode); });
    menu.classList.add('on');
    var r = anchor.getBoundingClientRect(), mw = menu.offsetWidth, mh = menu.offsetHeight;
    menu.style.left = Math.max(8, Math.min(innerWidth - mw - 8, r.left + r.width / 2 - mw / 2)) + 'px';
    menu.style.top = Math.max(8, r.top - mh - 10) + 'px';
    var f = menu.querySelector('button.cur') || menu.querySelector('button'); try { f.focus({ preventScroll: true }); } catch (e) {}
  }
  function closeMenu() { if (menu) menu.classList.remove('on'); }
  document.addEventListener('click', function (e) { if (menu && menu.classList.contains('on') && !menu.contains(e.target) && !(e.target.closest && e.target.closest('.rd-copy'))) closeMenu(); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  addEventListener('scroll', closeMenu, { passive: true });

  function markCopy() {
    var els = document.querySelectorAll('.wb-stl-footer, .rd-copy');
    [].forEach.call(els, function (el) {
      if (el._rdCopy || !/©/.test(el.textContent)) return; el._rdCopy = 1; el.classList.add('rd-copy');
      el.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); menu && menu.classList.contains('on') ? closeMenu() : openMenu(el); });
    });
  }
  function init() {
    markCopy();
    var s = null; try { s = sessionStorage.getItem('rdMode'); } catch (e) {}
    if (s && MODES[s] && !mode) set(s, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
