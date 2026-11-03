// the shrine: omikuji fortunes, the rack of saved quotes, and the garden behind it
import { h, toast } from './panel.js';
import { QUOTES, FORTUNES } from '../../data/content.js';
import * as S from '../state.js';
import { rand } from '../textures.js';
import { chime } from '../audio.js';

export function buildShrine(body, startTab = 'kuji') {
  const tabs = h('div', { class: 'tabs' });
  const view = h('div');
  const T = [
    ['kuji', 'おみくじ  Draw a fortune'],
    ['rack', 'The rack  (your quotes)'],
    ['garden', '庭  The garden'],
  ];
  function go(id) {
    tabs.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.id === id));
    view.innerHTML = '';
    ({ kuji: drawKuji, rack: drawRack, garden: drawGarden })[id](view);
  }
  T.forEach(([id, label]) => tabs.append(h('button', { class: 'chip', 'data-id': id, onclick: () => go(id) }, label)));
  body.append(tabs, view);
  go(startTab);

  // ---------- omikuji ----------
  function drawKuji(v) {
    const wrap = h('div', { class: 'omikuji' });
    const box = h('button', { class: 'kuji-box', title: 'Shake it' }, 'おみくじ');
    const out = h('div', {}, h('div', { class: 'fortune', style: 'display:grid;place-items:center;text-align:center' },
      h('div', {},
        h('p', { style: 'font-size:18px;margin:0 0 8px' }, 'Shake the box. A stick falls out with a number, and that number gets you a fortune.'),
        h('p', { class: 'note', style: 'margin:0' }, "they're all quotes you'd like. I checked who actually said them."),
      )));
    box.addEventListener('click', () => {
      box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
      setTimeout(() => draw(out), 900);
    });
    wrap.append(h('div', {}, box, h('div', { class: 'kuji-hint' }, 'click to shake')), out);
    v.append(wrap);
  }

  function weightedFortune() {
    const total = FORTUNES.reduce((a, f) => a + f.w, 0);
    let r = Math.random() * total;
    for (const f of FORTUNES) { if ((r -= f.w) < 0) return f; }
    return FORTUNES[0];
  }

  function draw(out) {
    const st = S.get();
    const pool = [...QUOTES, ...st.myQuotes.map(q => ({ ...q, mine: true }))];
    const q = pool[Math.floor(Math.random() * pool.length)];
    const f = weightedFortune();
    const n = 1 + Math.floor(Math.random() * 99);
    const saved = st.savedQuotes.some(s => s.t === q.t);
    const tie = h('button', {
      class: 'btn', style: 'background:#d8341c', onclick: () => {
        if (!S.get().savedQuotes.some(s => s.t === q.t)) S.update(s => s.savedQuotes.push({ t: q.t, who: q.who, src: q.src, date: new Date().toISOString() }));
        tie.disabled = true; tie.textContent = 'Tied to the rack';
        chime([880, 1174.66]);
        toast('Tied it to the rack. The garden grew a little.');
      },
    }, saved ? 'Already on the rack' : 'Tie it to the rack');
    if (saved) tie.disabled = true;
    out.innerHTML = '';
    out.append(h('div', { class: 'fortune' },
      h('div', { class: 'level' }, h('span', { class: 'k' }, f.kanji), h('span', {}, f.en), h('span', { class: 'num' }, `第 ${n} 番 · no. ${n}`)),
      h('blockquote', {}, '"' + q.t + '"'),
      h('div', { class: 'who' }, q.mine ? 'You wrote this one' : [q.who, q.src ? ` · ${q.src}` : ''].join('')),
      f.note ? h('p', { style: 'font-size:14px;margin:0 0 12px' }, f.note) : null,
      h('div', { class: 'row' }, tie, h('button', { class: 'btn ghost', onclick: () => draw(out) }, 'Eh, draw again')),
    ));
  }

  // ---------- rack ----------
  function drawRack(v) {
    const st = S.get();
    v.append(h('p', { style: 'margin:0 0 6px' }, "Every fortune you keep gets tied up here. The first three were already yours."));
    const rack = h('div', { class: 'rack' });
    const r = rand(st.savedQuotes.length + 3);
    st.savedQuotes.slice().reverse().forEach(q => {
      rack.append(h('div', { class: 'strip', style: `--r:${((r() - 0.5) * 3).toFixed(2)}deg` },
        h('button', {
          class: 'untie', title: 'untie it', onclick: () => {
            S.update(s => { s.savedQuotes = s.savedQuotes.filter(x => x.t !== q.t); });
            view.innerHTML = ''; drawRack(view);
          },
        }, '×'),
        q.t,
        h('div', { class: 'who' }, q.who + (q.src ? ` · ${q.src}` : '')),
      ));
    });
    if (!st.savedQuotes.length) rack.append(h('p', { class: 'muted' }, 'Nothing tied up yet.'));
    v.append(rack);
    v.append(h('h3', {}, 'Write your own'));
    v.append(h('p', { style: 'margin:-4px 0 6px;font-size:14px' }, "Got an aphorism of your own? It goes on the rack and into the omikuji box, so you might draw it later."));
    const inp = h('input', { placeholder: 'Something you always say', maxlength: 240 });
    v.append(h('form', {
      class: 'own', onsubmit: e => {
        e.preventDefault();
        const t = inp.value.trim();
        if (!t) return;
        S.update(s => {
          s.myQuotes.push({ t, who: 'Dad', src: '' });
          s.savedQuotes.push({ t, who: 'Dad', src: '', date: new Date().toISOString() });
        });
        view.innerHTML = ''; drawRack(view);
      },
    }, inp, h('button', { class: 'btn', type: 'submit' }, 'Add it')));
  }

  // ---------- garden ----------
  function drawGarden(v) {
    const top = h('div', { class: 'garden-top' });
    const count = h('div', { class: 'count' });
    const water = h('button', { class: 'btn', style: 'background:#2c5a3a' }, 'Water it');
    top.append(h('div', {}, h('div', { style: 'font-size:20px;font-weight:700' }, '"We must cultivate our garden."'), h('div', { class: 'muted', style: 'font-size:13px' }, 'Voltaire, Candide')), h('div', { style: 'text-align:right' }, count, water));
    const wrap = h('div', { class: 'garden-wrap' });
    v.append(top, wrap);
    v.append(h('p', { class: 'note', style: 'margin-top:14px' }, "I planted the first few. it grows when you use the street: log a bottle, keep a fortune, check off a trip, or just come back another day. it never dies so don't stress about it."));

    function render(rain = false) {
      const n = S.gardenCount();
      count.textContent = `${n} things growing`;
      wrap.innerHTML = gardenSVG(n, rain);
    }
    render();
    water.addEventListener('click', () => {
      S.update(s => { s.waterings++; });
      render(true);
      setTimeout(() => render(false), 1600);
      const w = S.get().waterings;
      if (w % 3 === 0) toast('Something new came up.');
    });
  }
}

