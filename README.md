A modular HTML5 slot machine built with Phaser 3, focusing on clean architecture, extensibility and two bonus mechanics (Mega Wild & Hold & Spin). This project demonstrates game flow orchestration, layered rendering, bonus state machines, and UI feedback (big win animations, modal system, dynamic bet handling).
<img width="1919" height="874" alt="image" src="https://github.com/user-attachments/assets/39f8a3d6-adba-4c42-8dd8-d6876ab9d2b1" />



---

## 1. Features

- 5x3 reels (configurable)
- Symbol strip scroll effect (continuous loop via double image)
- Dynamic bet adjustment
- Payline win evaluation with WILD substitution
- Big Win animation (video overlay + counter)
- Bonus: Mega Wild (shifting full‑reel wild over 10 spins)
- Bonus: Hold & Spin (sticky coin values reset spin counter)
- Modular ES module structure (no bundler required)
- Clear state management (single `state` object)
- Extensible constants for payouts, dimensions, timings

---

## 2. Technology Stack

- Phaser 3 (scene, tweening, asset loading)
- Vanilla ES modules (no framework/bundler)
- HTML/CSS UI overlay elements
- JavaScript state machine for bonuses

---

## 3. Folder Structure

```
WitcherSlots/
  Slots.html                Entry HTML
  Slots.css                 Styling
  js/
    main.js                 Bootstrap + spin orchestration
    state.js                Central mutable game state
    constants.js            Config: dimensions, payouts, strip, depths
    reels.js                Reel creation & spin mechanics
    paylines.js             Win + bonus trigger evaluation
    winLines.js             Drawing/clearing winning lines
    ui.js                   Balance, winnings, big win overlay, bonus total badge
    modal.js                Bonus info modal
    bonusMegaWild.js        Mega Wild bonus logic
    bonusHoldAndSpin.js     Hold & Spin bonus logic
    bet.js                  Bet increment/decrement & cost display
  img/                      Strip & symbol assets (adjust as needed)
  video/                    Big win video asset
```

---

## 4. Core Game Flow

1. Player presses SPIN.
2. `spinHandler` (main.js):
   - Clears win lines, resets per‑spin winnings.
   - Handles pending Mega Wild movement (animates before reel spin).
   - Invokes `startSpin`.
3. Reels stop → `onAllReelsStopped`.
4. If a bonus is active:
   - Delegate to its processor (`processMegaWildStop` or `processHoldAndSpinStop`).
5. Else evaluate wins (`evaluateWins`), draw win lines, calculate payout.
6. Natural bonus triggers (≥3 Bonus symbol for Mega Wild, ≥5 WILD for Hold & Spin) open modal → user confirms → bonus starts.

---

## 5. Modules Overview

| File | Responsibility |
|------|----------------|
| constants.js | Central config: sizes, payouts, strip, depths |
| state.js | Single source of truth for runtime data |
| reels.js | Reel container creation + spinning logic |
| paylines.js | Win detection + bonus trigger checks |
| winLines.js | Draw & clear winning line graphics |
| ui.js | Balance/winnings/big win overlay/bonus total |
| modal.js | Modal presentation with optional image |
| bonusMegaWild.js | Mega Wild accumulation + scheduled movement |
| bonusHoldAndSpin.js | Sticky coin grid & free spin loop |
| bet.js | Bet UI -> `state.currentBet` synchronization |
| main.js | Asset preload, event wiring, orchestrates flow |

---

## 6. Configuration (constants.js)

Key constants you can tweak:

```js
export const REEL_COUNT = 5;
export const SYMBOLS_PER_REEL = 3;
export const SYMBOL_WIDTH = 200;
export const SYMBOL_HEIGHT = 200;
export const TOTAL_SYMBOLS = 42; // must match SYMBOL_MAP length
export const BIG_WIN_MULTIPLIER = 10;
export const MEGA_BONUS_BUY_MULTIPLIER = 100;
export const HNS_BONUS_BUY_MULTIPLIER  = 70;
```

### Adjusting Bet Limits
Edit `bet.js`:
```js
const MIN_BET = 0.50;
const MAX_BET = 25.00;
const STEP    = 0.50;
```

### Changing Big Win Threshold
Raise or lower `BIG_WIN_MULTIPLIER` (e.g. 15 to reduce big win frequency).

---

## 7. Symbol Strip & Dimensions

The strip is a single tall image scrolled vertically. Requirements:

- Strip height = `SYMBOL_HEIGHT * TOTAL_SYMBOLS`
  - Current: 200 * 42 = 8400 px.
- Each symbol block should align exactly to `SYMBOL_HEIGHT` boundaries.
- To change symbol size:
  - Adjust `SYMBOL_WIDTH`, `SYMBOL_HEIGHT`.
  - Provide new strip assets with updated pixel dimensions.
  - All payouts still work; win line centers adapt automatically.

### Adding/Removing Symbols
1. Modify `SYMBOL_MAP`: ordered sequence of symbol IDs on the strip.
2. Update `TOTAL_SYMBOLS` to match new length.
3. Adjust `PAYOUTS` for new symbols.
4. Provide art in the strip image.
5. Optional: add new trigger conditions if bonus-related.

---

## 8. Paylines & Payouts

- `PAY_LINES`: Array of arrays of `[col,row]`.
- Each win:
  - Determine base symbol (first non-WILD or WILD).
  - Count consecutive matches left→right.
  - Pay if count ≥ 3 (modifiable logic).
- `PAYOUTS`: `symbol => {3,4,5}` multipliers (multiplied by current bet).
- Add a new payline: append to `PAY_LINES`.
- Remove payline: delete entry. Consider balancing volatility.

