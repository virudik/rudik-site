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

/* Клик/тап по космонавту или его Ресурс-П (общий canvas #rdSpace .sp-c, pointer-events:none — ловим клик на документе
   и проверяем непрозрачность пикселя, поэтому всё под ними кликается как раньше). Картинка делится на две части:
   нажатая улетает в противоположный угол видимой части раздела, вторая чуть отлетает в обратную сторону; затем обе
   возвращаются ДРУГ К ДРУГУ на свою общую орбиту (орбита .sp-x/.sp-y всё это время идёт). */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cv = document.querySelector('#rdSpace canvas.sp-c'); if (!cv || !cv.getContext || !document.body.animate) return;
  var space = document.getElementById('rdSpace'), busy = false;
  /* граница частей (доли кадра): космонавт слева, с гаечным ключом чуть правее в нижней половине */
  function isCosmo(fx, fy) { return fx < (fy > 0.44 ? 0.46 : 0.39); }
  function clip(c, cosmo) {
    var W = cv.width, H = cv.height; c.beginPath();
    if (cosmo) { c.moveTo(0, 0); c.lineTo(W * .39, 0); c.lineTo(W * .39, H * .44); c.lineTo(W * .46, H * .44); c.lineTo(W * .46, H); c.lineTo(0, H); }
    else { c.moveTo(W * .39, 0); c.lineTo(W, 0); c.lineTo(W, H); c.lineTo(W * .46, H); c.lineTo(W * .46, H * .44); c.lineTo(W * .39, H * .44); }
    c.closePath(); c.clip();
  }
  function hit(e) {
    var r = cv.getBoundingClientRect(); if (!r.width || e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return null;
    var fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    try {
      var x = Math.round(fx * cv.width), y = Math.round(fy * cv.height), R = 6;
      var d = cv.getContext('2d').getImageData(Math.max(0, x - R), Math.max(0, y - R), R * 2 + 1, R * 2 + 1).data, mx = 0;
      for (var i = 3; i < d.length; i += 4) if (d[i] > mx) mx = d[i];
      if (mx < 40) return null;
    } catch (x) { return null; }
    return { r: r, cosmo: isCosmo(fx, fy) };
  }
  document.addEventListener('click', function (e) {
    if (busy) { if (hit(e)) { e.stopPropagation(); e.preventDefault(); } return; }
    var h = hit(e); if (!h) return;
    e.stopPropagation(); e.preventDefault();
    var r = h.r, cr = space.getBoundingClientRect();
    var vL = Math.max(cr.left, 0), vR = Math.min(cr.right, innerWidth), vT = Math.max(cr.top, 0), vB = Math.min(cr.bottom, innerHeight);
    /* коробка нажатой части (по долям кадра) */
    var pL = r.left + r.width * (h.cosmo ? 0.03 : 0.39), pR = r.left + r.width * (h.cosmo ? 0.46 : 0.97), pT = r.top + r.height * .2, pB = r.bottom - r.height * .1;
    var cx = (pL + pR) / 2, cy = (pT + pB) / 2, sx = cx - e.clientX, sy = cy - e.clientY;
    if (Math.abs(sx) < 6 && Math.abs(sy) < 6) { sx = h.cosmo ? -1 : 1; sy = Math.random() < .5 ? -1 : 1; }
    var pad = 10, tx = sx >= 0 ? vR - pR - pad : vL - pL + pad, ty = sy >= 0 ? vB - pB - pad : vT - pT + pad;
    var k = r.width / cv.offsetWidth || 1; tx /= k; ty /= k;            /* в CSS-пикселях слоя */
    busy = true;
    var host = cv.parentNode; if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    function part(cosmo) {
      var c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; c.className = cv.className;
      c.style.cssText = 'position:absolute;left:' + cv.offsetLeft + 'px;top:' + cv.offsetTop + 'px;margin:0;pointer-events:none;';
      host.appendChild(c); return { c: c, x: c.getContext('2d'), cosmo: cosmo };
    }
    var A = part(true), B = part(false), run = true;
    function paint() {
      if (!run) return;
      [A, B].forEach(function (p) { p.x.save(); p.x.clearRect(0, 0, p.c.width, p.c.height); clip(p.x, p.cosmo); p.x.drawImage(cv, 0, 0); p.x.restore(); });
      requestAnimationFrame(paint);
    }
    paint(); cv.style.opacity = '0';
    var T = 4600, T1 = 1100 / T, T2 = 1700 / T, me = h.cosmo ? A : B, other = h.cosmo ? B : A;
    function fly(el, dx, dy, bank) {
      var far = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
      var a = el.animate([
        { translate: '0px 0px', offset: 0, easing: 'cubic-bezier(.16,.8,.24,1)' }, { translate: far, offset: T1, easing: 'ease-in-out' },
        { translate: far, offset: T2, easing: 'cubic-bezier(.45,0,.25,1)' }, { translate: '0px 0px', offset: 1 }], { duration: T });
      try { el.animate([{ rotate: '0deg', offset: 0, easing: 'ease-out' }, { rotate: bank + 'deg', offset: T1 * .6, easing: 'ease-in-out' }, { rotate: (bank * .25) + 'deg', offset: T2, easing: 'ease-in-out' }, { rotate: '0deg', offset: 1 }], { duration: T }); } catch (x) {}
      return a;
    }
    var bank = (sx >= 0 ? 1 : -1) * 12;
    var a = fly(me.c, tx, ty, bank);
    fly(other.c, -tx * .35, -ty * .35, -bank * .6);
    var end = function () { if (!run) return; run = false; cv.style.opacity = ''; A.c.remove(); B.c.remove(); busy = false; };
    a.onfinish = a.oncancel = end; setTimeout(end, T + 500);
  }, true);
})();
