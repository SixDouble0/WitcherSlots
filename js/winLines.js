import { state } from './state.js';
import { SYMBOL_WIDTH, SYMBOL_HEIGHT, DEPTH_WINLINE_GLOW, DEPTH_WINLINE } from './constants.js';

// Draw lines for provided win results
export function drawWinLines(scene, results) {
  clearWinLines();
  results.forEach(res => {
    const pos = res.line;
    // Glow base
    const glow = scene.add.graphics();
    glow.lineStyle(6, 0xC0C0C0, 0.2);
    drawPath(glow, pos);
    glow.setDepth(DEPTH_WINLINE_GLOW);
    state.winLineGraphics.push(glow);
    // Main line
    const line = scene.add.graphics();
    line.lineStyle(5, 0xC0C0C0, 0.95);
    drawPath(line, pos);
    line.setDepth(DEPTH_WINLINE);
    state.winLineGraphics.push(line);
  });
}

// drawPath: helper to move/lineTo center of each symbol cell and stroke the path
function drawPath(g, positions) {
  positions.forEach(([col,row],i) => {
    const x = col*SYMBOL_WIDTH + SYMBOL_WIDTH/2;
    const y = row*SYMBOL_HEIGHT + SYMBOL_HEIGHT/2;
    if (i===0) { g.beginPath(); g.moveTo(x,y); }
    else g.lineTo(x,y);
  });
  g.strokePath();
}

export function clearWinLines() {
  state.winLineGraphics.forEach(g=>g.destroy());
  state.winLineGraphics=[];
}