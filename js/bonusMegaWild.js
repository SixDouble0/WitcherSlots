/*
  Mega Wild bonus
  - Wolf is created and visible immediately at start.
  - Movement is scheduled and animated at the next spin start.
  - At end, wolf stays visible until the player starts the next normal spin.
*/
import { state } from './state.js';
import { SYMBOLS_PER_REEL, SYMBOL_WIDTH, SYMBOL_HEIGHT, DEPTH_WOLF } from './constants.js';
import { evaluateMegaWildWins, calculateTotalWin } from './paylines.js';
import { drawWinLines, clearWinLines } from './winLines.js';
import { showWinAmount, updateBalance, updateBonusTotalDisplay, removeBonusTotalDisplay } from './ui.js';

/** Initialize bonus and ensure wolf is visible right away */
export function startMegaWild(scene) {
  state.megaWildActive = true;
  state.megaWildSpinsLeft = 10;
  state.megaWildCurrentReel = 4;       // starts on the rightmost reel
  state.megaWildSpinsOnCurrentReel = 0;
  state.megaWildMoving = false;
  state.megaWildPendingMove = null;
  state.megaWildCleanupPending = false;
  state.megaWildTotalWin = 0;

  // Force-create and show sprite now
  renderMegaWild(scene, state.megaWildCurrentReel);
  updateBonusTotalDisplay(0);

  state.spinning = false; // wait for user spin
}

/** Apply wolf to current reel, evaluate spin, and schedule a move for next spin if needed */
export function processMegaWildStop(scene, visibleSymbols) {
  // Inject wolf for this spin on the logical reel
  for (let row = 0; row < SYMBOLS_PER_REEL; row++) {
    visibleSymbols[state.megaWildCurrentReel][row] = 'MEGAWILD';
  }

  const results = evaluateMegaWildWins(visibleSymbols);
  let spinWin = 0;
  if (results.length) {
    drawWinLines(scene, results);
    spinWin = calculateTotalWin(results, state.currentBet);
    state.megaWildTotalWin += spinWin;
    updateBonusTotalDisplay(state.megaWildTotalWin);
    showWinAmount(spinWin); // per-spin winnings label/animation
  } else {
    showWinAmount(0);
    clearWinLines();
  }

  state.megaWildSpinsLeft--;
  state.megaWildSpinsOnCurrentReel++;

  // After 2 spins on this reel, schedule a move to the left (but animate at next spin start)
  if (state.megaWildSpinsOnCurrentReel === 2 && state.megaWildCurrentReel > 0) {
    const from = state.megaWildCurrentReel;
    const to = from - 1;
    state.megaWildPendingMove = { from, to };
    state.megaWildCurrentReel = to;       // next spin uses the new logical reel
    state.megaWildSpinsOnCurrentReel = 0;
  }

  // End or wait for next spin
  if (state.megaWildSpinsLeft === 0) {
    endMegaWild(scene);
  } else {
    state.spinning = false; // ready for next spin
  }
  return true;
}

/** End bonus: pay total, keep wolf visible until next normal spin begins */
function endMegaWild(scene) {
  state.megaWildActive = false;
  state.megaWildPendingMove = null;
  state.megaWildCleanupPending = true; // cleaned up in spinHandler before next spin

  const total = state.megaWildTotalWin;
  if (total > 0) {
    state.balance += total;
    updateBalance();
    showWinAmount(total);
  } else {
    showWinAmount(0);
  }
  state.megaWildTotalWin = 0;
  removeBonusTotalDisplay();
  clearWinLines();
  state.spinning = false; // normal spins allowed
}

/** Create or update wolf sprite position */
function renderMegaWild(scene, reelIndex) {
  if (!state.megaWildSprite) {
    state.megaWildSprite = scene.add.image(
      reelIndex * SYMBOL_WIDTH + SYMBOL_WIDTH / 2,
      (SYMBOL_HEIGHT * SYMBOLS_PER_REEL) / 2,
      'megawild'
    ).setDisplaySize(SYMBOL_WIDTH, SYMBOL_HEIGHT * SYMBOLS_PER_REEL);
  } else {
    state.megaWildSprite.x = reelIndex * SYMBOL_WIDTH + SYMBOL_WIDTH / 2;
  }
  state.megaWildSprite.setDepth(DEPTH_WOLF); // below win lines
  state.megaWildSprite.setVisible(true);
  state.megaWildSprite.alpha = 1;
}

/** Ensure sprite exists and sits at a given reel before animating */
export function ensureMegaSpriteAt(scene, reel) {
  renderMegaWild(scene, reel);
}

/** Animate wolf horizontally to target reel, then call cb */
export function animateMegaNow(scene, toReel, cb) {
  if (!state.megaWildSprite) {
    renderMegaWild(scene, toReel);
    cb?.();
    return;
  }
  scene.tweens.add({
    targets: state.megaWildSprite,
    x: toReel * SYMBOL_WIDTH + SYMBOL_WIDTH / 2,
    duration: 350,
    onComplete: cb
  });
}

/** Destroy wolf sprite */
export function removeMegaWildSprite() {
  if (state.megaWildSprite) {
    state.megaWildSprite.destroy();
    state.megaWildSprite = null;
  }
}