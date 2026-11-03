// the big lantern at the end of the street: the birthday note, plus some counts
import { h } from './panel.js';
import { BIRTHDAY } from '../../data/content.js';
import * as S from '../state.js';

export function buildLantern(body) {
  const st = S.get();
  body.append(h('div', { class: 'letter' },
    h('h2', {}, BIRTHDAY.line1),
    h('div', { class: 'sub' }, BIRTHDAY.line2),
    h('p', {}, BIRTHDAY.body),
    h('div', { class: 'sign' }, BIRTHDAY.sign),
  ));
  const since = new Date(st.firstVisit).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  body.append(h('div', { class: 'stats' },
    h('div', { class: 'stat' }, h('b', {}, st.visitDays.length), h('span', {}, 'days on the street')),
    h('div', { class: 'stat' }, h('b', {}, st.bottles.length), h('span', {}, 'bottles on your shelf')),
    h('div', { class: 'stat' }, h('b', {}, st.savedQuotes.length), h('span', {}, 'fortunes kept')),
    h('div', { class: 'stat' }, h('b', {}, Object.values(st.trips).filter(v => v === 'been').length), h('span', {}, 'trains taken')),
    h('div', { class: 'stat' }, h('b', {}, S.gardenCount()), h('span', {}, 'things growing')),
  ));
  body.append(h('p', { style: 'text-align:center;opacity:.6;font-size:13px;margin-top:16px' }, `first walked in on ${since}`));
}
