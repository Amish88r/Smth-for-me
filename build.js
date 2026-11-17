#!/usr/bin/env node
/* Сборка сайта: node build.js  →  готовый сайт в папке dist/
   Запускается автоматически каждый день (см. .github/workflows/build.yml). */
const fs = require('fs'), path = require('path');
const Holidays = require('date-holidays');
const R = require('./src/render.js');
const cfg = require('./config.js');
const TR = require('./data/translations.js');
const C = require('./data/countries.js');
const GREET = require('./data/greetings.js');
const FACTS = require('./data/facts.js');

const OUT = path.join(__dirname, 'dist');
const now = process.env.BUILD_DATE ? new Date(process.env.BUILD_DATE + 'T12:00:00Z') : new Date();
const Y = now.getUTCFullYear(), todayKey = R.pad(now.getUTCMonth() + 1) + '-' + R.pad(now.getUTCDate());
const norm = s => s.replace(/[’‘]/g, "'");
const isLeap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/* ---------- 1. Праздники по странам ---------- */
const byDate = new Map();      // 'YYYY-MM-DD' → Map(название → [страны])
const skipped = new Map(), failed = [], EN = {};
for (const cc of C.HOLIDAY_COUNTRIES) {
  try {
    const hd = new Holidays(cc, { languages: ['en'] });
    for (const y of [Y, Y + 1]) for (const e of hd.getHolidays(y, 'en')) {
      if (!['public', 'observance', 'optional'].includes(e.type) || /substitute/i.test(e.name)) continue;
      const raw = norm(e.name);
      if (!TR[raw]) { skipped.set(raw, (skipped.get(raw) || new Set()).add(cc)); continue; }
      const name = TR[raw][2] || raw;          // третий элемент — английское название-синоним
      EN[name] = EN[name] || TR[raw];
      const d = new Date(e.date.slice(0, 10) + 'T00:00:00Z');
      const key = d.toISOString().slice(0, 10);
      if (!byDate.has(key)) byDate.set(key, new Map());
      const m = byDate.get(key); if (!m.has(name)) m.set(name, []);
      if (!m.get(name).includes(cc)) m.get(name).push(cc);
    }
  } catch (err) { failed.push(cc); }
}

/* ---------- 2. Пасха для поздравлений ---------- */
function westernEaster(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return R.pad(mo) + '-' + R.pad(da); }
function orthodoxEaster(y) { const a = y % 4, b = y % 7, c = y % 19, d = (19 * c + 15) % 30, e = (2 * a + 4 * b - d + 34) % 7, mo = Math.floor((d + e + 114) / 31), da = ((d + e + 114) % 31) + 1; const j = new Date(Date.UTC(y, mo - 1, da + 13)); return R.pad(j.getUTCMonth() + 1) + '-' + R.pad(j.getUTCDate()); }

/* ---------- 3. Данные на 366 дней вперёд ---------- */
const names = [], nameIdx = new Map(), days = {};
const idx = n => { if (!nameIdx.has(n)) { nameIdx.set(n, names.length); names.push([n, EN[n][0], EN[n][1]]); } return nameIdx.get(n); };
for (const mmdd of R.ALL) {
  let y = mmdd >= todayKey ? Y : Y + 1;                       // ближайшее наступление этой даты
  if (mmdd === '02-29') while (!isLeap(y)) y++;
  const m = byDate.get(y + '-' + mmdd), day = { y, h: [] };
  if (m) day.h = [...m].sort((a, b) => b[1].length - a[1].length).map(([n, ccs]) => [idx(n), ccs]);
  const g = {};
  for (const l of R.LANGS) {
    if (GREET[l][mmdd]) g[l] = GREET[l][mmdd];
    if ((l === 'ru' ? orthodoxEaster(y) : westernEaster(y)) === mmdd) g[l] = GREET.easter[l];
  }
  if (Object.keys(g).length) day.g = g;
  days[mmdd] = day;
}
const facts = FACTS.filter(f => !cfg.onlyCheckedFacts || f.ok).map(({ c, ru, en, de }) => ({ c, ru, en, de }));
const cmap = {}; for (const k of Object.keys(C)) if (Array.isArray(C[k]) && k.length === 2) cmap[k] = C[k];
const DATA = { built: now.toISOString().slice(0, 10), days, names, c: cmap, facts };

