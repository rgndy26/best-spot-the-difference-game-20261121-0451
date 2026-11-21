// Boot and the one loop. Screens: title, play, paused, round-win, game over.
// ?seed=N fixes the game. ?shot=start|play|end stages that scene instead of
// running the loop, paints it twice and sets window.__shotReady for a screenshot.
import { BEST_KEY, PANEL_L, PANEL_R, ROUNDS } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_FOUND, EVENT_MISS, EVENT_ROUND_WIN, EVENT_TIME_UP } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_PAUSE, ACTION_RESTART, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_ROUND_WIN, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
let muted = false;
let audio = null;

function beep(freq, ms) {
  if (muted) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.frequency.value = freq; osc.connect(gain); gain.connect(audio.destination);
    gain.gain.setValueAtTime(0.12, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + ms / 1000);
    osc.start(); osc.stop(audio.currentTime + ms / 1000);
  } catch { /* sound is optional */ }
}

function readBest() {
  try { return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0; } catch { return 0; }
}
function saveBest(value) {
  try { window.localStorage.setItem(BEST_KEY, String(value)); } catch { /* private mode */ }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();
  let last = performance.now();
  let pendingClick = null;

  const input = createInput(canvas, (x, y) => { pendingClick = { x, y }; });
  function announce(message) { status.textContent = message; }

  function startGame() {
    world.reset();
    screen = SCREEN_PLAY;
    announce(`Playing. ${ROUNDS[0].name}. Find 7 differences.`);
  }
  function nextRound() {
    if (world.state.round + 1 < ROUNDS.length) {
      world.resetRound(world.state.round + 1);
      screen = SCREEN_PLAY;
      announce(`Playing. ${ROUNDS[world.state.round].name}.`);
    } else startGame();
  }
  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.totalScore > best) { best = world.state.totalScore; saveBest(best); }
    announce(`Game over. Total score ${world.state.totalScore}. Best ${best}.`);
  }

  function handleClick() {
    if (!pendingClick) return;
    const p = renderer.toField(pendingClick.x, pendingClick.y);
    pendingClick = null;
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) { startGame(); return; }
    if (screen === SCREEN_ROUND_WIN) { nextRound(); return; }
    if (screen !== SCREEN_PLAY) return;
    // Which picture was clicked? Map to panel-local coordinates.
    let local = null;
    if (p.x >= PANEL_L.x && p.x < PANEL_L.x + PANEL_L.w && p.y >= PANEL_L.y && p.y < PANEL_L.y + PANEL_L.h) local = { x: p.x - PANEL_L.x, y: p.y - PANEL_L.y };
    else if (p.x >= PANEL_R.x && p.x < PANEL_R.x + PANEL_R.w && p.y >= PANEL_R.y && p.y < PANEL_R.y + PANEL_R.h) local = { x: p.x - PANEL_R.x, y: p.y - PANEL_R.y };
    if (!local) return;
    const events = world.click(local.x, local.y);
    if (events & EVENT_FOUND) { beep(880, 120); announce(`Found ${world.state.found.length} of ${world.diffs().length}.`); }
    if (events & EVENT_MISS) { beep(180, 150); announce(`Not a difference. ${world.state.misses} misses.`); }
    if (events & EVENT_ROUND_WIN) {
      beep(1040, 200);
      if (world.state.totalScore > best) { best = world.state.totalScore; saveBest(best); }
      screen = SCREEN_ROUND_WIN;
      announce(`Round clear! Total score ${world.state.totalScore}.`);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25); last = now;
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) muted = !muted;
    if (actions & ACTION_RESTART && screen !== SCREEN_TITLE) startGame();
    else if (actions & ACTION_CONFIRM && screen === SCREEN_TITLE) startGame();
    else if (actions & ACTION_CONFIRM && screen === SCREEN_OVER) startGame();
    else if (actions & ACTION_CONFIRM && screen === SCREEN_ROUND_WIN) nextRound();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) { screen = SCREEN_PAUSED; announce('Paused.'); }
    else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) { screen = SCREEN_PLAY; announce('Playing.'); }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      const pick = world.hint();
      if (pick) { beep(660, 100); announce(`Hint: look near ${pick.label}.`); }
    }
    handleClick();
    if (screen === SCREEN_PLAY) {
      const events = world.step(dt);
      if (events & EVENT_TIME_UP) endGame();
    }
    renderer.draw(world.state, screen, best);
  }

  announce('Harbour Spotter. Press Space or click to start. Find 7 differences.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
