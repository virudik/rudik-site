/* Спутники в «РАБОТЕ»: анимация идёт, только пока раздел виден (экономит батарею) */
(function () {
  var els = [].slice.call(document.querySelectorAll('.rd-sats'));
  if (!els.length || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); });
  }, { rootMargin: '100px 0px' });
  els.forEach(function (el) { el.classList.add('is-off'); io.observe(el); });
})();

/* Клик/тап по спутнику: он улетает в противоположный от клика угол видимой части раздела, чуть зависает у края и плавно возвращается на свою орбиту
   (орбита всё это время продолжает идти, поэтому возвращение выглядит естественно — спутник «догоняет» своё место). Без новых картинок. */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  [].slice.call(document.querySelectorAll('.rd-sats')).forEach(function (box) {
    [].slice.call(box.querySelectorAll('img')).forEach(function (img) {
      var busy = false;
      img.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (busy || !img.animate) return;
        var r = img.getBoundingClientRect(), cr = box.getBoundingClientRect();
        var vL = Math.max(cr.left, 0), vR = Math.min(cr.right, window.innerWidth), vT = Math.max(cr.top, 0), vB = Math.min(cr.bottom, window.innerHeight);
        if (vR - vL < r.width || vB - vT < r.height) return;
        var px = e.clientX, py = e.clientY, cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var sx = cx - px, sy = cy - py;
        if (Math.abs(sx) < 6 && Math.abs(sy) < 6) { sx = Math.random() < .5 ? -1 : 1; sy = Math.random() < .5 ? -1 : 1; }
        var pad = 10, over = .18;
        /* противоположный угол: клик слева/сверху от центра → летим вправо/вниз, и наоборот */
        var tx = (sx >= 0 ? vR - r.right + r.width * over : vL - r.left - r.width * over) + (sx >= 0 ? -pad : pad);
        var ty = (sy >= 0 ? vB - r.bottom + r.height * over : vT - r.top - r.height * over) + (sy >= 0 ? -pad : pad);
        busy = true; img.style.cursor = 'default';
        var T = 4600, T1 = 1100 / T, T2 = 1700 / T, bank = (sx >= 0 ? 1 : -1) * 14;
        var pos = '0px 0px', far = tx.toFixed(1) + 'px ' + ty.toFixed(1) + 'px';
        var a = img.animate([
          { translate: pos, offset: 0, easing: 'cubic-bezier(.16,.8,.24,1)' },
          { translate: far, offset: T1, easing: 'ease-in-out' },
          { translate: far, offset: T2, easing: 'cubic-bezier(.45,0,.25,1)' },
          { translate: pos, offset: 1 }
        ], { duration: T });
        try {
          img.animate([
            { rotate: '0deg', offset: 0, easing: 'ease-out' }, { rotate: bank + 'deg', offset: T1 * .6, easing: 'ease-in-out' },
            { rotate: (bank * .25) + 'deg', offset: T2, easing: 'ease-in-out' }, { rotate: '0deg', offset: 1 }
          ], { duration: T, composite: 'add' });
        } catch (err) {}
        var done = function () { busy = false; img.style.cursor = ''; };
        a.onfinish = a.oncancel = done;
      });
    });
  });
})();
