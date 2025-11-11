/*
  Modal (bonus info)
  - openBonusModal({ title, html, image, onContinue })
    Renders a styled modal, optional image, and waits for user to Continue or Close.
  - Blocks background with fade overlay while visible.
*/
export function openBonusModal(opts) {
  const modal = document.getElementById('bonusInfoModal');
  const titleEl = document.getElementById('bonusInfoTitle');
  const textEl = document.getElementById('bonusInfoText');
  const imgEl = document.getElementById('bonusInfoImage');
  const btn = document.getElementById('bonusInfoContinueBtn');
  const closeBtn = document.getElementById('bonusInfoCloseBtn');
  const fade = document.getElementById('fadeOverlay');

  titleEl.textContent = opts.title || 'Bonus';
  textEl.innerHTML = opts.html || '';
  if (opts.image) {
    imgEl.src = `img/${opts.image}`;
    imgEl.style.display = 'block';
  } else {
    imgEl.removeAttribute('src');
    imgEl.style.display = 'none';
  }

  modal.classList.add('is-visible');
  modal.style.display = 'flex';
  if (fade) { fade.style.opacity='0.6'; fade.style.pointerEvents='auto'; }

  btn.onclick = () => { close(); opts.onContinue?.(); };
  closeBtn.onclick = () => close();

  function keyHandler(e) {
    if (e.key==='Escape') { e.preventDefault(); close(); }
  }
  document.addEventListener('keydown', keyHandler);

  function close() {
    modal.classList.remove('is-visible');
    modal.style.display='none';
    if (fade) { fade.style.opacity='0'; fade.style.pointerEvents='none'; }
    document.removeEventListener('keydown', keyHandler);
  }
}