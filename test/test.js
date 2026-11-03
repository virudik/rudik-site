/* «Мои видео» (ИИшница): карточки из /js/videos-data.js, как на основном сайте */
(function () {
  var grid = document.getElementById('iiVideoGrid');
  if (!grid) return;
  (window.RUDIK_VIDEOS || []).forEach(function (v) {
    var c = document.createElement('div'); c.className = 'rv-card';
    var t = document.createElement('div'); t.className = 'rv-t'; t.textContent = v.title; c.appendChild(t);
    var b = document.createElement('div'); b.className = 'rv-box';
    if (v.file) {
      var vd = document.createElement('video');
      vd.controls = true; vd.preload = 'none'; vd.setAttribute('playsinline', '');
      if (v.poster) vd.poster = v.poster;
      vd.src = v.file; vd.title = v.title; b.appendChild(vd);
    } else if (v.rutube) {
      var rf = document.createElement('iframe');
      rf.src = 'https://rutube.ru/play/embed/' + v.rutube; rf.title = v.title; rf.loading = 'lazy';
      rf.allow = 'clipboard-write; autoplay; fullscreen'; rf.allowFullscreen = true; b.appendChild(rf);
    } else if (v.youtube) {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube.com/embed/' + v.youtube + '?controls=1' + (v.start ? '&start=' + v.start : '');
      f.title = v.title; f.loading = 'lazy'; f.allowFullscreen = true; b.appendChild(f);
    } else {
      b.innerHTML = '<div class="rv-soon">скоро</div>';
    }
    c.appendChild(b); grid.appendChild(c);
  });
})();

(function () {
  var root = document.documentElement, btn = document.getElementById('themeBtn');
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function cur() { return root.getAttribute('data-theme') || (mq && mq.matches ? 'dark' : 'light'); }
  function sync() { var d = cur() === 'dark'; if (btn) { btn.setAttribute('aria-pressed', d); btn.querySelector('.tx').textContent = d ? 'Светлая' : 'Тёмная'; btn.setAttribute('aria-label', d ? 'Включить светлую тему' : 'Включить тёмную тему'); } }
  if (btn) btn.addEventListener('click', function () {
    var n = cur() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', n);
    try { localStorage.setItem('rd-theme', n); } catch (e) {}
    sync();
  });
  if (mq && mq.addEventListener) mq.addEventListener('change', sync);
  sync();

  /* видео-петли играют только в зоне видимости */
  var vids = [].slice.call(document.querySelectorAll('video.lv'));
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.preload = 'auto'; play(e.target); } else e.target.pause();
      });
    }, { rootMargin: '200px 0px' });
    vids.forEach(function (v) { io.observe(v); });
  } else if (!reduce) { vids.forEach(play); }

  var up = document.getElementById('toTop');
  if (up) {
    window.addEventListener('scroll', function () { up.hidden = window.scrollY < 700; }, { passive: true });
    up.addEventListener('click', function () { window.scrollTo({ top: 0 }); });
  }
})();
