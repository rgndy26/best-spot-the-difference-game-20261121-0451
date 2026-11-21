// Screenshot scenes behind ?shot=start|play|end. Each stages a real game state:
// start: title over a fresh round, 0 found. play: 2 found, 5 still unfound, counter
// shows 5 left. end: all 7 found, round-win screen.
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_ROUND_WIN, SCREEN_TITLE } from './render.js';

export function stageShot(name, world) {
  world.reset();
  if (name === 'play') {
    // Find the first two differences for real, through the game's own click rules.
    const list = world.diffs();
    for (const d of list.slice(0, 2)) world.click(d.x, d.y);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'end') {
    const list = world.diffs();
    for (const d of list) world.click(d.x, d.y);
    return { screen: SCREEN_ROUND_WIN, best: world.state.totalScore };
  }
  return { screen: SCREEN_TITLE, best: 0 };
}
