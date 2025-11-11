/* 
  Constants
  - Static configuration used across the game (sizes, timings, payouts, etc.).
  - Keep this file dependency-free to avoid circular imports.
*/
// Game dimension & symbol constants
export const REEL_COUNT = 5;
export const SYMBOLS_PER_REEL = 3;
export const SYMBOL_WIDTH = 200;
export const SYMBOL_HEIGHT = 200;
export const TOTAL_SYMBOLS = 42;

// Timing
export const SPIN_SPEED = 40;
export const MIN_SPIN_TIME = 1200;
export const MAX_SPIN_TIME = 2200;
export const SPIN_DELAY_PER_REEL = 200;

// Reel geometry (pixels per symbol, grid size)
export const REEL_GEOMETRY = {
  width: SYMBOL_WIDTH,
  height: SYMBOL_HEIGHT,
  grid: {
    cols: REEL_COUNT,
    rows: SYMBOLS_PER_REEL
  }
};

// Spin timings (ms) and offsets between reels
export const SPIN_TIMINGS = {
  base: MIN_SPIN_TIME,
  delay: SPIN_DELAY_PER_REEL
};

// Big win thresholds and counter pacing
export const BIG_WIN_MULTIPLIER = 10;    // >= bet * this triggers animation
export const LOG_SPEED_PROG_1 = 20;      // x20 bet acceleration
export const LOG_SPEED_PROG_2 = 50;      // x50 bet strong acceleration

// Symbol strip and payline definitions
export const SYMBOL_MAP = [
  "J","10","K","A","WILD","CIRI","YEN","GER","B!",
  "J","J","J","10","10","10","K","K","K","A","A","A",
  "WILD","WILD","WILD","CIRI","YEN","GER",
  "J","J","J","10","10","K","K","A","A","YEN","CIRI",
  "CIRI","YEN","GER","B!"
];

// Paylines (each is array of [col,row])
export const PAY_LINES = [
  [[0,1],[1,1],[2,1],[3,1],[4,1]],
  [[0,0],[1,0],[2,0],[3,0],[4,0]],
  [[0,2],[1,2],[2,2],[3,2],[4,2]],
  [[0,0],[1,1],[2,2],[3,1],[4,0]],
  [[0,2],[1,1],[2,0],[3,1],[4,2]],
  // ... (keep remaining lines)
];

// Payout table: symbol => multiplier for {3,4,5} in a line
export const PAYOUTS = {
  J:   {3:0.1, 4:0.3, 5:1},
  "10":{3:0.1, 4:0.3, 5:1},
  K:   {3:0.1, 4:0.3, 5:1},
  A:   {3:0.1, 4:0.3, 5:1},
  YEN: {3:0.5, 4:1.5, 5:3},
  CIRI:{3:0.5, 4:1.5, 5:3},
  WILD:{3:0.5, 4:1.5, 5:3},
  GER: {3:1,   4:2.5, 5:5},
  "B!":{3:1,   4:2.5, 5:5}
};

// Bonus buy multipliers
export const MEGA_BONUS_BUY_MULTIPLIER = 100;   // cost = bet * 100
export const HNS_BONUS_BUY_MULTIPLIER  = 70;    // cost = bet * 70

// Rendering depths (Phaser)
export const DEPTH_REELS = 0;
export const DEPTH_COINS = 10;
export const DEPTH_COINS_TEXT = 11;
export const DEPTH_WOLF = 9000;              // MegaWild sprite (below lines)
export const DEPTH_WINLINE_GLOW = 10010;     // Win lines glow
export const DEPTH_WINLINE = 10020;          // Win lines main