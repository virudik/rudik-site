/* Чистые адреса разделов: рудик.рф/алина вместо рудик.рф/#алина */
(function () {
  var SECTIONS = {
    'рудики': '', 'рудик.рф': '',
    'виталик': 'виталик', 'обо-мне': 'обо-мне', 'работа': 'работа', 'фото': 'фото',
    'маша': 'маша', 'алина': 'алина', 'иишница': 'иишница',
    'prompts': 'prompts', 'промты': 'prompts',
    'видео': 'видео', 'мои-видео': 'мои-видео'
  };
  function norm(s) { try { s = decodeURIComponent(s); } catch (e) {} return s.replace(/^\/+|\/+$/g, '').toLowerCase(); }
  function known(slug) { return Object.prototype.hasOwnProperty.call(SECTIONS, slug); }
  function pathFor(slug) { return '/' + SECTIONS[slug]; }
  function findAnchor(slug) {
    var name = SECTIONS[slug] === '' ? 'рудики' : SECTIONS[slug];
    var enc = encodeURIComponent(name);
    return document.querySelector('a[name="' + enc + '"]') || document.querySelector('a[name="' + name + '"]');
  }
  function topOf(a) { return Math.max(0, Math.round(a.getBoundingClientRect().top + window.pageYOffset)); }
  function hit(path) { try { if (window.ym && /(^|\.)(xn--d1aigvp\.xn--p1ai|рудик\.рф)$/.test(location.hostname)) ym(65929291, 'hit', location.origin + path); } catch (e) {} }

  var interacted = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, function () { interacted = true; }, { passive: true }); });

  function jump(slug, smooth) {
    var a = findAnchor(slug); if (!a) return;
    var y = SECTIONS[slug] === '' ? 0 : topOf(a);
    if (smooth) window.scrollTo({ top: y, behavior: 'smooth' }); else window.scrollTo(0, y);
  }
  function landOn(slug) {
    jump(slug, false);
    [150, 500, 1200, 2500].forEach(function (t) { setTimeout(function () { if (!interacted) jump(slug, false); }, t); });
    window.addEventListener('load', function () { if (!interacted) jump(slug, false); });
  }

  // 1) вход по чистому пути или по старой ссылке с #
  var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
  var restored = nav.type === 'reload' || nav.type === 'back_forward';
  var hashSlug = location.hash ? norm(location.hash.slice(1)) : '';
  var pathSlug = norm(location.pathname);
  if (hashSlug && known(hashSlug)) {
    history.replaceState(null, '', pathFor(hashSlug)); hit(pathFor(hashSlug)); landOn(hashSlug);
  } else if (pathSlug && known(pathSlug)) {
    var clean = pathFor(pathSlug);
    if (decodeURIComponent(location.pathname) !== clean) history.replaceState(null, '', clean);
    if (!restored) landOn(pathSlug);
  } else if (location.pathname.replace(/index\.html$/, '') !== '/' && /index\.html$/.test(location.pathname)) {
    history.replaceState(null, '', '/');
  }

  // 2) клики по ссылкам на разделы
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var t = e.target; if (!t.closest) return;
    if (t.closest('#rudikTop')) { setTimeout(function () { if (location.pathname !== '/') history.replaceState(null, '', '/'); }, 0); return; }
    var link = t.closest('a[href^="#"]'); if (!link) return;
    var slug = norm(link.getAttribute('href').slice(1));
    if (!known(slug)) return;
    e.preventDefault();
    var inMenu = !!link.closest('.menu-landing');
    // «Видео со мной» — вложенный #видео (не .wb_page_anchor).
    // main.js не прокручивает к нему из подменю, здесь помогаем явно.
    if (!inMenu || slug === 'видео') { e.stopPropagation(); jump(slug, true); }
    var p = pathFor(slug);
    if (decodeURIComponent(location.pathname) !== p || location.hash) { history.pushState({ s: slug }, '', p); hit(p); }
  }, true);

  // 3) кнопки «назад/вперёд»
  window.addEventListener('popstate', function () {
    var slug = location.hash ? norm(location.hash.slice(1)) : norm(location.pathname);
    if (slug && known(slug)) jump(slug, true); else if (!slug) window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
