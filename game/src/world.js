// Rules and state, no drawing and no browser in it: rounds, differences found,
// timer, score, hints and misses. Clicks are in panel-local coordinates.
import { CLICK_RADIUS, DIFFS, HINTS_PER_ROUND, POINTS_FOUND, POINTS_HINT, POINTS_MISS, ROUNDS } from './config.js';

export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_ROUND_WIN = 4;
export const EVENT_TIME_UP = 8;

export function roundDiffs(roundIndex) {
  const round = ROUNDS[roundIndex];
  return round.diffs.map((id) => DIFFS.find((d) => d.id === id));
}

export function createWorld(random) {
  const state = {
    round: 0, found: [], misses: 0, hintsLeft: HINTS_PER_ROUND,
    hint: null, hintTimer: 0, timeLeft: ROUNDS[0].time, score: 0, totalScore: 0,
    elapsed: 0, lastMiss: null, lastMissTimer: 0, won: false, timeUp: false,
  };

  function diffs() { return roundDiffs(state.round); }

  function resetRound(roundIndex) {
    state.round = roundIndex;
    state.found = [];
    state.misses = 0;
    state.hintsLeft = HINTS_PER_ROUND;
    state.hint = null; state.hintTimer = 0;
    state.timeLeft = ROUNDS[roundIndex].time;
    state.score = 0;
    state.lastMiss = null; state.lastMissTimer = 0;
    state.won = false; state.timeUp = false;
  }

  function reset() {
    state.totalScore = 0;
    resetRound(0);
  }

  // Click at panel-local (x, y) on either picture. Returns event flags.
  function click(x, y) {
    if (state.won || state.timeUp) return 0;
    const list = diffs();
    for (const d of list) {
      if (state.found.includes(d.id)) continue;
      const dx = x - d.x, dy = y - d.y;
      if (dx * dx + dy * dy <= (CLICK_RADIUS + d.r * 0.4) * (CLICK_RADIUS + d.r * 0.4)) {
        state.found.push(d.id);
        state.score += POINTS_FOUND;
        if (state.found.length === list.length) {
          state.won = true;
          state.totalScore += state.score + Math.round(state.timeLeft) * 5;
          return EVENT_FOUND | EVENT_ROUND_WIN;
        }
        return EVENT_FOUND;
      }
    }
    state.misses += 1;
    state.score = Math.max(0, state.score + POINTS_MISS);
    state.lastMiss = { x, y };
    state.lastMissTimer = 0.6;
    return EVENT_MISS;
  }

  function hint() {
    if (state.won || state.timeUp || state.hintsLeft <= 0) return null;
    const remaining = diffs().filter((d) => !state.found.includes(d.id));
    if (!remaining.length) return null;
    const pick = remaining[Math.floor(random() * remaining.length)];
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score + POINTS_HINT);
    state.hint = pick; state.hintTimer = 3;
    return pick;
  }

  function step(dt) {
    if (state.won || state.timeUp) return 0;
    state.elapsed += dt;
    state.timeLeft -= dt;
    if (state.hintTimer > 0) { state.hintTimer -= dt; if (state.hintTimer <= 0) state.hint = null; }
    if (state.lastMissTimer > 0) state.lastMissTimer -= dt;
    if (state.timeLeft <= 0) { state.timeLeft = 0; state.timeUp = true; return EVENT_TIME_UP; }
    return 0;
  }

  reset();
  return { state, reset, resetRound, click, hint, step, diffs };
}
