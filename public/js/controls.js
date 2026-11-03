// walking around: WASD or arrows, drag the mouse to look, or click somewhere to walk there
import * as THREE from 'three';
import { Z_START, Z_END } from './street.js';

export function makeControls(camera, dom) {
  const EYE = 1.68;
  const pos = new THREE.Vector3(0.5, 0, 2);
  let yaw = 0, pitch = -0.02; // yaw 0 looks down -z (down the street)
  const keys = {};
  let dragging = false, dragDist = 0, lastX = 0, lastY = 0;
  let auto = null; // { target: Vector3, face: Vector3, done: fn }
  let enabled = true;
  let bob = 0;
  let lookTween = null;

  const isTyping = () => ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

  addEventListener('keydown', e => {
    if (!enabled || isTyping()) return;
    keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    if (/^(Key[WASD]|Arrow)/.test(e.code)) auto = null;
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  dom.addEventListener('pointerdown', e => {
    if (!enabled) return;
    dragging = true; dragDist = 0; lastX = e.clientX; lastY = e.clientY;
    dom.setPointerCapture(e.pointerId);
  });
  dom.addEventListener('pointermove', e => {
    if (!dragging || !enabled) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    dragDist += Math.abs(dx) + Math.abs(dy);
    lastX = e.clientX; lastY = e.clientY;
    yaw -= dx * 0.0042;
    pitch = THREE.MathUtils.clamp(pitch - dy * 0.0035, -0.9, 0.75);
    lookTween = null;
  });
  dom.addEventListener('pointerup', e => { dragging = false; dom.releasePointerCapture?.(e.pointerId); });

  function clampPos(p) {
    p.x = THREE.MathUtils.clamp(p.x, -6.0, 6.0);
    p.z = THREE.MathUtils.clamp(p.z, Z_END + 3, Z_START - 1);
  }

  function walkTo(target, face, done) {
    auto = { target: target.clone(), face, done };
  }

  function lookAtPoint(face, speed = 3) {
    const eye = new THREE.Vector3(pos.x, EYE + groundY(pos.x), pos.z);
    const d = face.clone().sub(eye);
    const tYaw = Math.atan2(-d.x, -d.z);
    const tPitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
    lookTween = { yaw: tYaw, pitch: THREE.MathUtils.clamp(tPitch, -0.6, 0.6), speed };
  }

  function groundY(x) { return Math.abs(x) > 4.05 ? 0.15 : 0; }

  function update(dt) {
    let moving = false;
    if (enabled) {
      const fwd = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
      const strafe = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
      const turn = (keys.ArrowLeft ? 1 : 0) - (keys.ArrowRight ? 1 : 0);
      yaw += turn * dt * 1.8;
      const speed = keys.ShiftLeft || keys.ShiftRight ? 5.5 : 2.8;
      if (fwd || strafe) {
        const sin = Math.sin(yaw), cos = Math.cos(yaw);
        pos.x += (-sin * fwd + cos * strafe) * speed * dt;
        pos.z += (-cos * fwd - sin * strafe) * speed * dt;
        moving = true;
        lookTween = null;
      }
      if (auto) {
        const d = new THREE.Vector3(auto.target.x - pos.x, 0, auto.target.z - pos.z);
        const dist = d.length();
        if (dist < 0.15) {
          const a = auto; auto = null;
          if (a.face) lookAtPoint(a.face, 4);
          a.done && setTimeout(a.done, 380);
        } else {
          const step = Math.min(dist, 4.2 * dt);
          d.normalize();
          pos.addScaledVector(d, step);
          // face where we're going
          const want = Math.atan2(-d.x, -d.z);
          let diff = ((want - yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          yaw += diff * Math.min(1, dt * 5);
          pitch += (-0.02 - pitch) * Math.min(1, dt * 3);
          moving = true;
        }
      }
    }
    if (lookTween) {
      let diff = ((lookTween.yaw - yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      yaw += diff * Math.min(1, dt * lookTween.speed);
      pitch += (lookTween.pitch - pitch) * Math.min(1, dt * lookTween.speed);
      if (Math.abs(diff) < 0.002) lookTween = null;
    }
    clampPos(pos);
    bob += moving ? dt * 9 : 0;
    const by = moving ? Math.sin(bob) * 0.035 : 0;
    camera.position.set(pos.x, EYE + groundY(pos.x) + by, pos.z);
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
    return moving;
  }

  return {
    update, walkTo, lookAtPoint,
    get pos() { return pos; },
    get wasDrag() { return dragDist > 6; },
    set enabled(v) { enabled = v; if (!v) for (const k in keys) keys[k] = false; },
    get enabled() { return enabled; },
    get autoWalking() { return !!auto; },
    cancelAuto() { auto = null; },
  };
}
