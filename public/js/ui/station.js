// Amaoto Station: departure board of ski trips, hikes, and our trips
import { h, toast } from './panel.js';
import { DESTINATIONS } from '../../data/content.js';
import * as S from '../state.js';
import { chime } from '../audio.js';

const KIND = { ski: 'SKI', hike: 'HIKE', ours: 'US', mine: 'YOURS' };

export function buildStation(body) {
  chime();
  const filters = h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px' });
  const board = h('div', { class: 'board' });
  const cardSlot = h('div');
  let filter = 'all';
  [['all', 'all'], ['ski', 'ski'], ['hike', 'hike'], ['ours', 'ours'], ['want', 'want to go'], ['been', 'been there']].forEach(([id, label]) => filters.append(h('button', {
    class: 'chip' + (id === 'all' ? ' on' : ''), onclick: e => {
      filter = id;
      filters.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
      e.currentTarget.classList.add('on');
      draw();
    },
  }, label)));

  function all() {
    return [...DESTINATIONS, ...S.get().myTrips.map(t => ({ ...t, kind: 'mine' }))];
  }

  function draw() {
    const st = S.get();
    board.innerHTML = '';
    board.append(h('div', { class: 'board-head' }, h('span', {}, '時刻'), h('span', {}, '行先 DESTINATION'), h('span', { class: 'w' }, 'WHERE'), h('span', {}, 'TRAIN'), h('span', {}, 'STATUS')));
    let minutes = new Date().getHours() * 60 + new Date().getMinutes() + 3;
    const list = all().filter(d => filter === 'all' || d.kind === filter || st.trips[d.id] === filter || (filter === 'ours' && d.kind === 'mine'));
    if (!list.length) board.append(h('div', { style: 'padding:14px;color:#888' }, 'Nothing here yet.'));
    list.forEach(d => {
      minutes += 7 + (d.name.length % 9);
      const time = d.kind === 'ours' || d.kind === 'mine' ? '--:--' : `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
      const s = st.trips[d.id];
      board.append(h('button', { class: 'board-row', onclick: () => show(d) },
        h('span', { class: 't' }, time),
        h('span', { class: 'dest' }, d.jp ? h('span', { class: 'jp' }, d.jp) : null, d.name.toUpperCase()),
        h('span', { class: 'w', style: 'font-size:13px;color:#aaa' }, d.where),
        h('span', { class: 'kind ' + d.kind }, KIND[d.kind]),
        h('span', { class: 'status ' + (s || '') }, s === 'been' ? '✓ BEEN' : s === 'want' ? '★ WANT' : (d.kind === 'ours' ? '✓ DONE' : 'ON TIME')),
      ));
    });
  }

  function show(d) {
    const st = S.get();
    const s = st.trips[d.id];
    const set = v => {
      S.update(x => { if (x.trips[d.id] === v) delete x.trips[d.id]; else x.trips[d.id] = v; });
      draw(); show(d);
    };
    cardSlot.innerHTML = '';
    const row = h('div', { class: 'row' },
      h('button', { class: 'btn' + (s === 'been' ? '' : ' ghost'), style: s === 'been' ? 'background:#2f8a3a;color:#fff' : '', onclick: () => set('been') }, s === 'been' ? '✓ Been there' : 'Been there'),
      h('button', { class: 'btn' + (s === 'want' ? '' : ' ghost'), style: s === 'want' ? 'background:#c9a12a;color:#111' : '', onclick: () => set('want') }, s === 'want' ? '★ Want to go' : 'Want to go'),
    );
    if (d.kind === 'mine') row.append(h('button', {
      class: 'btn ghost', onclick: () => {
        if (!confirm(`Remove ${d.name}?`)) return;
        S.update(x => { x.myTrips = x.myTrips.filter(t => t.id !== d.id); delete x.trips[d.id]; });
        cardSlot.innerHTML = ''; draw();
      },
    }, 'Remove'));
    cardSlot.append(h('div', { class: 'dest-card' },
      h('h4', {}, d.jp && d.kind !== 'mine' ? `${d.name}  ${d.jp}` : d.name),
      h('div', { class: 'where' }, d.where),
      h('p', {}, d.text || ''),
      row,
    ));
    cardSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  draw();
  body.append(filters, board, cardSlot);

  body.append(h('h3', {}, 'Add a trip'));
  const name = h('input', { placeholder: 'Where', maxlength: 50 });
  const where = h('input', { placeholder: 'State or country', maxlength: 50 });
  const note = h('input', { placeholder: 'Note', maxlength: 200, style: 'flex-basis:100%' });
  body.append(h('form', {
    class: 'add-trip', onsubmit: e => {
      e.preventDefault();
      if (!name.value.trim()) return;
      const t = { id: 'my-' + crypto.randomUUID(), name: name.value.trim(), where: where.value.trim(), text: note.value.trim(), jp: '' };
      S.update(x => x.myTrips.push(t));
      name.value = where.value = note.value = '';
      draw(); show({ ...t, kind: 'mine' });
    },
  }, name, where, note, h('button', { class: 'btn', type: 'submit', style: 'background:#ffb000;color:#111' }, 'Add')));
}