// draws the garden. same seed every time so plants stay where they are and new ones just get added
function gardenSVG(n, rain) {
  const W = 900, H = 420;
  const r = rand(60);
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  s += `<defs>
    <linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd6d6"/><stop offset="1" stop-color="#e9e6dc"/></linearGradient>
    <radialGradient id="moss" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#5f7d3a"/><stop offset="1" stop-color="#3d5a26"/></radialGradient>
    <pattern id="rake" width="900" height="12" patternUnits="userSpaceOnUse"><path d="M0 6 Q 225 2 450 6 T 900 6" fill="none" stroke="#cfc7b6" stroke-width="2"/></pattern>
  </defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#gsky)"/>`;
  // wall at back
  s += `<rect y="70" width="${W}" height="70" fill="#d9cfbd"/><rect y="62" width="${W}" height="12" fill="#3b3b3b"/>`;
  for (let x = 0; x < W; x += 30) s += `<rect x="${x}" y="58" width="26" height="6" fill="#2b2b2b"/>`;
  // gravel
  s += `<rect y="140" width="${W}" height="${H - 140}" fill="#e8e1d2"/><rect y="140" width="${W}" height="${H - 140}" fill="url(#rake)"/>`;
  // moss islands and big rocks (always there)
  const islands = [[160, 300, 120, 45], [520, 250, 150, 50], [770, 330, 110, 40]];
  islands.forEach(([x, y, rx, ry]) => {
    for (let k = 0; k < 4; k++) s += `<ellipse cx="${x}" cy="${y}" rx="${rx + 14 + k * 12}" ry="${ry + 6 + k * 6}" fill="none" stroke="#d4ccbb" stroke-width="2"/>`;
    s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#moss)"/>`;
  });
  s += `<path d="M480 245 q20 -50 60 -46 q30 6 32 46z" fill="#6c6a64"/><path d="M500 245 q14 -32 38 -36" stroke="#8a8780" stroke-width="3" fill="none"/>`;
  s += `<path d="M135 300 q10 -34 40 -30 q18 6 18 30z" fill="#75726b"/>`;
  // stepping stones
  [[90, 380], [180, 370], [270, 384], [360, 372], [450, 386]].forEach(([x, y]) => s += `<ellipse cx="${x}" cy="${y}" rx="30" ry="11" fill="#9a968d"/>`);

  // spots where things can grow, picked in order so the garden fills up over time
  const spots = [];
  for (let i = 0; i < 160; i++) {
    const isl = islands[i % 3];
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    if (i % 5 === 4) spots.push([60 + r() * 780, 150 + r() * 30, 'back']);
    else spots.push([isl[0] + Math.cos(a) * isl[2] * 0.85 * d, isl[1] + Math.sin(a) * isl[3] * 0.8 * d, 'moss']);
  }
  const items = spots.slice(0, Math.min(n, spots.length)).map((p, i) => ({ x: p[0], y: p[1], where: p[2], kind: kindFor(i, p[2], r), r2: r() }));
  items.sort((a, b) => a.y - b.y);
  for (const it of items) s += plant(it);
  if (n > spots.length) s += `<text x="${W - 16}" y="${H - 14}" text-anchor="end" font-size="16" fill="#6a6255" font-family="Caveat, cursive">and ${n - spots.length} more you can't see from here</text>`;
  if (rain) {
    s += `<g opacity=".55">`;
    for (let i = 0; i < 90; i++) { const x = Math.random() * W, y = Math.random() * H; s += `<line x1="${x}" y1="${y}" x2="${x - 4}" y2="${y + 18}" stroke="#7f98b0" stroke-width="1.6"><animate attributeName="y1" from="${y - 60}" to="${y + 60}" dur=".5s" repeatCount="indefinite"/><animate attributeName="y2" from="${y - 42}" to="${y + 78}" dur=".5s" repeatCount="indefinite"/></line>`; }
    s += `</g>`;
  }
  s += `</svg>`;
  return s;
}

