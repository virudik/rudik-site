/* Интерактив рудик.рф (общий для основного сайта и /test/):
   1) полноэкранный просмотр фото и «живых» фото (PhotoSwipe, тот же что и раньше);
   2) вращение плиток-логотипов разделов по клику;
   3) крючок для роликов-реакций героев (window.RUDIK_REACTIONS; без роликов — ничего не делает). */
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
  var REACTIONS = {
    iiDance: '/video/reactions/vitalik-dance-react.mp4?v=1',
    iiDetective: '/video/reactions/kot-detektiv-dog-react.mp4?v=1',
    iiShip: '/video/reactions/roskotmos-ship-react.mp4?v=1',
    rdDogs: '/video/reactions/dogs-react.mp4?v=1',   /* в /test/ ключ тот же: dogs */
  };
  function reactionSrc(key) { var r = window.RUDIK_REACTIONS || REACTIONS; return r[key] || ''; }
  function playReaction(host, key) {
    var src = reactionSrc(key); if (!src || host._rdBusy || reduce) return false;
    var loop = host.querySelector('video:not(.rd-react)'); if (!loop) return false;
    host._rdBusy = true;
    var rv = host._rdVid;
    if (!rv) {
      rv = host._rdVid = document.createElement('video');
      rv.className = loop.className + ' rd-react'; rv.muted = true; rv.playsInline = true; rv.setAttribute('playsinline', ''); rv.preload = 'auto';
      rv.setAttribute('aria-hidden', 'true'); rv.tabIndex = -1; rv.src = src; host.appendChild(rv);
    }
    var finish = function () {
      rv.onended = rv.onerror = null; rv.pause();
      var p = loop.play(); if (p && p.catch) p.catch(function () {});
      rv.classList.remove('on'); host._rdBusy = false;
    };
    rv.onended = finish; rv.onerror = finish;
    try { rv.currentTime = 0; } catch (x) {}
    var pl = rv.play();
    if (pl && pl.then) pl.then(function () { rv.classList.add('on'); }).catch(finish); else rv.classList.add('on');
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
      if (host && reactionSrc(HEROES[k])) host.classList.add('rd-react-ready');
    });
  }
  window.RUDIK_PLAY_REACTION = function (key) {
    var host = TEST ? document.querySelector('.dogs') : document.getElementById(key); return host ? playReaction(host, key) : false;
  };

  function init() { markZoom(); markHeroes(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('load', init);
})();
