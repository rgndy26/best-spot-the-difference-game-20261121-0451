// Harbour Spotter: every tuning number, colour and difference in one place.
// Playfield is a fixed 1280x720 logical area; the renderer scales it to the window.
export const FIELD = { width: 1280, height: 720 };
export const PANEL_L = { x: 40, y: 100, w: 580, h: 480 };
export const PANEL_R = { x: 660, y: 100, w: 580, h: 480 };
export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
export const BEST_KEY = 'harbour-spotter.best';

// Differences, in panel-local coordinates (panel is 580x480).
// id, x, y, radius, label. The right picture alters each one listed for the round.
export const DIFFS = [
  { id: 'sun',    x: 85,  y: 75,  r: 34, label: 'the sun' },
  { id: 'bird',   x: 225, y: 105, r: 20, label: 'a bird' },
  { id: 'sail',   x: 265, y: 292, r: 38, label: 'the sail colour' },
  { id: 'beacon', x: 465, y: 128, r: 24, label: 'the lighthouse light' },
  { id: 'buoy',   x: 385, y: 365, r: 22, label: 'the buoy' },
  { id: 'window', x: 145, y: 225, r: 20, label: 'a house window' },
  { id: 'flag',   x: 482, y: 96,  r: 20, label: 'the flag' },
  { id: 'cloud',  x: 390, y: 85,  r: 38, label: 'a cloud' },
  { id: 'crab',   x: 90,  y: 445, r: 22, label: 'the crab' },
];

// Three rounds: same harbour, different light and a different set of 7 differences.
export const ROUNDS = [
  { name: 'Round 1 — Sunset Harbour', time: 90, diffs: ['sun', 'bird', 'sail', 'beacon', 'buoy', 'window', 'flag'],
    sky: ['#ffd98a', '#ff9a5c', '#7ec8e3'], sea: '#2e7fa8', sand: '#e8c98f', night: false },
  { name: 'Round 2 — Night Harbour', time: 75, diffs: ['sun', 'bird', 'sail', 'beacon', 'window', 'cloud', 'crab'],
    sky: ['#1c2b4a', '#3a4a7a', '#5a6ea8'], sea: '#16324a', sand: '#8a7a5e', night: true },
  { name: 'Round 3 — Morning Harbour', time: 60, diffs: ['bird', 'sail', 'beacon', 'buoy', 'window', 'flag', 'cloud'],
    sky: ['#bfe8ff', '#e8f7ff', '#9fd8ef'], sea: '#3a9ab5', sand: '#f0d49a', night: false },
];

export const PALETTE = {
  backdrop: '#101820', panel: '#1c2836', text: '#f2f5f7', muted: '#9fb0bd',
  accent: '#f2c94c', good: '#4ade80', bad: '#e5534b', hint: '#f2c94c',
  found: '#22c55e', miss: '#ef4444',
};
export const CLICK_RADIUS = 30;
export const HINTS_PER_ROUND = 3;
export const POINTS_FOUND = 100;
export const POINTS_MISS = -25;
export const POINTS_HINT = -50;