---

## 9. Bonuses

### Mega Wild
- Trigger: ≥3 Bonus symbols `'B!'`.
<img width="673" height="404" alt="image" src="https://github.com/user-attachments/assets/de8a607c-5af1-48f5-8c47-a8cc84b4fba2" />


- 10 spins; full-reel MEGAWILD starting on rightmost reel (4).
- Stays for 2 spins per reel, then shifts left (animation occurs at next spin start).
- Per-spin wins added to `megaWildTotalWin` (displayed via Bonus Total badge).
- At end: total paid, wolf persists until next normal spin (cleanup at spin start).

<img width="1030" height="624" alt="image" src="https://github.com/user-attachments/assets/2485ecc1-aea9-400d-b4d9-d0120f6fb9d1" />



Key state fields:
```js
megaWildActive
megaWildCurrentReel
megaWildPendingMove    // scheduled movement {from,to}
megaWildSpinsLeft
megaWildTotalWin
megaWildCleanupPending // cleanup flag after bonus end
```

### Hold & Spin
- Trigger: ≥5 WILD symbols.
- Start with a sticky grid of coins from current WILD positions (each gets random multiplier).
- 3 spins countdown; landing new WILD resets spins-left to 3.
- If board fills or spins-left hits 0: sum all coin values, pay, exit.
- Coins re-render each spin with numeric values.
<img width="1027" height="618" alt="image" src="https://github.com/user-attachments/assets/2f7fe5cb-0e50-41c9-b7e7-be8bdd1c20b4" />



Key state fields:
```js
holdAndSpinActive
holdAndSpinSpinsLeft
holdAndSpinGrid          // boolean occupancy
holdAndSpinMultipliers   // numeric coin values
stickyWildSprites        // sprites/text for cleanup
```

---

## 10. Rendering Depth Strategy

Depth constants in `constants.js` ensure layering:
```js
DEPTH_REELS        // base reel strips
DEPTH_COINS        // Hold & Spin coin sprites
DEPTH_COINS_TEXT   // coin value text
DEPTH_WOLF         // Mega Wild image
DEPTH_WINLINE_GLOW // glow graphics
DEPTH_WINLINE      // main win line
```
Adjust if you introduce new overlays or particle effects.

---

## 11. Customizing for More Reels / Rows

To move from 5x3 to (say) 6x4:
1. Change:
   ```js
   REEL_COUNT = 6;
   SYMBOLS_PER_REEL = 4;
   ```
2. Provide new strip image with height = `SYMBOL_HEIGHT * TOTAL_SYMBOLS`.
3. Update UI container width (HTML/CSS or rely on Phaser config).
4. Add paylines covering extra grid cells.
5. Verify Mega Wild logic (reel indices) still valid (`megaWildCurrentReel` should start at `REEL_COUNT-1`).

---

## 12. Extensibility Ideas

- Additional bonus types (e.g., expanding wilds, multiplier ladder):
  - Add new bonus file `bonusXXX.js`.
  - Introduce trigger check in `paylines.js`.
  - Integrate into `onAllReelsStopped` (main.js).

- Sound effects:
  - Preload audio in `preload()`.
  - Fire on spin start, reel stop, win, bonus entry.

- Persistence:
  - Save `balance` and `currentBet` to `localStorage` on change; restore on load.

- Adaptive volatility:
  - Provide multiple SYMBOL_MAP variants and swap based on mode.

- Auto-play:
  - Loop `spinHandler` with safeguards (stop on bonus trigger; user confirmation mid-bonus).

---

## 13. Performance Notes

- Using two stacked images for each reel keeps scrolling cheap.
- Win line drawing uses lightweight `Phaser.Graphics`; cleared every spin.
- Bonus sprites are destroyed / recreated to prevent leaks.
- Depth assignments avoid heavy z-order sorting.

---

## 14. Testing Suggestions

- Unit test payoff logic (`evaluateWins` + `calculateTotalWin`).
- Scenario tests for bonus triggers: mock `visibleSymbols`.
- Animation timing: verify scheduled Mega Wild move only after two spins per reel.
- Balance transitions: ensure bet subtraction occurs before normal spin, not during bonuses.

---

## 15. Quick Start

1. Clone repository.
2. Serve folder (any static server, e.g.:
   ```
   npx serve .
   ```
   or open `Slots.html` directly).
3. Adjust bet with +/-.
4. Press SPIN.
5. Trigger bonuses naturally or force buy (buttons if implemented).
6. Modify constants as desired and refresh (Ctrl+F5).

---

## 16. Editing Bet Range

`js/bet.js`:
```js
const MIN_BET = 0.50;
const MAX_BET = 25.00;
const STEP    = 0.50;
```
Change these; no other file requires edits. UI auto updates.

---

## 17. Adding a New Symbol Example

1. Add asset to strip image (adjust design tool).
2. Append symbol ID to `SYMBOL_MAP`.
3. Increase `TOTAL_SYMBOLS`.
4. Optional payout:
   ```js
   PAYOUTS.NEW = {3: 1, 4: 2, 5: 4};
   ```
5. If it’s a trigger (e.g. scatter), add `hasNewBonus` in `paylines.js`.

---

## 18. Known Constraints

- Strip approach assumes uniform symbol heights.
- Bonus buy multipliers are linear (`bet * X`).
- No responsive scaling (desktop-focused). For mobile, wrap Phaser canvas in a scale container.

---

## 19. License

Add a license of choice (MIT recommended) if you plan open distribution.

---

## 21. Contact / Credit

Created as a demonstration of Phaser slot architecture with modular bonus systems and clear state handling. Adapt freely.

---

Happy spinning and extending!
