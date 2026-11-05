/* Тайные и праздничные режимы рудик.рф (js/modes.js).
   • Набрать слово на клавиатуре (раскладка не важна) — включить/выключить режим (список слов — в MODES[].word).
   • Клик по копирайту внизу — меню выбора (Погода / Праздники / Забавы / Обычный).
   • Праздники включаются сами в свой день (дата по Москве). «Обычный» в меню выключает авто-режим до закрытия вкладки.
   • Отладка: ?mode=<id> — включить режим, ?date=YYYY-MM-DD — притвориться, что сегодня эта дата.
   Выбор хранится только в этой вкладке (sessionStorage). Без мигания/стробоскопа: все вспышки мягкие и редкие. */
(function () {
  'use strict';
  /* дни рождения семьи: { name, date: 'MM-DD' } */
  var BIRTHDAYS = window.RUDIK_BIRTHDAYS || [{ name: 'Виталик', date: '08-10' }, { name: 'Маша', date: '04-05' }, { name: 'Алина', date: '10-26' }];   /* важнее любых других праздников */

  var TRI = ['#ffffff', '#1c57c9', '#d52b1e'];
  /* L — слои эффекта; tint — лёгкая подложка; hi — поздравление (баннер) */
  var MODES = {
    snow:    { g: 'w', word: 'снег',  name: 'Снег',          ico: '❄️', L: [['snow', 110]] },
    rain:    { g: 'w', word: 'дождь', name: 'Дождь',         ico: '🌧️', L: [['rain', 130]], tint: 'rgba(40,60,90,.08)' },
    ng:      { g: 'h', word: 'нг',    name: 'Новый год',     ico: '🎄', L: [['garland'], ['snow', 45]], hi: 'С Новым годом!' },
    xmas:    { g: 'h', word: 'рождество', name: 'Рождество', ico: '⭐', L: [['garland'], ['snow', 40], ['bstar']], hi: 'Со светлым Рождеством!' },
    pumpkin: { g: 'h', word: 'тыква', name: 'Хеллоуин',      ico: '🎃', L: [['bats'], ['pumpkins']], tint: 'rgba(30,5,45,.16)', hi: 'Счастливого Хеллоуина!' },
    feb14:   { g: 'h', word: 'любовь', name: 'День влюблённых', ico: '❤️', L: [['fall', ['❤️', '💕', '💖', '💗'], 26]], hi: 'С Днём всех влюблённых!' },
    feb23:   { g: 'h', word: 'салют', name: '23 февраля',    ico: '⭐', L: [['fw', ['#ffd54a', '#ff4b3e', '#ffffff', '#4bb0ff']], ['fall', ['⭐'], 10]], hi: 'С Днём защитника Отечества!' },
    masl:    { g: 'h', word: 'блины',  name: 'Масленица',    ico: '🥞', L: [['sun'], ['fall', ['🥞', '🥞', '☀️'], 16]], hi: 'С Масленицей! Блинов побольше!' },
    mar1:    { g: 'h', word: 'мяу',    name: 'День кошек',   ico: '🐱', L: [['fall', ['🐱', '🐾', '😺', '🐾'], 18]], hi: 'С Днём кошек! Мяу!' },
    mar8:    { g: 'h', word: 'мимоза', name: '8 Марта',      ico: '🌷', L: [['fall', ['🌷', '🌼', '🌷', '💐'], 24]], hi: 'С 8 Марта!' },
    apr1:    { g: 'h', word: 'смех',   name: 'День смеха',   ico: '😂', L: [['fall', ['😂', '🤪', '😜', '🤡'], 18], ['prank']], hi: 'С 1 апреля! Ничего не сломалось — честно 😉' },
    apr12:   { g: 'h', word: 'гагарин', name: 'День космонавтики', ico: '🚀', L: [['stars', 110], ['rockets']], tint: 'rgba(8,12,40,.42)', hi: 'С Днём космонавтики! Поехали!' },
    easter:  { g: 'h', word: 'пасха',  name: 'Пасха',        ico: '🥚', L: [['eggs', 16]], hi: 'Светлой Пасхи!' },
    may4:    { g: 'h', word: 'джедай', name: 'День звёздных войн', ico: '✨', L: [['stars', 160], ['crawl']], tint: 'rgba(0,0,10,.62)', hi: 'Да пребудет с тобой Сила!' },
    may9:    { g: 'h', word: 'победа', name: 'День Победы',  ico: '🎖️', L: [['fw', ['#ffd54a', '#ff6a3d', '#ffffff'], 1], ['lilac', 9]], hi: 'С Днём Победы! Помним. Гордимся.' },
    jun1:    { g: 'h', word: 'дети',   name: 'День защиты детей', ico: '🎈', L: [['rise', ['🎈', '🎈', '🎈', '🧸'], 16]], hi: 'С Днём защиты детей!' },
    jun12:   { g: 'h', word: 'россия', name: 'День России',  ico: '🎆', L: [['fw', TRI], ['confetti', TRI, 50]], hi: 'С Днём России!' },
    medic:   { g: 'h', word: 'доктор', name: 'День медика',  ico: '🩺', L: [['fall', ['🩺', '💊', '❤️‍🩹', '🩹'], 16]], hi: 'С Днём медицинского работника! Спасибо!' },
    jul8:    { g: 'h', word: 'ромашка', name: 'День семьи',  ico: '🌼', L: [['fall', ['🌼', '🌼', '💛'], 24]], hi: 'С Днём семьи, любви и верности!' },
    jul12:   { g: 'h', word: 'фото',   name: 'День фотографа', ico: '📷', L: [['flash'], ['fall', ['📷', '📸', '🖼️'], 10]], hi: 'С Днём фотографа! Улыбочку!' },
    ai:      { g: 'h', word: 'нейро',  name: 'День ИИ',      ico: '🤖', L: [['net']], tint: 'rgba(10,20,50,.12)', hi: 'С Днём искусственного интеллекта! 🤖' },
    aug22:   { g: 'h', word: 'флаг',   name: 'День флага',   ico: '🏳️', L: [['tri'], ['confetti', TRI, 60]], hi: 'С Днём Государственного флага России!' },
    aug27:   { g: 'h', word: 'кино',   name: 'День кино',    ico: '🎬', L: [['film'], ['fall', ['🎬', '🍿', '🎞️'], 12]], hi: 'С Днём российского кино!' },
    sep1:    { g: 'h', word: 'школа',  name: 'День знаний',  ico: '🔔', L: [['fall', ['🔔', '📚', '✏️', 'А', 'Б', 'В', '🍎'], 20]], hi: 'С Днём знаний!' },
    glass:   { g: 'h', word: 'стакан', name: 'День гранёного стакана', ico: '🥛', L: [['fall', ['🥛', '🥛', '✨'], 12]], hi: 'С Днём гранёного стакана!' },
    prog:    { g: 'h', word: 'код',    name: 'День программиста', ico: '💻', L: [['matrix']], tint: 'rgba(0,15,5,.5)', hi: 'С Днём программиста! (256-й день года)' },
    teach:   { g: 'h', word: 'учитель', name: 'День учителя', ico: '📚', L: [['fall', ['📚', '🍎', '✏️', '📐', '💐'], 18]], hi: 'С Днём учителя!' },
    father:  { g: 'h', word: 'папа',   name: 'День отца',    ico: '👨', L: [['fall', ['💙', '⭐', '🏆', '🛠️'], 16]], hi: 'С Днём отца!' },
    grand:   { g: 'h', word: 'бабушка', name: 'Бабушки и дедушки', ico: '👵', L: [['fall', ['👵', '👴', '🧶', '❤️', '🥧'], 16]], hi: 'С Днём бабушек и дедушек!' },
    nov4:    { g: 'h', word: 'единство', name: 'Народное единство', ico: '🤝', L: [['fw', TRI], ['fall', ['🤝', '❤️'], 10]], hi: 'С Днём народного единства!' },
    mother:  { g: 'h', word: 'мама',   name: 'День матери',  ico: '💐', L: [['fall', ['💐', '🌷', '❤️', '🌸'], 22]], hi: 'С Днём матери!' },
    bday:    { g: 'h', word: 'торт',   name: 'День рождения', ico: '🎂', L: [['rise', ['🎈', '🎈', '🎈'], 14], ['fall', ['🎂', '🎁', '🎉'], 10]], hi: 'С днём рождения!' },
    dogs:    { g: 'f', word: 'гав',    name: 'Летающие собаки', ico: '🐶', L: [['dogs']] }
  };
  var GROUPS = [['w', 'Погода'], ['h', 'Праздники'], ['f', 'Забавы']];
  var DOG_SPRITES = ['/img/dog-fly.webp?v=1'];

  /* ---------- даты (по Москве) ---------- */
  function q(k) { var m = new RegExp('[?&]' + k + '=([^&#]*)').exec(location.search); return m ? decodeURIComponent(m[1]) : null; }
  function today() {
    var s = q('date');
    if (!s || !/^\d{4}-\d\d-\d\d$/.test(s)) { try { s = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); } catch (e) { var n = new Date(Date.now() + 3 * 3600e3); s = n.toISOString().slice(0, 10); } }
    var p = s.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  }
  function D(y, m, d) { return Date.UTC(y, m - 1, d); }
  function orthEaster(y) {                                   /* православная Пасха: юлианский расчёт + 13 дней (1900–2099) */
    var a = y % 4, b = y % 7, c = y % 19, d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7;
    var mo = Math.floor((d + e + 114) / 31), da = ((d + e + 114) % 31) + 1;
    return D(y, mo, da) + 13 * 864e5;
  }
  function nthSun(y, m, n) { var f = new Date(D(y, m, 1)).getUTCDay(); return 1 + (7 - f) % 7 + 7 * (n - 1); }
  function lastSun(y, m) { var L = new Date(D(y, m + 1, 0)), wd = L.getUTCDay(); return L.getUTCDate() - wd; }
  function holiday(t) {
    var y = t.getUTCFullYear(), m = t.getUTCMonth() + 1, d = t.getUTCDate(), T = t.getTime(), md = m * 100 + d;
    var doy = Math.round((T - D(y, 1, 1)) / 864e5) + 1;
    var FIX = { 214: 'feb14', 223: 'feb23', 301: 'mar1', 308: 'mar8', 401: 'apr1', 412: 'apr12', 504: 'may4', 509: 'may9', 601: 'jun1', 612: 'jun12',
                708: 'jul8', 712: 'jul12', 716: 'ai', 822: 'aug22', 827: 'aug27', 901: 'sep1', 911: 'glass', 1005: 'teach', 1028: 'grand', 1031: 'pumpkin', 1104: 'nov4' };
    var mmdd = (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
    for (var i = 0; i < BIRTHDAYS.length; i++) if (BIRTHDAYS[i].date === mmdd) return { id: 'bday', name: BIRTHDAYS[i].name };
    var E = orthEaster(y);
    if (T === E) return { id: 'easter' };
    if (md === 107) return { id: 'xmas' };
    if (FIX[md]) return { id: FIX[md] };
    if (doy === 256) return { id: 'prog' };
    if (m === 6 && d === nthSun(y, 6, 3)) return { id: 'medic' };
    if (m === 10 && d === nthSun(y, 10, 3)) return { id: 'father' };
    if (m === 11 && d === lastSun(y, 11)) return { id: 'mother' };
    if (T >= E - 55 * 864e5 && T <= E - 49 * 864e5) return { id: 'masl' };   /* масленичная неделя: пн–вс перед Великим постом */
    if ((m === 12 && d >= 25) || (m === 1 && d <= 8)) return { id: 'ng' };
    return null;
  }
  window.RUDIK_HOLIDAY = function (s) { var p = s.split('-').map(Number); return holiday(new Date(Date.UTC(p[0], p[1] - 1, p[2]))); };

  /* ---------- раскладка ---------- */
  var EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`", RU = 'йцукенгшщзхъфывапролджэячсмитьбюё';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = Math.min(screen.width, innerWidth) <= 640;
  var mode = null, cv = null, ctx = null, W = 0, H = 0, DPR = 1, parts = [], raf = 0, tint = null, last = 0, t0 = 0, dogImgs = null, extra = [], hiName = '';

  function ensure() {
    if (cv) return;
    tint = document.createElement('div'); tint.className = 'rd-fx-tint'; tint.setAttribute('aria-hidden', 'true'); document.body.appendChild(tint);
    cv = document.createElement('canvas'); cv.className = 'rd-fx'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv); ctx = cv.getContext('2d');
    addEventListener('resize', function () { size(); if (mode) setup(); }, { passive: true }); size();
  }
  function size() { if (!cv) return; DPR = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  function R(a, b) { return a + Math.random() * (b - a); }
  function P(a) { return a[Math.floor(Math.random() * a.length)]; }
  function count(n) { return Math.max(3, Math.round(n * Math.min(1.4, (W * H) / (1280 * 720)) * (mobile ? .6 : 1))); }

  /* эмодзи рисуем один раз в маленький холст — так быстрее */
  var EC = {};
  function emo(e) {
    if (EC[e]) return EC[e];
    var c = document.createElement('canvas'), s = 64; c.width = c.height = s; var x = c.getContext('2d');
    x.textAlign = 'center'; x.textBaseline = 'middle';
    if (/^[А-Я]$/.test(e)) { x.font = 'bold 46px Georgia,serif'; x.fillStyle = P(['#d32f2f', '#1565c0', '#2e7d32', '#f9a825']); } else x.font = '48px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    x.fillText(e, s / 2, s / 2 + 3); return (EC[e] = c);
  }

  /* ---------- частицы ---------- */
  var MK = {
    snow: function (o, any) { return { k: 'f', x: R(0, W), y: any ? R(0, H) : R(-40, -5), r: R(1.2, 3.6), vy: R(25, 70), dx: R(0, 6.28), a: R(.6, .95) }; },
    rain: function (o, any) { return { k: 'r', x: R(-60, W), y: any ? R(0, H) : R(-80, -10), l: R(10, 22), vy: R(650, 950), a: R(.4, .7) }; },
    fall: function (o, any) { return { k: 'e', e: P(o[1]), x: R(0, W), y: any ? R(-H, H) : R(-80, -30), s: R(18, 34) * (mobile ? .85 : 1), vy: R(40, 85), sw: R(0, 6.28), rot: R(-.4, .4), vr: R(-.6, .6) }; },
    rise: function (o, any) { return { k: 'e', e: P(o[1]), x: R(0, W), y: any ? R(0, H * 2) : H + R(30, 90), s: R(28, 46) * (mobile ? .8 : 1), vy: -R(35, 70), sw: R(0, 6.28), rot: 0, vr: 0 }; },
    confetti: function (o, any) { return { k: 'c', c: P(o[1]), x: R(0, W), y: any ? R(-H, H) : R(-30, -5), w: R(5, 9), h: R(8, 14), vy: R(50, 110), sw: R(0, 6.28), rot: R(0, 6.28), vr: R(-4, 4) }; },
    stars: function (o) { return { k: 's', x: R(0, W), y: R(0, H), r: R(.5, 1.8), ph: R(0, 6.28), sp: R(.4, 1.4) }; },
    lilac: function (o, any) { return { k: 'l', x: R(0, W), y: any ? R(-H, H) : -60, s: R(.7, 1.1), vy: R(22, 38), sw: R(0, 6.28), rot: R(-.5, .5) }; },
    eggs: function (o, any) { return { k: 'g', x: R(0, W), y: any ? R(-H, H) : -50, s: R(14, 22), vy: R(40, 70), sw: R(0, 6.28), rot: R(-.5, .5), vr: R(-.5, .5), c: P(['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa']), c2: P(['#fff', '#ffe082', '#c5e1a5']) }; }
  };
  function bat() { var l = Math.random() < .5; return { k: 'b', l: l, x: l ? -40 : W + 40, y: R(H * .08, H * .6), vx: (l ? 1 : -1) * R(90, 170), s: R(12, 22), ph: R(0, 6.28), dy: R(0, 6.28) }; }
  function dog() { var l = Math.random() < .5, s = R(.28, .6) * (mobile ? .7 : 1); return { k: 'd', l: l, x: l ? -200 : W + 200, y: R(H * .1, H * .75), vx: (l ? 1 : -1) * R(160, 300), s: s, ph: R(0, 6.28), rot: R(-.15, .15) }; }
  var fw = [], fwT = 0, rk = [], net = [], flashes = [], flashT = 0, mcols = [];

  function setup() {
    parts = []; fw = []; rk = []; net = []; flashes = []; mcols = []; fwT = .3; flashT = 1.2;
    var M = MODES[mode]; if (!M) return;
    M.L.forEach(function (o) {
      var t = o[0];
      if (MK[t]) for (var i = 0, N = count(typeof o[1] === 'number' ? o[1] : o[2] || 20); i < N; i++) { var p = MK[t](o, true); p.o = o; parts.push(p); }
      if (t === 'bats') for (i = 0; i < 3; i++) { var b = bat(); b.x = R(0, W); parts.push(b); }
      if (t === 'dogs') { if (!dogImgs) dogImgs = DOG_SPRITES.map(function (s) { var im = new Image(); im.src = s; return im; }); parts.push(dog()); }
      if (t === 'net') for (i = 0; i < (mobile ? 26 : 50); i++) net.push({ x: R(0, W), y: R(0, H), vx: R(-18, 18), vy: R(-18, 18), r: R(1.5, 3) });
      if (t === 'matrix') { var cw = mobile ? 16 : 18; for (i = 0; i < Math.ceil(W / cw); i++) mcols.push({ x: i * cw, y: R(-H, H), v: R(60, 160), n: Math.floor(R(6, 18)) }); }
    });
  }

  /* ---------- рисование ---------- */
  function garland(t) {
    var n = Math.max(10, Math.round(W / 46)), sag = 18, cols = ['#ff3b3b', '#ffd23b', '#3bff7a', '#3bb8ff', '#ff5bd6'];
    ctx.strokeStyle = 'rgba(40,60,40,.85)'; ctx.lineWidth = 1.6; ctx.beginPath();
    for (var x = 0; x <= W; x += 8) { var u = (x % (W / 4)) / (W / 4); ctx.lineTo(x, 4 + Math.sin(u * Math.PI) * sag); } ctx.stroke();
    for (var i = 0; i < n; i++) {
      var bx = (i + .5) * W / n, uu = (bx % (W / 4)) / (W / 4), by = 4 + Math.sin(uu * Math.PI) * sag + 7;
      var on = .55 + .45 * Math.sin(t * 1.2 + i * 1.3), c = cols[i % cols.length];
      ctx.globalAlpha = on * .35; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(bx, by, 9, 0, 6.28); ctx.fill();
      ctx.globalAlpha = .55 + on * .45; ctx.beginPath(); ctx.ellipse(bx, by, 3.6, 5.2, 0, 0, 6.28); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function bstar(t) {                                         /* Вифлеемская звезда в правом верхнем углу: мягкое сияние */
    var x = W - (mobile ? 50 : 90), y = mobile ? 70 : 90, s = mobile ? 16 : 24, g = .75 + .25 * Math.sin(t * .9);
    var gr = ctx.createRadialGradient(x, y, 0, x, y, s * 3.2); gr.addColorStop(0, 'rgba(255,240,170,' + (.55 * g) + ')'); gr.addColorStop(1, 'rgba(255,240,170,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, s * 3.2, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#ffd84a'; ctx.beginPath();
    for (var i = 0; i < 16; i++) { var a = i * Math.PI / 8 - Math.PI / 2, rr = i % 2 ? s * .28 : (i % 4 ? s * .7 : (i === 8 ? s * 2.1 : s * 1.15)); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
  }
  function sun(t) {
    var x = mobile ? 50 : 90, y = mobile ? 80 : 100, r = mobile ? 22 : 34;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * .25); ctx.strokeStyle = '#ffb300'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (var i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(r * 1.2, 0); ctx.lineTo(r * 1.65, 0); ctx.stroke(); }
    ctx.restore(); ctx.fillStyle = '#ffca28'; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#6d4c41'; ctx.beginPath(); ctx.arc(x - r * .33, y - r * .15, r * .09, 0, 6.28); ctx.arc(x + r * .33, y - r * .15, r * .09, 0, 6.28); ctx.fill();
    ctx.strokeStyle = '#6d4c41'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y + r * .05, r * .45, .3, Math.PI - .3); ctx.stroke();
  }
  function tri(t) {                                           /* развевающаяся лента-триколор сверху */
    var h = mobile ? 7 : 10;
    for (var k = 0; k < 3; k++) {
      ctx.fillStyle = TRI[k]; ctx.beginPath();
      for (var x = 0; x <= W; x += 10) ctx.lineTo(x, k * h + Math.sin(x / 70 + t * 2) * 4 + 2);
      for (x = W; x >= 0; x -= 10) ctx.lineTo(x, (k + 1) * h + Math.sin(x / 70 + t * 2) * 4 + 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1; ctx.beginPath(); for (x = 0; x <= W; x += 10) ctx.lineTo(x, Math.sin(x / 70 + t * 2) * 4 + 2); ctx.stroke();
  }
  function film(t) {
    var h = mobile ? 22 : 30, off = (t * 40) % 24;
    [0, H - h].forEach(function (y) {
      ctx.fillStyle = 'rgba(20,20,20,.85)'; ctx.fillRect(0, y, W, h); ctx.fillStyle = 'rgba(255,255,255,.85)';
      for (var x = -off; x < W; x += 24) { ctx.fillRect(x, y + 4, 12, 6); ctx.fillRect(x, y + h - 10, 12, 6); }
    });
  }
  function lilac(p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(p.s, p.s);
    ctx.strokeStyle = '#5d7a3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 26); ctx.lineTo(0, 44); ctx.stroke();
    ctx.fillStyle = '#6b8e3a'; ctx.beginPath(); ctx.ellipse(7, 38, 7, 3.5, -.5, 0, 6.28); ctx.fill();
    var cs = ['#b39ddb', '#9575cd', '#ce93d8', '#b388ff'];
    for (var i = 0; i < 26; i++) { var yy = i * 1, w = 11 - yy * .35; ctx.fillStyle = cs[i % 4]; ctx.beginPath(); ctx.arc(((i * 37) % 7 - 3) / 3 * w, 26 - yy, 3.2, 0, 6.28); ctx.fill(); }
    ctx.restore();
  }
  function egg(p) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); var s = p.s;
    ctx.beginPath(); ctx.ellipse(0, 0, s * .72, s, 0, 0, 6.28); ctx.fillStyle = p.c; ctx.fill(); ctx.clip();
    ctx.fillStyle = p.c2; ctx.fillRect(-s, -s * .18, s * 2, s * .22); ctx.globalAlpha = .7; ctx.fillRect(-s, s * .3, s * 2, s * .1);
    for (var i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * s * .3, -s * .5, s * .07, 0, 6.28); ctx.fill(); }
    ctx.restore();
  }
  function batShape(p, t) {
    var f = Math.sin(t * 14 + p.ph) * .6, s = p.s;
    ctx.save(); ctx.translate(p.x, p.y + Math.sin(t * 2 + p.dy) * 14); ctx.fillStyle = 'rgba(25,10,30,.9)'; ctx.beginPath();
    ctx.moveTo(0, 0); ctx.quadraticCurveTo(-s * .6, -s * (.5 + f), -s * 1.4, -s * f * .8); ctx.quadraticCurveTo(-s * .8, s * .1, -s * .3, s * .25);
    ctx.lineTo(0, s * .12); ctx.lineTo(s * .3, s * .25); ctx.quadraticCurveTo(s * .8, s * .1, s * 1.4, -s * f * .8); ctx.quadraticCurveTo(s * .6, -s * (.5 + f), 0, 0); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -s * .05, s * .22, 0, 6.28); ctx.fill(); ctx.restore();
  }
  function pumpkins() {
    var fs = mobile ? 34 : 52, e = emo('🎃');
    ctx.drawImage(e, 8, H - fs - 6, fs, fs); ctx.drawImage(e, W - fs - 10, H - fs - 6, fs, fs);
    if (!mobile) ctx.drawImage(e, fs + 10, H - fs * .7 - 6, fs * .7, fs * .7);
  }
  /* салют: медленные мягкие вспышки (без стробоскопа) */
  function fireworks(o, dt) {
    var gentle = o[2], cols = o[1];
    fwT -= dt;
    if (fwT <= 0 && fw.length < (mobile ? 140 : 260)) {
      fwT = gentle ? R(1.6, 2.6) : R(.7, 1.4);
      var x = R(W * .15, W * .85), y = R(H * .12, H * .45), n = mobile ? 26 : 40, c = P(cols);
      for (var i = 0; i < n; i++) { var a = i / n * 6.28, v = R(60, 130) * (gentle ? .8 : 1); fw.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, c: P([c, c, P(cols)]) }); }
    }
    for (var j = fw.length - 1; j >= 0; j--) {
      var p = fw[j]; p.vy += 50 * dt; p.vx *= .985; p.vy *= .985; p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt * (gentle ? .45 : .6);
      if (p.l <= 0) { fw.splice(j, 1); continue; }
      ctx.globalAlpha = Math.min(1, p.l * 1.4); ctx.fillStyle = p.c; ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = .6;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 6.28); ctx.fill(); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function rockets(dt, t) {
    if (rk.length < (mobile ? 2 : 3) && Math.random() < dt * .7) rk.push({ x: R(-60, W * .5), y: H + 40, v: R(140, 230), s: R(30, 46) });
    for (var i = rk.length - 1; i >= 0; i--) {
      var p = rk[i]; p.x += p.v * .55 * dt; p.y -= p.v * dt; if (p.y < -80) { rk.splice(i, 1); continue; }
      ctx.save(); ctx.translate(p.x, p.y);
      var gr = ctx.createLinearGradient(0, 0, -p.s * .6, p.s * 1.1); gr.addColorStop(0, 'rgba(255,180,60,.75)'); gr.addColorStop(1, 'rgba(255,180,60,0)');
      ctx.strokeStyle = gr; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-p.s * .15, p.s * .2); ctx.lineTo(-p.s * .9, p.s * 1.6); ctx.stroke();
      ctx.drawImage(emo('🚀'), -p.s / 2, -p.s / 2, p.s, p.s); ctx.restore();
    }
  }
  function netDraw(dt) {
    var d2 = mobile ? 110 : 150;
    for (var i = 0; i < net.length; i++) { var a = net[i]; a.x += a.vx * dt; a.y += a.vy * dt; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1; }
    ctx.lineWidth = 1;
    for (i = 0; i < net.length; i++) for (var j = i + 1; j < net.length; j++) {
      var dx = net[i].x - net[j].x, dy = net[i].y - net[j].y, dd = Math.sqrt(dx * dx + dy * dy);
      if (dd < d2) { ctx.strokeStyle = 'rgba(70,140,255,' + (.45 * (1 - dd / d2)) + ')'; ctx.beginPath(); ctx.moveTo(net[i].x, net[i].y); ctx.lineTo(net[j].x, net[j].y); ctx.stroke(); }
    }
    ctx.fillStyle = 'rgba(90,170,255,.9)'; net.forEach(function (a) { ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.28); ctx.fill(); });
  }
  function matrix(dt) {
    var fs = mobile ? 14 : 16; ctx.font = fs + 'px monospace';
    var CH = '01アカサタナハマヤラワ{}<>/=;ИИ'.split('');
    mcols.forEach(function (c) {
      c.y += c.v * dt; if (c.y - c.n * fs > H) { c.y = R(-200, 0); c.v = R(60, 160); }
      for (var k = 0; k < c.n; k++) { var y = c.y - k * fs; if (y < -fs || y > H + fs) continue; ctx.fillStyle = k ? 'rgba(60,255,120,' + (.75 * (1 - k / c.n)) + ')' : 'rgba(210,255,220,.95)'; ctx.fillText(CH[(Math.floor(y / fs) * 7 + c.x) % CH.length], c.x, y); }
    });
  }
  function flash(dt) {                                         /* мягкие «вспышки» фотоаппарата: редкие, плавные, слабые */
    flashT -= dt; if (flashT <= 0) { flashT = R(1.8, 3); flashes.push({ x: R(W * .1, W * .9), y: R(H * .15, H * .7), l: 1 }); }
    for (var i = flashes.length - 1; i >= 0; i--) {
      var f = flashes[i]; f.l -= dt * .9; if (f.l <= 0) { flashes.splice(i, 1); continue; }
      var a = Math.sin(f.l * Math.PI) * .32, r = (mobile ? 70 : 120) * (1.2 - f.l * .4);
      var gr = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r); gr.addColorStop(0, 'rgba(255,255,240,' + a + ')'); gr.addColorStop(1, 'rgba(255,255,240,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, 6.28); ctx.fill();
    }
  }

  function frame(now) {
    raf = 0; if (!mode) return; var M = MODES[mode];
    var dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now; var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    M.L.forEach(function (o) { var k = o[0];
      if (k === 'tri') tri(t); if (k === 'film') film(t); if (k === 'net') netDraw(dt); if (k === 'matrix') matrix(dt); if (k === 'sun') sun(t); });
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      if (p.k === 'f') {
        p.y += p.vy * dt; p.dx += dt; p.x += Math.sin(p.dx) * 12 * dt; if (p.y > H + 5) { parts[i] = MK.snow(p.o, false); parts[i].o = p.o; }
        ctx.globalAlpha = p.a; ctx.fillStyle = '#e4eef9'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
        ctx.strokeStyle = 'rgba(95,125,170,.75)'; ctx.lineWidth = .9; ctx.stroke();
      } else if (p.k === 'r') {
        p.y += p.vy * dt; p.x += p.vy * .12 * dt; if (p.y > H + 20) { parts[i] = MK.rain(p.o, false); parts[i].o = p.o; }
        ctx.globalAlpha = p.a; ctx.strokeStyle = '#5a7aa0'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.l * .12, p.y + p.l); ctx.stroke();
      } else if (p.k === 'e' || p.k === 'c' || p.k === 'l' || p.k === 'g') {
        p.y += p.vy * dt; p.sw += dt * 1.3; p.x += Math.sin(p.sw) * 18 * dt; if (p.vr) p.rot += p.vr * dt;
        if (p.vy > 0 ? p.y > H + 60 : p.y < -80) { var kind = p.o[0]; parts[i] = MK[kind](p.o, false); parts[i].o = p.o; continue; }
        ctx.globalAlpha = 1;
        if (p.k === 'e') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + Math.sin(p.sw) * .15); ctx.drawImage(emo(p.e), -p.s / 2, -p.s / 2, p.s, p.s); ctx.restore(); }
        else if (p.k === 'c') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.sw * 2)); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = .6; ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }
        else if (p.k === 'l') lilac(p); else egg(p);
      } else if (p.k === 's') {
        ctx.globalAlpha = .45 + .45 * Math.sin(t * p.sp + p.ph); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
      } else if (p.k === 'b') {
        p.x += p.vx * dt; if (p.x < -80 || p.x > W + 80) parts[i] = bat(); batShape(p, t);
      } else if (p.k === 'd') {
        p.x += p.vx * dt; var im = dogImgs[0];
        if (p.x < -260 || p.x > W + 260) { parts.splice(i, 1); continue; }
        if (im.complete && im.naturalWidth) {
          var w = im.naturalWidth * p.s, hh = im.naturalHeight * p.s;
          ctx.save(); ctx.translate(p.x, p.y + Math.sin(t * 3 + p.ph) * 22); ctx.rotate(p.rot + Math.sin(t * 4 + p.ph) * .08);
          if (!p.l) ctx.scale(-1, 1); ctx.globalAlpha = 1; ctx.drawImage(im, -w / 2, -hh / 2, w, hh);
          ctx.font = Math.round(22 * p.s * 2.4) + 'px sans-serif'; ctx.fillStyle = '#c0392b'; ctx.globalAlpha = .9;
          if (Math.sin(t * 2.2 + p.ph) > .6) { ctx.scale(p.l ? 1 : -1, 1); ctx.fillText('гав!', (p.l ? 1 : -1) * w * .35, -hh * .45); }
          ctx.restore();
        }
      }
    }
    ctx.globalAlpha = 1;
    M.L.forEach(function (o) { var k = o[0];
      if (k === 'dogs' && parts.length < (mobile ? 2 : 4) && Math.random() < dt * 1.1) parts.push(dog());
      if (k === 'bats' && parts.length < (mobile ? 3 : 5) && Math.random() < dt * .4) parts.push(bat());
      if (k === 'pumpkins') pumpkins(); if (k === 'garland') garland(t); if (k === 'bstar') bstar(t);
      if (k === 'fw') fireworks(o, dt); if (k === 'rockets') rockets(dt, t); if (k === 'flash') flash(dt);
    });
    if (!reduce) raf = requestAnimationFrame(frame);
  }
  function run() { if (!raf && mode && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else run(); });

  /* ---------- DOM-эффекты: поздравление, «бегущая надпись», розыгрыш 1 апреля ---------- */
  function clearExtra() { extra.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); }); extra = []; document.documentElement.classList.remove('rd-prank'); }
  function greet(txt) {
    var b = document.createElement('div'); b.className = 'rd-hi'; b.setAttribute('role', 'status'); b.textContent = txt; b.title = 'Скрыть';
    b.addEventListener('click', function () { b.classList.remove('on'); }); document.body.appendChild(b); extra.push(b);
    requestAnimationFrame(function () { b.classList.add('on'); }); setTimeout(function () { b.classList.remove('on'); }, 9000);
  }
  function crawl() {
    var w = document.createElement('div'); w.className = 'rd-crawl'; w.setAttribute('aria-hidden', 'true');
    w.innerHTML = '<div><p class="c1">Давным-давно, в далёкой-далёкой галактике…</p><p class="c2">ЭПИЗОД IV&nbsp;МАЯ</p><h3>СЕМЬЯ РУДИК</h3><p>Неспокойные времена настали для сайта рудик.рф. Мотоциклист снова упал, собаки требуют почесать пузико, а спутники разлетаются по углам.</p><p>Но храбрая семья не сдаётся: Виталик, Маша и Алина делают новые ролики и фото, чтобы принести в галактику немного радости…</p></div>';
    document.body.appendChild(w); extra.push(w); setTimeout(function () { if (w.parentNode) w.classList.add('out'); }, 32000);
  }
  function prank() {                                           /* 1 апреля: страница на секунду переворачивается и возвращается */
    if (reduce) return; var h = document.documentElement; h.classList.add('rd-prank');
    setTimeout(function () { h.classList.remove('rd-prank'); }, 2300);
  }

  var auto = null;
  function set(m, how) {                                       /* how: 'user' | 'auto' | 'quiet' */
    if (m && !MODES[m]) m = null;
    mode = m; clearExtra();
    if (how === 'user') { try { sessionStorage.setItem('rdMode', m || 'off'); } catch (e) {} }
    document.documentElement.setAttribute('data-rd-mode', m || '');
    if (!m) { stop(); if (cv) { ctx.clearRect(0, 0, W, H); cv.style.display = 'none'; tint.style.opacity = '0'; } if (how === 'user') toast('Обычный режим'); return; }
    var M = MODES[m]; ensure(); cv.style.display = ''; size(); setup(); t0 = performance.now(); stop();
    tint.style.background = M.tint || 'transparent'; tint.style.opacity = M.tint ? '1' : '0';
    if (reduce) frame(performance.now()); else run();
    M.L.forEach(function (o) { if (o[0] === 'crawl') crawl(); if (o[0] === 'prank') prank(); });
    if (M.hi) greet(m === 'bday' && hiName ? 'С днём рождения, ' + hiName + '!' : M.hi);
    else if (how === 'user') toast(M.ico + ' ' + M.name);
  }
  function toggle(m) { set(mode === m ? null : m, 'user'); }
  window.RUDIK_MODE = function (m) { if (m === undefined) return mode; set(m, 'user'); };

  var tt = null, ttT = 0;
  function toast(s) {
    if (!tt) { tt = document.createElement('div'); tt.className = 'rd-toast'; tt.setAttribute('role', 'status'); document.body.appendChild(tt); }
    tt.textContent = s; tt.classList.add('on'); clearTimeout(ttT); ttT = setTimeout(function () { tt.classList.remove('on'); }, 1800);
  }

  /* ---------- секретные слова ---------- */
  var buf = '', WORDS = Object.keys(MODES).map(function (k) { return [MODES[k].word, k]; }).sort(function (a, b) { return b[0].length - a[0].length; });
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var k = (e.key || '').toLowerCase(), cd = e.code || '';
    if (!/[а-яё]/.test(k)) {                                   /* не кириллица — берём физическую клавишу (раскладка не важна) */
      var CODES = { Semicolon: ';', Quote: "'", BracketLeft: '[', BracketRight: ']', Comma: ',', Period: '.', Backquote: '`' };
      var en = /^Key[A-Z]$/.test(cd) ? cd.slice(3).toLowerCase() : CODES[cd] || (k.length === 1 ? k : '');
      var j = EN.indexOf(en); k = j >= 0 ? RU[j] : en;
    }
    if (k.length !== 1) return;
    if (k === 'ё') k = 'е';
    buf = (buf + k).slice(-12);
    for (var i = 0; i < WORDS.length; i++) if (buf.slice(-WORDS[i][0].length) === WORDS[i][0]) { buf = ''; toggle(WORDS[i][1]); break; }
  });

  /* ---------- тайная кнопка: копирайт ---------- */
  var menu = null;
  function openMenu(anchor) {
    if (!menu) {
      menu = document.createElement('div'); menu.className = 'rd-modes'; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-label', 'Выбор режима');
      var h = '<div class="rd-modes-in">';
      GROUPS.forEach(function (g) {
        h += '<div class="rd-modes-t">' + g[1] + '</div><div class="rd-modes-g rd-g-' + g[0] + '">';
        for (var m in MODES) if (MODES[m].g === g[0]) h += '<button type="button" data-m="' + m + '" title="слово: ' + MODES[m].word + '"><span>' + MODES[m].ico + '</span>' + MODES[m].name + '</button>';
        h += '</div>';
      });
      h += '<div class="rd-modes-g"><button type="button" data-m="" class="rd-normal"><span>✨</span>Обычный</button></div></div>';
      menu.innerHTML = h; document.body.appendChild(menu);
      menu.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; e.stopPropagation(); set(b.getAttribute('data-m') || null, 'user'); closeMenu(); });
    }
    [].forEach.call(menu.querySelectorAll('button'), function (b) { b.classList.toggle('cur', (b.getAttribute('data-m') || null) === mode); });
    menu.classList.add('on');
    var r = anchor.getBoundingClientRect(), mw = menu.offsetWidth, mh = menu.offsetHeight;
    menu.style.left = Math.max(8, Math.min(innerWidth - mw - 8, r.left + r.width / 2 - mw / 2)) + 'px';
    menu.style.top = Math.max(8, Math.min(innerHeight - mh - 8, r.top - mh - 10)) + 'px';
    var c = menu.querySelector('button.cur'); if (c) try { c.scrollIntoView({ block: 'nearest' }); } catch (e) {}
  }
  function closeMenu() { if (menu) menu.classList.remove('on'); }
  document.addEventListener('click', function (e) { if (menu && menu.classList.contains('on') && !menu.contains(e.target) && !(e.target.closest && e.target.closest('.rd-copy'))) closeMenu(); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  function markCopy() {
    [].forEach.call(document.querySelectorAll('.wb-stl-footer, .rd-copy'), function (el) {
      if (el._rdCopy || !/©/.test(el.textContent)) return; el._rdCopy = 1; el.classList.add('rd-copy');
      el.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); menu && menu.classList.contains('on') ? closeMenu() : openMenu(el); });
    });
  }
  var inited = false;
  function init() {
    markCopy(); if (inited) return; inited = true;
    var qm = q('mode'); if (qm && MODES[qm]) { set(qm, 'quiet'); return; }
    var s = null; try { s = sessionStorage.getItem('rdMode'); } catch (e) {}
    if (s === 'off') return;
    if (s && MODES[s]) { set(s, 'quiet'); return; }
    auto = holiday(today()); if (auto) { hiName = auto.name || ''; set(auto.id, 'auto'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
