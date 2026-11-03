// builds the whole street: road, buildings, signs, the shops dad can walk into
import * as THREE from 'three';
import { Reflector } from '../vendor/three/jsm/objects/Reflector.js';
import { signTexture, windowTextures, vendingTexture, roadTextures, sidewalkTexture, noren, departureTexture, shopWindowTexture, tvTexture, konbiniTexture, rand } from './textures.js';

export const ROAD_HALF = 4;      // road is x -4..4
export const FACADE = 6.5;       // building fronts at x = +-6.5
export const Z_START = 6;
export const Z_END = -124;

const R = rand(1964);

export function buildStreet(scene, renderer) {
  const world = {
    shops: [],
    signMats: [],      // unlit sign materials, dimmed in daytime
    windowMats: [],    // building window materials
    flicker: [],       // things that flicker
    animated: [],      // update(t) callbacks
    lights: [],        // shop lights
    lateNightSigns: [],// signs that turn off at 2am
  };

  const length = Z_START - Z_END;
  const midZ = (Z_START + Z_END) / 2;

  // ---------- ground ----------
  const reflector = new Reflector(new THREE.PlaneGeometry(ROAD_HALF * 2, length), {
    textureWidth: Math.min(1024, window.innerWidth * 0.6) | 0,
    textureHeight: Math.min(1024, window.innerHeight * 0.6) | 0,
    color: 0x5a6270,
    clipBias: 0.003,
  });
  reflector.rotation.x = -Math.PI / 2;
  reflector.position.set(0, 0, midZ);
  scene.add(reflector);
  world.reflector = reflector;

  const road = roadTextures(length, ROAD_HALF * 2);
  const roadMat = new THREE.MeshStandardMaterial({
    map: road.map, alphaMap: road.alphaMap, transparent: true,
    roughness: 0.55, metalness: 0.2, depthWrite: false,
  });
  const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_HALF * 2, length), roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.set(0, 0.01, midZ);
  roadMesh.renderOrder = 1;
  scene.add(roadMesh);

  const swTex = sidewalkTexture();
  swTex.repeat.set(1, length / 2.5);
  for (const side of [-1, 1]) {
    const t = swTex.clone(); t.needsUpdate = true;
    t.repeat.set(1, length / 2.5);
    if (side < 0) { t.center.set(0.5, 0.5); t.rotation = Math.PI; }
    const sw = new THREE.Mesh(
      new THREE.BoxGeometry(FACADE - ROAD_HALF, 0.15, length),
      new THREE.MeshStandardMaterial({ map: t, roughness: 0.32, metalness: 0.15, color: 0xb0b0b0 })
    );
    sw.position.set(side * (ROAD_HALF + (FACADE - ROAD_HALF) / 2), 0.075, midZ);
    scene.add(sw);
    // curb
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.17, length), new THREE.MeshStandardMaterial({ color: 0x77736c, roughness: 0.5 }));
    curb.position.set(side * (ROAD_HALF + 0.1), 0.085, midZ);
    scene.add(curb);
  }

  // ---------- helpers ----------
  const dark = new THREE.MeshStandardMaterial({ color: 0x1c1d21, roughness: 0.9 });

  function facingRotation(side) { return -side * Math.PI / 2; }

  function addSign(opts, w, h, pos, rotY, flicker = false, lateOff = false) {
    const m = new THREE.MeshBasicMaterial({ map: signTexture(opts), toneMapped: false, side: THREE.DoubleSide });
    m.userData.base = 1;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    mesh.position.copy(pos);
    mesh.rotation.y = rotY;
    scene.add(mesh);
    world.signMats.push(m);
    if (flicker) world.flicker.push({ m, rate: 0.3 + R() * 3 });
    if (lateOff) world.lateNightSigns.push(m);
    return mesh;
  }

  // a sign sticking out from the wall so you see it looking down the street
  function addBladeSign(side, z, y, text, color, lateOff = true) {
    const w = 0.9, h = Math.max(2.2, [...text].length * 0.75 + 0.6);
    const opts = { text, color, vertical: true, w: 128, h: Math.round(128 * h / w), bg: R() < 0.5 ? '#0d0a10' : '#f1ece0' };
    if (opts.bg === '#f1ece0') { opts.color = color; }
    const x = side * (FACADE - 0.55);
    const s = addSign(opts, w, h, new THREE.Vector3(x, y, z), Math.PI / 2, R() < 0.15, lateOff);
    s.rotation.y = 0; // faces up/down the street
    const s2 = s.clone(); s2.rotation.y = Math.PI; s2.position.z -= 0.02; scene.add(s2);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, h + 0.1, 0.06), dark);
    frame.position.set(x + side * 0.48, y, z);
    scene.add(frame);
  }

  function addLight(color, intensity, pos, distance = 14) {
    const l = new THREE.PointLight(color, intensity, distance, 1.6);
    l.position.copy(pos);
    l.userData.base = intensity;
    scene.add(l);
    world.lights.push(l);
    return l;
  }

  function addHit(shop, center, size) {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false })
    );
    box.position.copy(center);
    box.userData.shop = shop.id;
    scene.add(box);
    shop.hit = box;
  }

  function registerShop(def) {
    world.shops.push(def);
    return def;
  }

  // generic building block with windowed facade
  function building(side, z0, z1, h, seed, opts = {}) {
    const w = z0 - z1, cz = (z0 + z1) / 2, depth = 12;
    const body = new THREE.Mesh(new THREE.BoxGeometry(depth, h, w), dark);
    body.position.set(side * (FACADE + depth / 2), h / 2, cz);
    scene.add(body);
    const upperH = h - 4.2;
    if (upperH > 1) {
      const cols = Math.max(2, Math.round(w / 2.3)), rows = Math.max(1, Math.round(upperH / 3.1));
      const t = windowTextures(seed, cols, rows, opts.lit ?? 0.45);
      const m = new THREE.MeshStandardMaterial({ map: t.map, emissiveMap: t.emissiveMap, emissive: 0xffffff, emissiveIntensity: 1.2, roughness: 0.8 });
      m.userData.base = 1.2;
      world.windowMats.push(m);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(w, upperH), m);
      f.position.set(side * (FACADE - 0.01), 4.2 + upperH / 2, cz);
      f.rotation.y = facingRotation(side);
      scene.add(f);
    }
    // ledge between ground floor and upper floors
    const ledge = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, w), new THREE.MeshStandardMaterial({ color: 0x3a3a3e, roughness: 0.7 }));
    ledge.position.set(side * (FACADE - 0.2), 4.1, cz);
    scene.add(ledge);
    // rooftop clutter
    if (R() < 0.6) {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 10), new THREE.MeshStandardMaterial({ color: 0x55585c }));
      tank.position.set(side * (FACADE + 3 + R() * 5), h + 0.7, cz + (R() - 0.5) * (w - 2));
      scene.add(tank);
    }
    if (R() < 0.4) {
      const bb = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, 2.2), new THREE.MeshBasicMaterial({ map: signTexture({ text: pick(ROOF_SIGNS), color: pick(NEON), w: 512, h: 128 }), toneMapped: false }));
      bb.position.set(side * (FACADE + 0.5), h + 1.3, cz);
      bb.rotation.y = facingRotation(side);
      bb.material.userData.base = 1;
      world.signMats.push(bb.material);
      world.lateNightSigns.push(bb.material);
      scene.add(bb);
    }
    return { cz, w };
  }

  // ground floor of a normal building: little restaurant, shutter, or dark doorway
  function groundFloor(side, cz, w, seed) {
    const r = rand(seed)();
    const x = side * (FACADE - 0.02);
    if (r < 0.55) {
      const name = pick(SHOP_NAMES);
      const st = shopWindowTexture(seed, pick(['#ffd59a', '#ffe2b8', '#ffc98a', '#f6e6c8']));
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.7, 2.4), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: st, emissiveIntensity: 0.55 }));
      glow.material.userData.base = 0.55;
      world.windowMats.push(glow.material);
      glow.position.set(x, 1.45, cz); glow.rotation.y = facingRotation(side);
      scene.add(glow);
      const n = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.5, 0.9), new THREE.MeshStandardMaterial({ map: noren(pick(['#1f2f5c', '#5c1f1f', '#2e2a26', '#4a1f3a']), name.n), side: THREE.DoubleSide, roughness: 1 }));
      n.position.set(side * (FACADE - 0.25), 2.35, cz); n.rotation.y = facingRotation(side);
      scene.add(n);
      addSign({ text: name.s, color: name.c, w: 512, h: 128 }, Math.min(w * 0.8, 4), 0.9, new THREE.Vector3(side * (FACADE - 0.06), 3.35, cz), facingRotation(side), R() < 0.1, R() < 0.5);
    } else {
      // metal shutter
      const c = document.createElement('canvas'); c.width = 128; c.height = 128;
      const g = c.getContext('2d'); g.fillStyle = '#6d7073'; g.fillRect(0, 0, 128, 128);
      g.fillStyle = '#4e5154'; for (let y = 0; y < 128; y += 6) g.fillRect(0, y, 128, 2);
      if (R() < 0.6) { g.fillStyle = pick(['#e33', '#39f', '#fd2', '#3c3', '#f4f']); g.font = '700 22px sans-serif'; g.fillText(pick(['SAM', 'KUMA', 'ok', '★', 'RAIN', 'yo']), 20 + R() * 40, 60 + R() * 40); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      const sh = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.85, 3.2), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, metalness: 0.6 }));
      sh.position.set(x, 1.6, cz); sh.rotation.y = facingRotation(side);
      scene.add(sh);
    }
  }

  // ---------- the special places ----------
  // slots: [side, zStart, zEnd]
  const SLOTS = {
    station: [-1, -3, -19],
    gear: [-1, -31, -42],
    konbini: [-1, -57, -66],
    bowling: [-1, -86, -102],
    bar: [1, -17, -26],
    shrine: [1, -43, -55],
    bench: [1, -70, -76],
  };

  // fill the rest of each side with normal buildings
  for (const side of [-1, 1]) {
    const taken = Object.values(SLOTS).filter(s => s[0] === side && s !== SLOTS.bench).map(s => [s[1], s[2]]).sort((a, b) => b[0] - a[0]);
    let z = Z_START + 2;
    const gaps = [];
    for (const [a, b] of taken) { if (z > a) gaps.push([z, a]); z = b; }
    gaps.push([z, Z_END - 2]);
    let seed = side > 0 ? 500 : 900;
    for (const [g0, g1] of gaps) {
      let zz = g0;
      while (zz - g1 > 2) {
        let w = 5 + R() * 5;
        if (zz - w - g1 < 4) w = zz - g1;
        const h = 8 + R() * 14;
        const { cz, w: ww } = building(side, zz, zz - w, h, seed++);
        groundFloor(side, cz, ww, seed++);
        if (R() < 0.7) addBladeSign(side, cz + (R() - 0.5) * (ww - 2), 5.5 + R() * 3, pick(BLADE_TEXT), pick(NEON));
        zz -= w;
      }
    }
  }
  // close off both ends of the street
  for (const [z, s] of [[Z_START + 4, 77], [Z_END - 3, 88]]) {
    const h = 20;
    const t = windowTextures(s, 10, 5, 0.5);
    const m = new THREE.MeshStandardMaterial({ map: t.map, emissiveMap: t.emissiveMap, emissive: 0xffffff, emissiveIntensity: 1.2 });
    m.userData.base = 1.2; world.windowMats.push(m);
    const b = new THREE.Mesh(new THREE.BoxGeometry(26, h, 2), [dark, dark, dark, dark, m, m]);
    b.position.set(0, h / 2, z);
    scene.add(b);
  }

  // ===== station =====
  {
    const [side, z0, z1] = SLOTS.station;
    const cz = (z0 + z1) / 2, w = z0 - z1;
    building(side, z0, z1, 11, 42, { lit: 0.25 });
    const x = side * (FACADE - 0.03);
    const entrance = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.7, 3.3), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: stationInside(), emissiveIntensity: 0.5 }));
    entrance.material.userData.base = 0.5;
    entrance.position.set(x, 1.8, cz); entrance.rotation.y = facingRotation(side);
    scene.add(entrance);
    addSign({ text: '雨音駅', sub: 'AMAOTO STATION', color: '#f6fbff', bg: '#0c5a3a', w: 768, h: 192 }, 7, 1.75, new THREE.Vector3(side * (FACADE - 0.1), 5.4, cz), facingRotation(side));
    const board = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), new THREE.MeshBasicMaterial({ map: departureTexture(), toneMapped: false }));
    board.material.userData.base = 1; world.signMats.push(board.material);
    board.position.set(side * (FACADE - 0.12), 3.85, cz + 3.4); board.rotation.y = facingRotation(side);
    scene.add(board);
    // canopy
    const can = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, w * 0.85), new THREE.MeshStandardMaterial({ color: 0x2b2f33, metalness: 0.6, roughness: 0.4 }));
    can.position.set(side * (FACADE - 1.1), 3.6, cz);
    scene.add(can);
    addLight(0xcfe9ff, 9, new THREE.Vector3(side * 4.8, 3.2, cz), 14);
    const shop = registerShop({ id: 'station', name: 'Amaoto Station', jp: '駅', door: new THREE.Vector3(side * 4.9, 0, cz), face: new THREE.Vector3(side * 9, 1.6, cz) });
    addHit(shop, new THREE.Vector3(side * (FACADE + 0.2), 2.5, cz), new THREE.Vector3(1.2, 5, w * 0.8));
  }

  // ===== gear shop =====
  {
    const [side, z0, z1] = SLOTS.gear;
    const cz = (z0 + z1) / 2, w = z0 - z1;
    building(side, z0, z1, 13, 77);
    const x = side * (FACADE - 0.03);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.85, 3), new THREE.MeshStandardMaterial({ color: 0x050607, emissive: 0x26302a, emissiveIntensity: 1 }));
    win.position.set(x, 1.7, cz); win.rotation.y = facingRotation(side);
    scene.add(win);
    // TV wall in the window
    for (let i = 0; i < 6; i++) {
      const tv = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.68), new THREE.MeshBasicMaterial({ map: tvTexture(i * 7 + 1), toneMapped: false }));
      tv.position.set(side * (FACADE - 0.06), 1.3 + (i % 2) * 0.85, cz - 2.4 + Math.floor(i / 2) * 1.6);
      tv.rotation.y = facingRotation(side);
      scene.add(tv);
      const phase = R() * 10;
      world.animated.push(t => {
        const k = 0.7 + 0.15 * Math.sin(t * 1.3 + phase) + 0.08 * Math.sin(t * 7.1 + phase * 3) + (Math.random() < 0.01 ? 0.3 : 0);
        tv.material.color.setScalar(k);
      });
    }
    addSign({ text: '山道具', sub: 'MOUNTAIN GEAR', color: '#8dff7a', bg: '#0b140c', w: 640, h: 192 }, 5.2, 1.55, new THREE.Vector3(side * (FACADE - 0.08), 4.9, cz), facingRotation(side));
    addBladeSign(side, z0 - 0.6, 6.5, 'テント', '#8dff7a', false);
    addLight(0x9effa0, 10, new THREE.Vector3(side * 5, 2.8, cz), 12);
    const shop = registerShop({ id: 'gear', name: 'Mountain Gear', jp: '山道具', door: new THREE.Vector3(side * 4.9, 0, cz), face: new THREE.Vector3(side * 9, 1.6, cz) });
    addHit(shop, new THREE.Vector3(side * (FACADE + 0.2), 2.5, cz), new THREE.Vector3(1.2, 5, w * 0.9));
  }

  // ===== konbini =====
  {
    const [side, z0, z1] = SLOTS.konbini;
    const cz = (z0 + z1) / 2, w = z0 - z1;
    building(side, z0, z1, 10, 31, { lit: 0.6 });
    const x = side * (FACADE - 0.03);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, 3.1), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: konbiniTexture(), emissiveIntensity: 0.42 }));
    glass.material.userData.base = 0.42;
    glass.position.set(x, 1.7, cz); glass.rotation.y = facingRotation(side);
    scene.add(glass);
    // stripe sign
    const c = document.createElement('canvas'); c.width = 1024; c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 1024, 128);
    g.fillStyle = '#1aa85a'; g.fillRect(0, 70, 1024, 24);
    g.fillStyle = '#2a6be0'; g.fillRect(0, 98, 1024, 24);
    g.fillStyle = '#1b1b1b'; g.font = '800 58px "Hiragino Sans","Noto Sans JP",sans-serif'; g.fillText('コンビニ 24h', 30, 58);
    g.font = '700 40px "Courier New",monospace'; g.fillText('OPEN ALL NIGHT', 620, 52);
    const st = new THREE.CanvasTexture(c); st.colorSpace = THREE.SRGBColorSpace;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.95, 1.0), new THREE.MeshBasicMaterial({ map: st, toneMapped: false }));
    sign.material.userData.base = 0.6; world.signMats.push(sign.material);
    sign.position.set(side * (FACADE - 0.06), 3.75, cz); sign.rotation.y = facingRotation(side);
    scene.add(sign);
    addLight(0xf2f8ff, 9, new THREE.Vector3(side * 4.6, 2.4, cz), 14);
    // the konbini flickers a tiny bit
    world.flicker.push({ m: glass.material, rate: 0.2, emissive: true });
    const shop = registerShop({ id: 'konbini', name: 'Konbini', jp: 'コンビニ', door: new THREE.Vector3(side * 4.9, 0, cz), face: new THREE.Vector3(side * 9, 1.6, cz) });
    addHit(shop, new THREE.Vector3(side * (FACADE + 0.2), 2.3, cz), new THREE.Vector3(1.2, 4.6, w * 0.9));
  }

  // ===== bowling =====
  {
    const [side, z0, z1] = SLOTS.bowling;
    const cz = (z0 + z1) / 2, w = z0 - z1, h = 13;
    building(side, z0, z1, h, 11, { lit: 0.2 });
    const x = side * (FACADE - 0.03);
    const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.5, 3), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: shopWindowTexture(404, '#ff9ad8'), emissiveIntensity: 0.6 }));
    doorGlow.material.userData.base = 0.6;
    doorGlow.position.set(x, 1.6, cz); doorGlow.rotation.y = facingRotation(side);
    scene.add(doorGlow);
    addSign({ text: 'ボウリング', sub: 'BOWLING', color: '#ff5fc8', bg: '#14061a', w: 768, h: 192 }, 8, 2, new THREE.Vector3(side * (FACADE - 0.1), 5.6, cz), facingRotation(side), true);
    // giant pin on the roof, japan has a few of these
    const prof = [];
    const pts = [[0, 0], [0.55, 0], [0.75, 0.6], [0.9, 1.6], [0.8, 2.6], [0.45, 3.4], [0.38, 3.9], [0.48, 4.5], [0.4, 5.0], [0.2, 5.3], [0, 5.35]];
    pts.forEach(([r, y]) => prof.push(new THREE.Vector2(r, y)));
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xf6f3ee, roughness: 0.3, emissive: 0x332222, emissiveIntensity: 0.6 });
    const pin = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), pinMat);
    pin.scale.setScalar(1.3);
    pin.position.set(side * (FACADE + 2.5), h, cz);
    scene.add(pin);
    for (const yy of [4.05, 4.3]) {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.43 * 1.31, 0.43 * 1.31, 0.12, 24), new THREE.MeshBasicMaterial({ color: 0xff2030, toneMapped: false }));
      band.position.set(pin.position.x, h + yy * 1.3, cz);
      scene.add(band);
    }
    addLight(0xff7fd6, 16, new THREE.Vector3(side * 4.8, 3, cz), 14);
    addLight(0xffe6f4, 20, new THREE.Vector3(side * (FACADE + 0.5), h + 3, cz + 3), 12);
    world.animated.push(t => { pin.rotation.y = t * 0.4; });
    const shop = registerShop({ id: 'bowling', name: 'Bowling', jp: 'ボウリング', door: new THREE.Vector3(side * 4.9, 0, cz), face: new THREE.Vector3(side * 9, 1.6, cz) });
    addHit(shop, new THREE.Vector3(side * (FACADE + 0.2), 3, cz), new THREE.Vector3(1.2, 6, w * 0.8));
  }

  // ===== bar =====
  {
    const [side, z0, z1] = SLOTS.bar;
    const cz = (z0 + z1) / 2, w = z0 - z1;
    building(side, z0, z1, 15, 63, { lit: 0.35 });
    const x = side * (FACADE - 0.03);
    // dark wood front
    const c = document.createElement('canvas'); c.width = 256; c.height = 128;
    const g = c.getContext('2d'); g.fillStyle = '#2a1a10'; g.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 256; i += 16) { g.fillStyle = `rgba(0,0,0,${0.2 + Math.random() * 0.2})`; g.fillRect(i, 0, 3, 128); }
    const wt = new THREE.CanvasTexture(c); wt.colorSpace = THREE.SRGBColorSpace;
    const front = new THREE.Mesh(new THREE.PlaneGeometry(w, 4), new THREE.MeshStandardMaterial({ map: wt, roughness: 0.7 }));
    front.position.set(x, 2, cz); front.rotation.y = facingRotation(side);
    scene.add(front);
    // little window with warm glow
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.1), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xff9a3c, emissiveIntensity: 1.3 }));
    win.material.userData.base = 1.3;
    win.position.set(side * (FACADE - 0.05), 1.7, cz + 2.2); win.rotation.y = facingRotation(side);
    scene.add(win);
    // door
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.4), new THREE.MeshStandardMaterial({ color: 0x120a06, roughness: 0.6, emissive: 0x3a1a08, emissiveIntensity: 0.6 }));
    door.position.set(side * (FACADE - 0.05), 1.2, cz - 1); door.rotation.y = facingRotation(side);
    scene.add(door);
    addSign({ text: 'BAR 雨音', sub: 'AMAOTO', color: '#ffb35c', bg: '#140b05', w: 512, h: 160 }, 2.6, 0.8, new THREE.Vector3(side * (FACADE - 0.08), 2.85, cz - 1), facingRotation(side));
    // red paper lanterns
    for (const dz of [-2.2, 0.2]) {
      const lan = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff3a1e, toneMapped: false }));
      lan.scale.y = 1.35;
      lan.position.set(side * (FACADE - 0.5), 2.7, cz + dz);
      scene.add(lan);
      const ph = R() * 6;
      world.animated.push(t => { lan.position.y = 2.7 + Math.sin(t * 1.7 + ph) * 0.02; lan.rotation.z = Math.sin(t * 1.3 + ph) * 0.06; });
    }
    addBladeSign(side, z1 + 0.7, 6.4, 'ウイスキー', '#ffb35c', false);
    addLight(0xff9a40, 14, new THREE.Vector3(side * 5, 2.4, cz), 12);
    const shop = registerShop({ id: 'bar', name: 'Bar Amaoto', jp: 'バー', door: new THREE.Vector3(side * 4.9, 0, cz - 1), face: new THREE.Vector3(side * 9, 1.6, cz - 1) });
    addHit(shop, new THREE.Vector3(side * (FACADE + 0.2), 2, cz), new THREE.Vector3(1.2, 4, w * 0.9));
  }

  // ===== shrine (a gap between buildings with a torii and a little shrine) =====
  {
    const [side, z0, z1] = SLOTS.shrine;
    const cz = (z0 + z1) / 2, w = z0 - z1;
    const gravel = new THREE.Mesh(new THREE.PlaneGeometry(22, w), new THREE.MeshStandardMaterial({ color: 0x4a4744, roughness: 0.95 }));
    gravel.rotation.x = -Math.PI / 2; gravel.position.set(side * (FACADE + 11), 0.12, cz);
    scene.add(gravel);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(20, 1.8), new THREE.MeshStandardMaterial({ color: 0x77736e, roughness: 0.6 }));
    path.rotation.x = -Math.PI / 2; path.position.set(side * (FACADE + 10), 0.14, cz);
    scene.add(path);
    // side walls so the gap doesn't look like it opens into nothing
    for (const zz of [z0 - 0.3, z1 + 0.3]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(22, 1.6, 0.6), new THREE.MeshStandardMaterial({ color: 0x5a5650, roughness: 0.9 }));
      wall.position.set(side * (FACADE + 11), 0.8, zz);
      scene.add(wall);
    }
    const red = new THREE.MeshStandardMaterial({ color: 0xd8341c, roughness: 0.5, emissive: 0x3a0800, emissiveIntensity: 0.7 });
    const black = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
    function torii(x, s) {
      const grp = new THREE.Group();
      for (const dz of [-1.6, 1.6]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 4.4, 14), red);
        p.position.set(0, 2.2, dz); grp.add(p);
      }
      const kasagi = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.28, 4.8), black); kasagi.position.set(0, 4.55, 0); grp.add(kasagi);
      const shimaki = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 4.4), red); shimaki.position.set(0, 4.3, 0); grp.add(shimaki);
      const nuki = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 4.0), red); nuki.position.set(0, 3.6, 0); grp.add(nuki);
      grp.position.set(x, 0.1, cz); grp.scale.setScalar(s);
      scene.add(grp);
    }
    torii(side * (FACADE + 0.8), 1);
    torii(side * (FACADE + 6), 0.85);
    // stone lanterns
    const stone = new THREE.MeshStandardMaterial({ color: 0x8b877f, roughness: 0.9 });
    for (const dz of [-2.4, 2.4]) {
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.9, 6), stone); base.position.y = 0.45; g.add(base);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.55), stone); box.position.y = 1.15; g.add(box);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.56), new THREE.MeshBasicMaterial({ color: 0xffb060, toneMapped: false })); glow.position.y = 1.15; g.add(glow);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.4, 4), stone); roof.position.y = 1.58; roof.rotation.y = Math.PI / 4; g.add(roof);
      g.position.set(side * (FACADE + 3.5), 0.1, cz + dz);
      scene.add(g);
    }
    // the shrine itself
    const hall = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: 0x5a3a24, roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 5), wood); body.position.y = 2.1; hall.add(body);
    const plat = new THREE.Mesh(new THREE.BoxGeometry(5, 0.6, 6), stone); plat.position.y = 0.3; hall.add(plat);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.6, 2.2, 4), new THREE.MeshStandardMaterial({ color: 0x2c3a36, roughness: 0.6, metalness: 0.3 }));
    roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 1.25); roof.position.y = 4.6; hall.add(roof);
    const glowDoor = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.8), new THREE.MeshBasicMaterial({ color: 0xffa04a, toneMapped: false }));
    glowDoor.position.set(-side * 2.01, 1.9, 0); glowDoor.rotation.y = facingRotation(side); hall.add(glowDoor);
    hall.position.set(side * (FACADE + 13), 0.1, cz);
    scene.add(hall);
    // omikuji rack with white papers tied on
    const rack = new THREE.Group();
    for (const dz of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.1), wood); p.position.set(0, 0.75, dz); rack.add(p); }
    for (const yy of [1.0, 1.4]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 2.1), wood); bar.position.y = yy; rack.add(bar);
      for (let i = 0; i < 12; i++) {
        const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.14), new THREE.MeshStandardMaterial({ color: 0xf2efe6, side: THREE.DoubleSide, emissive: 0x333333 }));
        paper.position.set(0.04, yy - 0.06, -0.95 + i * 0.17 + R() * 0.05); paper.rotation.y = Math.PI / 2;
        rack.add(paper);
      }
    }
    rack.position.set(side * (FACADE + 8.5), 0.1, cz + 3);
    scene.add(rack);
    // trees behind
    const leaf = new THREE.MeshStandardMaterial({ color: 0x1d2d22, roughness: 1 });
    for (let i = 0; i < 9; i++) {
      const t = new THREE.Mesh(new THREE.ConeGeometry(1.5 + R(), 6 + R() * 5, 8), leaf);
      t.position.set(side * (FACADE + 16 + R() * 6), 3.5, z1 + 0.5 + R() * (w - 1));
      scene.add(t);
    }
    addSign({ text: '神社', color: '#ffe3b0', bg: '#2a0f08', vertical: true, w: 128, h: 300 }, 0.55, 1.3, new THREE.Vector3(side * (FACADE + 0.7), 3.5, cz + 0.02), facingRotation(side));
    addLight(0xffa040, 14, new THREE.Vector3(side * (FACADE + 4), 2.5, cz), 14);
    addLight(0xffb070, 10, new THREE.Vector3(side * (FACADE + 10), 3, cz), 10);
    const shop = registerShop({ id: 'shrine', name: 'Shrine and garden', jp: '神社', door: new THREE.Vector3(side * 4.9, 0, cz), face: new THREE.Vector3(side * 14, 2, cz) });
    addHit(shop, new THREE.Vector3(side * (FACADE + 2), 2.5, cz), new THREE.Vector3(4, 5, w * 0.6));
  }

  // ===== bus stop bench =====
  {
    const [side, z0, z1] = SLOTS.bench;
    const cz = (z0 + z1) / 2;
    const metal = new THREE.MeshStandardMaterial({ color: 0x5b6066, metalness: 0.7, roughness: 0.35 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 4), metal); roof.position.set(side * 5.4, 2.6, cz); scene.add(roof);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 3.6), new THREE.MeshBasicMaterial({ color: 0xdff2ff, toneMapped: false })); strip.position.set(side * 5.4, 2.53, cz); scene.add(strip);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.4, 4), new THREE.MeshStandardMaterial({ color: 0x8fa3b0, transparent: true, opacity: 0.25, metalness: 0.5, roughness: 0.1 })); back.position.set(side * 6.2, 1.35, cz); scene.add(back);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 3), new THREE.MeshStandardMaterial({ color: 0x6a4a30 })); seat.position.set(side * 5.8, 0.6, cz); scene.add(seat);
    for (const dz of [-1.3, 1.3]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.06), metal); leg.position.set(side * 5.8, 0.37, cz + dz); scene.add(leg); }
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6), metal); pole.position.set(side * 4.5, 1.4, cz + 2.3); scene.add(pole);
    addSign({ text: 'バス停', sub: 'BUS STOP', color: '#ffffff', bg: '#1c4e9a', w: 256, h: 160 }, 0.8, 0.5, new THREE.Vector3(side * 4.5, 2.6, cz + 2.3), facingRotation(side) + Math.PI / 2);
    addLight(0xdff2ff, 8, new THREE.Vector3(side * 5.4, 2.3, cz), 8);
    // a little poster on the shelter
    addSign({ text: '雨の日', sub: 'RAIN WALKS ->', color: '#9fd6ff', bg: '#0a1520', w: 256, h: 256 }, 1.1, 1.1, new THREE.Vector3(side * 6.17, 1.5, cz + 1), facingRotation(side));
    const shop = registerShop({ id: 'bench', name: 'The bench', jp: 'ベンチ', door: new THREE.Vector3(side * 4.6, 0, cz), face: new THREE.Vector3(side * 9, 1.5, cz) });
    addHit(shop, new THREE.Vector3(side * 5.6, 1.4, cz), new THREE.Vector3(1.6, 2.8, 4));
  }

  // ===== the big birthday lantern over the end of the street =====
  {
    const z = -112;
    const c = document.createElement('canvas'); c.width = 512; c.height = 256;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 256); grd.addColorStop(0, '#ff6a2a'); grd.addColorStop(0.5, '#ff3a1a'); grd.addColorStop(1, '#c81a0a');
    g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2;
    for (let y = 8; y < 256; y += 14) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
    g.fillStyle = '#1a0a05'; g.font = '900 120px "Hiragino Sans","Noto Sans JP",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('祝', 128, 128); g.fillText('60', 384, 128);
    const lt = new THREE.CanvasTexture(c); lt.colorSpace = THREE.SRGBColorSpace;
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(1.3, 32, 24), new THREE.MeshBasicMaterial({ map: lt, toneMapped: false }));
    lantern.scale.y = 1.4;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.3, 24), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    cap.position.y = 1.9;
    const cap2 = cap.clone(); cap2.position.y = -1.9;
    const grp = new THREE.Group(); grp.add(lantern, cap, cap2);
    grp.position.set(0, 7.2, z);
    scene.add(grp);
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, FACADE * 2), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    wire.rotation.z = Math.PI / 2; wire.position.set(0, 9.3, z); scene.add(wire);
    addLight(0xff6a30, 25, new THREE.Vector3(0, 6, z), 18);
    world.animated.push(t => { grp.rotation.z = Math.sin(t * 0.8) * 0.04; grp.rotation.y = Math.sin(t * 0.5) * 0.25; });
    const shop = registerShop({ id: 'lantern', name: 'The lantern', jp: '祝', door: new THREE.Vector3(0, 0, z + 5), face: new THREE.Vector3(0, 6.5, z) });
    addHit(shop, new THREE.Vector3(0, 7.2, z), new THREE.Vector3(3, 4, 3));
  }

  // ---------- vending machines ----------
  const vmSpots = [[-1, -28.5], [-1, -29.5], [1, -59], [1, -60], [1, -61], [1, -83], [-1, -76], [1, -6]];
  vmSpots.forEach(([side, z], i) => {
    const col = pick(['#c8202a', '#1a4fb0', '#e8e8e8', '#1d8a4a']);
    const front = new THREE.MeshStandardMaterial({ map: vendingTexture(i + 3, col), emissive: 0xffffff, emissiveMap: vendingTexture(i + 3, col), emissiveIntensity: 0.55 });
    front.userData.base = 0.55; world.windowMats.push(front);
    const vm = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.85, 0.95), [dark, dark, dark, dark, dark, dark]);
    vm.material[side > 0 ? 1 : 0] = front;
    vm.position.set(side * (FACADE - 0.45), 1.0, z);
    scene.add(vm);
  });
  addLight(0xddeeff, 5, new THREE.Vector3(-5.2, 1.4, -29), 6);
  addLight(0xddeeff, 6, new THREE.Vector3(5.2, 1.4, -60), 7);

  // ---------- utility poles and wires ----------
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x6d6a66, roughness: 0.8 });
  const wireMat = new THREE.LineBasicMaterial({ color: 0x0a0a0a });
  for (const side of [-1, 1]) {
    const tops = [];
    for (let z = Z_START - 3 + (side > 0 ? 7 : 0); z > Z_END + 2; z -= 15) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 10, 8), poleMat);
      p.position.set(side * (ROAD_HALF + 0.45), 5, z);
      scene.add(p);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.1), poleMat);
      arm.position.set(side * (ROAD_HALF + 0.45), 9.2, z);
      scene.add(arm);
      // transformer can on some poles
      if (R() < 0.4) {
        const can = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.7, 10), new THREE.MeshStandardMaterial({ color: 0x8c8f92, metalness: 0.5 }));
        can.position.set(side * (ROAD_HALF + 0.8), 7.6, z); scene.add(can);
      }
      // street lamp
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.25), new THREE.MeshBasicMaterial({ color: 0xffe9c4, toneMapped: false }));
      lamp.position.set(side * (ROAD_HALF - 0.1), 6.2, z);
      scene.add(lamp);
      world.signMats.push(lamp.material); lamp.material.userData.base = 1;
      tops.push(z);
    }
    // sagging wires between poles
    for (let i = 0; i < tops.length - 1; i++) {
      for (const [dx, y] of [[-0.6, 9.15], [0.6, 9.15], [0, 8.5]]) {
        const pts = [];
        for (let s = 0; s <= 12; s++) {
          const f = s / 12;
          pts.push(new THREE.Vector3(side * (ROAD_HALF + 0.45) + dx, y - Math.sin(f * Math.PI) * 0.6, tops[i] + (tops[i + 1] - tops[i]) * f));
        }
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
      }
    }
  }
  // a few wires crossing the street
  for (const z of [-15, -47, -80, -104]) {
    const pts = [];
    for (let s = 0; s <= 12; s++) { const f = s / 12; pts.push(new THREE.Vector3(-ROAD_HALF - 0.45 + f * (ROAD_HALF + 0.45) * 2, 8.7 - Math.sin(f * Math.PI) * 0.5, z + f * 2)); }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
  }

  // bicycles parked, because of course
  const bikeMat = new THREE.MeshStandardMaterial({ color: 0x8a9096, metalness: 0.7, roughness: 0.4 });
  for (const [side, z] of [[-1, -46], [-1, -47.2], [1, -32], [-1, -81], [1, -95]]) {
    const b = new THREE.Group();
    for (const dz of [-0.5, 0.5]) { const wh = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.03, 6, 20), bikeMat); wh.position.set(0, 0.48, dz); wh.rotation.y = Math.PI / 2; b.add(wh); }
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1), bikeMat); frame.position.y = 0.75; b.add(frame);
    const basket = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.25), bikeMat); basket.position.set(0, 0.9, -0.62); b.add(basket);
    b.position.set(side * (FACADE - 1.2), 0.15, z);
    b.rotation.y = side * 0.4;
    scene.add(b);
  }

  return world;
}

