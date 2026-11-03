// canvas-drawn textures so the whole street needs zero image files
import * as THREE from 'three';

export function rand(seed) {
  // tiny seeded random so the street looks the same every visit
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const JP_FONT = '"Hiragino Sans","Yu Gothic","Noto Sans JP","Noto Sans CJK JP","Meiryo",sans-serif';

// neon / lit sign. vertical signs stack characters top to bottom like real ones
export function signTexture({ text, sub = '', color = '#ff3b6b', bg = '#120b14', vertical = false, w = 512, h = 160, border = true, font = JP_FONT }) {
  const [c, g] = canvas(w, h);
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  if (border) {
    g.strokeStyle = color;
    g.lineWidth = Math.max(4, Math.min(w, h) * 0.04);
    g.shadowColor = color; g.shadowBlur = 18;
    g.strokeRect(g.lineWidth, g.lineWidth, w - g.lineWidth * 2, h - g.lineWidth * 2);
  }
  g.fillStyle = color;
  g.shadowColor = color;
  g.shadowBlur = 24;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  if (vertical) {
    const chars = [...text];
    const step = (h - (sub ? h * 0.12 : 0) - w * 0.3) / chars.length;
    const size = Math.min(w * 0.7, step * 0.92);
    g.font = `700 ${size}px ${font}`;
    chars.forEach((ch, i) => g.fillText(ch, w / 2, w * 0.15 + step * (i + 0.5)));
    if (sub) {
      g.font = `600 ${w * 0.16}px "Courier New", monospace`;
      g.fillText(sub, w / 2, h - h * 0.06);
    }
  } else {
    const size = sub ? h * 0.48 : h * 0.6;
    g.font = `700 ${size}px ${font}`;
    let tw = g.measureText(text).width;
    if (tw > w * 0.88) g.font = `700 ${size * (w * 0.88) / tw}px ${font}`;
    g.fillText(text, w / 2, sub ? h * 0.4 : h / 2);
    if (sub) {
      g.font = `600 ${h * 0.2}px "Courier New", monospace`;
      g.fillText(sub, w / 2, h * 0.78);
    }
  }
  return tex(c);
}

// building facade windows. returns color + emissive maps
export function windowTextures(seed, cols, rows, litChance) {
  const r = rand(seed);
  const cw = 64, ch = 64;
  const [c, g] = canvas(cols * cw, rows * ch);
  const [e, ge] = canvas(cols * cw, rows * ch);
  const wallTones = ['#2a2b30', '#33302e', '#2b3036', '#3a3633', '#26292e'];
  g.fillStyle = wallTones[Math.floor(r() * wallTones.length)];
  g.fillRect(0, 0, c.width, c.height);
  ge.fillStyle = '#000';
  ge.fillRect(0, 0, e.width, e.height);
  // grime streaks
  for (let i = 0; i < cols * 3; i++) {
    g.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.1})`;
    g.fillRect(r() * c.width, 0, 2 + r() * 6, c.height);
  }
  const warm = ['#ffd9a0', '#ffe7c2', '#fff2d8', '#cfe6ff', '#ffc98a', '#d8f0ff'];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = x * cw + 10, py = y * ch + 12, pw = cw - 20, ph = ch - 22;
      g.fillStyle = '#101216';
      g.fillRect(px, py, pw, ph);
      if (r() < litChance) {
        const col = warm[Math.floor(r() * warm.length)];
        ge.fillStyle = col;
        ge.globalAlpha = 0.35 + r() * 0.5;
        ge.fillRect(px, py, pw, ph);
        // blinds
        if (r() < 0.5) {
          ge.globalAlpha = 0.5;
          ge.fillStyle = '#000';
          for (let b = 0; b < ph; b += 5) ge.fillRect(px, py + b, pw, 2);
        }
        ge.globalAlpha = 1;
        g.fillStyle = '#2c2a26';
        g.fillRect(px, py, pw, ph);
      }
      // ledge
      g.fillStyle = 'rgba(255,255,255,0.05)';
      g.fillRect(px - 4, py + ph + 2, pw + 8, 3);
    }
  }
  // AC units, very japan
  for (let i = 0; i < cols; i++) {
    if (r() < 0.35) {
      const x = Math.floor(r() * cols) * cw + 18, y = Math.floor(r() * rows) * ch + ch - 18;
      g.fillStyle = '#8d9093';
      g.fillRect(x, y, 28, 14);
      g.fillStyle = '#555';
      g.beginPath(); g.arc(x + 9, y + 7, 5, 0, 7); g.fill();
    }
  }
  const map = tex(c), em = tex(e);
  return { map, emissiveMap: em };
}

// vending machine front
export function vendingTexture(seed, color) {
  const r = rand(seed);
  const [c, g] = canvas(256, 512);
  g.fillStyle = color; g.fillRect(0, 0, 256, 512);
  g.fillStyle = '#e9f4ff'; g.fillRect(16, 20, 224, 300);
  const cans = ['#d33', '#36c', '#f90', '#2a8', '#ccc', '#a3c', '#fd3', '#333', '#7cf'];
  for (let row = 0; row < 5; row++) {
    for (let k = 0; k < 6; k++) {
      g.fillStyle = cans[Math.floor(r() * cans.length)];
      g.fillRect(26 + k * 36, 32 + row * 58, 24, 40);
      g.fillStyle = '#fff'; g.fillRect(26 + k * 36, 32 + row * 58 + 10, 24, 6);
      g.fillStyle = r() < 0.3 ? '#e22' : '#29f';
      g.fillRect(28 + k * 36, 32 + row * 58 + 46, 20, 5);
    }
  }
  g.fillStyle = '#111'; g.fillRect(40, 400, 176, 60);
  g.fillStyle = '#222'; g.fillRect(190, 340, 40, 40);
  return tex(c);
}

// wet road: color map with lines and crosswalks, plus alpha map where puddles let reflections through
export function roadTextures(length, width) {
  const scale = 16; // px per meter
  const W = Math.round(width * scale), H = Math.round(length * scale);
  const [c, g] = canvas(W, H);
  const [a, ga] = canvas(W, H);
  const r = rand(60);
  g.fillStyle = '#17181b'; g.fillRect(0, 0, W, H);
  // asphalt noise
  for (let i = 0; i < W * H * 0.02; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},${r() * 0.06})`;
    g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2);
  }
  // patches
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(0,0,0,${0.1 + r() * 0.15})`;
    g.fillRect(r() * W, r() * H, 10 + r() * 60, 10 + r() * 90);
  }
  // edge lines + center dashes
  g.fillStyle = '#d8d8d0';
  g.fillRect(6, 0, 4, H); g.fillRect(W - 10, 0, 4, H);
  g.fillStyle = '#e8c35a';
  for (let y = 0; y < H; y += 80) g.fillRect(W / 2 - 2, y, 4, 44);
  // crosswalks
  const cross = [12, 54, 92];
  g.fillStyle = '#dcdcd4';
  cross.forEach(m => {
    const y = H - m * scale;
    for (let x = 14; x < W - 14; x += 20) g.fillRect(x, y, 11, 3 * scale);
  });
  // "止まれ" stop text painted on road
  g.save();
  g.translate(W * 0.75, H - 40 * scale); g.rotate(Math.PI);
  g.font = `900 ${scale * 1.4}px ${JP_FONT}`; g.fillStyle = 'rgba(230,230,230,0.8)'; g.textAlign = 'center';
  g.fillText('止まれ', 0, 0);
  g.restore();

  // alpha: mostly fairly opaque, puddles see-through
  ga.fillStyle = 'rgb(232,232,232)'; ga.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) {
    const x = r() * W, y = r() * H, rx = 10 + r() * 50, ry = 8 + r() * 70;
    const grd = ga.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    grd.addColorStop(0, 'rgba(25,25,25,1)');
    grd.addColorStop(0.7, 'rgba(60,60,60,0.9)');
    grd.addColorStop(1, 'rgba(232,232,232,0)');
    ga.fillStyle = grd;
    ga.beginPath(); ga.ellipse(x, y, rx, ry, r() * 3, 0, 7); ga.fill();
  }
  // gutters along the curbs collect water
  const grd2 = ga.createLinearGradient(0, 0, W, 0);
  grd2.addColorStop(0, 'rgba(30,30,30,1)'); grd2.addColorStop(0.12, 'rgba(232,232,232,0)');
  grd2.addColorStop(0.88, 'rgba(232,232,232,0)'); grd2.addColorStop(1, 'rgba(30,30,30,1)');
  ga.fillStyle = grd2; ga.fillRect(0, 0, W, H);
  return { map: tex(c), alphaMap: tex(a, false) };
}

export function sidewalkTexture() {
  const [c, g] = canvas(256, 256);
  g.fillStyle = '#3b3a38'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#2a2927'; g.lineWidth = 3;
  for (let i = 0; i <= 256; i += 64) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke();
  }
  // tactile paving strip (yellow bumps) on one side
  g.fillStyle = '#b8962a'; g.fillRect(180, 0, 52, 256);
  g.fillStyle = '#d4b03a';
  for (let y = 6; y < 256; y += 12) for (let x = 186; x < 232; x += 12) { g.beginPath(); g.arc(x, y, 3.5, 0, 7); g.fill(); }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function noren(color, text) {
  // the cloth curtain hanging over shop doors
  const [c, g] = canvas(512, 256);
  g.fillStyle = color; g.fillRect(0, 0, 512, 256);
  g.fillStyle = 'rgba(0,0,0,0.25)';
  for (let x = 128; x < 512; x += 128) g.fillRect(x - 2, 40, 4, 216);
  g.fillStyle = '#f4efe6';
  g.font = `700 120px ${JP_FONT}`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  [...text].forEach((ch, i, arr) => g.fillText(ch, (512 / arr.length) * (i + 0.5), 140));
  return tex(c);
}

// lit shop window with frames, a counter, and a couple people sitting at it
export function shopWindowTexture(seed, tint = '#ffd59a', people = true) {
  const r = rand(seed);
  const [c, g] = canvas(512, 256);
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, tint); grd.addColorStop(1, '#5a3a20');
  g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
  // back wall menu boards
  for (let i = 0; i < 6; i++) {
    g.fillStyle = r() < 0.5 ? '#fff6e0' : '#f0d8a8';
    g.fillRect(30 + i * 78, 30, 60, 40);
    g.fillStyle = '#3a2410';
    g.font = `700 16px ${JP_FONT}`;
    g.fillText(['ラ', '餃', '酒', '丼', '茶', '麺', '焼'][Math.floor(r() * 7)], 52 + i * 78, 56);
  }
  // hanging lamps
  for (let i = 0; i < 4; i++) {
    const x = 70 + i * 120;
    g.fillStyle = '#2a1a0a'; g.fillRect(x, 0, 2, 70);
    g.fillStyle = '#fff2c0'; g.beginPath(); g.arc(x + 1, 76, 12, Math.PI, 0); g.fill();
  }
  // counter
  g.fillStyle = '#4a2a14'; g.fillRect(0, 170, 512, 20);
  g.fillStyle = '#2a170a'; g.fillRect(0, 190, 512, 66);
  // people at the counter (backs to us)
  if (people) {
    const n = 1 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const x = 60 + r() * 390;
      g.fillStyle = '#1a120c';
      g.beginPath(); g.arc(x, 120, 17, 0, 7); g.fill();
      g.beginPath(); g.ellipse(x, 175, 30, 42, 0, Math.PI, 0); g.fill();
    }
  }
  // window frames
  g.fillStyle = '#16100a';
  for (let x = 0; x <= 512; x += 128) g.fillRect(x - 5, 0, 10, 256);
  g.fillRect(0, 0, 512, 8); g.fillRect(0, 248, 512, 8);
  // fog on the glass
  g.fillStyle = 'rgba(255,255,255,0.07)';
  for (let i = 0; i < 40; i++) g.fillRect(r() * 512, r() * 256, 2, 10 + r() * 30);
  return tex(c);
}

// what's playing on the gear shop TVs: a tent in the rain, basically
export function tvTexture(seed) {
  const r = rand(seed);
  const [c, g] = canvas(256, 160);
  const sky = g.createLinearGradient(0, 0, 0, 160);
  const night = r() < 0.5;
  sky.addColorStop(0, night ? '#0c1620' : '#6a7a80'); sky.addColorStop(1, night ? '#1c2a22' : '#3a4a3a');
  g.fillStyle = sky; g.fillRect(0, 0, 256, 160);
  g.fillStyle = night ? '#0a120c' : '#24382a';
  for (let i = 0; i < 9; i++) { const x = r() * 256, h = 60 + r() * 70; g.beginPath(); g.moveTo(x - 18, 130); g.lineTo(x, 130 - h); g.lineTo(x + 18, 130); g.fill(); }
  g.fillStyle = night ? '#1a2418' : '#3a4a30'; g.fillRect(0, 128, 256, 32);
  const tx = 70 + r() * 110;
  g.fillStyle = ['#d86a2a', '#2a7a4a', '#c8b040', '#3a5aa8'][Math.floor(r() * 4)];
  g.beginPath(); g.moveTo(tx - 40, 140); g.lineTo(tx, 92); g.lineTo(tx + 40, 140); g.fill();
  if (night) { g.fillStyle = 'rgba(255,200,120,.8)'; g.beginPath(); g.moveTo(tx - 12, 140); g.lineTo(tx, 112); g.lineTo(tx + 12, 140); g.fill(); }
  g.strokeStyle = 'rgba(200,220,240,.35)'; g.lineWidth = 1;
  for (let i = 0; i < 70; i++) { const x = r() * 256, y = r() * 160; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 12); g.stroke(); }
  return tex(c);
}

// inside the konbini: shelves and fridges full of stuff
export function konbiniTexture() {
  const r = rand(24);
  const [c, g] = canvas(1024, 384);
  g.fillStyle = '#eef3f6'; g.fillRect(0, 0, 1024, 384);
  g.fillStyle = '#ffffff'; for (let x = 40; x < 1024; x += 160) g.fillRect(x, 10, 110, 8);
  // fridges at the back
  for (let i = 0; i < 6; i++) {
    const x = 20 + i * 165;
    g.fillStyle = '#c9d6de'; g.fillRect(x, 40, 150, 150);
    for (let row = 0; row < 4; row++) for (let k = 0; k < 7; k++) {
      g.fillStyle = ['#e33', '#39f', '#fb2', '#2b6', '#eee', '#a3c', '#f80', '#333'][Math.floor(r() * 8)];
      g.fillRect(x + 8 + k * 20, 50 + row * 36, 14, 26);
    }
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x, 40, 150, 150);
  }
  // shelves in front
  for (let i = 0; i < 4; i++) {
    const x = 30 + i * 250;
    g.fillStyle = '#b8c0c6'; g.fillRect(x, 220, 200, 164);
    for (let row = 0; row < 3; row++) for (let k = 0; k < 9; k++) {
      g.fillStyle = ['#e85', '#fd5', '#7c5', '#f6a', '#69f', '#fff', '#c84'][Math.floor(r() * 7)];
      g.fillRect(x + 6 + k * 21, 230 + row * 50, 16, 34);
    }
  }
  // person reading a magazine by the window, a classic
  g.fillStyle = '#2a2f36'; g.beginPath(); g.arc(880, 250, 18, 0, 7); g.fill();
  g.beginPath(); g.ellipse(880, 330, 30, 64, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#ffffff'; g.fillRect(845, 286, 34, 26);
  return tex(c);
}

export function departureTexture() {
  const [c, g] = canvas(512, 128);
  g.fillStyle = '#050505'; g.fillRect(0, 0, 512, 128);
  g.fillStyle = '#ffb000'; g.font = `700 40px ${JP_FONT}`;
  g.fillText('発車 DEPARTURES', 20, 50);
  g.fillStyle = '#7dff7a'; g.font = '600 30px "Courier New", monospace';
  g.fillText('NISEKO    HAKUBA    ZAO', 20, 100);
  return tex(c);
}
