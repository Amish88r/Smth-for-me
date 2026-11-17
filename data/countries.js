// Код страны → [русское название, английское, немецкое]
module.exports = {
  US: ['США', 'USA', 'USA'], GB: ['Великобритания', 'United Kingdom', 'Großbritannien'], DE: ['Германия', 'Germany', 'Deutschland'],
  FR: ['Франция', 'France', 'Frankreich'], IT: ['Италия', 'Italy', 'Italien'], ES: ['Испания', 'Spain', 'Spanien'],
  RU: ['Россия', 'Russia', 'Russland'], PL: ['Польша', 'Poland', 'Polen'], TR: ['Турция', 'Türkiye', 'Türkei'],
  SA: ['Саудовская Аравия', 'Saudi Arabia', 'Saudi-Arabien'], IN: ['Индия', 'India', 'Indien'], JP: ['Япония', 'Japan', 'Japan'],
  BR: ['Бразилия', 'Brazil', 'Brasilien'], MX: ['Мексика', 'Mexico', 'Mexiko'], CA: ['Канада', 'Canada', 'Kanada'],
  AU: ['Австралия', 'Australia', 'Australien'], GR: ['Греция', 'Greece', 'Griechenland'], IL: ['Израиль', 'Israel', 'Israel'],
  EG: ['Египет', 'Egypt', 'Ägypten'], SE: ['Швеция', 'Sweden', 'Schweden'], NL: ['Нидерланды', 'Netherlands', 'Niederlande'],
  AT: ['Австрия', 'Austria', 'Österreich'], CH: ['Швейцария', 'Switzerland', 'Schweiz'], UA: ['Украина', 'Ukraine', 'Ukraine'],
  KZ: ['Казахстан', 'Kazakhstan', 'Kasachstan'], BY: ['Беларусь', 'Belarus', 'Belarus'], RS: ['Сербия', 'Serbia', 'Serbien'],
  BG: ['Болгария', 'Bulgaria', 'Bulgarien'], AM: ['Армения', 'Armenia', 'Armenien'], GE: ['Грузия', 'Georgia', 'Georgien'],
  IE: ['Ирландия', 'Ireland', 'Irland'], PT: ['Португалия', 'Portugal', 'Portugal'], FI: ['Финляндия', 'Finland', 'Finnland'],
  NO: ['Норвегия', 'Norway', 'Norwegen'], CZ: ['Чехия', 'Czechia', 'Tschechien'], AR: ['Аргентина', 'Argentina', 'Argentinien'],
  // только для примет (праздники этих стран пока не подключены):
  CN: ['Китай', 'China', 'China'], KR: ['Южная Корея', 'South Korea', 'Südkorea'],
};
// Страны, по которым берём праздники:
module.exports.HOLIDAY_COUNTRIES = 'US GB DE FR IT ES RU PL TR SA IN JP BR MX CA AU GR IL EG SE NL AT CH UA KZ BY RS BG AM GE IE PT FI NO CZ AR'.split(' ');
