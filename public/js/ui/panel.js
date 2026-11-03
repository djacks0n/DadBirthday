// the overlay you see when you walk into a place
const panel = document.getElementById('panel');
const body = document.getElementById('panel-body');
const jp = document.getElementById('panel-jp');
const en = document.getElementById('panel-en');
let onClose = null;
let cleanup = null;

export function openPanel({ theme, jpTitle, enTitle, build, closed }) {
  closePanel(true);
  panel.className = 'theme-' + theme;
  jp.textContent = jpTitle;
  en.textContent = enTitle;
  body.innerHTML = '';
  onClose = closed;
  cleanup = build(body) || null;
  panel.querySelector('.panel-inner').scrollTop = 0;
}

export function closePanel(silent = false) {
  if (panel.classList.contains('hidden')) return;
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;
  body.innerHTML = ''; // stops any playing video
  panel.className = 'hidden';
  const cb = onClose; onClose = null;
  if (!silent && cb) cb();
}

export function isOpen() { return !panel.classList.contains('hidden'); }

document.getElementById('panel-back').addEventListener('click', () => closePanel());
panel.addEventListener('pointerdown', e => { if (e.target === panel) closePanel(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) closePanel(); });

// small helpers used by every shop
export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(kid));
  }
  return el;
}

let toastTimer;
export function toast(msg, ms = 2800) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), ms);
}

export function ytThumb(id) { return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; }
export function ytEmbed(id) { return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`; }
export function ytWatch(id) { return `https://www.youtube.com/watch?v=${id}`; }

export function seededPick(arr, salt = 0) {
  const d = new Date();
  const n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate() + salt * 97;
  return arr[n % arr.length];
}
