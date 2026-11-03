// people walking around with umbrellas, the whole reason dad watches these videos
import * as THREE from 'three';
import { Z_START, Z_END } from './street.js';

export function makePeople(scene, count = 16) {
  const coats = [0x1f2228, 0xa89a7a, 0x3a3f46, 0x4a3b2e, 0x1d2a3a, 0x8a8a86, 0x6b5844, 0x22262a, 0x5a6a7a, 0xc8c2b4, 0x2b3a2e, 0x7a2a2a];
  const umbrellas = [
    { c: 0xdfe8ee, o: 0.35 }, { c: 0xdfe8ee, o: 0.35 }, { c: 0xdfe8ee, o: 0.35 }, // clear ones are everywhere in japan
    { c: 0x111111, o: 1 }, { c: 0x1b2a4a, o: 1 }, { c: 0x8a1a22, o: 1 }, { c: 0x2c4a3a, o: 1 }, { c: 0xd8b43a, o: 1 },
  ];
  const people = [];
  for (let i = 0; i < count; i++) {
    const g = new THREE.Group();
    const coat = new THREE.MeshStandardMaterial({ color: coats[i % coats.length], roughness: 0.8 });
    const pants = new THREE.MeshStandardMaterial({ color: 0x18191c, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.6, 4, 10), coat);
    body.position.y = 1.15; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), new THREE.MeshStandardMaterial({ color: 0xc9a587, roughness: 0.7 }));
    head.position.y = 1.67; g.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.135, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: 0x15110f }));
    hair.position.y = 1.69; g.add(hair);
    const legs = [];
    for (const dx of [-0.09, 0.09]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.75, 0.13), pants);
      leg.geometry.translate(0, -0.37, 0);
      leg.position.set(dx, 0.8, 0); g.add(leg); legs.push(leg);
    }
    const u = umbrellas[Math.floor(Math.random() * umbrellas.length)];
    const umb = new THREE.Group();
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.32, 8, 1, true), new THREE.MeshStandardMaterial({ color: u.c, transparent: u.o < 1, opacity: u.o, side: THREE.DoubleSide, roughness: 0.25, metalness: 0.1, emissive: u.o < 1 ? 0x334050 : 0x000000 }));
    canopy.position.y = 0.16; umb.add(canopy);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.75), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    shaft.position.y = -0.2; umb.add(shaft);
    umb.position.set(0.1, 2.05, 0.05);
    umb.rotation.z = -0.12;
    g.add(umb);

    const side = Math.random() < 0.5 ? -1 : 1;
    const p = {
      g, legs, umb,
      x: side * (4.5 + Math.random() * 1.5),
      z: Z_END + 4 + Math.random() * (Z_START - Z_END - 8),
      dir: Math.random() < 0.5 ? -1 : 1,
      speed: 1.0 + Math.random() * 0.5,
      phase: Math.random() * 10,
      pause: 0,
    };
    // a couple people walk in the road like they own it
    if (i % 7 === 0) p.x = (Math.random() - 0.5) * 4;
    // some cross the street at the crosswalks
    const CROSSWALKS = [-7.5, -49.5, -87.5];
    if (i % 6 === 2) {
      p.mode = 'cross';
      p.z = CROSSWALKS[i % 3] + (Math.random() - 0.5) * 2;
      p.x = (Math.random() - 0.5) * 10;
      p.dir = Math.random() < 0.5 ? -1 : 1;
      p.speed = 1.1 + Math.random() * 0.3;
    }
    // and a few just stand under an awning waiting for it to let up
    if (i % 10 === 7) {
      p.mode = 'stand';
      const spots = [[5.9, -24], [-5.9, -60], [5.9, -71], [-5.9, -13], [5.9, -100]];
      [p.x, p.z] = spots[i % spots.length];
      p.g.rotation.y = p.x > 0 ? -Math.PI / 2 : Math.PI / 2;
    }
    g.position.set(p.x, p.x * p.x > 16 ? 0.15 : 0, p.z);
    if (!p.mode) g.rotation.y = p.dir > 0 ? 0 : Math.PI;
    if (p.mode === 'cross') g.rotation.y = p.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
    g.position.set(p.x, Math.abs(p.x) > 4.05 ? 0.15 : 0, p.z);
    scene.add(g);
    people.push(p);
  }

  let visible = count;

  function update(dt, t, player) {
    people.forEach((p, i) => {
      p.g.visible = i < visible;
      if (!p.g.visible) return;
      if (p.mode === 'stand') {
        p.umb.rotation.x = Math.sin((t + p.phase) * 0.7) * 0.04;
        p.g.position.y = 0.15;
        return;
      }
      if (p.pause > 0) { p.pause -= dt; p.legs.forEach(l => (l.rotation.x = 0)); return; }
      // step aside a little if dad's in the way
      const dx = p.x - player.x, dz = p.z - player.z;
      const close = dx * dx + dz * dz < 1.4;
      if (p.mode === 'cross') {
        p.x += p.dir * p.speed * dt * (close ? 0.3 : 1);
        if (p.x > 5.6) { p.dir = -1; p.g.rotation.y = Math.PI / 2; p.pause = 3 + Math.random() * 8; }
        if (p.x < -5.6) { p.dir = 1; p.g.rotation.y = -Math.PI / 2; p.pause = 3 + Math.random() * 8; }
      } else {
        p.z += p.dir * p.speed * dt * (close ? 0.3 : 1);
        if (p.z > Z_START - 2) { p.dir = -1; p.g.rotation.y = Math.PI; }
        if (p.z < Z_END + 3) { p.dir = 1; p.g.rotation.y = 0; }
      }
      if (Math.random() < 0.0006) p.pause = 2 + Math.random() * 4; // stop and look at a phone or whatever
      const s = Math.sin((t + p.phase) * p.speed * 5.2);
      p.legs[0].rotation.x = s * 0.45;
      p.legs[1].rotation.x = -s * 0.45;
      p.g.position.set(p.x, (Math.abs(p.x) > 4.05 ? 0.15 : 0) + Math.abs(s) * 0.03, p.z);
      p.umb.rotation.x = Math.sin((t + p.phase) * 1.3) * 0.05;
    });
  }

  return { update, setCount(n) { visible = n; } };
}