/* ---------- 4. Страницы ---------- */
const host = cfg.url.replace(/^https?:\/\//, '');
const ver = Date.now().toString(36);
function adSlot(code, t) {
  if (code && code.trim()) return `<div class="ad"><span class="lbl" data-t="ad">${t.ad}</span>${code}</div>`;
  return cfg.adPlaceholders ? `<div class="ad ph"><span class="lbl" data-t="ad">${t.ad}</span><span data-t="adTxt">${t.adTxt}</span></div>` : '';
}
function page(lang, mmdd /* null = главная */) {
  const t = R.T[lang], isIndex = !mmdd, day = mmdd || todayKey;
  const rel = isIndex ? R.indexPath(lang) : R.datePath(lang, mmdd);
  const prefix = '../'.repeat(rel.split('/').length - 1);
  const urlOf = l => cfg.url + '/' + (isIndex ? (l === 'ru' ? '' : l + '/') : R.datePath(l, mmdd));
  const title = isIndex ? t.titleIndex(cfg.name[lang]) : t.titleDate(R.fmtDate(lang, mmdd), cfg.name[lang]);
  const desc = isIndex ? t.descIndex : t.descDate(R.fmtDate(lang, mmdd));
  let dateStr = isIndex ? now.toLocaleDateString(t.locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }) : R.fmtDate(lang, mmdd);
  dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  const PAGE = { lang, date: mmdd, rendered: day, prefix, auto: isIndex && lang === 'ru', site: host, url: cfg.url, names: cfg.name };
  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${R.esc(title)}</title>
<meta name="description" content="${R.esc(desc)}">
<link rel="canonical" href="${urlOf(lang)}">
${R.LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${urlOf(l)}">`).join('\n')}
<meta property="og:title" content="${R.esc(title)}">
<meta property="og:description" content="${R.esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${urlOf(lang)}">
<link rel="stylesheet" href="${prefix}assets/fonts.css?${ver}">
<link rel="stylesheet" href="${prefix}assets/style.css?${ver}">
${cfg.ads.head || ''}
</head>
<body>
<div class="topbar"><div class="wrap">
  <div class="seg" id="langSeg"><button data-l="ru">RU</button><button data-l="en">EN</button><button data-l="de">DE</button></div>
  <div class="seg" id="fontSeg"><button data-f="19">A</button><button data-f="22" style="font-size:1rem">A+</button><button data-f="25" style="font-size:1.15rem">A++</button></div>
</div></div>
<header>
  <span class="twinkle" style="top:12px;left:8%;font-size:26px">✦</span><span class="twinkle" style="top:30px;right:10%;font-size:34px;animation-delay:.8s">✧</span>
  <span class="twinkle" style="bottom:14px;left:22%;font-size:22px;animation-delay:1.4s">✦</span><span class="twinkle" style="bottom:20px;right:24%;font-size:28px;animation-delay:.4s">✧</span>
  <div class="wrap">
    <a class="brand" id="brand" href="${prefix}${R.indexPath(lang)}">🌹 ${R.esc(cfg.name[lang])} 🌹</a>
    <div class="date" id="dateStr">${R.esc(dateStr)}</div>
  </div>
</header>
<main class="wrap">
  <div id="panels">${R.panels(lang, day, DATA, prefix, isIndex)}</div>
  ${adSlot(cfg.ads.slot1, t)}
  <section class="box">
    <h2 data-t="main">${t.main}</h2>
    <img id="mainImg" alt="" width="1080" height="1080">
    <p class="hint" data-t="hint">${t.hint}</p>
    <button class="bigshare" id="shareBtn">📤 <span data-t="share">${t.share}</span></button>
    <div class="msgr" id="msgr"></div>
    <p class="msgr-note" data-t="note">${t.note}</p>
  </section>
  <section class="box own">
    <h2 data-t="own">${t.own}</h2>
    <p class="hint" data-t="ownHint">${t.ownHint}</p>
    <label for="cTo" data-t="to">${t.to}</label>
    <div class="field"><input id="cTo" maxlength="40" placeholder="${R.esc(t.toPh)}" data-ph="toPh"><button class="mic" data-for="cTo" hidden aria-label="🎤">🎤</button></div>
    <label for="cWish" data-t="wishL">${t.wishL}</label>
    <div class="field"><textarea id="cWish" maxlength="160" rows="3" placeholder="${R.esc(t.wishPh)}" data-ph="wishPh"></textarea><button class="mic" data-for="cWish" hidden aria-label="🎤">🎤</button></div>
    <button class="bigshare make" id="makeBtn" data-t="make">${t.make}</button>
  </section>
  ${adSlot(cfg.ads.slot2, t)}
  <section class="box">
    <h2 data-t="gallery">${t.gallery}</h2>
    <div class="gallery" id="gallery"></div>
  </section>
  ${adSlot(cfg.ads.slot3, t)}
</main>
<footer>
  <div data-t="foot">${t.foot}</div>
  <div>${R.LANGS.map(l => `<a href="${prefix}${isIndex ? R.indexPath(l) : R.datePath(l, mmdd)}" hreflang="${l}">${cfg.name[l]}</a>`).join(' · ')}</div>
  <div class="small">Holiday data: <a href="https://github.com/commenthol/date-holidays" rel="nofollow noopener">date-holidays</a>, CC BY-SA 4.0</div>
</footer>
<div class="modal" id="modal"><div class="card"><p data-t="save">${t.save}</p><img id="modalImg" alt=""><button class="close" id="closeBtn" data-t="close">${t.close}</button></div></div>
<canvas id="cv" width="1080" height="1080" style="display:none"></canvas>
<script>window.PAGE=${JSON.stringify(PAGE)};</script>
<script src="${prefix}assets/data.js?${ver}"></script>
<script src="${prefix}assets/render.js?${ver}"></script>
<script src="${prefix}assets/app.js?${ver}"></script>
</body>
</html>
`;
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return urlOf(lang);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets/fonts'), { recursive: true });
const urls = [];
for (const lang of R.LANGS) { urls.push(page(lang, null)); for (const mmdd of R.ALL) urls.push(page(lang, mmdd)); }

/* ---------- 5. Фотографии для открыток ---------- */
// Кладите снимки в папку photos/. Сборщик обрезает их в квадрат 1080×1080 и сжимает.
async function photos() {
  const dir = path.join(__dirname, 'photos');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort() : [];
  if (!files.length) return [];
  const sharp = require('sharp');
  fs.mkdirSync(path.join(OUT, 'assets/photos'), { recursive: true });
  const out = [];
  for (const f of files) {
    const name = 'p' + out.length + '-' + f.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '').slice(0, 30) + '.jpg';
    try {
      await sharp(path.join(dir, f)).rotate().resize(1080, 1080, { fit: 'cover', position: 'attention' }).jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(OUT, 'assets/photos', name));
      out.push('photos/' + name);
    } catch (e) { console.log('Не удалось обработать фото:', f, e.message); }
  }
  return out;
}

// Картинки дня от нейросети (scripts/ai-images.js кладёт их в ai-today/)
async function aiToday() {
  const dir = path.join(__dirname, 'ai-today');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.(jpe?g|png)$/i.test(f)).sort() : [];
  const out = [];
  if (!files.length) return out;
  const sharp = require('sharp');
  fs.mkdirSync(path.join(OUT, 'assets/ai'), { recursive: true });
  for (const f of files) {
    try {
      await sharp(path.join(dir, f)).resize(1080, 1080, { fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, 'assets/ai', f.replace(/\.png$/i, '.jpg')));
      out.push('ai/' + f.replace(/\.png$/i, '.jpg') + '?' + DATA.built);
    } catch (e) { console.log('Не удалось обработать картинку нейросети:', f); }
  }
  return out;
}

(async () => {
DATA.photos = await photos();
DATA.today = await aiToday();
fs.writeFileSync(path.join(OUT, 'assets/data.js'), 'window.DATA=' + JSON.stringify(DATA) + ';');
for (const f of ['render.js', 'app.js', 'style.css']) fs.copyFileSync(path.join(__dirname, 'src', f), path.join(OUT, 'assets', f));
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212,U+FEFF,U+FFFD';
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
let css = '';
for (const [fam, pkg, weights] of [['Lobster', 'lobster', [400]], ['Caveat', 'caveat', [700]], ['Nunito', 'nunito', [600, 800, 900]]])
  for (const w of weights) for (const [sub, range] of [['cyrillic', CYR], ['latin', LATIN]]) {
    const f = `${pkg}-${sub}-${w}-normal.woff2`;
    fs.copyFileSync(path.join(__dirname, 'node_modules/@fontsource', pkg, 'files', f), path.join(OUT, 'assets/fonts', f));
    css += `@font-face{font-family:${fam};font-style:normal;font-weight:${w};font-display:swap;src:url(fonts/${f}) format("woff2");unicode-range:${range}}\n`;
  }
fs.writeFileSync(path.join(OUT, 'assets/fonts.css'), css);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(u => `<url><loc>${u}</loc></url>`).join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${cfg.url}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
if (cfg.adsTxt && cfg.adsTxt.trim()) fs.writeFileSync(path.join(OUT, 'ads.txt'), cfg.adsTxt.trim() + '\n');

/* ---------- 6. Отчёт ---------- */
const withHol = R.ALL.filter(k => days[k].h.length).length;
console.log(`Готово: ${urls.length} страниц, дата сборки ${DATA.built}`);
console.log(`Праздники: ${names.length} названий, дней с праздниками: ${withHol} из 366`);
console.log(`Фото для открыток: ${DATA.photos.length}, от нейросети сегодня: ${DATA.today.length}`);
console.log(`Приметы: ${facts.length}` + (cfg.onlyCheckedFacts ? ' (только проверенные)' : ` (из них проверено: ${FACTS.filter(f => f.ok).length})`));
if (failed.length) console.log('Не удалось загрузить страны:', failed.join(', '));
if (skipped.size) console.log(`Пропущено без перевода (${skipped.size}):\n  ` + [...skipped].map(([n, s]) => `${n} [${[...s].join(',')}]`).join('\n  '));
})();
