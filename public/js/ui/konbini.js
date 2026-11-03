// the konbini: today's picks, settings, and the backup button
import { h, toast, seededPick, ytWatch } from './panel.js';
import { QUOTES, MOODS, RAIN_WALKS, CAMP_VIDEOS } from '../../data/content.js';
import * as S from '../state.js';

export function buildKonbini(body, app) {
  const st = S.get();
  const quote = seededPick(QUOTES, 1);
  const mood = seededPick(MOODS, 2);
  const bottle = seededPick(mood.picks, 3);
  const walk = seededPick(RAIN_WALKS, 4);
  const camp = seededPick(CAMP_VIDEOS, 5);
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  body.append(h('p', { style: 'margin:0 0 14px' }, h('span', { class: 'note' }, 'irasshaimase! '), "That's what they yell when you walk in. Everything else on the street is in here somewhere."));

  const grid = h('div', { class: 'k-grid' });

  // today's receipt
  const receipt = h('div', { class: 'receipt' },
    h('div', { style: 'text-align:center;font-weight:700' }, 'KONBINI 24h'),
    h('div', { style: 'text-align:center' }, today),
    h('hr'),
    h('div', {}, '1x QUOTE OF THE DAY'),
    h('div', { style: 'padding-left:14px' }, `"${quote.t}" (${quote.who})`),
    h('div', { style: 'margin-top:6px' }, '1x POUR TONIGHT'),
    h('div', { style: 'padding-left:14px' }, `${bottle.name}, for a ${mood.label.toLowerCase()} kind of night`),
    h('div', { style: 'margin-top:6px' }, '1x RAIN WALK'),
    h('div', { style: 'padding-left:14px' }, h('a', { href: ytWatch(walk.id), target: '_blank', rel: 'noopener' }, `${walk.city}: ${walk.sub}`)),
    h('div', { style: 'margin-top:6px' }, '1x CAMPING'),
    h('div', { style: 'padding-left:14px' }, h('a', { href: ytWatch(camp.id), target: '_blank', rel: 'noopener' }, camp.title)),
    h('hr'),
    h('div', {}, `DAYS YOU'VE VISITED ...... ${st.visitDays.length}`),
    h('div', {}, `BOTTLES ON YOUR SHELF ..... ${st.bottles.length}`),
    h('div', {}, `TOTAL ................. ¥0`),
    h('div', { style: 'text-align:center;margin-top:6px' }, 'come back tomorrow, it changes'),
  );
  grid.append(h('div', { class: 'k-card' }, h('h4', {}, "Today's picks"), receipt));

  // settings
  const sound = h('input', { type: 'checkbox' }); sound.checked = !st.muted;
  sound.addEventListener('change', () => app.setMuted(!sound.checked));
  const wx = h('input', { type: 'checkbox' }); wx.checked = !!st.realWeather;
  const wxNote = h('p', { style: 'font-size:13px;opacity:.75' }, "If it's really raining where you are, it rains harder here too. Your browser will ask for your location once. It only goes to a free weather service and nowhere else.");
  wx.addEventListener('change', async () => {
    S.update(s => { s.realWeather = wx.checked; });
    if (wx.checked) {
      toast('Checking the weather...');
      const w = await app.checkWeather();
      if (!w) { toast("Couldn't get your weather. Still raining here though."); wx.checked = false; S.update(s => { s.realWeather = false; }); }
    } else app.checkWeather();
  });
  grid.append(h('div', { class: 'k-card' },
    h('h4', {}, 'Settings'),
    h('label', { class: 'toggle' }, sound, 'Sound (rain, trains, all that)'),
    h('label', { class: 'toggle' }, wx, 'Match the real weather'),
    wxNote,
    h('h4', { style: 'margin-top:14px' }, 'How to walk around'),
    h('p', {}, 'W A S D or the arrow keys to walk, Shift to speed up. Click and drag to look around. Click a shop to walk there and go in. Esc to leave.'),
  ));

  // backup
  const file = h('input', { type: 'file', accept: '.json,application/json', style: 'display:none' });
  file.addEventListener('change', async () => {
    if (!file.files[0]) return;
    try {
      await S.importBackup(file.files[0]);
      toast('Backup loaded. Everything is back.');
      setTimeout(() => location.reload(), 900);
    } catch (e) { toast("That file didn't work. Is it the backup from here?"); }
  });
  grid.append(h('div', { class: 'k-card' },
    h('h4', {}, 'Back up your stuff'),
    h('p', {}, "Your shelf, quotes, trips and garden are saved in this browser. If you clear your browser or get a new computer they'd be gone, so download a backup every once in a while."),
    h('div', { class: 'row' },
      h('button', { class: 'btn', onclick: () => { S.exportBackup(); toast('Downloaded. Keep it somewhere.'); } }, 'Download backup'),
      h('button', { class: 'btn ghost', onclick: () => file.click() }, 'Load a backup'),
      file,
    ),
  ));

  grid.append(h('div', { class: 'k-card' },
    h('h4', {}, 'About this street'),
    h('p', {}, "I made this for your 60th. It's supposed to feel like one of those Japan rain walk videos you watch, except you can go inside stuff. Everything on here is picked for you."),
    h('p', { class: 'note' }, "if something breaks tell me and I'll fix it - Daniel"),
    h('div', { class: 'row' }, h('button', { class: 'btn ghost small', onclick: () => app.openShop('lantern') }, 'Read the birthday note again')),
  ));
  body.append(grid);
}
