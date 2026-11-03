// all the words and picks on the site live here so they're easy to change

export const BARTENDER_HI = [
  "The fart smeller's back.",
  "Your Glengoyne's where you left it.",
  "Still raining.",
  "Got more ouzo in.",
  "Sharp as a bowling ball, as always.",
];

// moods for "what kind of night is it?"
export const MOODS = [
  {
    id: 'rain', label: 'Rainy night',
    picks: [
      { name: 'GlenDronach 12', where: 'Highlands, Scotland', note: "Sherry casks, dark fruit." },
      { name: 'Yamazaki 12', where: 'Osaka, Japan', note: "Soft and fruity." },
      { name: 'Glenfarclas 15', where: 'Speyside, Scotland', note: "All sherry, no smoke." },
    ],
  },
  {
    id: 'ski', label: 'After skiing',
    picks: [
      { name: 'Balvenie DoubleWood 12', where: 'Speyside, Scotland', note: "Honey and vanilla." },
      { name: 'Hibiki Japanese Harmony', where: 'Japan', note: "Smooth Japanese blend." },
      { name: 'Talisker 10', where: 'Isle of Skye, Scotland', note: "A little smoke and pepper." },
    ],
  },
  {
    id: 'party', label: 'Celebrating',
    picks: [
      { name: 'Glengoyne 18', where: 'Highlands, Scotland', note: "Your Glengoyne, six years older." },
      { name: "Aberlour A'bunadh", where: 'Speyside, Scotland', note: "Cask strength. Add water." },
      { name: 'Yamazaki 12', where: 'Osaka, Japan', note: "Soft and fruity." },
    ],
  },
  {
    id: 'new', label: 'Something new',
    picks: [
      { name: 'Nikka Coffey Grain', where: 'Japan', note: "Sweet, vanilla, corn." },
      { name: 'Hakushu 12', where: 'Yamanashi, Japan', note: "Fresh, a little smoke." },
      { name: 'Nikka Miyagikyo', where: 'Sendai, Japan', note: "Soft and fruity." },
    ],
  },
  {
    id: 'smoke', label: 'Smoky',
    picks: [
      { name: 'Talisker 10', where: 'Isle of Skye, Scotland', note: "Smoke, salt, pepper." },
      { name: 'Lagavulin 16', where: 'Islay, Scotland', note: "Very smoky." },
    ],
  },
  {
    id: 'ouzo', label: 'Ouzo',
    picks: [
      { name: 'Plomari Ouzo', where: 'Lesvos, Greece', note: "The classic." },
      { name: 'Ouzo 12', where: 'Greece', note: "The standard." },
      { name: 'Ricard Pastis', where: 'France', note: "French cousin of ouzo." },
    ],
  },
];

// bottles already on the shelf the first time he walks in
export const STARTER_BOTTLES = [
  { name: 'Glengoyne', notes: "", rating: 5, color: '#c98a3a', starter: true },
  { name: 'Ouzo', notes: "", rating: 5, color: '#dfe8ea', starter: true },
];

// omikuji levels (real ones go from great blessing down to bad luck)
export const FORTUNES = [
  { kanji: '大吉', en: 'Great blessing', w: 2 },
  { kanji: '中吉', en: 'Middle blessing', w: 3 },
  { kanji: '吉', en: 'Blessing', w: 3 },
  { kanji: '小吉', en: 'Small blessing', w: 3 },
  { kanji: '末吉', en: 'Future blessing', w: 2 },
  { kanji: '凶', en: 'Bad luck', w: 1, note: "Bad luck. Tie it to the rack and leave it here." },
];

