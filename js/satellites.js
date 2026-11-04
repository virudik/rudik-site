/* Спутники в «РАБОТЕ»: анимация идёт, только пока раздел виден (экономит батарею) */
(function () {
  var els = [].slice.call(document.querySelectorAll('.rd-sats'));
  if (!els.length || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); });
  }, { rootMargin: '100px 0px' });
  els.forEach(function (el) { el.classList.add('is-off'); io.observe(el); });
})();
