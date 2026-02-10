const DEV_FORCE_INTRO = true;

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
}

function shouldShowIntro() {
  if (prefersReducedMotion()) return false;
  if (DEV_FORCE_INTRO) return true;
  return sessionStorage.getItem('badsonIntroSeen') !== '1';
}

function markSeen() {
  sessionStorage.setItem('badsonIntroSeen', '1');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function showAppSmooth() {
  const app = document.getElementById('app');
  if (!app) return;

  app.classList.remove('is-hidden');

  requestAnimationFrame(() => {
    app.classList.add('is-visible');
  });
}

function hideIntro() {
  const intro = document.getElementById('intro');
  if (!intro) return;

  intro.classList.add('is-fading');
  setTimeout(() => intro.remove(), 240);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function isInsideRect(x, y, rect, padding = 0) {
  return (
    x >= rect.left - padding &&
    x <= rect.right + padding &&
    y >= rect.top - padding &&
    y <= rect.bottom + padding
  );
}

function pickPositionAvoidingSafeZone(viewW, viewH, safeRect, tries = 30) {
  for (let i = 0; i < tries; i++) {
    const x = randomBetween(0, viewW);
    const y = randomBetween(0, viewH);
    if (!isInsideRect(x, y, safeRect, 36)) return { x, y };
  }
  return { x: randomBetween(0, viewW), y: randomBetween(0, viewH) };
}

function createTag() {
  const el = document.createElement('div');
  el.className = 'intro__tag';
  el.textContent = 'BADSON';

  const size = randomBetween(8, 34);
  const a = randomBetween(0.06, 0.18);
  const r = randomBetween(-15, 15);

  el.style.fontSize = `${size}px`;
  el.style.setProperty('--a', a.toFixed(3));
  el.style.setProperty('--r', `${r.toFixed(2)}deg`);

  return el;
}

async function runIntro() {
  const intro = document.getElementById('intro');
  const bg = document.getElementById('introBg');
  const center = document.getElementById('introCenter');
  const mark = document.getElementById('introMark');

  if (!intro || !bg || !center || !mark) {
    showAppSmooth();
    hideIntro();
    return;
  }

  if (!shouldShowIntro()) {
    markSeen();
    showAppSmooth();
    hideIntro();
    return;
  }

  const HARD_LIMIT_MS = 6000;
  let forced = false;

  const hardTimer = setTimeout(() => {
    forced = true;
    intro.classList.add('is-clearing');
    mark.classList.add('is-revealed');

    setTimeout(() => {
      markSeen();
      showAppSmooth();
      hideIntro();
    }, 700);
  }, HARD_LIMIT_MS);

  const FILL_MS = 3000;
  const SPAWN_INTERVAL = 5;
  const MAX_TAGS = 300;

  const safeRect = center.getBoundingClientRect();
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;

  const start = performance.now();
  let count = 0;

  while (!forced && (performance.now() - start) < FILL_MS && count < MAX_TAGS) {
    const tag = createTag();
    const pos = pickPositionAvoidingSafeZone(viewW, viewH, safeRect);

    tag.style.setProperty('--x', `${pos.x.toFixed(1)}px`);
    tag.style.setProperty('--y', `${pos.y.toFixed(1)}px`);

    bg.appendChild(tag);
    requestAnimationFrame(() => tag.classList.add('is-in'));

    count++;
    await sleep(SPAWN_INTERVAL);
  }

  if (!forced) {
    mark.classList.add('is-revealed');
    await sleep(900);
  }

  if (!forced) {
    intro.classList.add('is-clearing');
    await sleep(480);
  }

  clearTimeout(hardTimer);
  markSeen();
  showAppSmooth();
  hideIntro();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runIntro, { once: true });
} else {
  runIntro();
}