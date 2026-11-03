/* Зацикленные «живые» фото: играем только то, что в зоне видимости (экономит трафик и батарею) */
(function () {
  var vids = [].slice.call(document.querySelectorAll('video.rd-photo, video.rd-loop, video.rd-dogs-v, video.rd-space-v'));
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
