/*
  Hold & Spin bonus
  Flow:
  - startHoldAndSpin: build sticky grid from current snapshot (WILD -> coin with value),
    render coins, switch strip, and auto start the first bonus spin.
  - processHoldAndSpinStop: add new coins, reset spins-left to 3 when new appears,
    re-render coins with texts, continue until spins-left==0 or board is full.
  - endHoldAndSpin: sum all coin values, pay and exit to normal strip/spins.
*/
import { state } from './state.js';
import { REEL_COUNT, SYMBOLS_PER_REEL, SYMBOL_WIDTH, SYMBOL_HEIGHT } from './constants.js';
import { showWinAmount, updateBalance } from './ui.js';
import { setStrip } from './reels.js';
import { clearWinLines } from './winLines.js';

/** Enter H&S mode, seed grid and kick first bonus spin */
export function startHoldAndSpin(scene, visibleSymbols) {
  if (!visibleSymbols) visibleSymbols = [];
  state.holdAndSpinActive = true;
  state.holdAndSpinSpinsLeft = 3;
  state.holdAndSpinGrid = [];
  state.holdAndSpinMultipliers = [];
  const bet = state.currentBet;

  for (let c=0;c<REEL_COUNT;c++) {
    state.holdAndSpinGrid[c]=[];
    state.holdAndSpinMultipliers[c]=[];
    for (let r=0;r<SYMBOLS_PER_REEL;r++) {
      if (visibleSymbols[c] && visibleSymbols[c][r] === 'WILD') {
        state.holdAndSpinGrid[c][r]=true;
        const mult = randMultiplier();
        state.holdAndSpinMultipliers[c][r]=parseFloat((mult*bet).toFixed(2));
      } else {
        state.holdAndSpinGrid[c][r]=false;
        state.holdAndSpinMultipliers[c][r]=null;
      }
    }
  }
  removeSticky();
  renderCoins(scene, visibleSymbols);
  try { setStrip(scene,'slotStripHoldAndSpin'); } catch {}
  state.spinning = false;
  setTimeout(()=> state.spinHandler(scene), 50); // start first bonus spin
}

/** Handle one H&S spin stop, update grid and schedule next spin or finish */
export function processHoldAndSpinStop(scene, visibleSymbols) {
  let newWild=false;
  const bet = state.currentBet;
  for (let c=0;c<REEL_COUNT;c++) {
    for (let r=0;r<SYMBOLS_PER_REEL;r++) {
      if (visibleSymbols[c][r] === 'WILD' && !state.holdAndSpinGrid[c][r]) {
        state.holdAndSpinGrid[c][r]=true;
        const mult=randMultiplier();
        state.holdAndSpinMultipliers[c][r]=parseFloat((mult*bet).toFixed(2));
        newWild=true;
      }
    }
  }
  removeSticky();
  renderCoins(scene, visibleSymbols);
  state.holdAndSpinSpinsLeft = newWild ? 3 : state.holdAndSpinSpinsLeft - 1;

  if (state.holdAndSpinSpinsLeft === 0 || isGridFull()) {
    endHoldAndSpin(scene);
  } else {
    state.spinning = false;
    setTimeout(()=> state.spinHandler(scene), 600);
  }
  return true;
}

/** Sum coins and exit bonus back to normal play */
function endHoldAndSpin(scene) {
  state.holdAndSpinActive=false;
  removeSticky();
  let total=0;
  for (let c=0;c<REEL_COUNT;c++)
    for (let r=0;r<SYMBOLS_PER_REEL;r++)
      if (state.holdAndSpinGrid[c][r] && state.holdAndSpinMultipliers[c][r])
        total += state.holdAndSpinMultipliers[c][r];
  showWinAmount(total);
  if (total>0) state.balance += total;
  updateBalance();
  state.holdAndSpinGrid = [];
  state.holdAndSpinMultipliers = [];
  try { setStrip(scene,'slotStrip'); } catch {}
  clearWinLines();
  state.spinning=false; // ready for normal spins
}

/** Helper: random multiplier applied to bet for a coin value */
function randMultiplier() { return Math.random()*(4-1.5)+1.5; }
/** Helper: check if all cells are filled with sticky coins */
function isGridFull() {
  for (let c=0;c<REEL_COUNT;c++)
    for (let r=0;r<SYMBOLS_PER_REEL;r++)
      if (!state.holdAndSpinGrid[c][r]) return false;
  return true;
}
/** Render all sticky coins with their numeric values; rebuilds sprites every call */
function renderCoins(scene) {
  removeSticky();
  for (let c=0;c<REEL_COUNT;c++) {
    for (let r=0;r<SYMBOLS_PER_REEL;r++) {
      if (state.holdAndSpinGrid[c][r]) {
        const cx = c*SYMBOL_WIDTH + SYMBOL_WIDTH/2;
        const cy = r*SYMBOL_HEIGHT + SYMBOL_HEIGHT/2;

        const spr = scene.add.image(cx, cy, 'wild')
          .setDisplaySize(SYMBOL_WIDTH, SYMBOL_HEIGHT);
        spr.setDepth(10);
        state.stickyWildSprites.push(spr);

        const val = state.holdAndSpinMultipliers[c][r];
        if (val != null) {
          const txt = scene.add.text(cx, cy, val.toFixed(2), {
            font: 'bold 28px Arial',
            fill: '#C0C0C0',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
          }).setOrigin(0.5);
          txt.setDepth(11);
          state.stickyWildSprites.push(txt);
        }
      }
    }
  }
}
/** Destroy previous sticky sprites/texts to avoid duplicates */
function removeSticky() {
  state.stickyWildSprites.forEach(s=>s.destroy());
  state.stickyWildSprites=[];
}