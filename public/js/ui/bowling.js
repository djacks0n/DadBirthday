// the bowling alley. one lane, one ball, very sharp
import { h, toast } from './panel.js';
import * as S from '../state.js';
import { crash, rumble } from '../audio.js';

const LINES = {
  10: ['Strike.'],
  hi: ['Close.'],
  mid: ['Eh.'],
  lo: ['Warmup.'],
  0: ['Gutter. Sharp as a bowling ball.'],
};
const pickLine = a => a[Math.floor(Math.random() * a.length)];

export function buildBowling(body) {
  const st = S.get();
  const canvas = h('canvas', { id: 'lane', width: 360, height: 600 });
  const score = h('div', { class: 'score-big' }, '-');
  const msg = h('div', { style: 'font-size:17px;min-height:48px' }, 'Aim with the mouse, click to throw.');
  const best = h('div', { style: 'font-size:14px;opacity:.8' });
  const updBest = () => { const b = S.get().bowling; best.textContent = `Best: ${b.best} · Throws: ${b.games}`; };
  updBest();

  const side = h('div', {},
    h('div', { class: 'ball-rack' },
      h('div', { class: 'ball', style: 'background:radial-gradient(circle at 35% 30%, #ff9ad8, #c0207a 55%, #4a0830)' }, h('span', { class: 'tagb' }, 'sharpest one here')),
    ),
    h('div', { style: 'margin-top:34px' }, score, msg, best),
  );
  body.append(h('div', { class: 'lane-wrap' }, canvas, side));

  const g = canvas.getContext('2d');
  const W = 360, H = 600, LANE_L = 70, LANE_R = 290, PIN_R = 9, BALL_R = 14;
  let aimX = W / 2, ball = null, pins = [], done = false, raf, settleT = 0;

  function rack() {
    pins = [];
    const cx = W / 2, top = 70, dx = 26, dy = 24;
    for (let row = 0; row < 4; row++) for (let i = 0; i <= row; i++) {
      pins.push({ x: cx + (i - row / 2) * dx * 1.0, y: top + (3 - row) * dy, vx: 0, vy: 0, down: false, rot: 0 });
    }
  }
  rack();

  function draw() {
    g.clearRect(0, 0, W, H);
    // gutters and lane
    g.fillStyle = '#1a0a20'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#3a3a3e'; g.fillRect(LANE_L - 22, 0, 22, H); g.fillRect(LANE_R, 0, 22, H);
    const wood = g.createLinearGradient(LANE_L, 0, LANE_R, 0);
    wood.addColorStop(0, '#c99a5a'); wood.addColorStop(0.5, '#ddb070'); wood.addColorStop(1, '#c99a5a');
    g.fillStyle = wood; g.fillRect(LANE_L, 0, LANE_R - LANE_L, H);
    g.strokeStyle = 'rgba(120,70,30,.25)';
    for (let x = LANE_L; x < LANE_R; x += 11) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    // arrows
    g.fillStyle = '#7a3a12';
    for (let i = 0; i < 7; i++) { const x = LANE_L + 20 + i * 30, y = 380 - Math.abs(i - 3) * 14; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 5, y + 12); g.lineTo(x + 5, y + 12); g.fill(); }
    // foul line
    g.fillStyle = '#300'; g.fillRect(LANE_L, H - 90, LANE_R - LANE_L, 3);
    // pins
    for (const p of pins) {
      g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
      if (p.down) g.scale(1, 0.55);
      g.fillStyle = p.down ? '#d8d2c8' : '#fbf8f2';
      g.beginPath(); g.arc(0, 0, PIN_R, 0, 7); g.fill();
      g.strokeStyle = '#d0202a'; g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, PIN_R * 0.55, 0, 7); g.stroke();
      g.restore();
    }
    // aim guide / ball
    const bx = ball ? ball.x : aimX, by = ball ? ball.y : H - 50;
    if (!ball && !done) {
      g.setLineDash([6, 8]); g.strokeStyle = 'rgba(255,95,200,.6)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(aimX, H - 50); g.lineTo(aimX, 60); g.stroke(); g.setLineDash([]);
    }
    const grd = g.createRadialGradient(bx - 4, by - 5, 2, bx, by, BALL_R);
    grd.addColorStop(0, '#ffb0e0'); grd.addColorStop(0.6, '#c0207a'); grd.addColorStop(1, '#4a0830');
    g.fillStyle = grd; g.beginPath(); g.arc(bx, by, BALL_R, 0, 7); g.fill();
    // rain on the window above the lane, it's that kind of place
    g.fillStyle = 'rgba(255,255,255,.05)';
    for (let i = 0; i < 20; i++) g.fillRect(Math.random() * W, Math.random() * 40, 1, 8);
  }

  let last = performance.now();
  function step(now = performance.now()) {
    const f = Math.min(3, (now - last) / 16.67); // so it plays the same speed on any computer
    last = now;
    if (ball) {
      ball.y += ball.vy * f; ball.x += ball.vx * f;
      ball.vx += ball.hook * f;
      const inGutter = ball.x < LANE_L || ball.x > LANE_R;
      if (inGutter) { ball.vx = 0; ball.x = ball.x < LANE_L ? LANE_L - 11 : LANE_R + 11; ball.gutter = true; }
      for (const p of pins) {
        const dx = p.x - ball.x, dy = p.y - ball.y, d = Math.hypot(dx, dy);
        if (!ball.gutter && d < PIN_R + BALL_R) {
          if (!p.down && !ball.loud) { ball.loud = true; crash(8); }
          p.down = true;
          const k = 7 / (d || 1);
          p.vx += dx * k * 0.5 + ball.vx; p.vy += dy * k * 0.5 + ball.vy * 0.6;
          ball.vx -= dx * 0.004; // ball deflects a bit
        }
      }
      if (ball.y < -30) { ball = null; settleT = 0.9; }
    }
    // pins knocking pins
    for (const p of pins) {
      if (!p.down) continue;
      p.x += p.vx * f; p.y += p.vy * f; p.rot += p.vx * 0.05 * f;
      const damp = Math.pow(0.93, f);
      p.vx *= damp; p.vy *= damp;
      for (const q of pins) {
        if (q === p || q.down) continue;
        const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
        const speed = Math.hypot(p.vx, p.vy);
        if (d < PIN_R * 2.1 && speed > 0.6) {
          q.down = true;
          q.vx = (dx / d) * speed * 0.8 + p.vx * 0.2; q.vy = (dy / d) * speed * 0.8 + p.vy * 0.2;
          crash(2);
        }
      }
    }
    if (!ball && settleT > 0) { settleT -= f / 60; if (settleT <= 0) { settleT = 0; finish(); } }
    draw();
    raf = requestAnimationFrame(step);
  }

  function finish() {
    const n = pins.filter(p => p.down).length;
    score.textContent = n === 10 ? 'X' : String(n);
    const line = n === 10 ? LINES[10] : n >= 7 ? LINES.hi : n >= 4 ? LINES.mid : n > 0 ? LINES.lo : LINES[0];
    msg.textContent = pickLine(line);
    S.update(s => { s.bowling.games++; if (n > s.bowling.best) s.bowling.best = n; });
    updBest();
    done = true;
    msg.append(h('div', { style: 'font-size:13px;opacity:.7;margin-top:4px' }, 'click to go again'));
  }

  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    aimX = Math.max(LANE_L - 8, Math.min(LANE_R + 8, (e.clientX - r.left) * (W / r.width)));
  });
  canvas.addEventListener('click', () => {
    if (done) { done = false; rack(); score.textContent = '-'; msg.textContent = ''; return; }
    if (ball || settleT) return;
    const hook = (Math.random() - 0.5) * 0.03 + (aimX - W / 2) * -0.00012;
    ball = { x: aimX, y: H - 50, vx: (Math.random() - 0.5) * 0.4, vy: -9.5, hook };
    rumble(1.6);
  });

  draw();
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
