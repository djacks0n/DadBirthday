// falling rain streaks that follow the camera, plus little ripples on the ground
import * as THREE from 'three';

export function makeRain(scene) {
  const COUNT = 9000;
  const BOX = { x: 30, y: 22, z: 50 };
  const pos = new Float32Array(COUNT * 6);
  const drops = new Float32Array(COUNT * 4); // x, y, z, speed
  for (let i = 0; i < COUNT; i++) {
    drops[i * 4] = (Math.random() - 0.5) * BOX.x;
    drops[i * 4 + 1] = Math.random() * BOX.y;
    drops[i * 4 + 2] = (Math.random() - 0.5) * BOX.z;
    drops[i * 4 + 3] = 14 + Math.random() * 8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({ color: 0xa8bdd6, transparent: true, opacity: 0.32, depthWrite: false });
  const lines = new THREE.LineSegments(geo, mat);
  lines.frustumCulled = false;
  scene.add(lines);

  // ripples
  const RIP = 260;
  const ringGeo = new THREE.RingGeometry(0.8, 1, 24);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const rings = new THREE.InstancedMesh(ringGeo, ringMat, RIP);
  rings.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(RIP * 3), 3);
  rings.frustumCulled = false;
  scene.add(rings);
  const rip = [];
  for (let i = 0; i < RIP; i++) rip.push({ x: 0, z: 0, age: Math.random(), life: 0.5 + Math.random() * 0.4, y: 0.02 });
  const m4 = new THREE.Matrix4(), col = new THREE.Color();

  let intensity = 1;
  const wind = new THREE.Vector2(0.6, -0.3);

  function update(dt, cam) {
    const active = Math.floor(COUNT * Math.min(1, 0.45 + intensity * 0.4));
    const len = 0.5 + intensity * 0.15;
    for (let i = 0; i < COUNT; i++) {
      let x = drops[i * 4], y = drops[i * 4 + 1], z = drops[i * 4 + 2];
      const sp = drops[i * 4 + 3] * (0.8 + intensity * 0.25);
      y -= sp * dt;
      x += wind.x * dt; z += wind.y * dt;
      if (y < 0) {
        y += BOX.y;
        x = cam.position.x + (Math.random() - 0.5) * BOX.x;
        z = cam.position.z + (Math.random() - 0.5) * BOX.z;
      }
      // keep drops near the camera as dad walks
      if (x - cam.position.x > BOX.x / 2) x -= BOX.x; else if (x - cam.position.x < -BOX.x / 2) x += BOX.x;
      if (z - cam.position.z > BOX.z / 2) z -= BOX.z; else if (z - cam.position.z < -BOX.z / 2) z += BOX.z;
      drops[i * 4] = x; drops[i * 4 + 1] = y; drops[i * 4 + 2] = z;
      const o = i * 6;
      if (i < active) {
        pos[o] = x; pos[o + 1] = y; pos[o + 2] = z;
        pos[o + 3] = x - wind.x * 0.03; pos[o + 4] = y + len; pos[o + 5] = z - wind.y * 0.03;
      } else {
        pos[o + 1] = pos[o + 4] = -100;
      }
    }
    geo.attributes.position.needsUpdate = true;

    const ripActive = Math.floor(RIP * Math.min(1, 0.4 + intensity * 0.5));
    for (let i = 0; i < RIP; i++) {
      const r = rip[i];
      r.age += dt / r.life;
      if (r.age >= 1) {
        r.age = 0;
        r.x = cam.position.x + (Math.random() - 0.5) * 16;
        r.z = cam.position.z - Math.random() * 18 + 3;
        r.y = Math.abs(r.x) > 4.1 ? 0.165 : 0.02;
        if (Math.abs(r.x) > 6.4) r.x = Math.sign(r.x) * 6.2;
      }
      const s = i < ripActive ? 0.03 + r.age * 0.16 : 0.0001;
      m4.makeScale(s, 1, s).setPosition(r.x, r.y, r.z);
      rings.setMatrixAt(i, m4);
      const a = (1 - r.age) * 0.22;
      col.setRGB(a * 0.8, a * 0.9, a);
      rings.setColorAt(i, col);
    }
    rings.instanceMatrix.needsUpdate = true;
    rings.instanceColor.needsUpdate = true;
  }

  return {
    update,
    setIntensity(v) { intensity = v; mat.opacity = 0.22 + v * 0.12; },
    get intensity() { return intensity; },
  };
}
