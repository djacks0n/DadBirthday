// the street follows the real clock, and optionally the real weather where dad is
import * as THREE from 'three';

// 0 = full daylight, 1 = full night
// ?hour=13 in the url fakes the time, for checking what it looks like in the day
const FAKE_HOUR = new URLSearchParams(location.search).get('hour');
function hourOf(d) { return FAKE_HOUR != null ? +FAKE_HOUR : d.getHours() + d.getMinutes() / 60; }

export function nightAmount(d = new Date()) {
  const h = hourOf(d);
  if (h >= 20 || h < 5) return 1;
  if (h >= 8 && h < 16.5) return 0;
  if (h >= 16.5 && h < 20) return (h - 16.5) / 3.5;
  return 1 - (h - 5) / 3; // 5 to 8 am
}

export function isLateNight(d = new Date()) {
  const h = Math.floor(hourOf(d));
  return h >= 2 && h < 5;
}

const NIGHT_BG = new THREE.Color(0x0a0f1b);
const DUSK_BG = new THREE.Color(0x2b2f45);
const DAY_BG = new THREE.Color(0x7a8591);

export function applySky(env, n, late) {
  const { scene, hemi, world, bloom, people } = env;
  const bg = n > 0.5 ? DUSK_BG.clone().lerp(NIGHT_BG, (n - 0.5) * 2) : DAY_BG.clone().lerp(DUSK_BG, n * 2);
  scene.background = bg;
  scene.fog.color.copy(bg);
  scene.fog.density = 0.016 + n * 0.008;
  hemi.intensity = 1.6 - n * 1.25;
  hemi.color.set(n > 0.5 ? 0x334466 : 0xb8c4d0);
  const signK = 0.35 + n * 0.65;
  world.signMats.forEach(m => {
    const off = late && world.lateNightSigns.includes(m);
    m.userData.k = (off ? 0.06 : signK) * (m.userData.base ?? 1);
    m.color.setScalar(m.userData.k);
  });
  world.windowMats.forEach(m => { m.emissiveIntensity = m.userData.base * (late ? 0.45 : 0.35 + n * 0.65); });
  world.lights.forEach(l => { l.intensity = l.userData.base * (0.4 + n * 0.6); });
  if (bloom) bloom.strength = 0.25 + n * 0.6;
  people?.setCount(late ? 5 : Math.round(10 + (1 - Math.abs(n - 0.6)) * 6));
}

// real weather from open-meteo (free, no key). returns { raining, heavy, temp, code } or null
export async function realWeather() {
  const loc = await new Promise(res => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition(p => res(p.coords), () => res(null), { timeout: 8000, maximumAge: 3600000 });
  });
  if (!loc) return null;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude.toFixed(2)}&longitude=${loc.longitude.toFixed(2)}&current=precipitation,weather_code,temperature_2m&temperature_unit=fahrenheit`;
    const r = await fetch(url);
    const j = await r.json();
    const code = j.current.weather_code;
    const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];
    const snowCodes = [71, 73, 75, 77, 85, 86];
    return {
      raining: rainCodes.includes(code) || j.current.precipitation > 0.05,
      heavy: [65, 67, 82, 95, 96, 99].includes(code) || j.current.precipitation > 2,
      snowing: snowCodes.includes(code),
      temp: Math.round(j.current.temperature_2m),
      code,
    };
  } catch (e) {
    return null;
  }
}
