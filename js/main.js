'use strict';
/* ============ boot ============ */
function fit() {
  const w = innerWidth, hgt = innerHeight;
  document.documentElement.style.fontSize = Math.max(11, Math.min(w / 59, hgt / 41)) + 'px';
}
addEventListener('resize', fit); addEventListener('orientationchange', () => setTimeout(fit, 120));
fit();
loadState();
let unlocked = false;
addEventListener('pointerdown', () => { if (!unlocked) { unlocked = true; ac(); try { speechSynthesis.getVoices(); } catch (e) { } } }, { passive: true });
try { speechSynthesis.onvoiceschanged = () => { VOICE = null; }; } catch (e) { }
addEventListener('error', e => { console.error('app error', e.message); });
go('home');
