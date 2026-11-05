/* Интерактив рудик.рф (общий для основного сайта и /test/):
   1) полноэкранный просмотр фото и «живых» фото (PhotoSwipe, тот же что и раньше);
   2) вращение плиток-логотипов разделов по клику;
   3) крючок для роликов-реакций героев (window.RUDIK_REACTIONS; без роликов — ничего не делает);
   4) batch-1105: полёт корабля после клика, планета-переключатель календаря, «заворот» страницы с номером, косточки над календарём,
      Виталик на мотоцикле по разделителям. */
(function () {
  'use strict';
  var TEST = !!document.getElementById('themeBtn') || /^\/test\//.test(location.pathname);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function all(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function closest(el, sel) { while (el && el.nodeType === 1) { if (el.matches(sel)) return el; el = el.parentNode; } return null; }

  /* ---------- загрузка картинки с запасными адресами ---------- */
  function abs(u) {
    if (!u) return '';
    u = u.replace(/\\\//g, '/');
    if (/^(https?:)?\/\//.test(u)) return u;
    if (u.charAt(0) !== '/') u = '/' + u;
    return u;
  }
  function isRemote(u) { return /^(https?:)?\/\//.test(u) && u.indexOf(location.host) < 0; }
  function loadImg(src) {
    return new Promise(function (ok, no) {
      var i = new Image(), t = setTimeout(function () { i.onload = i.onerror = null; no(); }, isRemote(src) ? 4500 : 15000);
      i.onload = function () { clearTimeout(t); if (i.naturalWidth) ok(i); else no(); };
      i.onerror = function () { clearTimeout(t); no(); };
      i.src = src;
    });
  }
  function firstLoadable(list) {
    var seen = {}, l = list.filter(function (u) { if (!u || seen[u]) return false; return (seen[u] = 1); });
    return l.reduce(function (p, u) { return p.catch(function () { return loadImg(u); }); }, Promise.reject());
  }
  /* картинка-миниатюра gallery_gen/<hash>_WxH.ext -> полноразмерная gallery_gen/<hash>.ext */
  function fullOf(src) { var f = src.replace(/_\d+x\d+(?:\.\d+)?(?=\.\w+(?:\?.*)?$)/, ''); return f !== src ? f : ''; }
  function origFromScript(el) {
    var sc = el.querySelector('script'); if (!sc) return '';
    var m = /img\.src\s*=\s*"([^"]+)"/.exec(sc.textContent); return m ? abs(m[1]) : '';
  }

  /* ---------- PhotoSwipe ---------- */
  function pswpEl() { return document.querySelector('body > .pswp') || document.querySelector('.pswp'); }
  function openPS(items, index, pre) {
    var el = pswpEl();
    if (!el || !window.PhotoSwipe) { var u = items[index || 0] && items[index || 0].src; if (u) window.open(u, '_blank'); return null; }
    var g = new PhotoSwipe(el, window.PhotoSwipeUI_Default, items, {
      index: index || 0, history: false, shareEl: false, bgOpacity: .92, closeOnScroll: false, getDoubleTapZoom: function (isMouse, item) { return item.initialZoomLevel * 2; }
    });
    g.listen('afterChange', function () { all('.pswp video').forEach(function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }); });
    g.listen('beforeChange', function () { all('.pswp video').forEach(function (v) { v.pause(); }); });
    g.listen('destroy', function () { all('.pswp video').forEach(function (v) { v.pause(); }); document.body.style.cursor = ''; });
    if (pre) pre(g);
    g.init();
    return g;
  }
  var busy = false;
  function wait(on) { document.body.style.cursor = on ? 'progress' : ''; }
  function showImage(cands) {
    if (busy) return; busy = true; wait(true);
    firstLoadable(cands).then(function (img) {
      openPS([{ src: img.src, w: img.naturalWidth, h: img.naturalHeight, msrc: img.src }], 0);
    }).catch(function () {}).then(function () { busy = false; wait(false); });
  }
  /* «живое» фото: открываем зацикленный ролик, под ним ссылка на оригинал (если он нашёлся) */
  function showLoop(v, origCands) {
    if (busy) return; busy = true;
    var box = document.createElement('div'); box.className = 'rd-lb-slide';
    var vid = document.createElement('video');
    vid.src = v.currentSrc || v.src; if (v.poster) vid.poster = v.poster;
    vid.muted = true; vid.loop = true; vid.autoplay = true; vid.playsInline = true; vid.setAttribute('playsinline', '');
    vid.setAttribute('aria-label', v.getAttribute('aria-label') || 'Живое фото');
    box.appendChild(vid);
    var a = document.createElement('a'); a.className = 'rd-lb-orig'; a.target = '_blank'; a.rel = 'noopener'; a.hidden = true; a.textContent = 'открыть оригинал фото';
    box.appendChild(a);
    firstLoadable(origCands).then(function (i) { a.href = i.src; a.hidden = false; }).catch(function () {});
    openPS([{ html: box }], 0);
    var p = vid.play(); if (p && p.catch) p.catch(function () {});
    busy = false;
  }

  /* ---------- что считается «фото» на странице ---------- */
  function bigEnough(el) { var r = el.getBoundingClientRect(); return r.width >= 150 && r.height >= 150; }
  function classify(t) {
    var el;
    if (TEST) {
      /* ссылка на картинку (сетка фото, «живые» фото Алины) */
      var a = closest(t, 'a[href]');
      if (a && isImgHref(a.getAttribute('href')) && !a.closest('nav,.ico')) {
        var vv = a.querySelector('video');
        return vv ? { kind: 'loop', v: vv, orig: [fullOf(a.getAttribute('href')), a.getAttribute('href')].map(abs) } : { kind: 'grid', a: a };
      }
      if (a) return null;
      var v = closest(t, 'video.lv');
      if (v && !v.controls && !closest(v, '.dogs,.spacev,.dogsr,.ytc,.ph,nav,header,footer')) return { kind: 'loop', v: v, orig: [fullOf(v.getAttribute('poster') || ''), v.getAttribute('poster')].map(abs) };
      var im = closest(t, 'section img');
      if (im && !closest(im, 'a,.ico,.vcard,.vgrid,nav,header,footer') && bigEnough(im)) return { kind: 'img', img: im };
      return null;
    }
    el = closest(t, '.wb_element_picture');
    if (!el || closest(t, 'a[href]')) return null;
    var vid = el.querySelector('video.rd-photo, video.rd-loop');
    if (vid) {
      if (!bigEnough(vid)) return null;
      var poster = vid.getAttribute('poster') || '';
      return { kind: 'loop', el: el, v: vid, orig: [origFromScript(el), fullOf(poster), poster].map(abs) };
    }
    var img = el.querySelector('img');
    if (img && !el.querySelector('a[href]') && bigEnough(img)) {
      var s = img.getAttribute('src') || '';
      return { kind: 'img', el: el, img: img, cands: [origFromScript(el), fullOf(s), s].map(abs) };
    }
    return null;
  }
  function gridItems(a) {
    var host = a.closest('.pgrid') || a.parentNode;
    var links = all('a[href]', host).filter(function (x) { return isImgHref(x.getAttribute('href')) && !x.querySelector('video') && !x.closest('nav,.ico'); });
    var idx = Math.max(0, links.indexOf(a));
    return { links: links, idx: idx };
  }
  function isImgHref(h) { return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(h || '') || /^\/(img|gallery_gen)\//.test(h || ''); }
  function onPhoto(e) {
    if (e.defaultPrevented && !e.rdForce) return;
    if (e.type === 'click' && e.button) return;
    var c = classify(e.target); if (!c) return;
    e.stopPropagation(); e.stopImmediatePropagation();
    if (e.type === 'touchend') return;       /* старый обработчик жил на touchend; сам просмотр открываем по click */
    e.preventDefault();
    if (c.kind === 'grid') {
      var g = gridItems(c.a);
      /* вся сетка листается стрелками/свайпом; размеры узнаём по мере показа */
      var items = g.links.map(function (l) {
        var th = l.querySelector('img');
        return { src: l.getAttribute('href'), w: 1600, h: 1200, msrc: th ? (th.currentSrc || th.src) : undefined, rdSize: false };
      });
      openPS(items, g.idx, function (ps) {
        ps.listen('gettingData', function (i, item) {
          if (item.rdSize || item.rdLoading) return; item.rdLoading = true;
          var im = new Image();
          im.onload = function () { item.w = im.naturalWidth; item.h = im.naturalHeight; item.rdSize = true; ps.invalidateCurrItems(); ps.updateSize(true); };
          im.src = item.src;
        });
      });
      return;
    }
    if (c.kind === 'loop') { showLoop(c.v, c.orig || []); return; }
    if (c.kind === 'img') { showImage(c.cands || [abs(c.img.getAttribute('src'))]); return; }
  }
  document.addEventListener('click', onPhoto, true);
  document.addEventListener('touchend', function (e) { var c = classify(e.target); if (c && !TEST) { e.stopPropagation(); e.stopImmediatePropagation(); } }, true);
  /* курсор «увеличить» на кликабельных фото */
  function markZoom() {
    if (TEST) { all('section video.lv, section img').forEach(function (n) { var c = classify(n); if (c) n.classList.add('rd-zoom'); }); return; }
    all('.wb_element_picture').forEach(function (el) {
      var t = el.querySelector('video,img'); if (t && classify(t)) el.classList.add('rd-zoom');
    });
  }

  /* ---------- вращение плиток-логотипов ---------- */
  var SPIN_MS = 5000;
  function spinEls(els, cx, cy, ms, turns) {
    if (reduce || !els.length) return;
    var spinning = els[0]._rdSpin; if (spinning) return;
    els.forEach(function (el) {
      el._rdSpin = true;
      var ox = cx == null ? 'center' : (cx - el.offsetLeft) + 'px ' + (cy - el.offsetTop) + 'px';
      el.style.transformOrigin = ox;
      var an = el.animate([{ rotate: '0deg' }, { rotate: (360 * turns) + 'deg' }], { duration: ms, easing: 'cubic-bezier(.25,.1,.2,1)' });
      var done = function () { el._rdSpin = false; el.style.transformOrigin = ''; };
      an.onfinish = done; an.oncancel = done;
    });
  }
  var TILES = {};
  if (!TEST) {
    [[37, 39], [75, 56], [80, 91], [107, 106], [128, 109], [200, 192], [211, 205], [231, 227]].forEach(function (p) {
      var t = document.getElementById('wb_element_instance' + p[0]), s = document.getElementById('wb_element_instance' + p[1]);
      if (!t || !s) return;
      var pair = { els: [t, s] }; TILES[t.id] = TILES[s.id] = pair; t.classList.add('rd-tile'); s.classList.add('rd-tile');
    });
  }
  function onSpin(e) {
    if (e.button) return;
    var t = e.target;
    if (TEST) {
      var tag = closest(t, '.tag'); if (tag) spinEls([tag], null, null, SPIN_MS, 4); return;
    }
    var el = closest(t, '.wb_element'); if (!el) return;
    var pr = TILES[el.id];
    if (pr) {
      var s = pr.els[1];
      spinEls(pr.els, s.offsetLeft + s.offsetWidth / 2, s.offsetTop + s.offsetHeight / 2, SPIN_MS, 4);
      return;
    }
    /* плитка-ссылка «ИИшница → Промты»: открывается в новой вкладке, крутим ~1 с параллельно */
    var sq = closest(t, 'a.ii-sq');
    if (sq) spinEls([sq], null, null, 1100, 1);
  }
  document.addEventListener('click', onSpin);
  if (TEST) all('.tag').forEach(function (n) { n.classList.add('rd-tile'); });

  /* ---------- крючок для роликов-реакций ---------- */
  /* window.RUDIK_REACTIONS = { iiDance:'/video/reactions/dance.mp4', iiDetective:'…', iiShip:'…', rdDogs:'…' }
     Ролик должен начинаться и заканчиваться кадром петли героя: он плавно проявляется поверх петли, после конца
     исчезает, и герой продолжает свою петлю. Если ролика нет — клик ничего не делает. */
  var HEROES = TEST ? { dogs: 'rdDogs' } : { iiDance: 'iiDance', iiDetective: 'iiDetective', iiShip: 'iiShip', rdDogs: 'rdDogs' };
  /* Сюда впишем пути готовых роликов, когда они появятся (или задать window.RUDIK_REACTIONS до загрузки скрипта) */
  /* ret — время кадра петли, больше всего похожего на последний кадр реакции (подобрано попиксельным сравнением
     всех кадров петли, scripts/../seam: diff ниже = лучше); туда петля перематывается к концу реакции. */
  var REACTIONS = {
    iiDance: { src: '/video/reactions/vitalik-dance-react.mp4?v=1', ret: 0.042 },
    iiDetective: { src: '/video/reactions/kot-detektiv-dog-react.mp4?v=1', ret: 13.917 },
    iiShip: { src: '/video/reactions/roskotmos-ship-react.mp4?v=1', ret: 0,
      /* после взлёта (out, с) корабль подменяется прозрачным спрайтом и летает по разделу; перед посадкой (in, с) снова подхватывает ролик */
      fly: { out: 1.25, in: 4.25, a: '/video/reactions/roskotmos-ship-fly-a.webp?v=1', b: '/video/reactions/roskotmos-ship-fly-b.webp?v=1' } },
    rdDogs: { src: '/video/reactions/dogs-react.mp4?v=1', ret: 7.458 },   /* в /test/ ключ тот же: dogs */
  };
  var FADE_IN = 200, FADE_OUT = 450;
  function reactionCfg(key) {
    var r = (window.RUDIK_REACTIONS || REACTIONS)[key];
    if (!r) return null; return typeof r === 'string' ? { src: r, ret: 0 } : r;
  }
  function reactionSrc(key) { var c = reactionCfg(key); return c ? c.src : ''; }
  function nextFrame(v, cb) { if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(function () { cb(); }); else requestAnimationFrame(function () { requestAnimationFrame(cb); }); }
  function getReactVid(host, key, preload) {
    var c = reactionCfg(key); if (!c) return null;
    var loop = host.querySelector('video:not(.rd-react)'); if (!loop) return null;
    var rv = host._rdVid;
    if (!rv) {
      rv = host._rdVid = document.createElement('video');
      rv.className = loop.className + ' rd-react'; rv.muted = true; rv.defaultMuted = true; rv.playsInline = true;
      rv.setAttribute('playsinline', ''); rv.setAttribute('muted', ''); rv.preload = preload || 'auto';
      rv.setAttribute('aria-hidden', 'true'); rv.tabIndex = -1; rv.src = c.src; host.appendChild(rv);
    } else if (preload === 'auto' && rv.preload !== 'auto') { rv.preload = 'auto'; }
    return rv;
  }
  function playReaction(host, key) {
    var c = reactionCfg(key); if (!c || host._rdBusy || reduce) return false;
    var loop = host.querySelector('video:not(.rd-react)'); if (!loop) return false;
    var rv = getReactVid(host, key, 'auto'); if (!rv) return false;
    host._rdBusy = true;
    /* оверлей — ровно в коробку петли (размер, позиция), без зависимостей от CSS страницы */
    var st = rv.style; st.margin = '0'; st.right = st.bottom = 'auto';
    st.left = loop.offsetLeft + 'px'; st.top = loop.offsetTop + 'px'; st.width = loop.offsetWidth + 'px'; st.height = loop.offsetHeight + 'px';
    try { var cs = getComputedStyle(loop); st.objectFit = cs.objectFit; st.objectPosition = cs.objectPosition; st.borderRadius = cs.borderRadius; } catch (x) {}
    var phase = 0, timer = 0, fly = c.fly && !!window.requestAnimationFrame ? c.fly : null, spr = null, flyTimer = 0;
    function playLoop() { var p = loop.play(); if (p && p.catch) p.catch(function () {}); }
    function done() {
      clearTimeout(timer); clearTimeout(flyTimer); rv.onended = rv.onerror = rv.ontimeupdate = null;
      if (spr) { spr.remove(); spr = null; } loop.style.visibility = '';
      rv.classList.remove('on'); rv.style.transitionDuration = '';
      setTimeout(function () { rv.pause(); host._rdBusy = false; }, FADE_OUT + 30);
    }
    function fail() { if (phase > 1 && phase !== 3) return; phase = 2; playLoop(); done(); }
    /* за FADE_OUT до конца: петля уже стоит на подобранном кадре и играет, реакция плавно растворяется в неё */
    function startOut() {
      if (phase !== 1) return; phase = 2;
      var go = function () { loop.onseeked = null; loop.style.visibility = ''; playLoop(); nextFrame(loop, function () { rv.style.transitionDuration = FADE_OUT + 'ms'; rv.classList.remove('on'); timer = setTimeout(done, FADE_OUT); }); };
      try { if (Math.abs(loop.currentTime - c.ret) > 0.02) { loop.onseeked = go; loop.currentTime = c.ret; setTimeout(function () { if (loop.onseeked) go(); }, 300); } else go(); } catch (x) { go(); }
    }

    /* ---- полёт корабля: после взлёта ролик заменяется прозрачным спрайтом, который летит по свободной траектории
       в видимой части раздела и садится в то же место, откуда взлетел; затем ролик подхватывает посадку ---- */
    function flyImgs(f) {
      if (!f._imgs) { f._imgs = [new Image(), new Image()]; f._imgs[0].src = f.a; f._imgs[1].src = f.b; }
      return f._imgs;
    }
    function watchFly() {
      flyImgs(fly);
      var arm, tick = function (now, meta) {
        if (phase !== 1) return;
        var t = meta && meta.mediaTime != null ? meta.mediaTime : rv.currentTime;
        if (t >= fly.out - 0.01) startFlight(); else arm();
      };
      arm = function () { if (rv.requestVideoFrameCallback) rv.requestVideoFrameCallback(tick); else flyTimer = setTimeout(tick, 16); };
      arm();
    }
    function startFlight() {
      if (phase !== 1) return;
      try {
        var page = host.offsetParent || host.parentNode, hw = host.offsetWidth, hh = host.offsetHeight;
        var C = { x: host.offsetLeft + hw / 2, y: host.offsetTop + hh / 2 };
        var pr = page.getBoundingClientRect(), W = page.offsetWidth, H = page.offsetHeight;
        var x0 = Math.max(0, -pr.left), x1 = Math.min(W, window.innerWidth - pr.left);
        var y0 = Math.max(0, -pr.top) + 70, y1 = Math.min(H, window.innerHeight - pr.top) - 12;
        if (y1 - y0 < 340) y0 = Math.max(0, y1 - 340);
        var mx = hw * 0.45, my = hh * 0.42;
        var X0 = x0 + mx, X1 = x1 - mx, Y0 = y0 + my, Y1 = y1 - my;
        if (X1 - X0 < 120) { X0 = C.x - 60; X1 = C.x + 60; }
        if (Y1 - Y0 < 120) { Y0 = Y1 - 120; }
        function rnd(a, b) { return a + Math.random() * (b - a); }
        /* зигзаг по всему видимому разделу: чередуем левую/правую половины и разные высоты */
        var rows = [0.12, 0.34, 0.56, 0.78, 0.95], order = rows.sort(function () { return Math.random() - .5; });
        var side = Math.random() < .5 ? 0 : 1, pts = [];
        for (var i = 0; i < order.length; i++) {
          var fx = side ? rnd(.58, .96) : rnd(.04, .42); side = 1 - side;
          pts.push({ x: X0 + (X1 - X0) * fx, y: Y0 + (Y1 - Y0) * order[i] });
        }
        var up = { x: C.x + rnd(-30, 30), y: Math.max(Y0, C.y - hh * 1.1) };
        var pre = { x: C.x + rnd(-28, 28), y: Math.max(Y0 + 10, C.y - hh * 1.5) };
        var P = [{ x: C.x, y: C.y }, up].concat(pts, [pre, { x: C.x, y: C.y }]);
        /* Эрмитов сплайн с касательными: старт — строго вверх, финиш — строго вниз (посадка соплами вниз) */
        function len(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
        var M = P.map(function (q, k) {
          if (k === 0) return { x: 0, y: -len(P[0], P[1]) };
          if (k === P.length - 1) return { x: 0, y: len(P[k - 1], P[k]) };
          return { x: (P[k + 1].x - P[k - 1].x) * .5, y: (P[k + 1].y - P[k - 1].y) * .5 };
        });
        var S = [{ x: P[0].x, y: P[0].y, d: 0 }], N = 36;
        for (var k = 0; k < P.length - 1; k++) {
          for (var j = 1; j <= N; j++) {
            var t = j / N, t2 = t * t, t3 = t2 * t;
            var h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
            var q = { x: h00 * P[k].x + h10 * M[k].x + h01 * P[k + 1].x + h11 * M[k + 1].x, y: h00 * P[k].y + h10 * M[k].y + h01 * P[k + 1].y + h11 * M[k + 1].y };
            var pv = S[S.length - 1]; q.d = pv.d + Math.hypot(q.x - pv.x, q.y - pv.y); S.push(q);
          }
        }
        var L = S[S.length - 1].d, T = Math.max(5.5, Math.min(8.5, L / 420)) * 1000;
        function at(dist) {
          var lo = 0, hi = S.length - 1; while (hi - lo > 1) { var m = (lo + hi) >> 1; if (S[m].d <= dist) lo = m; else hi = m; }
          var a = S[lo], b = S[hi], f = b.d > a.d ? (dist - a.d) / (b.d - a.d) : 0;
          return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, hx: b.x - a.x, hy: b.y - a.y };
        }
        /* скорость: разгон — крейсер — торможение; путь ∈ [0..1] */
        var t1 = .14, t2 = .78, area = t1 / 2 + (t2 - t1) + (1 - t2) / 2;
        function prog(u) {
          var v;
          if (u < t1) v = u * u / (2 * t1); else if (u < t2) v = t1 / 2 + (u - t1); else { var r = 1 - u; v = area - r * r / (2 * (1 - t2)); }
          return v / area;
        }
        function sm(a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }

        /* спрайт: два полнокадровых прозрачных кадра (взлёт/посадка) ровно в коробку героя */
        spr = document.createElement('div'); spr.className = 'rd-fly';
        spr.style.cssText = 'left:' + host.offsetLeft + 'px;top:' + host.offsetTop + 'px;width:' + hw + 'px;height:' + hh + 'px;';
        var imgs = flyImgs(fly), ia = imgs[0], ib = imgs[1]; ia.alt = ib.alt = ''; ia.draggable = ib.draggable = false; ia.style.opacity = 1;
        ib.style.opacity = 0; ia.style.opacity = 1; spr.appendChild(ia); spr.appendChild(ib); page.appendChild(spr);
        var ready = function (im) { return im.complete && im.naturalWidth; };
        if (!ready(ia) || !ready(ib)) { spr.remove(); spr = null; return; }   /* спрайтов нет — просто доигрываем ролик */
        phase = 3;
        spr.style.transformOrigin = '50% 46%';
        /* ролик ставим на нужный кадр посадки заранее и прячем петлю, пока корабль в воздухе */
        loop.style.visibility = 'hidden';
        var spriteUp = false, sp = spr;
        nextFrame(rv, function () { /* спрайт уже нарисован поверх — ролик можно убрать */
          rv.style.transitionDuration = '60ms'; rv.classList.remove('on');
          setTimeout(function () { try { rv.pause(); rv.currentTime = fly.in; } catch (x) {} }, 90);
        });
        var t0 = performance.now(), ang = 0, lastT = t0, lastHead = 0, pend = true, finished = false;
        function frame(now) {
          if (!spr || sp !== spr || phase !== 3) return;
          var u = Math.min(1, (now - t0) / T), dt = Math.min(.06, (now - lastT) / 1000); lastT = now;
          var d = prog(u) * L, o = at(d), tx = o.x - C.x, ty = o.y - C.y;
          /* курс по касательной, сглаженный; в конце — разворот соплами вниз (нос вверх) без рывка */
          var head = Math.atan2(o.hy, o.hx) * 180 / Math.PI + 90;
          if (u < .005 || (o.hx === 0 && o.hy === 0)) head = lastHead;
          while (head - lastHead > 180) head -= 360; while (head - lastHead < -180) head += 360; lastHead = head;
          ang += (head - ang) * Math.min(1, dt * 7);
          var a = ang, w = sm(.8, 1, u);
          if (w > 0) { var tgt = Math.round(ang / 360) * 360; a = ang * (1 - w) + tgt * w; }
          var sc = 1 - .16 * Math.sin(Math.PI * Math.min(1, u * 1.05));
          var bsh = sm(.22, .5, u);
          spr.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) rotate(' + a.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
          ib.style.opacity = bsh; ia.style.opacity = bsh >= .99 ? 0 : 1;
          if (u >= 1) return land();
          requestAnimationFrame(frame);
        }
        function land() {
          if (finished) return; finished = true;
          spr.style.transform = 'none';
          var afterSeek = function () {
            rv.style.transitionDuration = '0s'; rv.classList.add('on');
            var fin = false, swap = function () {
              if (fin) return; fin = true;
              if (spr) { spr.remove(); spr = null; }
              phase = 1; rv.style.transitionDuration = '';
              var p = rv.play(); if (p && p.catch) p.catch(fail);
            };
            requestAnimationFrame(function () { requestAnimationFrame(swap); });
            setTimeout(swap, 250);
          };
          try {
            if (Math.abs(rv.currentTime - fly.in) > 0.02) { rv.onseeked = function () { rv.onseeked = null; afterSeek(); }; rv.currentTime = fly.in; setTimeout(function () { if (rv.onseeked) { rv.onseeked = null; afterSeek(); } }, 400); }
            else afterSeek();
          } catch (x) { afterSeek(); }
        }
        requestAnimationFrame(frame);
        /* страховка: если что-то пошло не так, через T+3 с возвращаем героя на место */
        flyTimer = setTimeout(function () { if (phase === 3) { phase = 2; fail(); } }, T + 3000);
      } catch (x) { if (spr) { spr.remove(); spr = null; } loop.style.visibility = ''; if (phase === 3) phase = 1; }
    }
    rv.onerror = fail;
    rv.onended = function () { if (phase === 1) startOut(); else if (phase === 2) { /* последний кадр держится, пока идёт растворение */ } };
    rv.ontimeupdate = function () { if (phase === 1 && rv.duration && rv.currentTime >= rv.duration - FADE_OUT / 1000 - 0.05) startOut(); };
    try { rv.currentTime = 0; } catch (x) {}
    var shown = function () {
      if (phase) return; phase = 1;
      /* первый кадр реакции уже декодирован — проявляем поверх живой петли, затем петлю ставим на паузу
         и заранее перематываем на кадр возврата (пока её не видно) */
      rv.style.transitionDuration = FADE_IN + 'ms'; rv.classList.add('on');
      setTimeout(function () { if (phase !== 1) return; loop.pause(); try { loop.currentTime = c.ret; } catch (x) {} }, FADE_IN + 20);
      if (fly) watchFly();
    };
    var pl = rv.play();
    if (pl && pl.then) pl.then(function () { nextFrame(rv, shown); }).catch(fail); else nextFrame(rv, shown);
    return true;
  }
  function heroAt(e) {
    var out = null;
    Object.keys(HEROES).forEach(function (k) {
      var host = TEST ? document.querySelector('.dogs') : document.getElementById(k);
      if (!host) return;
      var v = host.querySelector('video:not(.rd-react)') || host, r = v.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) out = { host: host, key: HEROES[k] };
    });
    return out;
  }
  document.addEventListener('click', function (e) {
    var t = e.target; if (closest(t, 'a[href],button,input,.pswp')) return;
    var h = heroAt(e); if (h) playReaction(h.host, h.key);
  });
  function markHeroes() {
    Object.keys(HEROES).forEach(function (k) {
      var host = TEST ? document.querySelector('.dogs') : document.getElementById(k);
      if (host && reactionSrc(HEROES[k])) { host.classList.add('rd-react-ready'); var fc = reactionCfg(HEROES[k]); if (fc && fc.fly && !reduce && !host._rdFlyPre) { host._rdFlyPre = 1; fc.fly._imgs || (fc.fly._imgs = [Object.assign(new Image(), { src: fc.fly.a }), Object.assign(new Image(), { src: fc.fly.b })]); } if (!reduce) getReactVid(host, HEROES[k], 'metadata'); if (!host._rdPre) { host._rdPre = 1; ['pointerenter', 'touchstart'].forEach(function (ev) { host.addEventListener(ev, function () { getReactVid(host, HEROES[k], 'auto'); }, { passive: true }); }); } }
    });
  }
  window.RUDIK_PLAY_REACTION = function (key) {
    var host = TEST ? document.querySelector('.dogs') : document.getElementById(key); return host ? playReaction(host, key) : false;
  };


  /* ================= batch-1105 ================= */
  function svgUrl(svg) { return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")'; }
  function inView(el, cb, opts) {
    if (!('IntersectionObserver' in window)) { cb(true); return null; }
    var io = new IntersectionObserver(function (es) { cb(es[es.length - 1].isIntersecting); }, opts || { threshold: 0 }); io.observe(el); return io;
  }

  /* ---------- планета у космического календаря: клик — обычный календарь, ещё клик — снова космос ---------- */
  function initPlanet() {
    var host = TEST ? document.querySelector('.cal-space') : document.getElementById('wb_element_instance103');
    if (!host || host.querySelector('.rd-planet')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'rd-planet';
    b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Космический вид календаря: переключить на обычный'); b.title = 'Обычный календарь / космос';
    host.appendChild(b);
    var wrap = TEST ? host.querySelector('.cal-blend') : host.firstElementChild, busyP = false;
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation(); if (busyP) return; busyP = true;
      function flip() {
        var plain = host.classList.toggle('rd-plain');
        b.setAttribute('aria-pressed', plain ? 'true' : 'false');
        var ttl = TEST ? null : document.getElementById('wb_element_instance104'); if (ttl) ttl.classList.toggle('rd-plain', plain);
        b.setAttribute('aria-label', plain ? 'Обычный вид календаря: вернуть космос' : 'Космический вид календаря: переключить на обычный');
      }
      if (reduce || !wrap || !wrap.animate) { flip(); busyP = false; return; }
      var o = wrap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, easing: 'ease-in', fill: 'forwards' });
      o.onfinish = function () { flip(); var i = wrap.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 230, easing: 'ease-out' }); o.cancel(); i.onfinish = function () { busyP = false; }; i.oncancel = function () { busyP = false; }; };
    });
  }

  /* ---------- косточки летают по календарю туда-сюда ---------- */
  var BONE = svgUrl("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 20'><g fill='#6b4a2b' stroke='#6b4a2b' stroke-width='3' stroke-linejoin='round'><rect x='8' y='6' width='32' height='8'/><circle cx='7' cy='5.5' r='4.6'/><circle cx='7' cy='14.5' r='4.6'/><circle cx='41' cy='5.5' r='4.6'/><circle cx='41' cy='14.5' r='4.6'/></g><g fill='#fff8e6'><rect x='8' y='6' width='32' height='8'/><circle cx='7' cy='5.5' r='4.6'/><circle cx='7' cy='14.5' r='4.6'/><circle cx='41' cy='5.5' r='4.6'/><circle cx='41' cy='14.5' r='4.6'/></g></svg>");
  function initBones() {
    if (reduce) return;
    var host = TEST ? document.querySelector('.cal-wall') : document.getElementById('wb_element_instance34');
    if (!host || host.querySelector('.rd-bones')) return;
    var box = document.createElement('div'); box.className = 'rd-bones'; box.setAttribute('aria-hidden', 'true');
    var cfg = [{ y: 22, d: 9.5, s: 1, delay: 0, spin: 3.2, bob: 2.6 }, { y: 50, d: 12, s: .85, delay: -4, spin: 4.4, bob: 3.3 }, { y: 76, d: 14.5, s: 1.15, delay: -9, spin: 5.2, bob: 2.1 }];
    cfg.forEach(function (c) {
      var a = document.createElement('i'), b = document.createElement('i'), im = document.createElement('i');
      a.className = 'rd-bone'; b.className = 'rd-bone-y'; im.className = 'rd-bone-i';
      a.style.cssText = 'top:' + c.y + '%;animation-duration:' + c.d + 's;animation-delay:' + c.delay + 's;';
      b.style.cssText = 'animation-duration:' + c.bob + 's;animation-delay:' + (c.delay / 2) + 's;';
      im.style.cssText = 'width:' + Math.round(54 * c.s) + 'px;height:' + Math.round(22.5 * c.s) + 'px;animation-duration:' + c.spin + 's;background-image:' + BONE + ';';
      b.appendChild(im); a.appendChild(b); box.appendChild(a);
    });
    host.appendChild(box);
    var setW = function () { box.style.setProperty('--bw', Math.max(0, box.clientWidth - 46) + 'px'); };
    setW(); window.addEventListener('resize', setW);
    inView(host, function (v) { box.classList.toggle('rd-off', !v); setW(); }, { threshold: 0 });
  }

  /* ---------- «оторванный кусок страницы»: по клику заворачивается обратно на 3 секунды и разворачивается ---------- */
  function initCurl() {
    var HOLD = 3000, FOLD = 700, UNFOLD = 900, TOT = FOLD + HOLD + UNFOLD;
    function ease(a) { return a; }
    function wire(clickEls, run) {
      var busyC = false;
      clickEls.forEach(function (el) { el.classList.add('rd-curlable'); });
      document.addEventListener('click', function (e) {
        if (e.button) return;
        var hit = closest(e.target, '.rd-curlable'); if (!hit || clickEls.indexOf(hit) < 0) return;
        if (busyC || reduce) return; busyC = true;
        run(function () { busyC = false; });
      });
    }
    if (TEST) {
      all('.tape').forEach(function (tp) {
        wire([tp], function (fin) {
          var an = tp.animate([
            { transform: 'scaleX(1)', opacity: 1, offset: 0 },
            { transform: 'scaleX(.06)', opacity: .2, offset: FOLD / TOT, easing: 'ease-in-out' },
            { transform: 'scaleX(.06)', opacity: .2, offset: (FOLD + HOLD) / TOT, easing: 'ease-out' },
            { transform: 'scaleX(1)', opacity: 1, offset: 1 }
          ], { duration: TOT });
          an.onfinish = an.oncancel = fin;
        });
      });
      return;
    }
    [[40, 41, 42], [62, 72, 73]].forEach(function (ids) {
      var pic = document.getElementById('wb_element_instance' + ids[0]);
      var rest = ids.slice(1).map(function (i) { return document.getElementById('wb_element_instance' + i); });
      var img = pic && pic.querySelector('img'); if (!pic || !img || rest.some(function (x) { return !x; })) return;
      var PIV = Math.round(pic.offsetWidth * .22);                 /* граница «рулона» слева и оторванной полосы справа */
      var roll = document.createElement('div'); roll.className = 'rd-roll';
      roll.style.cssText = 'background-image:url("' + (img.currentSrc || img.src) + '");width:' + pic.offsetWidth + 'px;height:' + pic.offsetHeight + 'px;clip-path:inset(0 ' + (100 - 22.6) + '% 0 0);transform-origin:' + Math.round(PIV * .55) + 'px ' + Math.round(pic.offsetHeight * .55) + 'px;';
      pic.insertBefore(roll, img);
      img.style.clipPath = 'inset(0 0 0 21.4%)'; img.style.transformOrigin = PIV + 'px 50%';
      var picLeft = pic.offsetLeft;
      wire([pic].concat(rest), function (fin) {
        var offs = [0, FOLD / TOT, (FOLD + HOLD) / TOT, 1], S = .03;
        var fr = function (arr) { return arr.map(function (k, i) { var o = { offset: offs[i] }; for (var p in k) o[p] = k[p]; if (i === 0 || i === 2) o.easing = i === 0 ? 'ease-in-out' : 'ease-out'; return o; }); };
        var anims = [];
        anims.push(img.animate(fr([{ transform: 'scaleX(1)', opacity: 1 }, { transform: 'scaleX(' + S + ')', opacity: 0 }, { transform: 'scaleX(' + S + ')', opacity: 0 }, { transform: 'scaleX(1)', opacity: 1 }]), { duration: TOT }));
        rest.forEach(function (el) {
          var org = parseFloat(getComputedStyle(el).transformOrigin) || 0;             /* px от левого края элемента */
          var dx = (picLeft + PIV) - (el.offsetLeft + org), tx = dx * (1 - S);
          anims.push(el.animate(fr([{ transform: 'translateX(0px) scaleX(1)', opacity: 1 }, { transform: 'translateX(' + tx.toFixed(1) + 'px) scaleX(' + S + ')', opacity: 0 }, { transform: 'translateX(' + tx.toFixed(1) + 'px) scaleX(' + S + ')', opacity: 0 }, { transform: 'translateX(0px) scaleX(1)', opacity: 1 }]), { duration: TOT }));
        });
        anims.push(roll.animate([
          { transform: 'rotate(0deg) scale(1)', offset: 0, easing: 'ease-in-out' },
          { transform: 'rotate(-7deg) scale(1.1)', offset: offs[1], easing: 'ease-in-out' },
          { transform: 'rotate(-3deg) scale(1.1)', offset: .42, easing: 'ease-in-out' },
          { transform: 'rotate(-8deg) scale(1.1)', offset: .66, easing: 'ease-in-out' },
          { transform: 'rotate(-7deg) scale(1.1)', offset: offs[2], easing: 'ease-out' },
          { transform: 'rotate(0deg) scale(1)', offset: 1 }
        ], { duration: TOT }));
        anims[0].onfinish = anims[0].oncancel = fin;
      });
    });
  }

  /* ---------- Виталик на Yamaha V-Max 1200 проезжает по разделителю от начала до конца ---------- */
  /* Анимация: зацикленное видео с прозрачностью (img/vitalik-ride.webm, VP9+alpha — Chrome, Edge, Firefox).
     Safari/iOS не показывают альфу в webm → там mp4 «цвет слева | маска справа» склеивается на canvas (как космос в loops.js).
     Если видео не стартует (экономия трафика, автоплей запрещён, ошибка) — показываем статичный кадр того же байка. */
  var RIDE = { webm: '/img/vitalik-ride.webm?v=2', sbs: '/img/vitalik-ride-sbs.mp4?v=2', still: '/img/vitalik-ride-still.webp?v=2', w: 578, h: 440 };
  var RIDE_H = 260;                                                    /* высота мотоциклиста на странице, px — как у рыжей собаки (~270) */
  var UA = navigator.userAgent || '';
  var NO_WEBM_ALPHA = /iP(hone|ad|od)/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                      (/Safari\//.test(UA) && !/Chrome|Chromium|CriOS|Edg|OPR|Android|Firefox|FxiOS/.test(UA));
  var BLOCKED = []; BLOCKED.add = function (x) { if (this.indexOf(x) < 0) this.push(x); }; BLOCKED.has = function (x) { return this.indexOf(x) >= 0; };
  BLOCKED.delete = function (x) { var i = this.indexOf(x); if (i >= 0) this.splice(i, 1); };
  var gestureArmed = false, lastTry = 0;
  /* первое касание / клик / клавиша / скролл: в обработчике жеста браузер разрешает play(), поэтому повторяем для всех заблокированных;
     скролл — тихая повторная попытка (на случай, если политика автоплея сменилась) */
  function onGesture(e) {
    if (!BLOCKED.length) return;
    var now = Date.now(); if (e.type === 'scroll' && now - lastTry < 700) return; lastTry = now;
    BLOCKED.slice().forEach(function (x) { x.retry(!x.isRunning()); });
  }
  function armGesture() {
    if (gestureArmed) return; gestureArmed = true;
    ['pointerdown', 'touchstart', 'touchend', 'keydown', 'click', 'wheel'].forEach(function (ev) { document.addEventListener(ev, onGesture, { passive: true, capture: true }); });
    window.addEventListener('scroll', onGesture, { passive: true });
  }
  function mkRider(lane, h) {
    var r = document.createElement('div'); r.className = 'rd-rider'; r.style.height = h + 'px'; r.style.width = Math.round(h * RIDE.w / RIDE.h) + 'px';
    var dust = document.createElement('i'); dust.className = 'rd-dust'; r.appendChild(dust);
    var v = document.createElement('video'); v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = 'none'; v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
    v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1; v.disableRemotePlayback = true;
    var cv = null, ctx = null, bx = null, buf = null, running = false, loaded = false, dead = false;
    if (NO_WEBM_ALPHA) {
      v.className = 'rd-rv-src';
      cv = document.createElement('canvas'); cv.className = 'rd-rv'; cv.width = RIDE.w; cv.height = RIDE.h; ctx = cv.getContext('2d');
      buf = document.createElement('canvas'); buf.width = RIDE.w * 2; buf.height = RIDE.h; bx = buf.getContext('2d', { willReadFrequently: true });
      r.appendChild(v); r.appendChild(cv);
    } else { v.className = 'rd-rv'; r.appendChild(v); }
    function draw() {
      if (!bx || v.readyState < 2) return;
      bx.drawImage(v, 0, 0, RIDE.w * 2, RIDE.h);
      var c = bx.getImageData(0, 0, RIDE.w, RIDE.h), a = bx.getImageData(RIDE.w, 0, RIDE.w, RIDE.h), d = c.data, m = a.data;
      for (var i = 0, n = d.length; i < n; i += 4) d[i + 3] = m[i];
      ctx.putImageData(c, 0, 0);
    }
    function tick() {
      if (!running || !bx) return;
      draw();
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(tick); else requestAnimationFrame(tick);
    }
    /* окончательный запасной вариант: формат не поддерживается / файл не грузится — навсегда статичный кадр */
    function fail() {
      if (dead) return; dead = true; running = false; BLOCKED.delete(api); try { v.pause(); } catch (e) {}
      [v, cv, wait].forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
      r.classList.remove('rd-wait');
      var im = document.createElement('img'); im.className = 'rd-still'; im.src = RIDE.still; im.alt = ''; im.draggable = false; im.decoding = 'async'; r.appendChild(im);
    }
    /* автоплей запрещён (iOS «Режим энергосбережения», экономия трафика): пока видео не заиграло, показываем кадр-заглушку,
       а play() повторяем при каждом проезде, при скролле/появлении в зоне видимости и по первому касанию/клику/клавише */
    var wait = null, api = null;
    function showWait() {
      if (wait || dead) return;
      wait = document.createElement('img'); wait.className = 'rd-still rd-still-wait'; wait.src = RIDE.still; wait.alt = ''; wait.draggable = false; wait.decoding = 'async';
      r.classList.add('rd-wait'); r.appendChild(wait);
    }
    function hideWait() { if (wait && wait.parentNode) wait.parentNode.removeChild(wait); wait = null; r.classList.remove('rd-wait'); }
    function tryPlay(quiet) {
      if (dead) return;
      var p; try { p = v.play(); } catch (e) { p = null; }
      if (!p || !p.then) { hideWait(); BLOCKED.delete(api); return; }
      p.then(function () {
        BLOCKED.delete(api);
        if (quiet && !running) { try { v.pause(); } catch (e) {} } else hideWait();
      }, function (err) {
        if (err && err.name === 'AbortError') return;                  /* прервали сами (pause/load) — не ошибка */
        if (err && err.name === 'NotSupportedError') { fail(); return; }
        BLOCKED.add(api); if (running || !quiet) showWait(); armGesture();
      });
    }
    v.addEventListener('error', fail);
    v.addEventListener('playing', function () { BLOCKED.delete(api); if (running) hideWait(); });
    r._ride = api = {
      load: function () { if (loaded || dead) return; loaded = true; v.src = NO_WEBM_ALPHA ? RIDE.sbs : RIDE.webm; v.load(); },
      play: function () {
        if (dead) return; this.load(); running = true;
        if (v.paused || BLOCKED.has(api)) tryPlay(false);
        if (bx) { draw(); tick(); }
      },
      pause: function () { running = false; if (!dead) v.pause(); },
      rewind: function () { if (!dead && loaded) { try { v.currentTime = 0; } catch (e) {} } },
      retry: function (quiet) { if (dead) return; this.load(); tryPlay(quiet); if (bx && running) { draw(); tick(); } },
      isRunning: function () { return running; }
    };
    lane.appendChild(r); return r;
  }
  function initRiders() {
    if (reduce) return;
    var targets = [];
    if (TEST) {
      var th = innerWidth <= 640 ? 150 : 200;                       /* в /test/ рыжая собака ~205px; на телефоне поменьше */
      all('main section, body > section, section').forEach(function (sec) { targets.push({ host: sec, h: th, line: 0, hit: true }); });
    } else {
      /* все разделители-полоски (Line) на странице: 38, 74, 92, 105, 127, 162 («Раньше увлекался съёмками»), 201, 9001; плюс тёмная плашка футера */
      [38, 74, 92, 105, 127, 162, 201, 9001].forEach(function (n) { var el = document.getElementById('wb_element_instance' + n); if (el) targets.push({ host: el, h: RIDE_H, line: 14, hit: true }); });
      var wf = document.getElementById('wb_footer'); if (wf) targets.push({ host: wf, h: RIDE_H, foot: true, click: true });
    }
    targets.forEach(function (t) {
      if (t.host.querySelector(':scope > .rd-lane')) return;            /* init() вызывается дважды (DOMContentLoaded и load) */
      var lane = document.createElement('div'); lane.className = 'rd-lane'; lane.setAttribute('aria-hidden', 'true');
      if (t.foot) lane.style.bottom = '100%'; else lane.style.bottom = t.line + 'px';     /* футер: колёса стоят на верхней кромке плашки */
      lane.style.height = (t.h + 12) + 'px';
      t.host.appendChild(lane);
      var r = mkRider(lane, t.h), run = null, armed = true;
      function start() {
        var W = lane.clientWidth, rw = r.offsetWidth, dur = Math.max(3200, Math.min(5600, W * 4.1));
        lane.classList.add('go'); r._ride.rewind(); r._ride.play();
        var me = r.animate([{ transform: 'translateX(' + (-rw - 10) + 'px)' }, { transform: 'translateX(' + (W + 10) + 'px)' }], { duration: dur, easing: 'cubic-bezier(.2,.35,.8,.7)' });
        run = me;
        me.onfinish = me.oncancel = function () { if (run !== me) return; run = null; lane.classList.remove('go'); r._ride.pause(); };
      }
      /* клик по полоске (и по всей плашке футера, кроме ссылок/иконок) — проезд ещё раз; если он уже идёт — стартует заново */
      function again() {
        if (run) { var o = run; run = null; o.onfinish = o.oncancel = null; o.cancel(); }
        armed = false; start();
      }
      var watch = t.host;                                            /* за чем следим: за самой полоской, а не за всем (высоким) разделом */
      if (t.hit) {
        var hit = document.createElement('div'); hit.className = 'rd-hit'; hit.setAttribute('aria-hidden', 'true'); t.host.appendChild(hit); watch = hit;
        hit.addEventListener('click', function (e) { e.preventDefault(); again(); });
      }
      if (t.click) {
        t.host.classList.add('rd-hitfoot');
        t.host.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a, button, input, textarea, select, label, [role="button"]')) return; again(); });
      }
      var top = t.foot ? 160 : Math.min(t.h + 36, Math.round(innerHeight * .5)), bot = t.foot ? 40 : TEST ? 60 : Math.min(130, Math.round(innerHeight * .25));   /* /test/: последний раздел упирается в низ страницы */
      inView(watch, function (v) { if (v) r._ride.load(); }, { threshold: 0, rootMargin: '700px 0px' });   /* подгружаем заранее */
      inView(watch, function (v) {
        if (v) { if (run) { run.play(); r._ride.play(); } else if (armed) { armed = false; start(); } }
        else { if (run) { run.pause(); r._ride.pause(); } else armed = true; }
      }, { threshold: 0, rootMargin: '-' + top + 'px 0px -' + bot + 'px 0px' });
      document.addEventListener('visibilitychange', function () {
        if (!run) return; if (document.hidden) { run.pause(); r._ride.pause(); } else if (host_visible()) { run.play(); r._ride.play(); }
        function host_visible() { var b = watch.getBoundingClientRect(); return b.bottom > top && b.top < innerHeight - bot; }
      });
    });
  }

  function init() { markZoom(); markHeroes(); initPlanet(); initBones(); initCurl(); initRiders(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('load', init);
})();
