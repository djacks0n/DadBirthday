// all the words and picks on the site live here so they're easy to change

export const BARTENDER_HI = [
  "Ah, the fart smeller's back. The usual?",
  "Evening. Your Glengoyne's right where you left it.",
  "Still raining. Good. Sit down.",
  "I ordered more ouzo. Nobody else drinks it, just so you know.",
  "Sharp as ever, I see. Like a bowling ball.",
  "You again. Pick a stool, any stool.",
  "Happy birthday. Don't tell anyone how old you are, I won't either.",
];

// moods for "what kind of night is it?"
export const MOODS = [
  {
    id: 'rain', label: 'Rainy night',
    say: "Rain like this needs something warm and sherried. Nothing smoky.",
    picks: [
      { name: 'GlenDronach 12', where: 'Highlands, Scotland', note: "Aged in sherry casks like the Glengoyne, but heavier. Raisins and dark fruit." },
      { name: 'Yamazaki 12', where: 'Osaka, Japan', note: "From Japan's first malt distillery. Soft and fruity, good for watching rain walks." },
      { name: 'Glenfarclas 15', where: 'Speyside, Scotland', note: "Family-run and all about sherry casks. Tastes like a fireplace with no smoke." },
    ],
  },
  {
    id: 'ski', label: 'Just got off the slopes',
    say: "Cold hands? Here's something to warm you back up.",
    picks: [
      { name: 'Balvenie DoubleWood 12', where: 'Speyside, Scotland', note: "Bourbon cask then sherry cask. Honey and vanilla, really easy to drink." },
      { name: 'Hibiki Japanese Harmony', where: 'Japan', note: "A smooth Japanese blend. Basically the après-ski whisky." },
      { name: 'Talisker 10', where: 'Isle of Skye, Scotland', note: "A little smoke and pepper. Tastes like the coast in bad weather, which you'd like." },
    ],
  },
  {
    id: 'party', label: 'Celebrating',
    say: "You only turn sixty once. Go big.",
    picks: [
      { name: 'Glengoyne 18', where: 'Highlands, Scotland', note: "Your Glengoyne, but six more years in the barrel. Seems right for a birthday." },
      { name: "Aberlour A'bunadh", where: 'Speyside, Scotland', note: "Cask strength and all sherry. Add a little water or it'll knock you over." },
      { name: 'Yamazaki 12', where: 'Osaka, Japan', note: "If you're going Japanese tonight, this is the one." },
    ],
  },
  {
    id: 'new', label: 'Something new',
    say: "Okay, let's get you out of your comfort zone. A little.",
    picks: [
      { name: 'Nikka Coffey Grain', where: 'Japan', note: "Grain whisky from an old Coffey still. Sweet, like vanilla and corn. Different from anything on your shelf." },
      { name: 'Hakushu 12', where: 'Yamanashi, Japan', note: "The distillery is in a forest. Green and fresh with a tiny bit of smoke." },
      { name: 'Nikka Miyagikyo', where: 'Sendai, Japan', note: "Soft and fruity Japanese single malt. Kind of a cousin of the Glengoyne." },
    ],
  },
  {
    id: 'smoke', label: 'Feeling brave (smoke)',
    say: "I know you don't usually go smoky. If you're going to try it, try it here.",
    picks: [
      { name: 'Talisker 10', where: 'Isle of Skye, Scotland', note: "The gentle way in. Smoke, salt, pepper." },
      { name: 'Lagavulin 16', where: 'Islay, Scotland', note: "The deep end. Tastes like a campfire on a beach. You'll love it or hate it." },
    ],
  },
  {
    id: 'ouzo', label: 'Ouzo kind of night',
    say: "Fine. I keep it in the back just for you.",
    picks: [
      { name: 'Plomari Ouzo', where: 'Lesvos, Greece', note: "Classic. Add water and watch it go cloudy." },
      { name: 'Ouzo 12', where: 'Greece', note: "The one every Greek restaurant has." },
      { name: 'Ricard Pastis', where: 'France', note: "Ouzo's French cousin. Same anise thing, same cloudy trick." },
    ],
  },
];

