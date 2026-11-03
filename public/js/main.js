// Amaoto Street (雨音通り, "rain sound street"). made for dad's 60th
import * as THREE from 'three';
import { EffectComposer } from '../vendor/three/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/three/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/three/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/three/jsm/postprocessing/OutputPass.js';

import * as S from './state.js';
import { buildStreet } from './street.js';
import { makeRain } from './rain.js';
import { makePeople } from './people.js';
import { makeControls } from './controls.js';
import { nightAmount, isLateNight, applySky, realWeather } from './sky.js';
import { startAudio, setMuted as audioMute, setRain, setInside, doorBell } from './audio.js';
import { openPanel, isOpen } from './ui/panel.js';
import { buildBar } from './ui/bar.js';
import { buildShrine } from './ui/shrine.js';
import { buildGear } from './ui/gear.js';
import { buildBench } from './ui/bench.js';
import { buildStation } from './ui/station.js';
import { buildKonbini } from './ui/konbini.js';
import { buildBowling } from './ui/bowling.js';
import { buildLantern } from './ui/lantern.js';
import { BIRTHDAY } from '../data/content.js';

if (new URLSearchParams(location.search).has('reset')) {
  S.resetAll();
  history.replaceState(null, '', location.pathname);
}

// ---------- renderer + scene ----------
const canvas = document.getElementById('street');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0f1b, 0.03);
scene.background = new THREE.Color(0x0a0f1b);
const camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, 0.1, 220);
const hemi = new THREE.HemisphereLight(0x334466, 0x0a0a10, 0.4);
scene.add(hemi);

const world = buildStreet(scene, renderer);
const rain = makeRain(scene);
const people = makePeople(scene, 18);
const controls = makeControls(camera, canvas);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.8, 0.55, 0.72);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- shops ----------
const SHOPS = {
  station: { theme: 'station', jp: '雨音駅', en: 'Amaoto Station', build: buildStation },
  bar: { theme: 'bar', jp: 'バー 雨音', en: 'Bar Amaoto', build: buildBar },
  gear: { theme: 'gear', jp: '山道具', en: 'Mountain gear', build: buildGear },
  shrine: { theme: 'shrine', jp: '神社', en: 'Shrine and garden', build: buildShrine },
  konbini: { theme: 'konbini', jp: 'コンビニ', en: 'Open 24 hours', build: b => buildKonbini(b, app) },
  bench: { theme: 'bench', jp: 'ベンチ', en: 'Rain walks', build: buildBench },
  bowling: { theme: 'bowling', jp: 'ボウリング', en: 'Bowling', build: buildBowling },
  lantern: { theme: 'lantern', jp: '祝 六十', en: 'Happy birthday', build: buildLantern },
};
const ORDER = ['station', 'bar', 'gear', 'shrine', 'konbini', 'bench', 'bowling', 'lantern'];
const shopById = Object.fromEntries(world.shops.map(s => [s.id, s]));

function enterShop(id) {
  const def = SHOPS[id];
  if (!def || isOpen()) return;
  controls.enabled = false;
  controls.cancelAuto();
  setInside(true);
  if (id !== 'station') doorBell();
  document.getElementById('prompt').classList.add('hidden');
  openPanel({
    theme: def.theme, jpTitle: def.jp, enTitle: def.en, build: def.build,
    closed: () => {
      controls.enabled = true;
      setInside(false);
      // turn back toward the street a little
      const s = shopById[id];
      controls.lookAtPoint(new THREE.Vector3(0, 1.6, s.door.z - 12), 2.5);
      canvas.focus?.();
    },
  });
}

function goTo(id) {
  const s = shopById[id];
  if (!s || isOpen()) return;
  controls.walkTo(s.door, s.face, () => enterShop(id));
}

// bottom buttons
const nav = document.getElementById('places');
ORDER.forEach(id => {
  const b = document.createElement('button');
  b.innerHTML = `<span class="jp">${SHOPS[id].jp.split(' ')[0]}</span><span class="en">${{ station: 'Station', bar: 'Bar', gear: 'Gear shop', shrine: 'Shrine', konbini: 'Konbini', bench: 'Bench', bowling: 'Bowling', lantern: 'Lantern' }[id]}</span>`;
  b.addEventListener('click', () => goTo(id));
  nav.append(b);
});

// clicking on stuff in the street
const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const hits = world.shops.map(s => s.hit);
function shopUnder(e) {
  mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(hits, false)[0];
  return hit && hit.distance < 60 ? hit.object.userData.shop : null;
}
canvas.addEventListener('pointerup', e => {
  if (controls.wasDrag || isOpen() || !started) return;
  const id = shopUnder(e);
  if (id) goTo(id);
});
canvas.addEventListener('pointermove', e => {
  if (e.buttons || !started) return;
  canvas.classList.toggle('pointing', !!shopUnder(e));
});

