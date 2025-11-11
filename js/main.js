/*
  Game bootstrap and orchestration
  - Boot Phaser and load assets.
  - Wire UI (Spin, Bonus Buy buttons).
  - spinHandler: canonical entry for every spin (normal and bonus):
      * reset Winnings label and clear lines,
      * if Mega Wild has a pending move -> animate, then spin,
      * startSpin and dispatch to onAllReelsStopped.
  - onAllReelsStopped:
      * If a bonus is active, delegate to its processor.
      * Else evaluate standard wins, show UI, and check natural bonus triggers.
*/
import { SYMBOL_WIDTH, SYMBOL_HEIGHT, REEL_COUNT, SYMBOLS_PER_REEL, MEGA_BONUS_BUY_MULTIPLIER, HNS_BONUS_BUY_MULTIPLIER } from './constants.js';
import { state } from './state.js';
import { initReels, startSpin, getVisibleSymbols, setStrip } from './reels.js';
import { evaluateWins, calculateTotalWin, hasMegaWildBonus, hasHoldAndSpinBonus } from './paylines.js';
import { showWinAmount, updateBalance, updateBonusTotalDisplay, removeBonusTotalDisplay } from './ui.js';
import { startMegaWild, processMegaWildStop, animateMegaNow, ensureMegaSpriteAt, removeMegaWildSprite } from './bonusMegaWild.js';
import { startHoldAndSpin, processHoldAndSpinStop } from './bonusHoldAndSpin.js';
import { openBonusModal } from './modal.js';
import { drawWinLines, clearWinLines } from './winLines.js';
import { initBetControls, updateBetDisplay } from './bet.js';

const spinBtn = document.getElementById('spinButton');
const megaBtn = document.getElementById('forceBonusButton');
const hnsBtn  = document.getElementById('HnSBonusButton');

/** Start a spin; animates pending Mega Wild move first to keep lines visible */
state.spinHandler = (scene) => {
  if (state.spinning || state.megaWildMoving) return;

  // Reset per-spin Winnings and clear lines
  const wd = document.getElementById('winDisplay');
  if (wd) { wd.innerText = 'Winnings: 0.00'; wd.style.display = 'block'; }
  clearWinLines();

  // If bonus just ended, clean wolf before the first normal spin
  if (state.megaWildCleanupPending) {
    state.megaWildCleanupPending = false;
    removeMegaWildSprite();
  }

  // If a move is scheduled, animate it now, then start the spin
  if (state.megaWildActive && state.megaWildPendingMove) {
    const { from, to } = state.megaWildPendingMove;
    state.megaWildMoving = true;
    ensureMegaSpriteAt(scene, from);
    animateMegaNow(scene, to, () => {
      state.megaWildMoving = false;
      state.megaWildPendingMove = null;
      state.spinning = true;
      startSpin(scene, () => onAllReelsStopped(scene));
    });
    return;
  }

  state.spinning = true;
  startSpin(scene, () => onAllReelsStopped(scene));
};

/** Handle the result of all reels stopping (normal vs. bonus flows) */
function onAllReelsStopped(scene) {
    const visible = getVisibleSymbols();
    console.debug('[VISIBLE]', visible);

    if (state.megaWildActive) {
        processMegaWildStop(scene, visible);
        return;
    }
    if (state.holdAndSpinActive) {
        processHoldAndSpinStop(scene, visible);
        return;
    }

    const wins = evaluateWins(visible);
    let totalWin = 0;
    if (wins.length) {
        drawWinLines(scene, wins);
        totalWin = calculateTotalWin(wins, state.currentBet);
        showWinAmount(totalWin);
        if (totalWin > 0) {
            state.balance += totalWin;
            updateBalance();
        }
    } else {
        clearWinLines();
        showWinAmount(0);
    }

    // Bonus triggers
    if (!state.megaWildActive && hasMegaWildBonus(visible)) {
        openBonusModal({
            title: 'MEGA WILD BONUS',
            html: '10 free spins. Mega Wild shifts left every 2 spins. Click SPIN when ready.',
            image: 'MegaWildBonus.png',
            onContinue: () => startMegaWild(scene)
        });
        state.spinning = false;
        return;
    }
    if (hasHoldAndSpinBonus(visible)) {
        openBonusModal({
            title: 'HOLD & SPIN BONUS',
            html: '3 spins. Each new Wild coin resets spins to 3. Collect all values at the end.',
            image: 'BonusHnS.png',
            onContinue: () => startHoldAndSpin(scene, visible)
        });
        state.spinning = false;
        return;
    }

    state.spinning = false;
}

