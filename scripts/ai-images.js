#!/usr/bin/env node
/* Рисует открытки дня нейросетью FLUX.1 [schnell] через Cloudflare Workers AI.
   Запускается в ежедневной сборке ПЕРЕД build.js. Картинки кладёт в ai-today/.
   Нужны секреты репозитория CF_ACCOUNT_ID и CF_API_TOKEN. Если их нет — тихо пропускает.
   Бесплатно: 10 000 «нейронов» в день; одна картинка 1024×1024 ≈ 58 — то есть 6 картинок ≈ 350. */
const fs = require('fs'), path = require('path');
const { STYLE, PROMPTS } = require('../data/prompts.js');
const N = +(process.env.AI_IMAGES || 6);
const ACC = process.env.CF_ACCOUNT_ID, TOKEN = process.env.CF_API_TOKEN;
const API = process.env.CF_API_BASE || 'https://api.cloudflare.com/client/v4';
const OUT = path.join(__dirname, '..', 'ai-today');

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  if (!ACC || !TOKEN) { console.log('Нейросеть: ключей Cloudflare нет — пропускаю (используются фото из photos/).'); return; }
  fs.mkdirSync(OUT, { recursive: true });
  const d = new Date(), month = d.getUTCMonth() + 1, day = Math.floor(d / 864e5);
  const fit = PROMPTS.filter(x => !x.m || x.m.includes(month));
  let ok = 0;
  for (let i = 0; i < N; i++) {
    const pr = fit[(day * N + i) % fit.length].p + STYLE;
    try {
      const res = await fetch(`${API}/accounts/${ACC}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
        method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: pr, steps: 4, seed: day * 100 + i }),
        signal: AbortSignal.timeout(60000),
      });
      const j = await res.json();
      const b64 = j && j.result && j.result.image;
      if (!res.ok || !b64) throw new Error(res.status + ' ' + JSON.stringify(j && j.errors || j).slice(0, 200));
      fs.writeFileSync(path.join(OUT, `ai-${i}.jpg`), Buffer.from(b64, 'base64'));
      ok++;
    } catch (e) { console.log(`Нейросеть: картинка ${i + 1} не получилась — ${e.message}`); }
  }
  console.log(`Нейросеть: нарисовано ${ok} из ${N}`);
})();
