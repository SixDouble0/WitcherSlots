import { state } from './state.js';
import { REEL_COUNT, SYMBOLS_PER_REEL, SYMBOL_WIDTH, SYMBOL_HEIGHT, TOTAL_SYMBOLS, SPIN_SPEED, MIN_SPIN_TIME, MAX_SPIN_TIME, SPIN_DELAY_PER_REEL, SYMBOL_MAP } from './constants.js';

export function initReels(scene) {
  for (let r = 0; r < REEL_COUNT; r++) {
    const container = scene.add.container(r * SYMBOL_WIDTH, 0);
    const img1 = scene.add.image(0, 0, state.currentStripKey).setOrigin(0,0);
    const img2 = scene.add.image(0, -img1.height, state.currentStripKey).setOrigin(0,0);
    container.add([img1,img2]);
    state.reelContainers.push(container);
    state.reelOffsets.push(0);
  }
}

export function setStrip(scene, key) {
  state.currentStripKey = key;
  state.reelContainers.forEach(container => {
    container.removeAll(true);
    const img1 = scene.add.image(0,0,key).setOrigin(0,0);
    const img2 = scene.add.image(0,-img1.height,key).setOrigin(0,0);
    container.add([img1,img2]);
  });
}

export function startSpin(scene, onStop) {
  const spinTimes = [];
  const base = Math.floor(Math.random()*(MAX_SPIN_TIME-MIN_SPIN_TIME)+MIN_SPIN_TIME);
  for (let r=0;r<REEL_COUNT;r++) spinTimes[r]=base + r*SPIN_DELAY_PER_REEL;

  let stopped = 0;
  const spinningFlags = Array(REEL_COUNT).fill(true);

  for (let r=0;r<REEL_COUNT;r++) {
    const startTime = scene.time.now;
    scene.time.addEvent({
      delay:16, loop:true,
      callback: () => {
        const elapsed = scene.time.now - startTime;
        if (spinningFlags[r]) {
          state.reelOffsets[r] = (state.reelOffsets[r] + SPIN_SPEED) % 8400;
          state.reelContainers[r].y = state.reelOffsets[r];
        }
        if (elapsed >= spinTimes[r] && spinningFlags[r]) {
          spinningFlags[r]=false;
          state.reelOffsets[r] = Math.floor(state.reelOffsets[r]/SYMBOL_HEIGHT)*SYMBOL_HEIGHT;
          state.reelContainers[r].y = state.reelOffsets[r];
          stopped++;
          if (stopped === REEL_COUNT) {
            scene.time.removeAllEvents();
            onStop();
          }
        }
      }
    });
  }
}

export function getVisibleSymbols() {
  const out = [];
  for (let r=0;r<REEL_COUNT;r++) {
    const offsetY = state.reelOffsets[r] % 8400;
    const startIndex = (TOTAL_SYMBOLS - Math.floor(offsetY / SYMBOL_HEIGHT)) % TOTAL_SYMBOLS;
    out[r]=[];
    for (let i=0;i<SYMBOLS_PER_REEL;i++) {
      const idx = (startIndex + i) % TOTAL_SYMBOLS;
      out[r].push(SYMBOL_MAP[idx]);
    }
  }
  return out;
}

/*
  Reels API
  - initReels(scene): create scrolling containers with two stacked strip images.
  - setStrip(scene,key): swap graphics for all reels (normal / H&S variant).
  - startSpin(scene,onStop): perform timed scrolling and stop each reel in order.
  - getVisibleSymbols(): map current offsets to symbol IDs (3 rows per reel).
*/