// walking up close to a door
const prompt = document.getElementById('prompt');
let nearShop = null;
function checkNear() {
  const p = controls.pos;
  let best = null, bd = 3.4;
  for (const s of world.shops) {
    const d = Math.hypot(p.x - s.door.x, p.z - s.door.z);
    if (d < bd) { bd = d; best = s; }
  }
  if (best !== nearShop) {
    nearShop = best;
    if (best && !isOpen() && !controls.autoWalking) {
      prompt.innerHTML = `Press <kbd>E</kbd> or click to go into <b>${best.name}</b>`;
      prompt.classList.remove('hidden');
    } else prompt.classList.add('hidden');
  }
}
addEventListener('keydown', e => {
  if ((e.code === 'KeyE' || e.code === 'Enter') && nearShop && !isOpen() && started && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    controls.walkTo(nearShop.door, nearShop.face, () => enterShop(nearShop.id));
  }
});

// ---------- sky, weather, hud ----------
let weather = null;
const hudTime = document.getElementById('hud-time');
function refreshSky() {
  const n = nightAmount(), late = isLateNight();
  applySky({ scene, hemi, world, bloom, people }, n, late);
  let rainK = 1;
  if (weather?.raining) rainK = weather.heavy ? 1.8 : 1.4;
  rain.setIntensity(rainK);
  setRain(rainK);
  const t = new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  let txt = `${t} · raining on the street`;
  if (weather) txt += weather.raining ? ` · ${weather.temp}°F and raining at your place too` : weather.snowing ? ` · ${weather.temp}°F and snowing at your place, go skiing` : ` · ${weather.temp}°F and dry at your place`;
  if (late) txt += ' · most places are closed';
  hudTime.textContent = txt;
}
async function checkWeather() {
  weather = S.get().realWeather ? await realWeather() : null;
  refreshSky();
  return weather;
}
refreshSky();
setInterval(refreshSky, 60000);
setInterval(() => { if (S.get().realWeather) checkWeather(); }, 20 * 60000);

// ---------- sound + mute ----------
const muteBtn = document.getElementById('btn-mute');
function setMuted(m) {
  S.update(s => { s.muted = m; });
  audioMute(m);
  muteBtn.classList.toggle('off', m);
}
muteBtn.classList.toggle('off', S.get().muted);
muteBtn.addEventListener('click', () => setMuted(!S.get().muted));
const help = document.getElementById('help');
document.getElementById('btn-help').addEventListener('click', () => help.classList.toggle('hidden'));
document.getElementById('help-ok').addEventListener('click', () => help.classList.add('hidden'));

const app = { setMuted, checkWeather, openShop: id => { import('./ui/panel.js').then(m => { m.closePanel(true); controls.enabled = true; enterShop(id); }); } };

// ---------- intro ----------
let started = false;
const intro = document.getElementById('intro');
const introContent = document.getElementById('intro-content');
const firstTime = !S.get().seenBirthday;
if (firstTime) {
  introContent.innerHTML = `<div class="lantern">60</div><h1>${BIRTHDAY.line1}</h1><h2>${BIRTHDAY.line2}</h2><p class="body">${BIRTHDAY.body}</p><div class="sign">${BIRTHDAY.sign}</div>`;
} else {
  const hi = ['still raining. come on in.', 'your stool is open.', 'welcome back.', 'the rain never stopped.'];
  introContent.innerHTML = `<div class="jp-title">雨音通り</div><h2 style="margin-top:6px">${hi[Math.floor(Math.random() * hi.length)]}</h2>`;
}
document.getElementById('intro-go').addEventListener('click', () => {
  started = true;
  startAudio(S.get().muted);
  refreshSky();
  intro.classList.add('fade');
  setTimeout(() => intro.remove(), 1000);
  ['hud', 'hud-right', 'places'].forEach(id => document.getElementById(id).classList.remove('hidden'));
  if (firstTime) {
    S.update(s => { s.seenBirthday = true; });
    setTimeout(() => help.classList.remove('hidden'), 1400);
  }
  if (S.get().realWeather) checkWeather();
});

// ---------- loop ----------
let lastT = performance.now(), elapsed = 0;
let frame = 0;
function loop() {
  requestAnimationFrame(loop);
  const now = performance.now();
  const dt = Math.min((now - lastT) / 1000, 0.05);
  lastT = now; elapsed += dt;
  const t = elapsed;
  frame++;
  // while inside a shop the street just idles behind the blur
  if (isOpen() && frame % 4) return;
  const k = isOpen() ? 4 : 1;
  if (!started) {
    // slow drift down the street behind the intro card
    camera.position.set(0.6, 1.7, 2 - t * 0.6 % 40);
    camera.rotation.set(0.02, Math.sin(t * 0.1) * 0.15, 0, 'YXZ');
  } else {
    controls.update(dt * k);
    checkNear();
  }
  rain.update(dt * k, camera);
  people.update(dt * k, t, controls.pos);
  for (const f of world.flicker) {
    const on = Math.sin(t * f.rate * 7) > -0.97 && Math.random() > 0.004;
    if (f.emissive) f.m.emissiveIntensity = f.m.userData.base * (on ? 1 : 0.85);
    else f.m.color.setScalar((f.m.userData.k ?? 1) * (on ? 1 : 0.15));
  }
  for (const a of world.animated) a(t);
  composer.render();
}
loop();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});

// so I can poke at it from the console
window.__street = { scene, camera, world, controls, S, enter: enterShop };