/** Phaser boot: sizes derived from constants */
window.onload = () => {
    const config = {
        type: Phaser.AUTO,
        width: SYMBOL_WIDTH * REEL_COUNT,
        height: SYMBOL_HEIGHT * SYMBOLS_PER_REEL,
        parent: 'phaser-container',
        backgroundColor: '#ffffff',
        scene: { preload, create, update() {} }
    };
    state.game = new Phaser.Game(config);
    updateBalance();
    updateBetDisplay();        // reflect current bet on load
};

initBetControls();             // wire +/- and keep state.currentBet in sync

/** Preload all assets (strips, bonus images, coin spritesheet) */
function preload() {
    this.load.image('slotStrip', 'img/SlotsyGotowe.png');
    this.load.image('slotStripHoldAndSpin', 'img/SlotsyHoldAndSpin.jpg');
    this.load.image('wild', 'img/Coin_Back.png');
    this.load.image('megawild', 'img/MegaWildWolf.png');
    this.load.spritesheet('coin', 'img/coins.png', { frameWidth: 40, frameHeight: 44 });
}

/** Create scene: reels, animations, and UI button handlers */
function create() {
    initReels(this);

    this.anims.create({
        key: 'coin_spin',
        frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 3 }),
        frameRate: 12,
        repeat: -1
    });

    spinBtn?.addEventListener('click', () => {
        if (state.spinning || state.megaWildMoving) return;
        clearWinLines();
        if (state.megaWildActive || state.holdAndSpinActive) {
            state.spinHandler(this);
        } else {
            if (state.currentBet > state.balance) {
                alert('Insufficient balance.');
                return;
            }
            state.balance -= state.currentBet;
            updateBalance();
            state.spinHandler(this);
        }
    });

    megaBtn?.addEventListener('click', () => {
        if (state.spinning || state.megaWildActive || state.holdAndSpinActive) return;
        const cost = state.currentBet * MEGA_BONUS_BUY_MULTIPLIER;
        openBonusModal({
            title: 'MEGA WILD BONUS BUY',
            html: `Purchase 10 free spins with shifting Mega Wild.<br>Cost: ${cost.toFixed(2)} $<br>Continue?`,
            image: 'MegaWildBonus.png',
            onContinue: () => {
                if (state.balance < cost) {
                    alert('Insufficient balance.');
                    return;
                }
                state.balance -= cost;
                updateBalance();
                startMegaWild(this);
            }
        });
    });

    hnsBtn?.addEventListener('click', () => {
        if (state.spinning || state.holdAndSpinActive || state.megaWildActive) return;
        const cost = state.currentBet * HNS_BONUS_BUY_MULTIPLIER;
        const visible = getVisibleSymbols();
        openBonusModal({
            title: 'HOLD & SPIN BONUS BUY',
            html: `Start Hold & Spin.<br>Cost: ${cost.toFixed(2)} $<br>Continue?`,
            image: 'BonusHnS.png',
            onContinue: () => {
                if (state.balance < cost) {
                    alert('Insufficient balance.');
                    return;
                }
                state.balance -= cost;
                updateBalance();
                startHoldAndSpin(this, visible);
            }
        });
    });
}

/** Helpers to switch symbol strips (normal <-> Hold&Spin) */
export function setHoldAndSpinStrip(scene) { setStrip(scene, 'slotStripHoldAndSpin'); }
export function setDefaultStrip(scene) { setStrip(scene, 'slotStrip'); }