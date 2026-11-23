/* Статическая сверка лент ИИшницы. node test/ii-gallery-check.js */
'use strict';
var fs = require('fs');
var path = require('path');
var root = path.join(__dirname, '..');
var fail = 0;
function ok(name, cond, detail) {
  if (cond) { console.log('ok  ' + name); return; }
  fail++;
  console.log('FAIL ' + name + (detail ? ' — ' + detail : ''));
}
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }

var data = JSON.parse(read('data/iishnitsa-gallery.json'));
var sections = data.sections || [];
ok('8 sections', sections.length === 8, String(sections.length));
var ids = ['ii-kot', 'ii-km', 'ii-rk', 'ii-raz', 'ii-sg', 'ii-honor', 'ii-konkurs', 'ii-stikhiy'];
ok('anchors in order', sections.map(function (s) { return s.anchor; }).join() === ids.join());
var n = 0;
sections.forEach(function (s) {
  (s.images || []).forEach(function (im) {
    n++;
    ok('file ' + im.src, im.src && im.alt && fs.existsSync(path.join(root, im.src.replace(/^\//, ''))), im.src);
  });
});
ok('72 images', n === 72, String(n));
var konkurs = sections.filter(function (s) { return s.id === 'konkurs'; })[0];
ok('konkurs subtitle', konkurs && konkurs.subtitle === '«Креативное поколение»');

var js = read('js/ii-gallery.js');
var css = read('css/ii-gallery.css');
ok('no external url in js', !/https?:\/\//.test(js));
ok('no external url in css', !/https?:\/\//.test(css));
ok('reduced motion handled', /prefers-reduced-motion/.test(js) && /prefers-reduced-motion/.test(css));
ok('lazy via data-src', /data-src/.test(js) && /loading="lazy"/.test(read('иишница/index.html')));

var copies = ['index.html', 'алина/index.html', 'маша/index.html', 'виталик/index.html', 'иишница/index.html', 'мои-видео/index.html', 'обо-мне/index.html', 'промты/index.html', 'работа/index.html', 'фото/index.html', 'видео/index.html', 'prompts/index.html'];
copies.forEach(function (rel) {
  var html = read(rel);
  ok(rel + ' script', /\/js\/ii-gallery\.js\?v=2/.test(html));
  ok(rel + ' css', /\/css\/ii-gallery\.css\?v=1/.test(html));
  ids.forEach(function (id) { ok(rel + ' #' + id, html.indexOf('id="' + id + '"') >= 0); });
  ok(rel + ' chips', /href="#ii-honor"/.test(html) && /href="#ii-konkurs"/.test(html) && /href="#ii-stikhiy"/.test(html));
  ok(rel + ' 72 fallback imgs', (html.split('id="iiGallery"')[1].split('ii-cta2')[0].match(/<img /g) || []).length === 72);
});
ok('test site does not embed the gallery', read('test/index.html').indexOf('id="iiGallery"') < 0);

if (fail) { console.log('FAILED ' + fail); process.exit(1); }
console.log('all static checks passed');