const NEON = ['#ff3b6b', '#ffcf3a', '#3be8ff', '#a66bff', '#ff8a3a', '#6bff8f', '#ffffff', '#ff5fc8'];
const BLADE_TEXT = ['ラーメン', 'カラオケ', '居酒屋', '焼き鳥', '喫茶', 'ホテル', '餃子', '寿司', '古本', '麻雀', 'うどん', 'ゲーム', '銭湯', '定食', 'そば', 'たばこ', 'パチンコ', '酒', 'スナック', '天ぷら', '整骨院'];
const ROOF_SIGNS = ['KUMA COFFEE', 'カメラ', '雨の日セール', 'HOTEL MOMO', 'カラオケ 鳥', 'HAKUBA EXPRESS', 'さくら銀行', 'UME BEER'];
const SHOP_NAMES = [
  { s: 'ラーメン 一番', n: 'らーめん', c: '#ffcf3a' },
  { s: '焼き鳥 とり吉', n: '焼鳥', c: '#ff8a3a' },
  { s: '喫茶 ふじ', n: '喫茶', c: '#ffffff' },
  { s: 'うどん 丸', n: 'うどん', c: '#ffcf3a' },
  { s: '寿司 まつ', n: 'すし', c: '#3be8ff' },
  { s: '古本屋', n: '本', c: '#ffe3b0' },
  { s: '居酒屋 たぬき', n: '居酒屋', c: '#ff3b6b' },
  { s: '餃子の店', n: '餃子', c: '#ff8a3a' },
  { s: '定食 みどり', n: '定食', c: '#6bff8f' },
  { s: 'そば 山', n: 'そば', c: '#ffffff' },
];
function pick(a) { return a[Math.floor(R() * a.length)]; }