// quotes in the omikuji box. attributions checked, translations are the common ones
export const QUOTES = [
  { t: "We must cultivate our garden.", who: 'Voltaire', src: 'Candide (1759)', fav: true },
  { t: "We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields and in the streets, we shall fight in the hills; we shall never surrender.", who: 'Winston Churchill', src: 'House of Commons, June 1940', fav: true },
  { t: "Freedom is to be able to choose your own shackles.", who: "Dad's favorite", src: '', fav: true },
  { t: "The best is the enemy of the good.", who: 'Voltaire', src: 'La Bégueule (1772)' },
  { t: "This is not the end. It is not even the beginning of the end. But it is, perhaps, the end of the beginning.", who: 'Winston Churchill', src: 'Mansion House speech, 1942' },
  { t: "Never give in, never give in, never, never, never.", who: 'Winston Churchill', src: 'Harrow School, 1941' },
  { t: "We shape our buildings; thereafter they shape us.", who: 'Winston Churchill', src: '1943' },
  { t: "Man is born free, and everywhere he is in chains.", who: 'Jean-Jacques Rousseau', src: 'The Social Contract (1762)' },
  { t: "The unexamined life is not worth living.", who: 'Socrates', src: "Plato's Apology" },
  { t: "We suffer more often in imagination than in reality.", who: 'Seneca', src: 'Letters to Lucilius' },
  { t: "Men are disturbed not by things, but by the views which they take of things.", who: 'Epictetus', src: 'Enchiridion' },
  { t: "Waste no more time arguing about what a good man should be. Be one.", who: 'Marcus Aurelius', src: 'Meditations' },
  { t: "He who has a why to live can bear almost any how.", who: 'Friedrich Nietzsche', src: 'Twilight of the Idols' },
  { t: "All the unhappiness of men arises from one single fact, that they cannot stay quietly in their own chamber.", who: 'Blaise Pascal', src: 'Pensées' },
  { t: "Life can only be understood backwards; but it must be lived forwards.", who: 'Søren Kierkegaard', src: 'Journals, 1843' },
  { t: "One must imagine Sisyphus happy.", who: 'Albert Camus', src: 'The Myth of Sisyphus' },
  { t: "A journey of a thousand miles begins with a single step.", who: 'Lao Tzu', src: 'Tao Te Ching' },
  { t: "I went to the woods because I wished to live deliberately.", who: 'Henry David Thoreau', src: 'Walden' },
  { t: "The mountains are calling and I must go.", who: 'John Muir', src: 'Letter, 1873' },
  { t: "All things excellent are as difficult as they are rare.", who: 'Baruch Spinoza', src: 'Ethics' },
  { t: "We are all in the gutter, but some of us are looking at the stars.", who: 'Oscar Wilde', src: "Lady Windermere's Fan" },
  { t: "When I play with my cat, who knows if I am not a pastime to her more than she is to me?", who: 'Michel de Montaigne', src: 'Essays' },
  { t: "Well done is better than well said.", who: 'Benjamin Franklin', src: "Poor Richard's Almanack" },
  { t: "No man ever steps in the same river twice.", who: 'Heraclitus', src: 'via Plato' },
];

// Abel & Victoria on the gear shop TVs
export const CAMP_VIDEOS = [
  { id: 'T5hdql82pP4', title: 'The Worst Mountain Storm I Have Ever Camped In', mood: 'storm' },
  { id: '7wvdICyoiWA', title: 'Trapped in a Rainstorm', mood: 'storm' },
  { id: 'z4ih-3Nseps', title: 'Camping in Rain Storm, Heavy Rain and Strong Winds', mood: 'storm' },
  { id: '7Jv2JOzqynU', title: 'Rainstorm Overwhelms Hot Tent', mood: 'storm' },
  { id: 'GZ1x5vFM4rw', title: '24 Hours of Torrential Rain in a Cabin', mood: 'cabin' },
  { id: 'UYLr6FIO5_Y', title: 'Camping in a Snowstorm, Forced to Shelter', mood: 'snow' },
];

