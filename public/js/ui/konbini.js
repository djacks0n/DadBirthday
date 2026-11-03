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


  const grid = h('div', { class: 'k-grid' });

  // today's receipt
  const receipt = h('div', { class: 'receipt' },
    h('div', { style: 'text-align:center;font-weight:700' }, 'KONBINI 24h'),
    h('div', { style: 'text-align:center' }, today),
    h('hr'),
    h('div', {}, '1x QUOTE OF THE DAY'),
    h('div', { style: 'padding-left:14px' }, `"${quote.t}" (${quote.who})`),
    h('div', { style: 'margin-top:6px' }, '1x POUR TONIGHT'),
    h('div', { style: 'padding-left:14px' }, bottle.name),
    h('div', { style: 'margin-top:6px' }, '1x RAIN WALK'),
    h('div', { style: 'padding-left:14px' }, h('a', { href: ytWatch(walk.id), target: '_blank', rel: 'noopener' }, `${walk.city}: ${walk.sub}`)),
    h('div', { style: 'margin-top:6px' }, '1x CAMPING'),
    h('div', { style: 'padding-left:14px' }, h('a', { href: ytWatch(camp.id), target: '_blank', rel: 'noopener' }, camp.title)),
    h('hr'),
    h('div', {}, `VISITS ........... ${st.visitDays.length}`),
    h('div', {}, `BOTTLES .......... ${st.bottles.length}`),
  );
  grid.append(h('div', { class: 'k-card' }, h('h4', {}, "Today's picks"), receipt));

  // settings
  const sound = h('input', { type: 'checkbox' }); sound.checked = !st.muted;
  sound.addEventListener('change', () => app.setMuted(!sound.checked));
  const wx = h('input', { type: 'checkbox' }); wx.checked = !!st.realWeather;
  const wxNote = h('p', { style: 'font-size:13px;opacity:.75' }, 'Uses your location.');
  wx.addEventListener('change', async () => {
    S.update(s => { s.realWeather = wx.checked; });
    if (wx.checked) {
      const w = await app.checkWeather();
      if (!w) { toast("Couldn't get the weather."); wx.checked = false; S.update(s => { s.realWeather = false; }); }
    } else app.checkWeather();
  });
  grid.append(h('div', { class: 'k-card' },
    h('h4', {}, 'Settings'),
    h('label', { class: 'toggle' }, sound, 'Sound'),
    h('label', { class: 'toggle' }, wx, 'Match the real weather'),
    wxNote,
    h('h4', { style: 'margin-top:14px' }, 'Controls'),
    h('p', {}, 'WASD or arrows to walk, Shift to run. Drag to look. Click a shop to go in. Esc to leave.'),
  ));

  // backup
  const file = h('input', { type: 'file', accept: '.json,application/json', style: 'display:none' });
  file.addEventListener('change', async () => {
    if (!file.files[0]) return;
    try {
      await S.importBackup(file.files[0]);
      toast('Loaded.');
      setTimeout(() => location.reload(), 900);
    } catch (e) { toast("That file didn't work."); }
  });
  grid.append(h('div', { class: 'k-card' },
    h('h4', {}, 'Backup'),
    h('p', {}, 'Everything is saved in this browser only.'),
    h('div', { class: 'row' },
      h('button', { class: 'btn', onclick: () => S.exportBackup() }, 'Download'),
      h('button', { class: 'btn ghost', onclick: () => file.click() }, 'Load'),
      file,
    ),
    h('h4', { style: 'margin-top:16px' }, 'Reset'),
    h('div', { class: 'row' },
      // back to the welcome screen, keeps his shelf and everything
      h('button', {
        class: 'btn ghost', onclick: () => {
          S.update(s => { s.seenBirthday = false; });
          location.reload();
        },
      }, 'Show welcome again'),
      // wipes everything, like opening it for the first time
      h('button', {
        class: 'btn ghost', style: 'color:#c0302a', onclick: () => {
          if (!confirm('Erase everything and start over?')) return;
          S.resetAll();
          location.reload();
        },
      }, 'Start over'),
    ),
  ));

  body.append(grid);
}
