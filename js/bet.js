import { state } from './state.js';
import { MEGA_BONUS_BUY_MULTIPLIER, HNS_BONUS_BUY_MULTIPLIER } from './constants.js';

// Bet limits and step
const MIN_BET = 0.50;
const MAX_BET = 25.00;
const STEP    = 0.50;

/** Attach +/- handlers and initialize UI based on state.currentBet */
export function initBetControls() {
  document.addEventListener('DOMContentLoaded', () => {
    const minus = document.getElementById('minus-bet');
    const plus  = document.getElementById('plus-bet');

    minus?.addEventListener('click', () => {
      if (state.spinning) return; // avoid changing bet mid-spin
      setBet(Math.max(MIN_BET, round2(state.currentBet - STEP)));
    });
    plus?.addEventListener('click', () => {
      if (state.spinning) return;
      setBet(Math.min(MAX_BET, round2(state.currentBet + STEP)));
    });

    if (!state.currentBet || state.currentBet < MIN_BET) state.currentBet = MIN_BET;
    updateBetDisplay();
  });
}

/** Programmatically set bet and refresh UI */
export function setBet(value) {
  state.currentBet = clamp(round2(value), MIN_BET, MAX_BET);
  updateBetDisplay();
}

/** Refresh bet label and bonus buy cost labels */
export function updateBetDisplay() {
  const betEl = document.getElementById('bet-amount');
  if (betEl) betEl.textContent = state.currentBet.toFixed(2).replace('.', ',');
  const mega = document.getElementById('bonus-cost');
  const hns  = document.getElementById('hns-cost');
  if (mega) mega.textContent = `Cost: ${(state.currentBet * MEGA_BONUS_BUY_MULTIPLIER).toFixed(2)} $`;
  if (hns)  hns.textContent  = `Cost: ${(state.currentBet * HNS_BONUS_BUY_MULTIPLIER).toFixed(2)} $`;
}

function round2(n) { return Math.round(n * 100) / 100; }
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }