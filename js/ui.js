/*
  UI helpers
  - updateBalance: reflect current balance.
  - showWinAmount: updates "Winnings" for the last spin and triggers big win flow.
  - animateWinCounter: silver counter during big win animation.
  - fadeToBlack/fromBlack: overlay transitions.
  - Big win video overlay: play/stop helper.
  - Bonus total badge (optional): shows accumulated amount during a bonus.
*/
import { state } from './state.js';
import { BIG_WIN_MULTIPLIER, LOG_SPEED_PROG_1, LOG_SPEED_PROG_2 } from './constants.js';

export function updateBalance() {
  const el = document.getElementById('balanceDisplay');
  if (el) el.textContent = `$${state.balance.toFixed(2)}`;
}

/** 
 * showWinAmount(amount)
 * - Always updates the Winnings label for the last spin.
 * - If amount >= BIG_WIN_MULTIPLIER * bet: plays big win video + counter, then restores label.
 */
export function showWinAmount(amount) {
  const winDisplay = document.getElementById('winDisplay');
  if (winDisplay) {
    winDisplay.innerText = `Winnings: ${amount.toFixed(2)}`;
    winDisplay.style.display = 'block';
  }
  const threshold = state.currentBet * BIG_WIN_MULTIPLIER;
  if (amount >= threshold) {
    if (winDisplay) winDisplay.style.display = 'none';
    fadeToBlack(500, () => {
      showBigWinOverlay(amount);
      animateWinCounter(amount, () => {
        hideBigWinOverlay();
        fadeFromBlack(500, () => {
          if (winDisplay) {
            winDisplay.innerText = `Winnings: ${amount.toFixed(2)}`;
            winDisplay.style.display = 'block';
          }
        });
      }, calcCounterDuration(amount));
    });
  }
}

// calcCounterDuration: heuristic for smoother long counters
function calcCounterDuration(finalAmount) {
  const d = finalAmount * 40;
  return Math.max(2000, Math.min(10000, d));
}

/** Animate silver counting text in #winCounterHtml and call onComplete() at the end */
export function animateWinCounter(finalAmount, onComplete, customDuration) {
  const el = document.getElementById('winCounterHtml');
  if (!el) { onComplete?.(); return; }
  el.style.display = 'block';
  el.style.color = '#C0C0C0';

  const bet = state.currentBet;
  const t1 = LOG_SPEED_PROG_1 * bet;
  const t2 = LOG_SPEED_PROG_2 * bet;
  const duration = customDuration ?? Math.max(1800, Math.min(12000, finalAmount * 30));
  const baseRatePerMs = finalAmount / duration;

  let current = 0;
  let last = performance.now();
  const start = last;

  function step(now) {
    const dt = now - last;
    last = now;
    const timeProgress = Math.min((now - start) / duration, 1);
    const ease = 0.5 + Math.pow(timeProgress, 2);
    let mult = 0.9;
    if (current >= t1 && current < t2) mult = 1.8;
    else if (current >= t2) mult = 3.2;
    current = Math.min(finalAmount, current + baseRatePerMs * dt * ease * mult);
    el.textContent = current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (current < finalAmount) requestAnimationFrame(step);
    else {
      el.textContent = finalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      setTimeout(() => { el.style.display = 'none'; onComplete?.(); }, 250);
    }
  }
  requestAnimationFrame(step);
}

/** Darken screen and block clicks; call cb after transition ends */
export function fadeToBlack(duration = 800, cb) {
  const overlay = document.getElementById('fadeOverlay');
  if (!overlay) { cb?.(); return; }
  overlay.style.transition = `opacity ${duration}ms linear`;
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'auto';
  setTimeout(() => cb?.(), duration);
}
/** Restore screen and clicks; call cb after transition ends */
export function fadeFromBlack(duration = 800, cb) {
  const overlay = document.getElementById('fadeOverlay');
  if (!overlay) { cb?.(); return; }
  overlay.style.transition = `opacity ${duration}ms linear`;
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  setTimeout(() => cb?.(), duration);
}

/** Prepare and show big win video/text overlay */
export function showBigWinOverlay() {
  const overlay = document.getElementById('bigWinVideoOverlay');
  const video = document.getElementById('bigWinVideo');
  const text = document.getElementById('bigWinTextOverlay');
  if (!overlay || !video || !text) return;
  video.src = 'video/Madagascar3.mp4';
  video.currentTime = 0;
  video.play();
  overlay.style.display = 'flex';
  text.innerHTML = `<span class="big-win-text">BIG WIN</span>`;
}
/** Hide and reset big win overlay */
export function hideBigWinOverlay() {
  const overlay = document.getElementById('bigWinVideoOverlay');
  const video = document.getElementById('bigWinVideo');
  if (!overlay || !video) return;
  overlay.style.display = 'none';
  video.pause();
  video.currentTime = 0;
}

/** Create/update small badge displaying accumulated bonus total */
export function updateBonusTotalDisplay(total) {
  let el = document.getElementById('bonusTotalDisplay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'bonusTotalDisplay';
    const center = document.querySelector('.slot-center');
    if (!center) return;
    el.style.position = 'absolute';
    el.style.top = '-84px';
    el.style.left = '50%';
    el.style.transform = 'translateX(-50%)';
    el.style.background = '#232931';
    el.style.padding = '8px 20px';
    el.style.border = '2px solid #C0C0C0';
    el.style.borderRadius = '14px';
    el.style.boxShadow = '0 0 12px #bcbcbc, 0 0 0 3px #ffffff inset';
    el.style.font = '600 20px Arial';
    el.style.color = '#C0C0C0';
    el.style.zIndex = '1600';
    center.appendChild(el);
  }
  el.textContent = `Bonus Total: ${total.toFixed(2)}`;
}
/** Remove bonus total badge */
export function removeBonusTotalDisplay() {
  const el = document.getElementById('bonusTotalDisplay');
  if (el) el.remove();
}