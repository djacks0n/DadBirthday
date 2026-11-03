// the gear shop with the wall of TVs playing Abel & Victoria
import { h, ytThumb, ytEmbed, ytWatch } from './panel.js';
import { CAMP_VIDEOS } from '../../data/content.js';

export function buildGear(body) {

  const big = h('div', { class: 'tv-big' }, h('div', { class: 'idle' }, h('div', {}, 'PICK A TV')));
  const link = h('a', { class: 'yt-link', href: 'https://www.youtube.com/results?search_query=Abel+%26+Victoria+camping', target: '_blank', rel: 'noopener' }, 'More Abel & Victoria ↗');
  const nowPlaying = h('span', { style: 'font-size:14px;opacity:.8' }, '');
  const filters = h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' });
  const grid = h('div', { class: 'tvs' });

  let mood = 'all';
  ['all', 'storm', 'cabin', 'snow'].forEach(m => filters.append(h('button', {
    class: 'chip' + (m === 'all' ? ' on' : ''), onclick: e => {
      mood = m;
      filters.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
      e.currentTarget.classList.add('on');
      drawGrid();
    },
  }, m)));

  function play(v) {
    big.innerHTML = '';
    big.append(h('iframe', { src: ytEmbed(v.id), allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen: true, title: v.title }));
    nowPlaying.innerHTML = '';
    nowPlaying.append(v.title + '  ', h('a', { class: 'yt-link', href: ytWatch(v.id), target: '_blank', rel: 'noopener' }, 'YouTube ↗'));
    grid.querySelectorAll('.tv').forEach(t => t.classList.toggle('on', t.dataset.id === v.id));
  }

  function drawGrid() {
    grid.innerHTML = '';
    CAMP_VIDEOS.filter(v => mood === 'all' || v.mood === mood).forEach(v => {
      grid.append(h('button', { class: 'tv', 'data-id': v.id, onclick: () => play(v) },
        h('img', { src: ytThumb(v.id), alt: '', loading: 'lazy' }), h('span', {}, v.title)));
    });
  }
  drawGrid();

  body.append(big, h('div', { class: 'tv-row' }, nowPlaying, filters), grid, h('p', { style: 'margin-top:14px' }, link));
}
