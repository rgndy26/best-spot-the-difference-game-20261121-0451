// Keyboard and pointer input. One-shot presses are queued as flags and taken once.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;
export const ACTION_MUTE = 16;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const HINT = new Set(['KeyH']);
const RESTART = new Set(['KeyR']);
const MUTE = new Set(['KeyM']);

export function createInput(target, onClick) {
  let actions = 0;
  window.addEventListener('keydown', (event) => {
    if (CONFIRM.has(event.code)) { if (!event.repeat) actions |= ACTION_CONFIRM; }
    else if (PAUSE.has(event.code)) { if (!event.repeat) actions |= ACTION_PAUSE; }
    else if (HINT.has(event.code)) { if (!event.repeat) actions |= ACTION_HINT; }
    else if (RESTART.has(event.code)) { if (!event.repeat) actions |= ACTION_RESTART; }
    else if (MUTE.has(event.code)) { if (!event.repeat) actions |= ACTION_MUTE; }
    else return;
    event.preventDefault();
  });
  target.addEventListener('pointerdown', (event) => {
    actions |= ACTION_CONFIRM;
    if (onClick) onClick(event.clientX, event.clientY);
  });
  return {
    takeActions() { const taken = actions; actions = 0; return taken; },
  };
}