// inside the station: ticket gates, lights, a map on the wall
function stationInside() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 256); grd.addColorStop(0, '#dfeaf2'); grd.addColorStop(1, '#6a7a86');
  g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#fff'; for (let x = 20; x < 512; x += 90) g.fillRect(x, 8, 60, 6);
  g.fillStyle = '#26323c'; g.fillRect(40, 40, 170, 70);
  g.strokeStyle = '#ff9a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(50, 90); g.bezierCurveTo(100, 50, 150, 100, 200, 55); g.stroke();
  g.strokeStyle = '#3ab0ff'; g.beginPath(); g.moveTo(50, 60); g.lineTo(200, 95); g.stroke();
  g.fillStyle = '#0c5a3a'; g.fillRect(280, 40, 190, 40);
  g.fillStyle = '#fff'; g.font = '700 26px sans-serif'; g.fillText('改札  GATES', 296, 70);
  for (let i = 0; i < 5; i++) { g.fillStyle = '#4a5560'; g.fillRect(40 + i * 95, 170, 22, 86); g.fillStyle = '#3ad06a'; g.fillRect(44 + i * 95, 176, 14, 6); }
  g.fillStyle = '#1a2026';
  g.beginPath(); g.arc(300, 150, 14, 0, 7); g.fill(); g.beginPath(); g.ellipse(300, 210, 22, 46, 0, Math.PI, 0); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
