// Drawing only: the world's state and the current screen in, pixels out.
// The 1280x720 playfield is scaled to fit the window and centred.
import { DIFFS, FIELD, FONT, PALETTE, PANEL_L, PANEL_R, ROUNDS } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_ROUND_WIN = 'roundwin';
export const SCREEN_OVER = 'over';

function isDiff(round, id, isRight) {
  return isRight && ROUNDS[round].diffs.includes(id);
}

function cloud(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 22 * s, y - 8 * s, 22 * s, 0, Math.PI * 2);
  ctx.arc(x + 48 * s, y, 18 * s, 0, Math.PI * 2);
  ctx.fill();
}

function bird(ctx, x, y, color) {
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(x - 12, y); ctx.quadraticCurveTo(x - 5, y - 10, x, y);
  ctx.quadraticCurveTo(x + 5, y - 10, x + 12, y); ctx.stroke();
}

// One harbour picture, drawn at panel (x, y) size 580x480.
// isRight=true draws the altered picture: the round's differences change or vanish.
function drawScene(ctx, panel, round, isRight) {
  const R = ROUNDS[round];
  const ox = panel.x, oy = panel.y;
  ctx.save();
  ctx.beginPath(); ctx.rect(ox, oy, panel.w, panel.h); ctx.clip();
  // Sky
  const sky = ctx.createLinearGradient(0, oy, 0, oy + 260);
  sky.addColorStop(0, R.sky[0]); sky.addColorStop(0.6, R.sky[1]); sky.addColorStop(1, R.sky[2]);
  ctx.fillStyle = sky; ctx.fillRect(ox, oy, panel.w, 260);
  // Sun / moon
  if (!isDiff(round, 'sun', isRight)) {
    ctx.fillStyle = R.night ? '#f5f0c8' : '#ffd94d';
    ctx.beginPath(); ctx.arc(ox + 85, oy + 75, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = R.night ? 'rgba(245,240,200,0.25)' : 'rgba(255,217,77,0.35)';
    ctx.beginPath(); ctx.arc(ox + 85, oy + 75, 44, 0, Math.PI * 2); ctx.fill();
  }
  // Clouds
  const cloudCol = R.night ? '#7a8ab0' : '#ffffff';
  cloud(ctx, ox + 210, oy + 55, 1, cloudCol);
  if (!isDiff(round, 'cloud', isRight)) cloud(ctx, ox + 390, oy + 85, 1.1, cloudCol);
  cloud(ctx, ox + 500, oy + 45, 0.8, cloudCol);
  // Birds
  const birdCol = R.night ? '#dfe6f2' : '#2b3a4a';
  bird(ctx, ox + 150, oy + 125, birdCol);
  if (!isDiff(round, 'bird', isRight)) bird(ctx, ox + 225, oy + 105, birdCol);
  bird(ctx, ox + 300, oy + 135, birdCol);
  // Distant hills
  ctx.fillStyle = R.night ? '#2c4a3a' : '#5da864';
  ctx.beginPath(); ctx.moveTo(ox, oy + 260); ctx.quadraticCurveTo(ox + 150, oy + 200, ox + 300, oy + 260);
  ctx.quadraticCurveTo(ox + 450, oy + 210, ox + 580, oy + 260); ctx.lineTo(ox + 580, oy + 260); ctx.closePath(); ctx.fill();
  // House (left)
  ctx.fillStyle = R.night ? '#7a5a3a' : '#f2e3c6'; ctx.fillRect(ox + 55, oy + 200, 120, 60);
  ctx.fillStyle = R.night ? '#4a2c2c' : '#c65b4e';
  ctx.beginPath(); ctx.moveTo(ox + 45, oy + 200); ctx.lineTo(ox + 115, oy + 160); ctx.lineTo(ox + 185, oy + 200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6b4a2f'; ctx.fillRect(ox + 100, oy + 225, 22, 35);
  ctx.fillStyle = R.night ? '#ffd94d' : '#ffe98a'; ctx.fillRect(ox + 68, oy + 215, 20, 18);
  if (!isDiff(round, 'window', isRight)) { ctx.fillStyle = R.night ? '#ffd94d' : '#ffe98a'; ctx.fillRect(ox + 135, oy + 215, 20, 18); }
  else { ctx.fillStyle = '#2b3a4a'; ctx.fillRect(ox + 135, oy + 215, 20, 18); }
  // Lighthouse (right)
  ctx.fillStyle = '#f2f0e8'; ctx.fillRect(ox + 440, oy + 120, 50, 140);
  ctx.fillStyle = '#d94f3d'; ctx.fillRect(ox + 440, oy + 150, 50, 18); ctx.fillRect(ox + 440, oy + 200, 50, 18);
  ctx.fillStyle = '#2b3a4a'; ctx.fillRect(ox + 435, oy + 100, 60, 22);
  if (!isDiff(round, 'beacon', isRight)) {
    ctx.fillStyle = '#ffe98a'; ctx.fillRect(ox + 452, oy + 104, 26, 14);
    ctx.fillStyle = 'rgba(255,233,138,0.35)';
    ctx.beginPath(); ctx.arc(ox + 465, oy + 111, 30, 0, Math.PI * 2); ctx.fill();
  } else { ctx.fillStyle = '#5a6a7a'; ctx.fillRect(ox + 452, oy + 104, 26, 14); }
  // Flag on the lighthouse
  ctx.strokeStyle = '#3a2c22'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(ox + 465, oy + 100); ctx.lineTo(ox + 465, oy + 78); ctx.stroke();
  if (!isDiff(round, 'flag', isRight)) {
    ctx.fillStyle = '#e5534b'; ctx.beginPath(); ctx.moveTo(ox + 465, oy + 78); ctx.lineTo(ox + 498, oy + 86); ctx.lineTo(ox + 465, oy + 96); ctx.closePath(); ctx.fill();
  }
  // Sea
  ctx.fillStyle = R.sea; ctx.fillRect(ox, oy + 260, panel.w, 160);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3;
  for (const wy of [285, 315, 350, 390]) {
    ctx.beginPath();
    for (let x = 0; x <= 580; x += 20) ctx.quadraticCurveTo(ox + x + 10, oy + wy - 6, ox + x + 20, oy + wy);
    ctx.stroke();
  }
  // Boat
  ctx.fillStyle = '#6b4a2f'; ctx.beginPath(); ctx.moveTo(ox + 200, oy + 330); ctx.lineTo(ox + 330, oy + 330); ctx.lineTo(ox + 310, oy + 355); ctx.lineTo(ox + 220, oy + 355); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3a2c22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ox + 265, oy + 330); ctx.lineTo(ox + 265, oy + 255); ctx.stroke();
  ctx.fillStyle = isDiff(round, 'sail', isRight) ? '#3a7bd5' : '#e5534b';
  ctx.beginPath(); ctx.moveTo(ox + 265, oy + 258); ctx.lineTo(ox + 265, oy + 325); ctx.lineTo(ox + 315, oy + 325); ctx.closePath(); ctx.fill();
  // Buoy
  if (!isDiff(round, 'buoy', isRight)) {
    ctx.fillStyle = '#ff7a2f'; ctx.beginPath(); ctx.arc(ox + 385, oy + 365, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(ox + 371, oy + 361, 28, 7);
  }
  // Beach
  ctx.fillStyle = R.sand; ctx.fillRect(ox, oy + 420, panel.w, 60);
  // Crab
  if (!isDiff(round, 'crab', isRight)) {
    ctx.fillStyle = '#e5534b'; ctx.beginPath(); ctx.arc(ox + 90, oy + 445, 12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e5534b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ox + 78, oy + 438); ctx.lineTo(ox + 66, oy + 430); ctx.moveTo(ox + 102, oy + 438); ctx.lineTo(ox + 114, oy + 430); ctx.stroke();
  }
  // Panel label (bottom-right corner, clear of the sun, the crab and the found-markers)
  ctx.fillStyle = 'rgba(16,24,32,0.75)'; ctx.fillRect(ox + panel.w - 120, oy + panel.h - 36, 110, 26);
  ctx.fillStyle = '#ffffff'; ctx.font = `bold 15px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(isRight ? 'PICTURE B' : 'PICTURE A', ox + panel.w - 110, oy + panel.h - 23);
  ctx.restore();
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width; canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  function text(value, x, y, size, color, align, weight) {
    context.font = `${weight || ''} ${size}px ${FONT}`.trim();
    context.fillStyle = color; context.textAlign = align; context.textBaseline = 'alphabetic';
    context.fillText(value, x, y);
  }

  // Convert a client (CSS pixel) click to logical field coordinates.
  function toField(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const px = (clientX - rect.left) * (canvas.width / rect.width);
    const py = (clientY - rect.top) * (canvas.height / rect.height);
    return { x: (px - view.x) / view.scale, y: (py - view.y) / view.scale };
  }

  function drawPanels(state) {
    drawScene(context, PANEL_L, state.round, false);
    drawScene(context, PANEL_R, state.round, true);
    // Borders + found markers on both pictures
    for (const panel of [PANEL_L, PANEL_R]) {
      context.strokeStyle = '#e8eef2'; context.lineWidth = 3;
      context.strokeRect(panel.x, panel.y, panel.w, panel.h);
      for (const id of state.found) {
        const d = DIFFS.find((v) => v.id === id);
        context.strokeStyle = PALETTE.found; context.lineWidth = 5;
        context.beginPath(); context.arc(panel.x + d.x, panel.y + d.y, d.r + 4, 0, Math.PI * 2); context.stroke();
        context.fillStyle = PALETTE.found;
        context.beginPath(); context.arc(panel.x + d.x, panel.y + d.y - d.r - 2, 11, 0, Math.PI * 2); context.fill();
        context.strokeStyle = '#ffffff'; context.lineWidth = 3;
        context.beginPath(); context.moveTo(panel.x + d.x - 5, panel.y + d.y - d.r - 2); context.lineTo(panel.x + d.x - 1, panel.y + d.y - d.r + 3); context.lineTo(panel.x + d.x + 6, panel.y + d.y - d.r - 6); context.stroke();
      }
      // Hint pulse
      if (state.hint) {
        const d = state.hint;
        context.strokeStyle = PALETTE.hint; context.lineWidth = 4;
        context.setLineDash([8, 6]);
        context.beginPath(); context.arc(panel.x + d.x, panel.y + d.y, d.r + 10, 0, Math.PI * 2); context.stroke();
        context.setLineDash([]);
      }
      // Wrong-click X
      if (state.lastMiss && state.lastMissTimer > 0) {
        // lastMiss is panel-local; it was clicked on one picture only, so draw on both at same local spot (harmless, fades fast)
        context.strokeStyle = PALETTE.miss; context.lineWidth = 5;
        const mx = panel.x + state.lastMiss.x, my = panel.y + state.lastMiss.y;
        context.beginPath(); context.moveTo(mx - 12, my - 12); context.lineTo(mx + 12, my + 12); context.moveTo(mx + 12, my - 12); context.lineTo(mx - 12, my + 12); context.stroke();
      }
    }
  }

  function drawHud(state, screen) {
    const round = ROUNDS[state.round];
    const total = state.diffs ? state.diffs().length : round.diffs.length;
    const remaining = total - state.found.length;
    text('HARBOUR SPOTTER', 40, 42, 30, PALETTE.text, 'left', 'bold');
    text(round.name, 640, 42, 22, PALETTE.muted, 'center');
    text(`Found ${state.found.length} of ${total}  •  ${remaining} left`, 640, 72, 24, remaining === 0 ? PALETTE.good : PALETTE.accent, 'center', 'bold');
    text(`Time ${Math.ceil(state.timeLeft)}s`, 1240, 42, 24, state.timeLeft < 15 ? PALETTE.bad : PALETTE.text, 'right', 'bold');
    text(`Score ${state.score}   Misses ${state.misses}   Hints ${state.hintsLeft} (H)`, 1240, 72, 20, PALETTE.muted, 'right');
    text('Click a difference on either picture  •  H hint  •  P pause  •  R restart  •  M sound', 640, 632, 19, PALETTE.muted, 'center');
    text('Two pictures, one harbour — only one side has every change. Find them all before the clock runs out!', 640, 662, 17, PALETTE.muted, 'center');
  }

  function drawPanel(title, lines, prompt) {
    const width = 640, height = 150 + lines.length * 34;
    const x = (FIELD.width - width) / 2, y = (FIELD.height - height) / 2;
    context.fillStyle = 'rgba(10,16,22,0.82)'; context.fillRect(0, 0, FIELD.width, FIELD.height);
    context.fillStyle = PALETTE.panel; context.fillRect(x, y, width, height);
    context.strokeStyle = PALETTE.accent; context.lineWidth = 3; context.strokeRect(x, y, width, height);
    text(title, FIELD.width / 2, y + 62, 40, PALETTE.text, 'center', 'bold');
    lines.forEach((line, i) => text(line, FIELD.width / 2, y + 110 + i * 34, 21, PALETTE.muted, 'center'));
    text(prompt, FIELD.width / 2, y + height - 28, 22, PALETTE.accent, 'center', 'bold');
  }

  function draw(state, screen, best) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop; context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawPanels(state);
    drawHud(state, screen);
    if (screen === SCREEN_TITLE) {
      drawPanel('HARBOUR SPOTTER', ['Two pictures of the same harbour. Seven things are different.', 'Click each difference on either picture. Find all 7 before time runs out.', `Best score ${best}`], 'Press Space or click to start');
    } else if (screen === SCREEN_PAUSED) {
      drawPanel('Paused', ['The clock is waiting for you.'], 'Press P to resume');
    } else if (screen === SCREEN_ROUND_WIN) {
      const last = state.round >= ROUNDS.length - 1;
      drawPanel(last ? 'You found them all!' : 'Round clear!', [`Round score ${state.score}  •  Total ${state.totalScore}`, last ? `Best score ${Math.max(best, state.totalScore)}` : 'A new harbour, a new light, new differences next.'], last ? 'Press Space to play again' : 'Press Space for the next round');
    } else if (screen === SCREEN_OVER) {
      drawPanel(state.timeUp ? "Time's up!" : 'Game over', [`You found ${state.found.length} of ${ROUNDS[state.round].diffs.length} differences this round.`, `Total score ${state.totalScore}  •  Best ${Math.max(best, state.totalScore)}`], 'Press Space to play again');
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, toField };
}
