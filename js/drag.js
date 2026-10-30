'use strict';
/* ============ drag kit: pointer-based drag and drop with tap-to-place fallback ============ */
function makeDragger(host, cfg) {
  const chipSel = cfg.chip || '.chip', zoneSel = cfg.zone || '.zone';
  let sel = null, d = null;

  function zones() { return $$(zoneSel, host).filter(z => !z.classList.contains('full')); }
  function zoneAt(x, y) {
    let best = null, bestScore = 1e9;
    zones().forEach(z => {
      const r = z.getBoundingClientRect();
      const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom);
      const dist = Math.hypot(dx, dy);
      if (dist > 46) return;
      const score = dist * 1000 + r.width * r.height / 1000;
      if (score < bestScore) { bestScore = score; best = z; }
    });
    return best;
  }
  function clearHover() { $$(zoneSel + '.hover', host).forEach(z => z.classList.remove('hover')); }
  function setSel(chip) {
    if (sel) sel.classList.remove('sel');
    sel = chip;
    host.classList.toggle('armed', !!chip);
    if (chip) chip.classList.add('sel');
  }
  function startGhost(e) {
    const r = d.chip.getBoundingClientRect();
    const g = d.chip.cloneNode(true);
    g.classList.add('ghost'); g.classList.remove('sel');
    g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
    document.body.appendChild(g);
    d.ghost = g; d.ox = e.clientX - r.left; d.oy = e.clientY - r.top;
    d.chip.classList.add('lifted');
    sfx('tap');
  }
  function moveGhost(e) {
    d.ghost.style.transform = `translate(${e.clientX - d.ox}px, ${e.clientY - d.oy}px) scale(1.08) rotate(-2deg)`;
  }
  function finish() {
    if (!d) return;
    if (d.ghost) d.ghost.remove();
    d.chip.classList.remove('lifted');
    clearHover();
    d = null;
  }
  host.addEventListener('pointerdown', e => {
    const chip = e.target.closest(chipSel);
    if (!chip || !host.contains(chip) || chip.classList.contains('locked') || cfg.locked && cfg.locked()) return;
    e.preventDefault();
    d = { chip, id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, ghost: null };
    try { chip.setPointerCapture(e.pointerId); } catch (_) { }
  });
  host.addEventListener('pointermove', e => {
    if (!d || e.pointerId !== d.id) return;
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 9) { d.moved = true; startGhost(e); setSel(null); }
    if (d.moved) {
      moveGhost(e);
      const z = zoneAt(e.clientX, e.clientY);
      clearHover(); if (z) z.classList.add('hover');
    }
  });
  function up(e) {
    if (!d || e.pointerId !== d.id) return;
    const chip = d.chip, moved = d.moved;
    const z = moved ? zoneAt(e.clientX, e.clientY) : null;
    finish();
    if (moved) { if (z) cfg.onDrop(chip, z); }
    else {
      if (sel === chip) setSel(null); else { setSel(chip); sfx('tap'); if (cfg.onSelect) cfg.onSelect(chip); }
    }
  }
  host.addEventListener('pointerup', up);
  host.addEventListener('pointercancel', e => { if (d && e.pointerId === d.id) finish(); });
  host.addEventListener('click', e => {
    if (!sel) return;
    if (e.target.closest(chipSel)) return;
    const z = e.target.closest(zoneSel);
    if (!z || z.classList.contains('full') || !host.contains(z)) return;
    const chip = sel; setSel(null);
    cfg.onDrop(chip, z);
  });
  return { clearSel() { setSel(null); }, sel: () => sel };
}
