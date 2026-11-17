/* Общий код: работает и при сборке (Node), и в браузере. Рисует панель праздников и примету дня. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.R = factory();
})(this, function () {
  const LANGS = ['ru', 'en', 'de'];
  const LI = { ru: 1, en: 0, de: 2 };   // позиция языка в названиях праздников [en, ru, de]
  const CI = { ru: 0, en: 1, de: 2 };   // позиция языка в названиях стран [ru, en, de]

  const T = {
    ru: { todayQ: 'Какой сегодня праздник?', dateQ: d => `Какой праздник ${d}?`, world: 'Праздники в мире', none: 'Больших государственных праздников в этот день нет — зато день всё равно хороший!',
      soon: 'Скоро', more: n => ` и ещё ${n}`, fact: 'А вы знали?', main: 'Открытка на сегодня', gallery: 'Ещё открытки', share: 'Отправить открытку',
      hint: 'Нажмите на любую открытку ниже, чтобы выбрать её', note: 'Кнопки ниже отправляют ссылку на сайт. Чтобы отправить саму картинку — большая зелёная кнопка.',
      save: 'Нажмите на картинку и подержите палец, затем выберите «Сохранить» или «Поделиться»', close: 'Закрыть', ad: 'Реклама', adTxt: 'Здесь будет рекламный блок',
      foot: 'Все открытки бесплатны. Делитесь с родными и друзьями! ❤️', today: 'Сегодня', home: 'На главную',
      titleIndex: n => `${n}: какой сегодня праздник, приметы и открытки на каждый день`, titleDate: (d, n) => `Какой праздник ${d} — праздники в мире, приметы и открытки | ${n}`,
      descIndex: 'Какой сегодня праздник в разных странах мира, примета дня и красивые бесплатные открытки, которые можно отправить близким одним нажатием.',
      descDate: d => `Какие праздники отмечают ${d} в разных странах, примета дня и бесплатные открытки для родных и друзей.`,
      morning: 'Доброе утро!', day: 'Доброго дня!', night: 'Спокойной ночи!',
      week: ['Доброго воскресенья!', 'Хорошего понедельника!', 'Доброго вторника!', 'Прекрасной среды!', 'Чудесного четверга!', 'С пятницей! Отличных выходных!', 'Доброй субботы!'],
      wishes: ['Желаю крепкого здоровья, тепла и радости в каждом дне!', 'Пусть этот день будет светлым, а на душе будет спокойно!', 'Пусть в доме будет уют, а рядом — любимые люди!', 'Улыбнитесь! Вы — самое лучшее, что есть у ваших близких!', 'Тёплого чая, вкусных пирогов и добрых новостей!', 'Пусть каждый день дарит маленькие радости!'],
      locale: 'ru-RU', msgr: ['max', 'ok', 'vk', 'telegram', 'whatsapp', 'email'] },
    en: { todayQ: 'What is celebrated today?', dateQ: d => `What is celebrated on ${d}?`, world: 'Holidays around the world', none: 'No major public holidays on this day — but it is a lovely day all the same!',
      soon: 'Coming up', more: n => ` and ${n} more`, fact: 'Did you know?', main: 'Today\'s card', gallery: 'More cards', share: 'Send this card',
      hint: 'Tap any card below to choose it', note: 'The buttons below send a link to the site. To send the picture itself, use the big green button.',
      save: 'Press and hold the picture, then choose "Save" or "Share"', close: 'Close', ad: 'Advertisement', adTxt: 'Ad space',
      foot: 'All cards are free. Share them with family and friends! ❤️', today: 'Today', home: 'Home',
      titleIndex: n => `${n}: today's holidays, traditions and free greeting cards`, titleDate: (d, n) => `What is celebrated on ${d} — holidays around the world and free cards | ${n}`,
      descIndex: 'Today\'s holidays around the world, a tradition of the day and beautiful free greeting cards to send to your loved ones with one tap.',
      descDate: d => `Holidays celebrated on ${d} around the world, a tradition of the day and free greeting cards for family and friends.`,
      morning: 'Good morning!', day: 'Have a lovely day!', night: 'Good night!',
      week: ['Happy Sunday!', 'Happy Monday!', 'Have a lovely Tuesday!', 'Happy Wednesday!', 'Happy Thursday!', 'Happy Friday! Enjoy the weekend!', 'Happy Saturday!'],
      wishes: ['Wishing you good health, warmth and joy every day!', 'May your day be bright and your heart be peaceful!', 'May your home be cosy and your loved ones near!', 'Smile! You are the best thing in your family\'s life!', 'A warm cup of tea, a slice of cake and good news!', 'May every day bring you little joys!'],
      locale: 'en-GB', msgr: ['whatsapp', 'facebook', 'telegram', 'viber', 'email'] },
    de: { todayQ: 'Was wird heute gefeiert?', dateQ: d => `Was wird am ${d} gefeiert?`, world: 'Feiertage in aller Welt', none: 'An diesem Tag gibt es keine großen Feiertage — ein schöner Tag ist es trotzdem!',
      soon: 'Demnächst', more: n => ` und ${n} weitere`, fact: 'Wussten Sie schon?', main: 'Die Karte für heute', gallery: 'Weitere Karten', share: 'Karte verschicken',
      hint: 'Tippen Sie unten auf eine Karte, um sie auszuwählen', note: 'Die Knöpfe unten verschicken einen Link zur Seite. Für das Bild selbst: der große grüne Knopf.',
      save: 'Bild gedrückt halten, dann „Speichern“ oder „Teilen“ wählen', close: 'Schließen', ad: 'Anzeige', adTxt: 'Werbefläche',
      foot: 'Alle Karten sind kostenlos. Teilen Sie sie mit Familie und Freunden! ❤️', today: 'Heute', home: 'Startseite',
      titleIndex: n => `${n}: Feiertage heute, Bräuche und kostenlose Grußkarten`, titleDate: (d, n) => `Was wird am ${d} gefeiert — Feiertage weltweit und kostenlose Grußkarten | ${n}`,
      descIndex: 'Welche Feiertage heute in aller Welt gefeiert werden, ein Brauch des Tages und schöne kostenlose Grußkarten zum Verschicken mit einem Fingertipp.',
      descDate: d => `Welche Feiertage am ${d} in aller Welt gefeiert werden, ein Brauch des Tages und kostenlose Grußkarten für Familie und Freunde.`,
      morning: 'Guten Morgen!', day: 'Einen schönen Tag!', night: 'Gute Nacht!',
      week: ['Schönen Sonntag!', 'Guten Start in die Woche!', 'Einen schönen Dienstag!', 'Schönen Mittwoch!', 'Schönen Donnerstag!', 'Endlich Freitag! Schönes Wochenende!', 'Schönen Samstag!'],
      wishes: ['Ich wünsche Ihnen Gesundheit, Wärme und Freude an jedem Tag!', 'Möge Ihr Tag hell und Ihr Herz ruhig sein!', 'Ein gemütliches Zuhause und liebe Menschen um Sie herum!', 'Lächeln Sie! Sie sind das Schönste für Ihre Familie!', 'Eine Tasse Tee, ein Stück Kuchen und gute Nachrichten!', 'Möge jeder Tag kleine Freuden bringen!'],
      locale: 'de-DE', msgr: ['whatsapp', 'facebook', 'telegram', 'viber', 'email'] },
  };

  const MON = {
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  };
  const SLUG = {
    ru: ['yanvarya', 'fevralya', 'marta', 'aprelya', 'maya', 'iyunya', 'iyulya', 'avgusta', 'sentyabrya', 'oktyabrya', 'noyabrya', 'dekabrya'],
    en: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    de: ['januar', 'februar', 'maerz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'],
  };
  const DIM = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const ALL = []; DIM.forEach((n, m) => { for (let d = 1; d <= n; d++) ALL.push(pad(m + 1) + '-' + pad(d)); });

  function pad(n) { return String(n).padStart(2, '0'); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function parts(mmdd) { return [+mmdd.slice(0, 2), +mmdd.slice(3)]; }
  function fmtDate(lang, mmdd) { const [m, d] = parts(mmdd); return lang === 'en' ? `${d} ${MON.en[m - 1]}` : lang === 'de' ? `${d}. ${MON.de[m - 1]}` : `${d} ${MON.ru[m - 1]}`; }
  // Путь страницы от корня сайта
  function indexPath(lang) { return lang === 'ru' ? 'index.html' : lang + '/index.html'; }
  function datePath(lang, mmdd) {
    const [m, d] = parts(mmdd);
    if (lang === 'en') return `en/holidays/${SLUG.en[m - 1]}-${d}.html`;
    if (lang === 'de') return `de/feiertage/${d}-${SLUG.de[m - 1]}.html`;
    return `prazdniki/${d}-${SLUG.ru[m - 1]}.html`;
  }
  function shift(mmdd, n) { const i = ALL.indexOf(mmdd); return ALL[(i + n + ALL.length) % ALL.length]; }
  function flag(cc) { return String.fromCodePoint(...[...cc].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)); }
  function country(D, lang, cc) { return flag(cc) + ' ' + (D.c[cc] ? D.c[cc][CI[lang]] : cc); }

  function holidayLines(D, lang, mmdd, max) {
    const day = D.days[mmdd]; if (!day || !day.h.length) return [];
    return day.h.map(([ni, ccs]) => {
      const shown = ccs.slice(0, max).map(cc => country(D, lang, cc)).join(', ');
      return { name: D.names[ni][LI[lang]], where: shown + (ccs.length > max ? T[lang].more(ccs.length - max) : ''), n: ccs.length };
    });
  }
  function factOf(D, mmdd) { return D.facts.length ? D.facts[ALL.indexOf(mmdd) % D.facts.length] : null; }

  // HTML панели праздников и приметы. prefix — путь до корня сайта ('', '../', '../../').
  function panels(lang, mmdd, D, prefix, isIndex) {
    const t = T[lang], day = D.days[mmdd] || { h: [] }, lines = holidayLines(D, lang, mmdd, 6);
    let h = `<section class="box"><h1>${esc(isIndex ? t.todayQ : t.dateQ(fmtDate(lang, mmdd)))}</h1>`;
    if (day.g && day.g[lang]) h += `<div class="holiday">🎉 ${esc(day.g[lang])}</div>`;
    h += `<h2 class="sub">🌍 ${esc(t.world)}</h2>`;
    h += lines.length
      ? '<ul class="world">' + lines.map(l => `<li><b>${esc(l.name)}</b><span>${l.where}</span></li>`).join('') + '</ul>'
      : `<p class="none">${esc(t.none)}</p>`;
    const soon = [];
    for (let i = 1; i < ALL.length && soon.length < 3; i++) { const k = shift(mmdd, i), l = holidayLines(D, lang, k, 2); if (l.length) soon.push([k, l[0]]); }
    if (soon.length) h += `<h2 class="sub">📅 ${esc(t.soon)}</h2><ul class="upcoming">` + soon.map(([k, l]) =>
      `<li><a href="${prefix + datePath(lang, k)}">${esc(fmtDate(lang, k))}</a><span>${esc(l.name)} — ${l.where}</span></li>`).join('') + '</ul>';
    const p = shift(mmdd, -1), n = shift(mmdd, 1);
    h += `<nav class="daynav"><a href="${prefix + datePath(lang, p)}">← ${esc(fmtDate(lang, p))}</a>` +
      (isIndex ? '' : `<a href="${prefix + indexPath(lang)}">${esc(t.today)}</a>`) +
      `<a href="${prefix + datePath(lang, n)}">${esc(fmtDate(lang, n))} →</a></nav></section>`;
    const f = factOf(D, mmdd);
    if (f) h += `<section class="box fact"><h2>💡 ${esc(t.fact)}</h2><p>${f.c ? `<span class="fc">${country(D, lang, f.c)}</span> ` : ''}${esc(f[lang])}</p></section>`;
    return h;
  }

  return { LANGS, T, ALL, pad, esc, fmtDate, indexPath, datePath, shift, panels, holidayLines, factOf };
});
