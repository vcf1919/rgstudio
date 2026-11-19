/**
 * Floating preview for the works list (fine pointers only).
 * Follows the cursor with inertia, scales in, tilts with the horizontal speed (±14°)
 * and shifts the image the other way. On click, the visible image gets the
 * view-transition-name so it morphs into the case header.
 */
import { preview as cfg } from '../config/effects';
import { finePointer } from '../lib/media';

export function init(list: HTMLElement, preview: HTMLElement) {
  const rows = [...list.querySelectorAll<HTMLAnchorElement>('[data-slug]')];
  const layers = [...preview.querySelectorAll<HTMLElement>('[data-layer]')];
  const fine = finePointer();
  let px = 0, py = 0, mx = -100, my = -100, on = 0, s = 0, raf = 0, placed = false;

  const show = (slug: string) => layers.forEach((l) => (l.style.opacity = l.dataset.layer === slug ? '1' : '0'));
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  function loop() {
    raf = 0;
    const vx = mx - px; px += vx * cfg.follow; py += (my - py) * cfg.follow;
    s += (on - s) * cfg.scale;
    const tilt = Math.max(-cfg.maxTilt, Math.min(cfg.maxTilt, vx * 0.06));
    preview.style.transform = `translate(${px}px,${py}px) scale(${s}) rotate(${tilt}deg)`;
    layers.forEach((l) => (l.style.transform = `translateX(${-tilt * 1.2}px) scale(1.05)`));
    if (on || s > 0.002 || Math.abs(vx) > 0.5) raf = requestAnimationFrame(loop);
  }

  const onMove = (e: PointerEvent) => {
    mx = e.clientX; my = e.clientY;
    if (!placed) { px = mx; py = my; placed = true; }
    kick();
  };
  const enter = (e: Event) => { on = 1; show((e.currentTarget as HTMLElement).dataset.slug!); kick(); };
  const leave = () => { on = 0; kick(); };
  const click = (e: Event) => {
    const row = e.currentTarget as HTMLElement;
    const slug = row.dataset.slug!;
    // name the image that is actually on screen so it morphs into the case header
    const src = fine && s > 0.5
      ? layers.find((l) => l.dataset.layer === slug)
      : row.querySelector<HTMLElement>('[data-thumb]');
    if (src) src.style.viewTransitionName = `cover-${slug}`;
  };

  if (fine) addEventListener('pointermove', onMove, { passive: true });
  rows.forEach((r) => {
    if (fine) { r.addEventListener('pointerenter', enter); r.addEventListener('pointerleave', leave); }
    r.addEventListener('click', click);
  });

  return {
    destroy() {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      rows.forEach((r) => { r.removeEventListener('pointerenter', enter); r.removeEventListener('pointerleave', leave); r.removeEventListener('click', click); });
    },
  };
}
