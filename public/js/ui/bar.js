// Bar Amaoto: bottle keep shelf, mood picks, tasting log
import { h, toast } from './panel.js';
import { BARTENDER_HI, MOODS } from '../../data/content.js';
import * as S from '../state.js';
import { pour } from '../audio.js';

const COLORS = ['#c98a3a', '#a8641f', '#d9a24a', '#7a3a12', '#e0b45a', '#8c4a1a', '#b5762c', '#5a2a0a'];

function bottleSVG(color, shape = 0) {
  const shapes = [
    // tall classic
    `<rect x="17" y="2" width="12" height="16" rx="2" fill="#222"/><path d="M15 18 h16 v6 q8 4 8 14 v58 q0 4 -4 4 h-24 q-4 0 -4 -4 v-58 q0 -10 8 -14z" fill="${color}" opacity=".92"/><rect x="11" y="52" width="24" height="26" rx="2" fill="#f1ece0" opacity=".85"/>`,
    // squat round (like a japanese whisky bottle)
    `<rect x="18" y="12" width="10" height="12" rx="2" fill="#222"/><path d="M16 24 h14 v4 q12 6 12 22 v40 q0 6 -6 6 h-26 q-6 0 -6 -6 v-40 q0 -16 12 -22z" fill="${color}" opacity=".92"/><circle cx="23" cy="64" r="11" fill="#f1ece0" opacity=".85"/>`,
    // square shoulders
    `<rect x="18" y="4" width="10" height="16" rx="2" fill="#222"/><path d="M17 20 h12 v6 l10 6 v62 q0 2 -2 2 h-28 q-2 0 -2 -2 v-62 l10 -6z" fill="${color}" opacity=".92"/><rect x="11" y="50" width="24" height="30" fill="#f1ece0" opacity=".85"/>`,
  ];
  return `<svg width="46" height="100" viewBox="0 0 46 100">${shapes[shape % shapes.length]}</svg>`;
}

export function buildBar(body) {
  const st = S.get();
  let openCard = null;

  const bubble = h('div', { class: 'bubble' }, BARTENDER_HI[Math.floor(Math.random() * BARTENDER_HI.length)]);
  body.append(h('div', { class: 'bartender' }, h('div', { class: 'face', 'aria-hidden': 'true' }, '🥃'), bubble));

  // ----- the shelf -----
  body.append(h('h3', {}, 'Your shelf'));
  const shelfWrap = h('div', { class: 'shelf-wrap' });
  const cardSlot = h('div');
  body.append(shelfWrap, cardSlot);

  function drawShelf(newId) {
    shelfWrap.innerHTML = '';
    const bottles = S.get().bottles;
    for (let i = 0; i < bottles.length; i += 9) {
      const shelf = h('div', { class: 'shelf' });
      bottles.slice(i, i + 9).forEach((b, j) => {
        const btn = h('button', { class: 'bottle' + (b.id === newId ? ' new' : ''), title: b.name, onclick: () => showCard(b) });
        btn.innerHTML = bottleSVG(b.color || COLORS[(i + j) % COLORS.length], b.shape ?? (i + j));
        btn.append(h('span', { class: 'tag' }, 'Dad'), h('span', { class: 'label' }, b.name));
        shelf.append(btn);
      });
      shelfWrap.append(shelf);
    }
  }

  function showCard(b) {
    cardSlot.innerHTML = '';
    if (openCard === b.id) { openCard = null; return; }
    openCard = b.id;
    const d = new Date(b.date);
    const card = h('div', { class: 'bottle-card' },
      h('button', { class: 'x', title: 'close', onclick: () => { cardSlot.innerHTML = ''; openCard = null; } }, '×'),
      h('b', { style: 'font-size:18px' }, b.name), ' ',
      h('span', { class: 'stars' }, '🥃'.repeat(b.rating || 0)),
      b.starter ? null : h('div', { style: 'font-size:12.5px;opacity:.6;margin:2px 0 8px' }, d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })),
      b.notes ? h('div', { style: 'margin-top:6px' }, b.notes) : null,
    );
    if (!b.starter) {
      card.append(h('div', { style: 'margin-top:10px' }, h('button', {
        class: 'btn small ghost', onclick: () => {
          if (!confirm(`Take ${b.name} off the shelf?`)) return;
          S.update(s => { s.bottles = s.bottles.filter(x => x.id !== b.id); });
          cardSlot.innerHTML = ''; openCard = null; drawShelf();
        },
      }, 'Remove')));
    }
    cardSlot.append(card);
  }
  drawShelf();

  // ----- what kind of night -----
  body.append(h('h3', {}, 'What kind of night is it?'));
  const moods = h('div', { class: 'moods' });
  const picks = h('div');
  MOODS.forEach(m => {
    moods.append(h('button', {
      class: 'chip', onclick: e => {
        moods.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
        e.currentTarget.classList.add('on');
        picks.innerHTML = '';
        const grid = h('div', { class: 'picks' });
        m.picks.forEach(p => grid.append(h('div', { class: 'pick' },
          h('b', {}, p.name), h('div', { class: 'where' }, p.where), h('p', {}, p.note),
          h('button', { class: 'btn small ghost', onclick: () => { nameIn.value = p.name; nameIn.focus(); form.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, 'Log it'),
        )));
        picks.append(grid);
      },
    }, m.label));
  });
  body.append(moods, picks);

  // ----- log a bottle -----
  body.append(h('h3', {}, 'Log a bottle'));
  let rating = 4;
  const nameIn = h('input', { placeholder: 'e.g. Yamazaki 12', maxlength: 60, required: true });
  const notesIn = h('textarea', { rows: 2, placeholder: 'Notes', maxlength: 400 });
  const glasses = h('div', { class: 'glasses' });
  function drawGlasses() {
    glasses.innerHTML = '';
    for (let i = 1; i <= 5; i++) glasses.append(h('button', { type: 'button', class: i <= rating ? 'on' : '', title: i + ' out of 5', onclick: () => { rating = i; drawGlasses(); } }, '🥃'));
  }
  drawGlasses();
  const form = h('form', {
    class: 'log-form', onsubmit: e => {
      e.preventDefault();
      const name = nameIn.value.trim();
      if (!name) return;
      const id = crypto.randomUUID();
      S.update(s => s.bottles.push({ id, name, notes: notesIn.value.trim(), rating, date: new Date().toISOString(), color: COLORS[Math.floor(Math.random() * COLORS.length)], shape: Math.floor(Math.random() * 3) }));
      pour();
      drawShelf(id);
      nameIn.value = ''; notesIn.value = ''; rating = 4; drawGlasses();
      shelfWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
  },
    h('label', {}, 'Bottle', nameIn),
    h('label', {}, 'Rating', glasses),
    h('label', { class: 'full' }, 'Notes', notesIn),
    h('div', { class: 'full' }, h('button', { class: 'btn', type: 'submit', style: 'background:#ffb35c;color:#23160d' }, 'Put it on the shelf')),
  );
  body.append(form);
}
