// Описания картинок для нейросети (на английском — так она понимает лучше).
// Текст на картинке нейросеть не пишет: надписи сайт накладывает сам.
// m — месяцы, когда картинка уместна (1–12). Без m — подходит всегда.
const STYLE = ', vintage greeting card style, soft dreamy light, glitter and sparkles, warm cozy colors, highly detailed, no text, no letters';
module.exports = { STYLE, PROMPTS: [
  { p: 'a cute fluffy ginger kitten sitting next to a bouquet of tulips in a pink gift box' },
  { p: 'a basket of red roses and a cup of tea with steam on a lace tablecloth by a sunny window' },
  { p: 'a white teapot with porcelain cups, strawberry jam and pastries on a garden table, morning sunshine' },
  { p: 'two little kittens sleeping in a basket of daisies' },
  { p: 'a bouquet of peonies in a crystal vase with a butterfly, golden bokeh background' },
  { p: 'a cup of coffee with a heart in the foam and a pink rose beside it' },
  { p: 'a fluffy white puppy holding a red rose, flower meadow' },
  { p: 'a cozy village cottage with blooming garden and sunflowers, summer morning' },
  { p: 'a bouquet of lilac and a wicker basket with pastries, spring garden', m: [4, 5, 6] },
  { p: 'snowdrops and early spring flowers in the melting snow, sunrise', m: [2, 3, 4] },
  { p: 'a bouquet of tulips and mimosa with a ribbon, spring sunshine', m: [2, 3, 4] },
  { p: 'a field of chamomile and cornflowers at sunrise', m: [6, 7, 8] },
  { p: 'a basket of ripe strawberries and wild flowers in the garden', m: [6, 7] },
  { p: 'a seaside with roses on a wooden bench, summer sunset', m: [6, 7, 8] },
  { p: 'golden autumn park with falling maple leaves and a bench, warm sunlight', m: [9, 10, 11] },
  { p: 'a cup of hot tea with lemon, autumn leaves and a knitted blanket', m: [9, 10, 11] },
  { p: 'a basket of apples and pumpkins with autumn flowers', m: [9, 10] },
  { p: 'a ginger kitten wrapped in a knitted scarf with autumn leaves', m: [10, 11] },
  { p: 'a snowy winter village with warm lights in the windows, falling snowflakes', m: [12, 1, 2] },
  { p: 'a cup of cocoa with marshmallows, pine branches and a candle, cozy winter evening', m: [11, 12, 1, 2] },
  { p: 'a bullfinch sitting on a snowy rowan branch with red berries', m: [12, 1, 2] },
  { p: 'a decorated Christmas tree with gifts and a sleeping kitten, warm lights', m: [12, 1] },
  { p: 'a snowman in a red scarf in a snowy forest, sparkling snow', m: [12, 1, 2] },
  { p: 'a white swan on a lake with water lilies at sunrise', m: [5, 6, 7, 8] },
  { p: 'a hedgehog with a basket of mushrooms in an autumn forest', m: [9, 10] },
  { p: 'a vase of red roses and a lit candle, romantic evening' },
  { p: 'an angel with golden wings among white flowers and soft clouds' },
  { p: 'a little bird singing on a blooming apple tree branch', m: [4, 5] },
]};