// rain walks for the bench map
export const RAIN_WALKS = [
  // tokyo gets the most because that's the one you watch the most
  { city: 'Tokyo', area: 'Shinjuku', sub: 'Back alleys at night', lat: 35.69, lon: 139.70, id: 'K1_mxPL3rpw' },
  { city: 'Tokyo', area: 'Shinjuku', sub: 'Kabukicho on a rainy night', lat: 35.69, lon: 139.70, id: 'KBiRbwhbPpo' },
  { city: 'Tokyo', area: 'Shibuya', sub: 'Shibuya to Harajuku, rainy night', lat: 35.69, lon: 139.70, id: 'vvWShDvADgU' },
  { city: 'Tokyo', area: 'Shibuya', sub: 'Shibuya to Naka-Meguro, rainy night', lat: 35.69, lon: 139.70, id: 'gKjzJYmDhxo' },
  { city: 'Tokyo', area: 'Shibuya', sub: 'Typhoon morning, heavy rain', lat: 35.69, lon: 139.70, id: 'hkiV4FDR2IU' },
  { city: 'Tokyo', area: 'Asakusa', sub: 'Asakusa on a rainy night', lat: 35.69, lon: 139.70, id: 'oz_5SUICD7M' },
  { city: 'Tokyo', area: 'Asakusa', sub: 'Rainy evening at Senso-ji', lat: 35.69, lon: 139.70, id: 'xpVMp1WRwI0' },
  { city: 'Tokyo', area: 'Ginza', sub: 'Heavy rain at night', lat: 35.69, lon: 139.70, id: 'NY5w8S1uKO8' },
  { city: 'Tokyo', area: 'Ueno and Yanaka', sub: 'Yanaka Ginza to Ueno, rainy night', lat: 35.69, lon: 139.70, id: 'Ab78G8VIW3U' },
  { city: 'Tokyo', area: 'Akihabara', sub: 'Drizzle at night', lat: 35.69, lon: 139.70, id: '4TBrF66OSgw' },
  { city: 'Tokyo', area: 'Shimokitazawa', sub: 'Rain walk', lat: 35.69, lon: 139.70, id: 'ZE4lmwHKtCs' },
  { city: 'Tokyo', area: 'All over', sub: 'Across Tokyo at night in the rain', lat: 35.69, lon: 139.70, id: 'hfx2Cgd1AUw' },
  { city: 'Tokyo', area: 'All over', sub: 'Record heavy rain', lat: 35.69, lon: 139.70, id: 'UGSWyoR7QpM' },
  { city: 'Kyoto', sub: 'Rainy night walk', lat: 35.01, lon: 135.77, id: '2MH3YdtA-yU' },
  { city: 'Kyoto', sub: 'Higashiyama in light rain', lat: 35.01, lon: 135.77, id: 'KDEmWy30Vn0' },
  { city: 'Osaka', sub: 'Shinsaibashi and Namba', lat: 34.67, lon: 135.50, id: 'BfWIrHRAsxA' },
  { city: 'Nara', sub: 'Quiet suburbs in the rain', lat: 34.68, lon: 135.83, id: 'Dbia047CDAE' },
  { city: 'Fukuoka', sub: 'Typhoon night', lat: 33.59, lon: 130.40, id: 'isdeLJy81YU' },
  { city: 'Nakasendo', sub: 'Old mountain road in Nagano', lat: 35.60, lon: 137.60, id: 'BG1cZlbUsLI' },
  { city: 'Fukushima', sub: 'Countryside, early morning rain', lat: 37.40, lon: 140.20, id: 'XTEzbe-r5_I' },
];

// departure board
export const DESTINATIONS = [
  { id: 'laurel', name: 'Laurel Fork', jp: 'ローレルフォーク', kind: 'ours', time: '—', where: 'West Virginia',
    text: "Where we got lost." },
  { id: 'tmb', name: 'Tour du Mont Blanc', jp: 'モンブラン', kind: 'ours', time: '—', where: 'France, Italy, Switzerland',
    text: "105 miles, three countries." },
  { id: 'niseko', name: 'Niseko', jp: 'ニセコ', kind: 'ski', where: 'Hokkaido',
    text: "Famous for powder." },
  { id: 'hakuba', name: 'Hakuba', jp: '白馬', kind: 'ski', where: 'Nagano',
    text: "1998 Olympic ski events." },
  { id: 'nozawa', name: 'Nozawa Onsen', jp: '野沢温泉', kind: 'ski', where: 'Nagano',
    text: "Hot spring village with a ski hill." },
  { id: 'zao', name: 'Zao Onsen', jp: '蔵王温泉', kind: 'ski', where: 'Yamagata',
    text: "Snow monsters (ice-covered trees)." },
  { id: 'kumano', name: 'Kumano Kodo', jp: '熊野古道', kind: 'hike', where: 'Wakayama',
    text: "Old pilgrimage trails through cedar forest." },
  { id: 'nakasendo', name: 'Magome to Tsumago', jp: '馬籠・妻籠', kind: 'hike', where: 'Nakasendo, Nagano',
    text: "8 km on an old post road." },
  { id: 'fuji', name: 'Mt. Fuji', jp: '富士山', kind: 'hike', where: 'Yamanashi / Shizuoka',
    text: "3,776 m. Summer only." },
  { id: 'kamikochi', name: 'Kamikochi', jp: '上高地', kind: 'hike', where: 'Northern Alps',
    text: "Alpine valley, no cars." },
  { id: 'yakushima', name: 'Yakushima', jp: '屋久島', kind: 'hike', where: 'Kagoshima',
    text: "Ancient cedars. Rains constantly." },
];

export const BIRTHDAY = {
  line1: 'Happy 60th',
  line2: 'to the sharpest bowling ball I know',
  sign: '- Daniel',
};
