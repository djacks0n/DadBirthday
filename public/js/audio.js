// all the sounds are made in code, no audio files
let ctx, master, rainGain, rainFilter, started = false, muted = false, intensity = 1;

function noiseBuffer(seconds = 4) {
  const len = ctx.sampleRate * seconds;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02; // brownish
      d[i] = w * 0.5 + last * 3;
    }
  }
  return buf;
}

export function startAudio(isMuted) {
  muted = isMuted;
  if (started) return;
  started = true;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.8;
  master.connect(ctx.destination);

  // steady rain: filtered noise
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  src.loop = true;
  rainFilter = ctx.createBiquadFilter();
  rainFilter.type = 'lowpass';
  rainFilter.frequency.value = 2400;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 250;
  rainGain = ctx.createGain();
  rainGain.gain.value = 0.2 * intensity;
  src.connect(hp).connect(rainFilter).connect(rainGain).connect(master);
  src.start();

  // drips off awnings
  const drip = () => {
    if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    const f = 900 + Math.random() * 1600;
    o.frequency.setValueAtTime(f, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(f * 0.4, ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.04, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    const pan = ctx.createStereoPanner(); pan.pan.value = Math.random() * 2 - 1;
    o.connect(g).connect(pan).connect(master);
    o.start(); o.stop(ctx.currentTime + 0.15);
    setTimeout(drip, 120 + Math.random() * 900);
  };
  drip();

  // a train going by far away every so often
  const train = () => {
    if (!ctx) return;
    const s = ctx.createBufferSource(); s.buffer = noiseBuffer(9);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 3.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 8.5);
    // clack clack
    const lfo = ctx.createOscillator(); lfo.frequency.value = 3.2;
    const lg = ctx.createGain(); lg.gain.value = 0.25;
    lfo.connect(lg).connect(g.gain);
    s.connect(f).connect(g).connect(master);
    s.start(t); s.stop(t + 9); lfo.start(t); lfo.stop(t + 9);
    setTimeout(train, 45000 + Math.random() * 60000);
  };
  setTimeout(train, 12000);
}

export function setMuted(m) {
  muted = m;
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.8, ctx.currentTime, 0.2);
}

export function setRain(v) {
  intensity = v;
  if (rainGain) {
    rainGain.gain.setTargetAtTime(0.12 + 0.12 * v, ctx.currentTime, 0.5);
    rainFilter.frequency.setTargetAtTime(1800 + v * 900, ctx.currentTime, 0.5);
  }
}

// muffle the rain when inside somewhere
export function setInside(inside) {
  if (!rainFilter) return;
  rainFilter.frequency.setTargetAtTime(inside ? 500 : 1800 + intensity * 900, ctx.currentTime, 0.3);
}

// the little two note station chime
export function chime(notes = [659.25, 523.25, 587.33, 392]) {
  if (!ctx || muted) return;
  notes.forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = f;
    const t = ctx.currentTime + i * 0.32;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(g).connect(master); o.start(t); o.stop(t + 1);
  });
}

// door bell when walking into a shop (konbini style)
export function doorBell() {
  chime([739.99, 587.33]);
}

// pins falling
export function crash(n = 10) {
  if (!ctx || muted) return;
  for (let i = 0; i < n; i++) {
    const t = ctx.currentTime + Math.random() * 0.35;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 300 + Math.random() * 500;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g).connect(master); o.start(t); o.stop(t + 0.15);
  }
}

export function rumble(sec = 1.2) {
  if (!ctx || muted) return;
  const s = ctx.createBufferSource(); s.buffer = noiseBuffer(2);
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 120;
  const g = ctx.createGain(); const t = ctx.currentTime;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.6, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + sec);
  s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + sec + 0.1);
}

export function pour() {
  if (!ctx || muted) return;
  const s = ctx.createBufferSource(); s.buffer = noiseBuffer(2);
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 3;
  const g = ctx.createGain(); const t = ctx.currentTime;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  f.frequency.linearRampToValueAtTime(600, t + 1.1);
  s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + 1.2);
}
