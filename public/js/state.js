// everything dad does gets saved in his browser
import { STARTER_BOTTLES, QUOTES } from '../data/content.js';

const KEY = 'amaoto-street-v1';

function fresh() {
  return {
    seenBirthday: false,
    firstVisit: new Date().toISOString(),
    visitDays: [new Date().toISOString().slice(0, 10)],
    bottles: STARTER_BOTTLES.map(b => ({ ...b, id: crypto.randomUUID(), date: new Date().toISOString() })),
    savedQuotes: QUOTES.filter(q => q.fav).map(q => ({ t: q.t, who: q.who, src: q.src, date: new Date().toISOString() })),
    myQuotes: [],
    trips: {}, // id -> 'been' | 'want'
    myTrips: [],
    waterings: 0,
    bowling: { best: 0, games: 0 },
    muted: false,
    realWeather: false,
  };
}

let state;
try {
  state = JSON.parse(localStorage.getItem(KEY)) || fresh();
} catch (e) {
  state = fresh();
}
state = { ...fresh(), ...state };

// count today as a visit
const today = new Date().toISOString().slice(0, 10);
if (!state.visitDays.includes(today)) state.visitDays.push(today);

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode or whatever */ }
}
save();

export function get() { return state; }

export function update(fn) { fn(state); save(); }

export function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `amaoto-street-backup-${today}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function importBackup(file) {
  return file.text().then(txt => {
    const data = JSON.parse(txt);
    if (!data || !Array.isArray(data.bottles)) throw new Error('bad file');
    state = { ...fresh(), ...data };
    save();
  });
}

export function resetAll() {
  state = fresh();
  save();
}

// how many things are growing in the garden
export function gardenCount() {
  const s = state;
  const bottles = s.bottles.filter(b => !b.starter).length;
  const trips = Object.values(s.trips).filter(v => v === 'been').length + s.myTrips.length;
  return 12 + bottles + s.savedQuotes.length + s.myQuotes.length + trips + Math.min(s.visitDays.length, 60) + Math.floor(s.waterings / 3);
}