function kindFor(i, where, r) {
  if (where === 'back') return ['bamboo', 'maple', 'pine', 'bamboo', 'lantern'][i % 5];
  return ['fern', 'hydrangea', 'azalea', 'grass', 'fern', 'iris', 'bonsai', 'mushroom', 'hydrangea'][Math.floor(r() * 9)];
}

function plant({ x, y, kind, r2 }) {
  const sc = 0.8 + r2 * 0.5;
  const g = (inner) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${sc.toFixed(2)})">${inner}</g>`;
  switch (kind) {
    case 'fern': return g(`<path d="M0 0 q-14 -20 -26 -22 M0 0 q14 -22 28 -20 M0 0 q-4 -26 -2 -36 M0 0 q6 -24 10 -32" stroke="#2f6a2a" stroke-width="4" fill="none" stroke-linecap="round"/>`);
    case 'grass': return g(`<path d="M-8 0 q-2 -14 -8 -22 M0 0 q0 -16 2 -26 M8 0 q4 -12 10 -18" stroke="#4e7a2e" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
    case 'hydrangea': {
      const c = ['#7b8fd8', '#a37fd0', '#6fa6d8', '#d38fbf'][Math.floor(r2 * 4)];
      return g(`<path d="M0 0 v-14" stroke="#3a5a2a" stroke-width="3"/><ellipse cx="-10" cy="-8" rx="9" ry="5" fill="#3d6a2c"/><ellipse cx="10" cy="-8" rx="9" ry="5" fill="#3d6a2c"/>` +
        Array.from({ length: 9 }, (_, k) => `<circle cx="${(Math.cos(k * 0.7) * 8).toFixed(1)}" cy="${(-22 + Math.sin(k * 1.3) * 6).toFixed(1)}" r="5" fill="${c}" opacity=".9"/>`).join(''));
    }
    case 'azalea': return g(`<ellipse cx="0" cy="-10" rx="20" ry="12" fill="#3f6a2e"/>` + Array.from({ length: 7 }, (_, k) => `<circle cx="${(-14 + k * 4.5).toFixed(1)}" cy="${(-14 + Math.sin(k * 2) * 5).toFixed(1)}" r="3.2" fill="#e65a8a"/>`).join(''));
    case 'iris': return g(`<path d="M0 0 v-30 M-6 0 q-2 -18 -6 -24 M6 0 q2 -18 6 -24" stroke="#3a6a2a" stroke-width="2.5" fill="none"/><path d="M0 -30 q-8 -6 -3 -12 q3 4 3 4 q0 0 3 -4 q5 6 -3 12z" fill="#5a4ac0"/>`);
    case 'bonsai': return g(`<rect x="-14" y="-6" width="28" height="8" fill="#5a3a22"/><path d="M0 -6 q-4 -14 6 -22" stroke="#4a3020" stroke-width="4" fill="none"/><ellipse cx="-6" cy="-28" rx="14" ry="7" fill="#2e5a2a"/><ellipse cx="12" cy="-24" rx="10" ry="6" fill="#36632e"/>`);
    case 'mushroom': return g(`<rect x="-2" y="-8" width="4" height="8" fill="#eee"/><path d="M-8 -8 q8 -10 16 0z" fill="#c0503a"/>`);
    case 'bamboo': return g(Array.from({ length: 3 }, (_, k) => `<g transform="translate(${k * 9 - 9},0)"><rect x="-2.5" y="-120" width="5" height="120" fill="#6f9a4a"/>${[30, 60, 90].map(yy => `<rect x="-3" y="${-yy}" width="6" height="2" fill="#4f7a32"/>`).join('')}<path d="M0 -100 q14 -6 22 -2 M0 -70 q-14 -6 -20 0" stroke="#5f8a3a" stroke-width="3" fill="none"/></g>`).join(''));
    case 'maple': return g(`<rect x="-3" y="-70" width="6" height="70" fill="#4a3020"/><circle cx="0" cy="-80" r="30" fill="#c8402a" opacity=".92"/><circle cx="-20" cy="-66" r="18" fill="#d8582a" opacity=".9"/><circle cx="22" cy="-70" r="20" fill="#b8301e" opacity=".9"/>`);
    case 'pine': return g(`<path d="M0 0 q-6 -40 4 -80" stroke="#3a2a1a" stroke-width="6" fill="none"/><ellipse cx="-14" cy="-52" rx="24" ry="8" fill="#24442a"/><ellipse cx="14" cy="-70" rx="22" ry="7" fill="#2a4a2e"/><ellipse cx="0" cy="-86" rx="16" ry="7" fill="#24442a"/>`);
    case 'lantern': return g(`<rect x="-5" y="-30" width="10" height="30" fill="#8b877f"/><rect x="-12" y="-44" width="24" height="14" fill="#8b877f"/><rect x="-6" y="-41" width="12" height="8" fill="#ffcf7a"/><path d="M-16 -44 l16 -10 l16 10z" fill="#77736b"/>`);
  }
  return '';
}
