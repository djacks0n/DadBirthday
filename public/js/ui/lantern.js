// the big lantern at the end of the street: the birthday note, plus some counts
import { h } from './panel.js';
import { BIRTHDAY } from '../../data/content.js';
import * as S from '../state.js';

export function buildLantern(body) {
  const st = S.get();
  body.append(h('div', { class: 'letter' },
    h('h2', {}, BIRTHDAY.line1),
    h('div', { class: 'sub' }, BIRTHDAY.line2),
    h('div', { class: 'sign' }, BIRTHDAY.sign),
  ));
  body.append(h('div', { class: 'stats' },
    h('div', { class: 'stat' }, h('b', {}, st.visitDays.length), h('span', {}, 'days')),
    h('div', { class: 'stat' }, h('b', {}, st.bottles.length), h('span', {}, 'bottles')),
    h('div', { class: 'stat' }, h('b', {}, st.savedQuotes.length), h('span', {}, 'quotes')),
    h('div', { class: 'stat' }, h('b', {}, Object.values(st.trips).filter(v => v === 'been').length), h('span', {}, 'trips')),
    h('div', { class: 'stat' }, h('b', {}, S.gardenCount()), h('span', {}, 'plants')),
  ));
}
