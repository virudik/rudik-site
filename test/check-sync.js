/* Сверка /test/ с основным сайтом: контент, дни рождения, жесты, клик космонавта.
   Запуск из корня репозитория: node test/check-sync.js
   Не открывает браузер и не меняет файлы. */
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

var main = read('index.html');
var test = read('test/index.html');
var sats = read('js/satellites.js');
var interact = read('js/interact.js');
var modes = read('js/modes.js');
var css = read('test/test.css');
var copies = ['index.html', 'алина/index.html', 'маша/index.html', 'виталик/index.html', 'иишница/index.html', 'мои-видео/index.html', 'обо-мне/index.html', 'промты/index.html', 'работа/index.html', 'фото/index.html', 'видео/index.html', 'prompts/index.html'];

ok('main keeps #rdSpace', /id="rdSpace"/.test(main));
ok('main still asks satellites.js?v=4', /satellites\.js\?v=4/.test(main) && !/satellites\.js\?v=5/.test(main));
copies.forEach(function (rel) {
  var html = read(rel);
  ok(rel + ' has no test theme button', html.indexOf('id="themeBtn"') < 0);
  ok(rel + ' keeps #rdSpace', /id="rdSpace"/.test(html));
});

ok('test stays noindex', /noindex/.test(test));
ok('test keeps theme button', /id="themeBtn"/.test(test));
ok('test keeps dark theme hook', /data-theme/.test(test) && /rd-theme/.test(test) && /data-theme="dark"/.test(css));
ok('test loads satellites.js?v=5', /satellites\.js\?v=5/.test(test));
ok('test loads test.css?v=22', /test\.css\?v=22/.test(test));
ok('test cosmonaut lives in .spacev, not #rdSpace', /class="spacev"/.test(test) && !/id="rdSpace"/.test(test));
ok('test work calendar is .cal-space', /class="cal chip cal-space"/.test(test));
ok('test home calendar is .cal-wall', /class="cal chip cal-wall"/.test(test));
ok('both calendars hl=ru', (main.match(/hl=ru/g) || []).length >= 2 && (test.match(/hl=ru/g) || []).length >= 2);

['vitalik-tile-loop.mp4', 'masha-loop.mp4?v=5', 'alina-loop.mp4', 'dogs-loop.mp4?v=2', 'space-loop.mp4?v=2', 'fam2-loop.mp4?v=5', 'rainbow-loop.mp4?v=4'].forEach(function (src) {
  ok('loop on both: ' + src, main.indexOf(src) >= 0 && test.indexOf(src) >= 0);
});
ok('spoon loop is current masha-loop.mp4?v=5', /masha-loop\.mp4\?v=5/.test(test));
ok('videos-data shared', /videos-data\.js\?v=8/.test(main) && /videos-data\.js\?v=8/.test(test));
ok('test links ИИшница out, does not embed iiDance', test.indexOf('id="iiDance"') < 0 && /href="\/иишница\/"/.test(test));
ok('main still has iiDance/iiDetective/iiShip', /id="iiDance"/.test(main) && /id="iiDetective"/.test(main) && /id="iiShip"/.test(main));

ok('birthdays Виталик 08-10 Маша 04-05 Алина 10-26',
  /name:\s*'Виталик',\s*date:\s*'08-10'/.test(modes) &&
  /name:\s*'Маша',\s*date:\s*'04-05'/.test(modes) &&
  /name:\s*'Алина',\s*date:\s*'10-26'/.test(modes));

