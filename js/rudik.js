(function () {
  var grid = document.getElementById('iiVideoGrid');
  if (grid) {
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
        rf.src = 'https://rutube.ru/play/embed/' + v.rutube; rf.title = v.title;
        rf.allow = 'clipboard-write; autoplay; fullscreen'; rf.allowFullscreen = true; rf.setAttribute('frameborder', '0'); b.appendChild(rf);
      } else if (v.youtube) {
        var f = document.createElement('iframe');
        f.src = '//www.youtube.com/embed/' + v.youtube + '?controls=1' + (v.start ? '&start=' + v.start : '');
        f.title = v.title; f.allowFullscreen = true; b.appendChild(f);
      } else {
        b.innerHTML = '<div class="rv-play"></div><div class="rv-soon">скоро</div>';
      }
      c.appendChild(b); grid.appendChild(c);
    });
  }
  // высота раздела ИИшница = по содержимому
  function fit() {
    var f = document.getElementById('iiFlow'), p = document.getElementById('page_3');
    if (!f || !p) return;
    var h = f.offsetTop + f.offsetHeight + 40;
    p.style.height = h + 'px';
    var e = document.getElementById('page_3e'); if (e) e.style.height = h + 'px';
  }
  window.addEventListener('load', fit); window.addEventListener('resize', fit);
  setTimeout(fit, 300); setTimeout(fit, 1500);
  var imgs = document.querySelectorAll('#iiFlow img');
  for (var i = 0; i < imgs.length; i++) imgs[i].addEventListener('load', fit);
  fit();
  // ссылки-кнопки с кириллическими якорями: учитываем фиксированную шапку
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('#iiBtns a'); if (!a) return;
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    var el = document.querySelector('.wb_anchor[name="' + a.getAttribute('href').slice(1) + '"]') || document.getElementById(id);
    if (!el) return;
    ev.preventDefault();
    var hh = (document.querySelector('.wb_header_fixed') || {}).offsetHeight || 60;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - (el.classList.contains('wb_anchor') ? 0 : hh) + (el.classList.contains('wb_anchor') ? -0 : 0), behavior: 'smooth' });
    history.replaceState(null, '', a.getAttribute('href'));
  });
})();
