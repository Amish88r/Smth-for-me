/* Работает в браузере: рисует открытки, отправка, язык, размер шрифта. */
(function () {
  const P = window.PAGE, D = window.DATA, T = R.T;
  const $ = id => document.getElementById(id);
  let lang = P.lang, sel = 0, imgs = [], titles = [];
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  const now = new Date();
  const todayKey = R.pad(now.getMonth() + 1) + '-' + R.pad(now.getDate());
  const mmdd = P.date || todayKey;              // на главной — всегда сегодняшний день посетителя
  const dayInfo = D.days[mmdd] || { h: [] };
  // Дата, которой посвящена страница (для дня недели на открытке)
  const pageDate = P.date ? new Date(dayInfo.y || now.getFullYear(), +mmdd.slice(0, 2) - 1, +mmdd.slice(3)) : now;

  const TPL = [
    { bg: ['#8c1230', '#4a0616'], emoji: '🌹☕🌹' }, { bg: ['#0f5a44', '#062b22'], emoji: '🌻🕊️🌻' }, { bg: ['#4b1a7a', '#1d0838'], emoji: '💐✨💐' },
    { bg: ['#a3561a', '#4a2208'], emoji: '🍰🫖🌸' }, { bg: ['#123d7a', '#071a3a'], emoji: '🌷🦋🌷' }, { bg: ['#8a1d5c', '#3a0626'], emoji: '🌺💖🌺' },
  ];
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function star(ctx, x, y, r) { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .28 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
  function wrap(ctx, text, maxW) { const words = text.split(' '), lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; } if (cur) lines.push(cur); return lines; }
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function drawCard(tpl, title, wish, seed) {
    const cv = $('cv'), ctx = cv.getContext('2d'), W = 1080, Rn = rng(seed);
    let g = ctx.createLinearGradient(0, 0, W, W); g.addColorStop(0, tpl.bg[0]); g.addColorStop(1, tpl.bg[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);
    g = ctx.createRadialGradient(W / 2, W * .45, 40, W / 2, W * .45, W * .6); g.addColorStop(0, 'rgba(255,215,90,.45)'); g.addColorStop(1, 'rgba(255,215,90,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, W);
    for (let i = 0; i < 170; i++) { ctx.fillStyle = Rn() < .7 ? `rgba(255,${200 + Rn() * 55 | 0},${80 + Rn() * 120 | 0},${.35 + Rn() * .65})` : `rgba(255,255,255,${.4 + Rn() * .6})`; const r = 2 + Rn() * (Rn() < .12 ? 16 : 6); if (r > 8) star(ctx, Rn() * W, Rn() * W, r); else { ctx.beginPath(); ctx.arc(Rn() * W, Rn() * W, r / 2, 0, 7); ctx.fill(); } }
    const gold = ctx.createLinearGradient(0, 0, W, W); gold.addColorStop(0, '#fff3b0'); gold.addColorStop(.35, '#ffd54a'); gold.addColorStop(.6, '#c98a00'); gold.addColorStop(1, '#ffe68a');
    ctx.strokeStyle = gold; ctx.lineWidth = 22; ctx.strokeRect(30, 30, W - 60, W - 60); ctx.lineWidth = 4; ctx.strokeRect(58, 58, W - 116, W - 116);
    ctx.fillStyle = gold; [[58, 58], [W - 58, 58], [58, W - 58], [W - 58, W - 58]].forEach(([x, y]) => star(ctx, x, y, 30));

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let fs = 96, lines; do { ctx.font = fs + 'px Lobster'; lines = wrap(ctx, title, 860); fs -= 10; } while (lines.length > 2 && fs > 50);
    const lh = fs + 16, tg = ctx.createLinearGradient(0, 120, 0, 320); tg.addColorStop(0, '#fff6c2'); tg.addColorStop(.5, '#ffd54a'); tg.addColorStop(1, '#e09b00');
    let y = 225 - (lines.length - 1) * lh / 2;
    lines.forEach(l => { ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(40,0,10,.75)'; ctx.strokeText(l, W / 2, y); ctx.fillStyle = tg; ctx.shadowColor = 'rgba(255,215,90,.8)'; ctx.shadowBlur = 25; ctx.fillText(l, W / 2, y); ctx.shadowBlur = 0; y += lh; });

    ctx.font = '170px serif'; ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 30; ctx.fillText(tpl.emoji, W / 2, 500); ctx.shadowBlur = 0;

    ctx.font = '700 64px Caveat'; const wl = wrap(ctx, '«' + wish + '»', 820); const bh = wl.length * 72 + 50, by = 650;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; rrect(ctx, 110, by, W - 220, bh, 36); ctx.fill(); ctx.strokeStyle = 'rgba(255,213,74,.6)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#fff3d0'; wl.forEach((l, i) => ctx.fillText(l, W / 2, by + 60 + i * 72));

    ctx.font = '800 30px Nunito'; ctx.fillStyle = 'rgba(255,236,170,.85)'; ctx.fillText('✨ ' + P.site + ' ✨', W / 2, W - 92);
    return cv.toDataURL('image/jpeg', .9);
  }

  function dayTitle(t) {
    if (dayInfo.g && dayInfo.g[lang]) return dayInfo.g[lang];
    const hr = now.getHours(), wd = t.week[pageDate.getDay()];
    if (!P.date && hr >= 4 && hr < 11) return t.morning + ' ' + wd;
    if (!P.date && (hr >= 22 || hr < 4)) return t.night;
    return wd;
  }

  function render(panelsToo) {
    const t = T[lang];
    document.documentElement.lang = lang;
    if (panelsToo) {
      $('panels').innerHTML = R.panels(lang, mmdd, D, P.prefix, !P.date);
      document.querySelectorAll('[data-t]').forEach(el => { el.textContent = t[el.dataset.t]; });
      $('brand').textContent = '🌹 ' + P.names[lang] + ' 🌹';
      document.title = P.date ? t.titleDate(R.fmtDate(lang, mmdd), P.names[lang]) : t.titleIndex(P.names[lang]);
    }
    let ds = P.date ? R.fmtDate(lang, mmdd) : now.toLocaleDateString(t.locale, { weekday: 'long', day: 'numeric', month: 'long' });
    $('dateStr').textContent = ds.charAt(0).toUpperCase() + ds.slice(1);

    const base = pageDate.getFullYear() * 1000 + pageDate.getMonth() * 40 + pageDate.getDate(), title = dayTitle(t), special = dayInfo.g && dayInfo.g[lang];
    imgs = []; titles = [];
    TPL.forEach((tpl, i) => {
      const w = t.wishes[(i + pageDate.getDate()) % t.wishes.length];
      const tt = i % 2 && !special ? (P.date || now.getHours() >= 12 ? t.day : t.morning) : title;
      titles.push(tt); imgs.push(drawCard(tpl, tt, w, base * 10 + i));
    });
    $('gallery').innerHTML = imgs.map((s, i) => `<img src="${s}" data-i="${i}" alt="${R.esc(titles[i])}">`).join('');
    pick(Math.min(sel, imgs.length - 1));
    document.querySelectorAll('#langSeg button').forEach(b => b.classList.toggle('on', b.dataset.l === lang));
  }
  function pick(i) { sel = i; $('mainImg').src = imgs[i]; $('mainImg').alt = titles[i]; document.querySelectorAll('#gallery img').forEach(im => im.classList.toggle('on', +im.dataset.i === i)); renderMsgr(); }

  const M = {
    telegram: { n: 'Telegram', ic: '✈️', c: '#2aa3e0', u: (u, x) => `https://t.me/share/url?url=${u}&text=${x}` },
    whatsapp: { n: 'WhatsApp', ic: '💬', c: '#25a556', u: (u, x) => `https://wa.me/?text=${x}%20${u}` },
    ok: { n: 'Одноклассники', ic: '🟠', c: '#ee8208', u: u => `https://connect.ok.ru/offer?url=${u}` },
    vk: { n: 'ВКонтакте', ic: '🔵', c: '#0077ff', u: u => `https://vk.com/share.php?url=${u}` },
    facebook: { n: 'Facebook', ic: '👍', c: '#1877f2', u: u => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    viber: { n: 'Viber', ic: '📞', c: '#7360f2', u: (u, x) => `viber://forward?text=${x}%20${u}` },
    email: { n: 'E-mail', ic: '✉️', c: '#8a5a2b', u: (u, x) => `mailto:?subject=${x}&body=${x}%20${u}` },
  };
  function pageUrl() { return P.url + '/' + (P.date ? R.datePath(lang, mmdd) : (lang === 'ru' ? '' : lang + '/')); }
  function renderMsgr() {
    const u = encodeURIComponent(pageUrl()), x = encodeURIComponent('🌹 ' + titles[sel] + ' 🌹');
    $('msgr').innerHTML = T[lang].msgr.map(k => { const m = M[k]; return `<a href="${m.u(u, x)}" target="_blank" rel="noopener" style="background:${m.c}"><span class="ic">${m.ic}</span>${m.n}</a>`; }).join('');
  }
  function showModal() { $('modalImg').src = imgs[sel]; $('modal').classList.add('show'); }
  async function shareImage() {
    try {
      const blob = await (await fetch(imgs[sel])).blob();
      const file = new File([blob], 'otkrytka.jpg', { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: titles[sel] + ' — ' + pageUrl() }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    showModal();
  }

  $('gallery').addEventListener('click', e => { if (e.target.dataset.i) { pick(+e.target.dataset.i); window.scrollTo({ top: $('mainImg').offsetTop - 80, behavior: 'smooth' }); } });
  $('shareBtn').onclick = shareImage;
  $('mainImg').onclick = showModal;
  $('closeBtn').onclick = () => $('modal').classList.remove('show');
  $('langSeg').onclick = e => { const l = e.target.dataset.l; if (l && l !== lang) { lang = l; store('lang', l); render(true); } };
  function setFont(f) { document.documentElement.style.fontSize = f + 'px'; document.querySelectorAll('#fontSeg button').forEach(b => b.classList.toggle('on', b.dataset.f == f)); store('font', f); }
  $('fontSeg').onclick = e => { const b = e.target.closest('button'); if (b) setFont(b.dataset.f); };

  (async function init() {
    const saved = store('lang');
    if (saved && T[saved]) lang = saved;
    else if (P.auto) { const nav = (navigator.language || '').slice(0, 2); if (T[nav]) lang = nav; }   // главная без выбранного языка — по языку телефона
    setFont(store('font') || 19);
    try { await Promise.all([document.fonts.load('96px Lobster', 'Аб'), document.fonts.load('700 64px Caveat', 'Аб'), document.fonts.load('800 30px Nunito', 'Аб')]); } catch (e) { }
    // Перерисовываем панель, если язык или день не совпали с тем, что собрано заранее
    render(lang !== P.lang || mmdd !== P.rendered);
  })();
})();