ok('satellites bind #rdSpace first', /querySelector\('#rdSpace canvas\.sp-c'\)/.test(sats));
ok('satellites also bind test .spacev', /querySelector\('\.spacev canvas\.sp-c'\)/.test(sats));
ok('test css positions hit ovals', /\.spacev \.sp-hit\{[^}]*position:absolute/.test(css) && /\.spacev \.sp-hit\{[^}]*pointer-events:auto/.test(css));
ok('satellite images stay clickable', /\.rd-sats img \{ pointer-events:auto/.test(read('css/satellites.css')));
ok('satellite layer itself ignores clicks', /\.rd-sats, \.rd-sats \* \{ pointer-events:none/.test(read('css/satellites.css')));

ok('phone tap is wheelie, not a double-tap fall', /lastPT === 'touch'\) \{ if \(r\._ride\.has\('wheelie'\)\) react\('wheelie'\); return; \}/.test(interact));
ok('long-press 550ms falls', /setTimeout\(function \(\) \{ lpR = 0; lpRFired = true;[\s\S]*fallAlt\(\); \}, 550\)/.test(interact));
ok('viewport does not lock zoom', /width=device-width, initial-scale=1/.test(test) && !/maximum-scale|user-scalable=no/.test(test));

ok('ИИшница: only red tile click triggers 3 existing reactions',
  interact.includes('function playIishnicaHeroesFromTile(e)') &&
  interact.includes("closest(e.target, '#wb_element_instance227, #wb_element_instance231')") &&
  interact.includes("document.addEventListener('click', playIishnicaHeroesFromTile, true)") &&
  interact.includes("['iiDance', 'iiShip', 'iiDetective']") &&
  !interact.includes('scheduleIishnicaHeroes') &&
  !interact.includes("addEventListener('hashchange'"));

copies.concat(['test/index.html']).forEach(function (rel) {
  ok(rel + ' loads interact.js?v=17', /\/js\/interact\.js\?v=17/.test(read(rel)));
});

var vids = read('js/videos-data.js');
ok('Rutube portfolio has six exact owner video IDs', [
 '5c9529ad09a354eb24e7fec0030f8108',
 'bded60522d4d787ae2df31e8ebe5ad23',
 '81a1e6150e98400ce7732b6da6bbc3e6',
 'f28cf60c314b00eadc77d88f582e1be0',
 '71a96d88e127f61acd8e49c3831b50d7',
 'a260d16ec1ec08900d878aec655b62b0'
].every(function (id) { return vids.indexOf(id) >= 0; }));
ok('Канцлер Серёгиус one single title, no duplicates',
  (vids.match(/title:\s*'Канцлер Серёгиус'/g) || []).length === 1 &&
  !/title:\s*'(Канцлер|Серёгиус)'/.test(vids));
ok('Rutube iframe and fallback link enabled',
  /if \(v\.rutube && v\.review !== 'pending'\)/.test(read('js/rudik.js')) &&
  /rf\.loading = 'lazy'/.test(read('js/rudik.js')) &&
  /Открыть на Rutube/.test(read('js/rudik.js')));
ok('TV-submenu linked to nested video section',
  /slug === 'видео'/.test(read('js/clean-urls.js')) &&
  /rd-menu-shut/.test(read('js/clean-urls.js')) &&
  /fixedBar\(\)/.test(read('js/clean-urls.js')) &&
  /rd-menu-shut ul ul \{ display: none !important; \}/.test(read('css/extra.css')) &&
  /id="видео"/.test(main) && /Видео со мной/.test(main));
ok('test Video click stays on the TV section under the sticky bar',
  /getAttribute\('href'\) !== '#video'/.test(read('test/test.js')) &&
  /function go\(y\)/.test(read('test/test.js')) &&
  /id="video"/.test(test) && /Видео со мной из того что шло по телику/.test(test) &&
  /\/test\/test\.js\?v=4/.test(test));
ok('Unassigned cards preserved: Матиз, Кот-детектив, Роскосмос',
  ['Матиз', 'Кот-детектив', 'Роскосмос'].every(function (n) { return vids.includes("title: '" + n + "'"); }));
copies.forEach(function (rel) {
  var html = read(rel);
  ok(rel + ' loads the new portfolio and navigation code',
    /\/js\/videos-data\.js\?v=8/.test(html) &&
    /\/js\/rudik\.js\?v=6/.test(html) &&
    /\/js\/clean-urls\.js\?v=3/.test(html) &&
    /\/css\/extra\.css\?v=23/.test(html));
});


// Портфолио: проверяем РЕАЛЬНЫЙ порядок, а не только строки в исходнике.
var vm = require('vm');
var renderGrid = { children: [], appendChild: function (c) { this.children.push(c); } };
var renderDocument = {
  getElementById: function (id) { return id === 'iiVideoGrid' ? renderGrid : null; },
  createElement: function (type) { return {
    type: type, children: [], appendChild: function (c) { this.children.push(c); },
    setAttribute: function () {}
  }; },
  addEventListener: function () {}, querySelectorAll: function () { return []; }
};
var renderWindow = { addEventListener: function () {} };
vm.runInNewContext(vids + '\n' + read('js/rudik.js'),
  { document: renderDocument, window: renderWindow, setTimeout: function () {} });
var names = renderGrid.children.map(function (card) { return card.children[0].textContent; });
var ranks = names.map(function (name) {
  var v = renderWindow.RUDIK_VIDEOS.find(function (x) { return x.title === name; });
  if (v.file || v.youtube || (v.rutube && v.review !== 'pending')) return 0;
  if (v.rutube || v.review === 'pending') return 1;
  return 2;
});
ok('Video cards unique after merging twice-named films',
  names.length === 14 && new Set(names).size === 14 &&
  names.filter(function (x) { return x.includes('Очень Странный Дед Мороз'); }).length === 1 &&
  names.filter(function (x) { return x.includes('Звёздные войны в деревне'); }).length === 1);
ok('Replaced original MP4 absent only after Drive backup and Rutube verification', !vids.includes('/video/alina-ny.mp4') && !vids.includes('/video/zv.mp4') && !fs.existsSync(path.join(root,'video/alina-ny.mp4')) && !fs.existsSync(path.join(root,'video/zv.mp4')));
ok('Alexey MP4 removed: site uses Rutube and durations match', !vids.includes('alexey.mp4') && !fs.existsSync(path.join(root,'video/alexey.mp4')));
ok('Kotmonavty MP4 kept while local and Rutube durations disagree', fs.existsSync(path.join(root,'video/kotmonavty.mp4')) && !vids.includes('kotmonavty.mp4'));
ok('School film stays on the local file', vids.includes('/video/alina-school.mp4') && fs.existsSync(path.join(root,'video/alina-school.mp4')));
var ownerIds = ["81a1e6150e98400ce7732b6da6bbc3e6", "a260d16ec1ec08900d878aec655b62b0", "bded60522d4d787ae2df31e8ebe5ad23", "71a96d88e127f61acd8e49c3831b50d7", "f28cf60c314b00eadc77d88f582e1be0", "5c9529ad09a354eb24e7fec0030f8108"];
var renderedIds = names.map(function (name) { return renderWindow.RUDIK_VIDEOS.find(function (x) { return x.title === name; }).rutube; });
ok('Exact owner order: Открытка ОСД Котмонавты ЗВ Финансовые Алексей', JSON.stringify(renderedIds.slice(0, 6)) === JSON.stringify(ownerIds));
ok('Remaining videos before remaining soon cards', ranks.slice(6).every(function (v, i, a) { return i === 0 || v >= a[i - 1]; }));
ok('Explicit order preserves pending flags and all fourteen cards', names.length === 14 && renderWindow.RUDIK_VIDEOS.filter(function (v) { return v.review === 'pending'; }).length === 0);
ok('Pending Rutube IDs not falsely labeled as confirmed moderation',
  /Публикация на Rutube проверяется/.test(read('js/rudik.js')) &&
  !/На модерации/.test(read('js/videos-data.js')));

// Подпись Открытки: отдельная строка в том же оформлении заголовка.
var postcard = renderWindow.RUDIK_VIDEOS.find(function (v) { return v.rutube === '81a1e6150e98400ce7732b6da6bbc3e6'; });
ok('Postcard keeps its title, first position and exact Rutube ID', postcard.title === 'Открытка' && postcard.order === 1 && postcard.shorts === true);
ok('Only postcard receives the requested subtitle', postcard.subtitle === '(Новогоднее поздравление)' && renderWindow.RUDIK_VIDEOS.filter(function (v) { return v.subtitle; }).length === 1);
function hasPostcardSubtitle(grid) {
  var card = grid.children.find(function (c) { return c.children[0].textContent === 'Открытка'; });
  if (!card) return false;
  var title = card.children[0];
  return title.className === 'rv-t' && title.children.length === 1 && title.children[0].type === 'div' && title.children[0].className === 'rv-subtitle' && title.children[0].textContent === '(Новогоднее поздравление)';
}
ok('Main renders postcard subtitle as a separate block under its title', hasPostcardSubtitle(renderGrid));
var testGrid = { children: [], appendChild: function (c) { this.children.push(c); } };
var testDocument = Object.assign({}, renderDocument, { getElementById: function (id) { return id === 'iiVideoGrid' ? testGrid : null; } });
var testRenderer = read('test/test.js');
testRenderer = testRenderer.slice(0, testRenderer.indexOf('})();') + 5);
vm.runInNewContext(vids + '\n' + testRenderer, { document: testDocument, window: {} });
ok('Test page renderer keeps the same separate postcard subtitle', hasPostcardSubtitle(testGrid));

console.log(fail ? '\n' + fail + ' failed' : '\nall checks passed');
process.exit(fail ? 1 : 0);
