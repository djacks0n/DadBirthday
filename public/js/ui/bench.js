// the bench at the bus stop: pick a city on the map, watch someone walk around it in the rain
import { h, ytThumb, ytEmbed, ytWatch } from './panel.js';
import { RAIN_WALKS } from '../../data/content.js';
import { JAPAN, project } from '../../data/japan.js';

export function buildBench(body) {
  // group walks by city
  const cities = [];
  RAIN_WALKS.forEach(w => {
    let c = cities.find(c => c.city === w.city);
    if (!c) cities.push(c = { city: w.city, lat: w.lat, lon: w.lon, walks: [] });
    c.walks.push(w);
  });

  const win = h('div', { class: 'window' }, h('div', { class: 'idle' }, h('div', {},
    h('div', { style: 'font-size:22px;font-weight:700;margin-bottom:6px' }, 'Sit down. Pick somewhere.'),
    h('div', { class: 'note', style: 'color:#9fd6ff' }, "every pin is a rain walk. no talking, just rain and people with umbrellas. tokyo has the most"),
  )), h('div', { class: 'drops' }));
  const list = h('div', { class: 'walks' });
  const label = h('div', { style: 'font-size:14px;margin-top:10px;opacity:.85;min-height:20px' });

  // the map
  const LABEL_OFFSET = { Kyoto: [12, -10], Osaka: [-72, 8], Nara: [12, 26], Tokyo: [12, 8], Nakasendo: [-118, -12], Fukushima: [12, 8], Fukuoka: [-40, 30] };
  let svg = `<svg viewBox="0 0 ${JAPAN.w} ${JAPAN.h}" xmlns="http://www.w3.org/2000/svg"><path class="land" d="${JAPAN.d}"/>`;
  cities.forEach((c, i) => {
    const p = project(c.lat, c.lon);
    const [ox, oy] = LABEL_OFFSET[c.city] || [8, 4];
    svg += `<g class="pin" data-i="${i}" tabindex="0" role="button" aria-label="${c.city}">
      <circle class="pulse" cx="${p.x}" cy="${p.y}" r="12" style="animation-delay:${(i * 0.37) % 2}s"/>
      <circle class="dot" cx="${p.x}" cy="${p.y}" r="8"/>
      <circle cx="${p.x}" cy="${p.y}" r="16" fill="transparent"/>
      <text x="${p.x + ox}" y="${p.y + oy}">${c.city}</text></g>`;
  });
  svg += `</svg>`;
  const map = h('div', { class: 'japan', html: svg });

  function play(w) {
    win.innerHTML = '';
    win.append(h('iframe', { src: ytEmbed(w.id), allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen: true, title: w.city + ' rain walk' }));
    label.innerHTML = '';
    label.append(`${w.city}, ${w.sub.toLowerCase()}.  `, h('a', { href: ytWatch(w.id), target: '_blank', rel: 'noopener', style: 'color:#9fd6ff' }, 'open on YouTube ↗'));
    list.querySelectorAll('.walk').forEach(b => b.classList.toggle('on', b.dataset.id === w.id));
  }

  function pickCity(i) {
    const c = cities[i];
    map.querySelectorAll('.pin').forEach(p => p.classList.toggle('on', +p.dataset.i === i));
    list.innerHTML = '';
    list.append(h('div', { style: 'font-weight:700;font-size:15px' }, c.city + (c.walks.length > 2 ? `  ·  ${c.walks.length} walks` : '')));
    let area = null;
    c.walks.forEach(w => {
      if (w.area && w.area !== area) { area = w.area; list.append(h('div', { class: 'area' }, area)); }
      list.append(h('button', { class: 'walk', 'data-id': w.id, onclick: () => play(w) }, h('img', { src: ytThumb(w.id), alt: '', loading: 'lazy' }), h('span', { style: 'font-size:13.5px' }, w.sub)));
    });
    play(c.walks[0]);
  }

  map.querySelectorAll('.pin').forEach(p => {
    p.addEventListener('click', () => pickCity(+p.dataset.i));
    p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') pickCity(+p.dataset.i); });
  });

  const tokyoI = cities.findIndex(c => c.city === 'Tokyo');
  const random = h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px' },
    h('button', { class: 'btn', style: 'background:#9fd6ff;color:#0a1220', onclick: () => pickCity(tokyoI) }, 'Tokyo in the rain'),
    h('button', { class: 'btn ghost', onclick: () => pickCity(Math.floor(Math.random() * cities.length)) }, 'Surprise me'),
  );

  body.append(h('div', { class: 'bench-grid' },
    h('div', {}, map, random, list),
    h('div', {}, win, label),
  ));
}
