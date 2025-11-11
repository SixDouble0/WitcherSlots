/*
  Runtime state
  - Single source of truth for mutable values: balance, bet, spin flags, bonus data.
  - Do not import heavy modules here; this file must stay lightweight.
*/
// Central mutable state
export const state = {
  balance: 1000.00,
  currentBet: 0.50,
  spinning: false,
  reelOffsets: [],
  reelContainers: [],
  winLineGraphics: [],
  currentStripKey: 'slotStrip',

  // Mega Wild bonus
  megaWildActive: false,
  megaWildSpinsLeft: 0,
  megaWildCurrentReel: 4,
  megaWildSpinsOnCurrentReel: 0,
  megaWildMoving: false,
  megaWildPendingMove: null,   // { from, to } animated at next spin start
  megaWildCleanupPending: false, // remove sprite on next spin after bonus ends
  megaWildTotalWin: 0,
  megaWildSprite: null,

  // Hold & Spin
  holdAndSpinActive: false,
  holdAndSpinSpinsLeft: 0,
  holdAndSpinGrid: null,
  holdAndSpinMultipliers: null,
  holdAndSpinSpinValues: null,
  stickyWildSprites: [],

  game: null,
  pendingPurchase: null  // { type:'MEGA'|'HNS', cost:number, onSuccess:fn }
};

// Core
//   balance/currentBet: money handling
//   spinning: prevents concurrent spins
//   reelOffsets/reelContainers: phaser containers for strip movement
// Mega Wild bonus
//   megaWildActive: bonus mode flag
//   megaWildCurrentReel: reel index used this spin
//   megaWildPendingMove: {from,to} animated at next spin start
//   megaWildTotalWin: accumulated amount across bonus
// Hold & Spin bonus
//   holdAndSpinGrid/Multipliers: sticky coin occupancy and their values
//   stickyWildSprites: sprite+text held between spins (clean up every update)