// bottles already on the shelf the first time he walks in
export const STARTER_BOTTLES = [
  { name: 'Glengoyne', notes: "Your bottle. Always here.", rating: 5, color: '#c98a3a', starter: true },
  { name: 'Ouzo', notes: "Nobody else drinks this. It's yours.", rating: 5, color: '#dfe8ea', starter: true },
];

// omikuji levels (real ones go from great blessing down to bad luck)
export const FORTUNES = [
  { kanji: '大吉', en: 'Great blessing', w: 2 },
  { kanji: '中吉', en: 'Middle blessing', w: 3 },
  { kanji: '吉', en: 'Blessing', w: 3 },
  { kanji: '小吉', en: 'Small blessing', w: 3 },
  { kanji: '末吉', en: 'Future blessing', w: 2 },
  { kanji: '凶', en: 'Bad luck', w: 1, note: "Bad luck. In Japan you tie these to the rack and leave them at the shrine so the bad luck stays here. So do that." },
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
    text: "Where we got lost. Also where you showed me multiflora rose, which kind of decided what I want to do with my life. No big deal." },
  { id: 'tmb', name: 'Tour du Mont Blanc', jp: 'モンブラン', kind: 'ours', time: '—', where: 'France, Italy, Switzerland',
    text: "105 miles around Mont Blanc through three countries. Still the longest trip." },
  { id: 'niseko', name: 'Niseko', jp: 'ニセコ', kind: 'ski', where: 'Hokkaido',
    text: "The powder place. Cold air comes off Siberia across the sea and dumps super light snow on it all winter." },
  { id: 'hakuba', name: 'Hakuba', jp: '白馬', kind: 'ski', where: 'Nagano',
    text: "Big Alps-looking mountains. They held ski events here for the 1998 Olympics." },
  { id: 'nozawa', name: 'Nozawa Onsen', jp: '野沢温泉', kind: 'ski', where: 'Nagano',
    text: "Old hot spring village with a ski hill above it. Ski all day, then go sit in a free public bath." },
  { id: 'zao', name: 'Zao Onsen', jp: '蔵王温泉', kind: 'ski', where: 'Yamagata',
    text: "Famous for the snow monsters, which are trees so covered in ice they turn into weird giant shapes." },
  { id: 'kumano', name: 'Kumano Kodo', jp: '熊野古道', kind: 'hike', where: 'Wakayama',
    text: "Really old pilgrimage trails through cedar forest. UNESCO site. It's like the Japanese Camino." },
  { id: 'nakasendo', name: 'Magome to Tsumago', jp: '馬籠・妻籠', kind: 'hike', where: 'Nakasendo, Nagano',
    text: "About 8 km on an old samurai-era road between two old post towns that still look like it's the 1800s." },
  { id: 'fuji', name: 'Mt. Fuji', jp: '富士山', kind: 'hike', where: 'Yamanashi / Shizuoka',
    text: "3,776 m. You can only really climb it in summer. Most people go up overnight to see sunrise from the top." },
  { id: 'kamikochi', name: 'Kamikochi', jp: '上高地', kind: 'hike', where: 'Northern Alps',
    text: "Mountain valley with a crazy clear river. No private cars allowed, you take a bus in." },
  { id: 'yakushima', name: 'Yakushima', jp: '屋久島', kind: 'hike', where: 'Kagoshima',
    text: "Island with cedar trees thousands of years old. There's a saying it rains 35 days a month there. Basically built for you." },
];

export const BIRTHDAY = {
  line1: 'Happy 60th',
  line2: 'to the sharpest bowling ball I know',
  body: "I made you a street. It's always raining here. Walk around, go into places, and come back whenever. Your stuff saves.",
  sign: '- Daniel',
};
