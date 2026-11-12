(function () {
  var grid = document.getElementById('iiVideoGrid');
  if (grid) {
    var items = (window.RUDIK_VIDEOS || []).slice();
    function group(v) {
      if (v.file || (v.rutube && v.review !== 'pending') || v.youtube) return 0;
      if (v.rutube || v.review === 'pending') return 1;
      return 2;
    }
    // Явный порядок шести роликов владельца; остальные группируются по доступности.
    items.sort(function (a, b) {
      var ar = typeof a.order === 'number' ? a.order : 1000;
      var br = typeof b.order === 'number' ? b.order : 1000;
      return ar - br || group(a) - group(b);
    });
    items.forEach(function (v) {
      var c = document.createElement('div'); c.className = 'rv-card';
      var t = document.createElement('div'); t.className = 'rv-t'; t.textContent = v.title; c.appendChild(t);
      if (v.subtitle) {
        var subtitle = document.createElement('div'); subtitle.className = 'rv-subtitle';
        subtitle.textContent = v.subtitle; t.appendChild(subtitle);
      }
      var b = document.createElement('div'); b.className = 'rv-box';
      var source = null, note = null;
      if (v.file && (!v.rutube || v.review === 'pending')) {
        // Пока внешний дубль недоступен, проигрываем существующий локальный MP4.
        var vd = document.createElement('video');
        vd.controls = true; vd.preload = 'none'; vd.setAttribute('playsinline', '');
        if (v.poster) vd.poster = v.poster;
        vd.src = v.file; vd.title = v.title; b.appendChild(vd);
      } else if (v.rutube && v.review !== 'pending') {
        var rf = document.createElement('iframe');
        rf.src = 'https://rutube.ru/play/embed/' + v.rutube;
        rf.title = 'Смотреть на Rutube: ' + v.title;
        rf.allow = 'clipboard-write; autoplay; fullscreen';
        rf.allowFullscreen = true; rf.loading = 'lazy';
        rf.setAttribute('frameborder', '0'); b.appendChild(rf);
      } else if (v.youtube) {
        var f = document.createElement('iframe');
        f.src = '//www.youtube.com/embed/' + v.youtube + '?controls=1' + (v.start ? '&start=' + v.start : '');
        f.title = v.title; f.allowFullscreen = true; b.appendChild(f);
      } else if (v.rutube && v.review === 'pending') {
        var wait = document.createElement('div');
        wait.className = 'rv-pending';
        wait.textContent = 'Публикация на Rutube проверяется';
        b.appendChild(wait);
      } else {
        b.innerHTML = '<div class="rv-play"></div><div class="rv-soon">скоро</div>';
      }
      c.appendChild(b);
      if (v.rutube && v.review === 'pending') {
        note = document.createElement('div');
        note.className = 'rv-check';
        note.textContent = 'Ссылка на Rutube пока не подтверждена';
        c.appendChild(note);
      }
      if (v.rutube) {
        source = document.createElement('a');
        source.href = 'https://rutube.ru/' + (v.shorts ? 'shorts/' : 'video/') + v.rutube + '/';
        source.textContent = v.review === 'pending' ? 'Проверить на Rutube' : 'Открыть на Rutube';
        source.className = 'rv-source';
        source.target = '_blank'; source.rel = 'noopener noreferrer';
        c.appendChild(source);
      }
      grid.appendChild(c);
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
