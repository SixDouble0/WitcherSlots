import { PAY_LINES, PAYOUTS } from './constants.js';

/**
 * evaluateWins
 * Finds wins for standard spins:
 * - For each payline, determine the first non-WILD symbol (or WILD if only wilds).
 * - Count consecutive symbols from left that match base symbol or are WILD.
 * - Record wins of length >= 3.
 * Returns array of { symbol, count, line (positions), lineIndex }.
 */
export function evaluateWins(visibleSymbols) {
  const results = [];
  for (let li = 0; li < PAY_LINES.length; li++) {
    const line = PAY_LINES[li];
    // Collect symbols along the line
    const symbolsAll = line.map(([c, r]) => visibleSymbols[c][r]);

    // Determine base (first non-WILD) or remain WILD if none
    let base = 'WILD';
    for (const s of symbolsAll) {
      if (s !== 'WILD') { base = s; break; }
    }

    // Count consecutive matches (base or WILD)
    let count = 0;
    for (const s of symbolsAll) {
      if (s === base || s === 'WILD') count++;
      else break;
    }

    // Record only wins of length >= 3
    if (count >= 3) {
      results.push({
        symbol: base,
        count,
        line: line.slice(0, count),
        lineIndex: li
      });
    }
  }
  return results;
}

/**
 * evaluateMegaWildWins
 * Treats MEGAWILD as WILD so existing evaluation can be reused.
 */
export function evaluateMegaWildWins(visibleSymbols) {
  const transformed = visibleSymbols.map(col =>
    col.map(s => s === 'MEGAWILD' ? 'WILD' : s)
  );
  return evaluateWins(transformed);
}

/**
 * calculateTotalWin
 * Sums win amounts:
 * - For each result look up payout multiplier in PAYOUTS using symbol + count.
 * - Win = bet * multiplier.
 */
export function calculateTotalWin(results, bet) {
  let win = 0;
  for (const r of results) {
    const pay = PAYOUTS[r.symbol];
    if (!pay) continue;
    const mult = pay[r.count] || 0;
    win += bet * mult;
  }
  return win;
}

/**
 * hasMegaWildBonus
 * Natural trigger condition for Mega Wild bonus:
 * - Count how many bonus symbols 'B!' appear anywhere.
 * - Trigger if 3 or more.
 */
export function hasMegaWildBonus(visibleSymbols) {
  let bonusCount = 0;
  visibleSymbols.forEach(col => col.forEach(s => {
    if (s === 'B!') bonusCount++;
  }));
  return bonusCount >= 3;
}

/**
 * hasHoldAndSpinBonus
 * Natural trigger condition for Hold & Spin bonus:
 * - Count WILD occurrences.
 * - Trigger if 5 or more.
 */
export function hasHoldAndSpinBonus(visibleSymbols) {
  let wildCount = 0;
  visibleSymbols.forEach(col => col.forEach(s => {
    if (s === 'WILD') wildCount++;
  }));
  return wildCount >= 5;
}

/*
  Paylines & payouts
  - evaluateWins: standard line evaluation (WILD substitutes).
  - evaluateMegaWildWins: treat MEGAWILD as WILD and reuse evaluation.
  - calculateTotalWin: sum bet * multiplier for each result.
  - hasMegaWildBonus / hasHoldAndSpinBonus: natural triggers.
*/