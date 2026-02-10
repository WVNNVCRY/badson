// scripts/bg-plane.js
// BG plane: canvas trail + DOM SVG plane
// - trail stays until reload
// - plane moves along smooth random trajectory
// - respects prefers-reduced-motion

export function startBackgroundPlane(userOptions = {}) {
  // respect prefers-reduced-motion
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (reduce) return { stop() { } };

  // ====== TUNING: крути всё тут ======
  const CFG = {
    // trail style
    trailColor: 'rgba(210, 30, 30, 0.18)',
    trailWidth: 1,
    trailJitter: 0.45, // карандашность

    // plane style (DOM SVG)
    planeSize: 28,
    planeOpacity: 0.9,
    planeAngleOffset: 0,          // если нос не туда — ставь Math.PI
    planeAnchor: { x: 10, y: 44 },// ЭТО ДОЛЖЕН БЫТЬ ХВОСТ В SVG
    planeWobble: 0.06,

    // motion
    speed: 150,
    turnSmoothness: 0.07,
    changeDirMs: 850,

    // allow outside + quick return
    outsideMargin: 140,
    returnForce: 0.28,

    // perf
    dprCap: 2,
    fpsCap: 60,

    // IMPORTANT:
    // никаких tailOffsetPx не надо, если planeAnchor = хвост
    trailEndSnap: true,
  };

  Object.assign(CFG, userOptions);

  const trailCanvas = document.querySelector('canvas.bg-trail');
  const planeSvg = document.querySelector('svg.plane');

  if (!trailCanvas) {
    console.warn('[bg-plane] Missing <canvas class="bg-trail"> in HTML');
    return { stop() { } };
  }
  if (!planeSvg) {
    console.warn('[bg-plane] Missing <svg class="plane"> in HTML');
    return { stop() { } };
  }

  applyFixedCanvasStyles(trailCanvas, 0);

  const ps = planeSvg.style;
  ps.position = 'fixed';
  ps.left = '0';
  ps.top = '0';
  ps.width = `${CFG.planeSize}px`;
  ps.height = 'auto';
  ps.pointerEvents = 'none';
  ps.opacity = String(CFG.planeOpacity);
  ps.zIndex = '1';
  ps.transformOrigin = '50% 50%';
  ps.willChange = 'transform';
  const vb = planeSvg.viewBox?.baseVal;
  const vbW = vb?.width || 120;               // ширина viewBox
  const scale = CFG.planeSize / vbW;          // px на 1 unit viewBox

  const tailEl = planeSvg.querySelector('#tail');
  const tailCx = tailEl ? Number(tailEl.getAttribute('cx')) : (CFG.planeAnchor?.x ?? 10);
  const tailCy = tailEl ? Number(tailEl.getAttribute('cy')) : (CFG.planeAnchor?.y ?? 44);

  const ax = tailCx * scale;
  const ay = tailCy * scale;

  ps.transformOrigin = `${ax}px ${ay}px`;

  const ctx = trailCanvas.getContext('2d', { alpha: true });

  let running = true;
  let rafId = 0;

  let dpr = clampDpr(window.devicePixelRatio || 1, CFG.dprCap);

  function resize() {
    dpr = clampDpr(window.devicePixelRatio || 1, CFG.dprCap);
    const w = window.innerWidth;
    const h = window.innerHeight;

    trailCanvas.width = Math.floor(w * dpr);
    trailCanvas.height = Math.floor(h * dpr);
    trailCanvas.style.width = `${w}px`;
    trailCanvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // resize сбрасывает canvas -> след исчезнет при ресайзе/повороте
  }

  resize();
  window.addEventListener('resize', resize);

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  // ====== motion state ======
  let x = W() * 0.35;
  let y = H() * 0.55;
  let lastX = x;
  let lastY = y;

  let angle = Math.random() * Math.PI * 2;
  let targetAngle = angle;
  let nextDirAt = performance.now() + CFG.changeDirMs;

  // FPS cap
  let lastT = performance.now();
  let acc = 0;
  const frameMs = 1000 / CFG.fpsCap;

  function pickNewTargetAngle() {
    const delta = (Math.random() * 2 - 1) * (Math.PI / 2.2);
    targetAngle = angle + delta;
  }

  function isOutside(px, py) {
    const m = CFG.outsideMargin;
    return px < -m || px > W() + m || py < -m || py > H() + m;
  }

  function steerBackIfNeeded() {
    if (!isOutside(x, y)) return;

    const cx = W() * 0.5;
    const cy = H() * 0.5;
    const toCenter = Math.atan2(cy - y, cx - x);

    const diff = normalizeAngle(toCenter - targetAngle);
    targetAngle += diff * CFG.returnForce;
  }

  function drawTrail(x0, y0, x1, y1, snapEnd = false) {
    ctx.lineWidth = CFG.trailWidth;
    ctx.strokeStyle = CFG.trailColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const j = CFG.trailJitter;

    const sx = x0 + (Math.random() * 2 - 1) * j;
    const sy = y0 + (Math.random() * 2 - 1) * j;

    const ex = snapEnd ? x1 : x1 + (Math.random() * 2 - 1) * j;
    const ey = snapEnd ? y1 : y1 + (Math.random() * 2 - 1) * j;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  function movePlane(px, py, ang, now) {
    const wobble = Math.sin(now * 0.006) * CFG.planeWobble;
    const rot = ang + CFG.planeAngleOffset + wobble;

    // хвост (ax,ay) должен оказаться в (px,py)
    planeSvg.style.transform = `
    translate3d(${px - ax}px, ${py - ay}px, 0)
    rotate(${rot}rad)
  `;
  }

  function tick(now) {
    if (!running) return;

    const dtRaw = now - lastT;
    lastT = now;
    acc += dtRaw;

    if (acc < frameMs) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    const dt = Math.min(40, acc) / 1000;
    acc = 0;

    if (now >= nextDirAt) {
      pickNewTargetAngle();
      nextDirAt = now + CFG.changeDirMs * rand(0.85, 1.25);
    }

    steerBackIfNeeded();

    const diff = normalizeAngle(targetAngle - angle);
    angle += diff * CFG.turnSmoothness;

    const vx = Math.cos(angle) * CFG.speed;
    const vy = Math.sin(angle) * CFG.speed;

    x += vx * dt;
    y += vy * dt;

    // ✅ ВАЖНО:
    // (x,y) — это ТОЧКА planeAnchor (хвоста), потому что movePlane клеит anchor в px/py.
    // Значит след рисуем прямо по (x,y), без trig-offset'ов.
    drawTrail(lastX, lastY, x, y, CFG.trailEndSnap);

    movePlane(x, y, angle, now);

    lastX = x;
    lastY = y;

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
  }

  return { stop };
}

function applyFixedCanvasStyles(canvas, zIndex) {
  const s = canvas.style;
  s.position = 'fixed';
  s.left = '0';
  s.top = '0';
  s.width = '100vw';
  s.height = '100vh';
  s.pointerEvents = 'none';
  s.display = 'block';
  s.zIndex = String(zIndex);
}

function normalizeAngle(a) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

function clampDpr(dpr, cap) {
  return Math.max(1, Math.min(cap, dpr));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}