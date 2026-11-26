/* Ленты фото ИИшницы.
   Каждая секция из data/iishnitsa-gallery.json едет справа налево по кругу.
   Наведение останавливает только эту ленту. Колесо и перетаскивание листают
   её в обе стороны, после этого автодвижение продолжается. Клик (не жест)
   открывает фото раздела в PhotoSwipe. Без JS остаётся ряд ссылок в #iiGallery. */
(function () {
  'use strict';
  var root = document.getElementById('iiGallery');
  if (!root || root.getAttribute('data-ready')) return;
  root.setAttribute('data-ready', 'pending');

  var GAP = 12;
  var SPEED = 34; /* px/с, влево */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrowQ = window.matchMedia ? matchMedia('(max-width: 600px)') : null;
  /* viewport сайта зафиксирован на 992px, поэтому max-width:600 на телефоне не срабатывает.
     Квадраты включаем и когда физический экран не шире 600, а окно вёрстки — эти 992. */
  function phoneLayout() {
    var layout = window.innerWidth || 0;
    var screenW = (window.screen && window.screen.width) || 0;
    return !!(screenW && screenW <= 600 && Math.abs(layout - 992) < 80);
  }
  function isNarrow() { return !!((narrowQ && narrowQ.matches) || phoneLayout()); }
  function markNarrow() { if (root) root.classList.toggle('ii-narrow', isNarrow()); }
  markNarrow();
  var ribbons = [];
  var activeLB = null;
  var lbLock = 0;
  var lbAcc = 0;

  function countFor(px) {
    if (px >= 860) return 4;
    if (px >= 640) return 3;
    if (px >= 480) return 2;
    return 1.35;
  }
  /* Ширина видимой части ленты. На десктопе это колонка ~920px (четыре кадра 16:10, как в PR 5). */
  function visibleWidth(ribbon) {
    var box = ribbon.clientWidth || 320;
    var layout = window.innerWidth || box;
    var rect = ribbon.getBoundingClientRect();
    var vis = Math.min(rect.right, layout) - Math.max(rect.left, 0);
    if (!(vis > 80)) vis = Math.min(box, layout);
    return Math.min(box, vis);
  }
  function slideWidth(ribbon) {
    if (isNarrow()) {
      /* На масштабированном телефоне четыре квадрата на всю колонку, иначе — на видимую ширину окна. */
      var view = phoneLayout() ? (ribbon.clientWidth || 320) : visibleWidth(ribbon);
      return Math.max(64, (view - GAP * 3) / 4);
    }
    var wide = visibleWidth(ribbon);
    var n = countFor(wide);
    return Math.max(96, (wide - GAP * (n - 1)) / n);
  }
  function safeFocus(v) {
    if (typeof v !== 'string') return '';
    var s = v.trim();
    if (/^(?:(?:left|right|center|top|bottom)|-?\d+(?:\.\d+)?%)(?:\s+(?:(?:left|right|center|top|bottom)|-?\d+(?:\.\d+)?%))?$/.test(s)) return s;
    return '';
  }

  function wrap(x, m) {
    if (!m) return 0;
    x %= m;
    if (x < 0) x += m;
    return x;
  }

  function wheelDelta(e) {
    var dx = e.deltaX, dy = e.deltaY, k = 1;
    if (e.deltaMode === 1) k = 16;
    else if (e.deltaMode === 2) k = 800;
    return { dx: dx * k, dy: dy * k };
  }
  /* Классическое колёсико (не тачпад): Firefox шлёт deltaMode 1/2,
     Chrome — wheelDelta кратный 120. */
  function isMouseWheel(e) {
    if (e.deltaMode !== 0) return true;
    var wy = e.wheelDeltaY || 0, wx = e.wheelDeltaX || 0;
    if (wy && Math.abs(wx) < 1) {
      var w = Math.abs(wy);
      if (w >= 100 && w % 20 === 0) return true;
    }
    return false;
  }
  /* Горизонтальный жест и колесо мыши листают ленту.
     Вертикальный жест тачпада не перехватываем — страница скроллится. */
  function takeWheel(e) {
    if (e.ctrlKey) return null;
    var d = wheelDelta(e);
    if (e.shiftKey && Math.abs(d.dy) >= Math.abs(d.dx)) return d.dy;
    if (Math.abs(d.dx) > Math.abs(d.dy) && d.dx !== 0) return d.dx;
    if (isMouseWheel(e)) return d.dy;
    return null;
  }
  function safeSrc(src) {
    if (typeof src !== 'string' || src.charAt(0) !== '/' || src.indexOf('//') === 0) return '';
    if (src.indexOf('\\') >= 0 || src.indexOf('..') >= 0) return '';
    return src;
  }

  function arm(img, src) {
    if (!src || img.getAttribute('src')) return;
    img.src = src;
  }

  function hydrate(ribbon) {
    var host = ribbon.getBoundingClientRect();
    var imgs = ribbon.querySelectorAll('img[data-src]');
    var pad = 280;
    for (var i = 0; i < imgs.length; i++) {
      var r = imgs[i].getBoundingClientRect();
      if (r.right >= host.left - pad && r.left <= host.right + pad && r.bottom > 0 && r.top < (window.innerHeight || 800) + pad) {
        arm(imgs[i], imgs[i].getAttribute('data-src'));
        imgs[i].removeAttribute('data-src');
      }
    }
  }

  function paint(st) {
    if (st.still) return;
    st.x = wrap(st.x, st.loop);
    st.track.style.transform = 'translate3d(' + (-st.x) + 'px,0,0)';
  }

  function measure(st) {
    markNarrow();
    var w = slideWidth(st.ribbon);
    st.ribbon.style.setProperty('--ii-slide', w.toFixed(2) + 'px');
    if (st.still) return;
    var first = st.track.querySelector('.ii-slide:not(.ii-clone)');
    var clone = st.track.querySelector('.ii-clone');
    if (first && clone) st.loop = clone.offsetLeft - first.offsetLeft;
    if (!(st.loop > 1)) st.loop = st.track.scrollWidth / 2;
    paint(st);
  }

  function makeSlide(img, index, clone) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ii-slide' + (clone ? ' ii-clone' : '');
    b.setAttribute('data-ii', String(index));
    if (clone) {
      b.tabIndex = -1;
      b.setAttribute('aria-hidden', 'true');
    } else {
      b.setAttribute('aria-label', img.alt || '');
    }
    var im = document.createElement('img');
    im.alt = clone ? '' : (img.alt || '');
    im.decoding = 'async';
    im.setAttribute('draggable', 'false');
    var src = safeSrc(img.src);
    if (src) im.setAttribute('data-src', src);
    im.setAttribute('width', '900');
    im.setAttribute('height', '900');
    var focus = safeFocus(img.focus);
    if (focus) im.style.objectPosition = focus;
    b.appendChild(im);
    return b;
  }

  function sectionTitle(sec) {
    var h = document.createElement('h3');
    h.id = sec.anchor;
    h.textContent = sec.title || '';
    if (sec.subtitle) {
      h.appendChild(document.createTextNode(' '));
      var s = document.createElement('span');
      s.className = 'ii-sub';
      s.textContent = sec.subtitle;
      h.appendChild(s);
    }
    if (sec.credit) {
      var credit = document.createElement('span');
      credit.className = 'ii-credit';
      credit.textContent = sec.credit;
      h.appendChild(credit);
    }
    return h;
  }

  function bindRibbon(ribbon, st, images) {
    var touchAt = 0;
    function armHover(on) {
      if (!on) { st.hover = false; return; }
      if (Date.now() - touchAt < 700) return;
      st.hover = true;
    }
    ribbon.addEventListener('mouseenter', function () { armHover(true); });
    ribbon.addEventListener('mouseleave', function () { armHover(false); });
    ribbon.addEventListener('pointerenter', function (e) {
      if (!e.pointerType || e.pointerType === 'mouse') armHover(true);
    });
    ribbon.addEventListener('pointerleave', function (e) {
      if (!e.pointerType || e.pointerType === 'mouse') armHover(false);
    });
    ribbon.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      st.ptr = e.pointerType || 'mouse';
      if (st.ptr !== 'mouse') { touchAt = Date.now(); st.hover = false; }
      st.down = { id: e.pointerId, x: e.clientX, y: e.clientY, start: st.still ? ribbon.scrollLeft : st.x, moved: false };
      st.holding = true;
    });
    ribbon.addEventListener('pointermove', function (e) {
      var d = st.down;
      if (!d || e.pointerId !== d.id) return;
      var dx = e.clientX - d.x;
      var dy = e.clientY - d.y;
      if (!d.moved) {
        if (st.ptr === 'touch' && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
          st.suppress = true;
          setTimeout(function () { st.suppress = false; }, 400);
          st.down = null;
          st.holding = false;
          return;
        }
        if (Math.abs(dx) < 8) return;
        d.moved = true;
        st.moved = true;
        ribbon.classList.add('is-drag');
        try { ribbon.setPointerCapture(e.pointerId); } catch (err) {}
      }
      if (st.still) ribbon.scrollLeft = d.start - dx;
      else {
        st.x = d.start - dx;
        paint(st);
        hydrate(ribbon);
      }
    });
    function endPtr(e) {
      var d = st.down;
      if (!d || (e && e.pointerId !== d.id)) return;
      st.down = null;
      st.holding = false;
      ribbon.classList.remove('is-drag');
      if (d.moved) {
        /* click приходит следом — гасим открытие лайтбокса */
        st.suppress = true;
        setTimeout(function () { st.suppress = false; st.moved = false; }, 400);
      }
    }
    ribbon.addEventListener('pointerup', endPtr);
    ribbon.addEventListener('pointercancel', endPtr);
    ribbon.addEventListener('dragstart', function (e) { e.preventDefault(); });
    ribbon.addEventListener('wheel', function (e) {
      var delta = takeWheel(e);
      if (delta == null) return;
      e.preventDefault();
      if (st.still) ribbon.scrollLeft += delta;
      else {
        st.x += delta;
        paint(st);
        hydrate(ribbon);
      }
    }, { passive: false });
    ribbon.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      var step = (parseFloat(ribbon.style.getPropertyValue('--ii-slide')) || 200) + GAP;
      var dir = e.key === 'ArrowRight' ? 1 : -1;
      if (st.still) ribbon.scrollLeft += dir * step;
      else { st.x += dir * step; paint(st); hydrate(ribbon); }
    });
    ribbon.addEventListener('click', function (e) {
      if (st.suppress) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      var btn = e.target.closest && e.target.closest('.ii-slide');
      if (!btn || !ribbon.contains(btn)) return;
      e.preventDefault();
      openLightbox(images, parseInt(btn.getAttribute('data-ii'), 10) || 0, st);
    });
  }

  function openLightbox(images, index, st) {
    if (activeLB) return;
    var el = document.querySelector('body > .pswp') || document.querySelector('.pswp');
    if (!el || !window.PhotoSwipe || !window.PhotoSwipeUI_Default) {
      var u = images[index] && safeSrc(images[index].src);
      if (u) window.open(u, '_blank', 'noopener');
      return;
    }
    var host = (st && st.ribbon) || root;
    var items = images.map(function (img, i) {
      var src = safeSrc(img.src);
      /* только кадр этой ленты: тот же data-ii есть в каждом разделе */
      var shown = host.querySelector('.ii-slide[data-ii="' + i + '"]:not(.ii-clone) img');
      var same = shown && (shown.currentSrc === src || shown.getAttribute('src') === src);
      var known = !!(same && shown.naturalWidth);
      return {
        src: src,
        w: known ? shown.naturalWidth : 1600,
        h: known ? shown.naturalHeight : 900,
        title: img.alt || '',
        msrc: src,
        rdSize: known
      };
    });
    var g = new PhotoSwipe(el, PhotoSwipeUI_Default, items, {
      index: index || 0,
      history: false,
      shareEl: false,
      loop: true,
      bgOpacity: 0.92,
      closeOnScroll: false,
      arrowKeys: true,
      escKey: true
    });
    g.listen('gettingData', function (i, item) {
      if (item.rdSize || item.rdLoading) return;
      item.rdLoading = true;
      var im = new Image();
      im.onload = function () {
        item.w = im.naturalWidth || item.w;
        item.h = im.naturalHeight || item.h;
        item.rdSize = true;
        g.invalidateCurrItems();
        g.updateSize(true);
      };
      im.src = item.src;
    });
    var prevOverflow = document.documentElement.style.overflow;
    st.lb = true;
    activeLB = g;
    g.listen('destroy', function () {
      activeLB = null;
      st.lb = false;
      lbAcc = 0;
      document.documentElement.style.overflow = prevOverflow;
    });
    document.documentElement.style.overflow = 'hidden';
    g.init();
  }

  window.addEventListener('wheel', function (e) {
    if (!activeLB) return;
    e.preventDefault();
    e.stopPropagation();
    var d = wheelDelta(e);
    var main = Math.abs(d.dx) > Math.abs(d.dy) ? d.dx : d.dy;
    lbAcc += main;
    var now = Date.now();
    if (Math.abs(lbAcc) < 30 || now < lbLock) return;
    lbLock = now + 340;
    if (lbAcc > 0) activeLB.next(); else activeLB.prev();
    lbAcc = 0;
  }, { passive: false, capture: true });

  function prime(st) {
    var n = (isNarrow() ? 4 : countFor(visibleWidth(st.ribbon))) + 1;
    var imgs = st.track.querySelectorAll('.ii-slide:not(.ii-clone) img[data-src]');
    for (var i = 0; i < imgs.length && i < n; i++) {
      arm(imgs[i], imgs[i].getAttribute('data-src'));
      imgs[i].removeAttribute('data-src');
    }
  }

  function build(sections) {
    var frag = document.createDocumentFragment();
    sections.forEach(function (sec) {
      if (!sec || !sec.anchor || !sec.images || !sec.images.length) return;
      frag.appendChild(sectionTitle(sec));
      var ribbon = document.createElement('div');
      ribbon.className = 'ii-ribbon' + (reduce ? ' is-still' : '');
      ribbon.setAttribute('role', 'region');
      ribbon.setAttribute('aria-roledescription', 'карусель');
      ribbon.setAttribute('aria-labelledby', sec.anchor);
      var track = document.createElement('div');
      track.className = 'ii-track';
      sec.images.forEach(function (img, i) { track.appendChild(makeSlide(img, i, false)); });
      if (!reduce) sec.images.forEach(function (img, i) { track.appendChild(makeSlide(img, i, true)); });
      ribbon.appendChild(track);
      frag.appendChild(ribbon);
      var st = { ribbon: ribbon, track: track, x: 0, loop: 0, hover: false, holding: false, still: reduce, lb: false, suppress: false, moved: false };
      ribbon._ii = st;
      bindRibbon(ribbon, st, sec.images);
      ribbons.push(st);
    });
    root.textContent = '';
    root.appendChild(frag);
    root.setAttribute('data-ready', '1');
    root.classList.add('is-on');
    ribbons.forEach(measure);
    ribbons.forEach(prime);
    ribbons.forEach(function (st) { hydrate(st.ribbon); });
    var hash = '';
    try { hash = decodeURIComponent((location.hash || '').replace(/^#/, '')); } catch (e2) { hash = ''; }
    if (hash) {
      var target = document.getElementById(hash);
      if (target && root.contains(target)) target.scrollIntoView({ block: 'start' });
    }
    window.dispatchEvent(new Event('resize'));
  }

  function fromDom() {
    var sections = [];
    var heads = root.querySelectorAll('h3[id]');
    for (var i = 0; i < heads.length; i++) {
      var h = heads[i];
      var gr = h.nextElementSibling;
      if (!gr || !gr.classList.contains('gr')) continue;
      var sub = h.querySelector('.ii-sub');
      var creditEl = h.querySelector('.ii-credit');
      var title = '';
      for (var n = h.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3) title += n.textContent;
      }
      var images = [];
      var links = gr.querySelectorAll('a[href]');
      for (var k = 0; k < links.length; k++) {
        var img = links[k].querySelector('img');
        var item = { src: links[k].getAttribute('href'), alt: (img && img.getAttribute('alt')) || title.trim() };
        var rawPos = img ? img.style.objectPosition : '';
        if (!rawPos && img) {
          var pos = /object-position\s*:\s*([^;]+)/i.exec(img.getAttribute('style') || '');
          if (pos) rawPos = pos[1];
        }
        var focus = safeFocus(rawPos);
        if (focus) item.focus = focus;
        images.push(item);
      }
      if (!images.length) continue;
      sections.push({ anchor: h.id, title: title.trim() || h.textContent.trim(), subtitle: sub ? sub.textContent.trim() : '', credit: creditEl ? creditEl.textContent.trim() : '', images: images });
    }
    return sections;
  }

  function boot(sections) {
    if (!sections || !sections.length) return;
    build(sections);
    function relayout() {
      ribbons.forEach(measure);
      ribbons.forEach(function (st) { hydrate(st.ribbon); });
    }
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(relayout);
      ro.observe(root);
    }
    window.addEventListener('resize', relayout);
    if (narrowQ && narrowQ.addEventListener) narrowQ.addEventListener('change', relayout);
    else if (narrowQ && narrowQ.addListener) narrowQ.addListener(relayout);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.target._ii) en.target._ii.off = !en.isIntersecting;
          if (en.isIntersecting) hydrate(en.target);
        });
      }, { rootMargin: '120px' });
      ribbons.forEach(function (st) { io.observe(st.ribbon); });
    }
    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce && !document.hidden) {
        for (var i = 0; i < ribbons.length; i++) {
          var st = ribbons[i];
          if (st.still || st.hover || st.holding || st.lb || st.off || !(st.loop > 1)) continue;
          st.x += SPEED * dt;
          paint(st);
        }
      }
      requestAnimationFrame(frame);
    }
    if (!reduce) requestAnimationFrame(frame);
    setInterval(function () {
      if (document.hidden) return;
      for (var i = 0; i < ribbons.length; i++) if (!ribbons[i].off) hydrate(ribbons[i].ribbon);
    }, 500);
  }

  var fallback = fromDom();
  fetch('/data/iishnitsa-gallery.json?v=3', { credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error('gallery'); return r.json(); })
    .then(function (data) {
      var sections = data && data.sections;
      if (!sections || !sections.length) throw new Error('empty');
      boot(sections);
    })
    .catch(function () { if (fallback.length) boot(fallback); });
})();
