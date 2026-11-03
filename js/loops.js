/* Зацикленные «живые» фото: играем только то, что в зоне видимости (экономит трафик и батарею) */
(function () {
  var vids = [].slice.call(document.querySelectorAll('video.rd-photo, video.rd-loop, video.rd-dogs-v'));
  if (!vids.length) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  if (reduce) { vids.forEach(function (v) { v.pause(); v.removeAttribute('autoplay'); }); return; }
  if (!('IntersectionObserver' in window)) { vids.forEach(play); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) play(e.target); else e.target.pause(); });
  }, { rootMargin: '300px 0px' });
  vids.forEach(function (v) { io.observe(v); });
})();

/* Космос поверх раздела «РАБОТА»: mp4 хранит цвет (слева) и маску прозрачности (справа);
   склеиваем их на canvas — так прозрачность работает и на iOS, и в любом браузере. */
(function () {
  var vids = [].slice.call(document.querySelectorAll('video.rd-alpha-v'));
  if (!vids.length) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  vids.forEach(function (v) {
    var host = v.parentNode, cv = host.querySelector('canvas.sp-c');
    if (!cv || !cv.getContext) return;
    var W = cv.width, H = cv.height, ctx = cv.getContext('2d');
    var buf = document.createElement('canvas'); buf.width = W * 2; buf.height = H;
    var bx = buf.getContext('2d', { willReadFrequently: true });
    var running = false, drawn = false;
    function draw() {
      if (v.readyState < 2) return;
      bx.drawImage(v, 0, 0, W * 2, H);
      var c = bx.getImageData(0, 0, W, H), a = bx.getImageData(W, 0, W, H), d = c.data, m = a.data;
      for (var i = 0, n = d.length; i < n; i += 4) d[i + 3] = m[i];
      ctx.putImageData(c, 0, 0); drawn = true;
    }
    function tick() {
      if (!running) return;
      draw();
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(tick); else requestAnimationFrame(tick);
    }
    function start() { if (running || reduce) return; running = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); tick(); }
    function stop() { running = false; v.pause(); }
    v.addEventListener('loadeddata', function () { draw(); });
    v.addEventListener('seeked', draw);
    if (reduce) { v.addEventListener('loadeddata', function () { try { v.currentTime = 0.5; } catch (e) {} }); return; }
    if (!('IntersectionObserver' in window)) { start(); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
    }, { rootMargin: "200px 0px" }).observe(cv);
  });
})();

/* ИИшница: плавающая кнопка «Заказать» видна, пока на экране раздел */
(function () {
  var pg = document.getElementById('page_3'); if (!pg || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (es) {
    es.forEach(function (e) { document.body.classList.toggle('ii-in', e.isIntersecting); });
  }, { threshold: 0.02 }).observe(pg);
})();
