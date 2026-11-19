/**
 * Magnetic button: pulled towards the pointer within `radius` px; its label moves less.
 */
import { magnetic as cfg } from '../config/effects';
import { finePointer, prefersReducedMotion } from '../lib/media';

export function init(el: HTMLElement, opts: Partial<typeof cfg> = {}) {
  const { radius, pull, label } = { ...cfg, ...opts };
  if (!finePointer() || prefersReducedMotion()) return { destroy() {} };
  const inner = el.querySelector<HTMLElement>('span');
  const onMove = (e: PointerEvent) => {
    const b = el.getBoundingClientRect();
    const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2);
    if (Math.hypot(dx, dy) < radius) {
      el.style.transform = `translate(${dx * pull}px,${dy * pull}px)`;
      if (inner) inner.style.transform = `translate(${dx * label}px,${dy * label}px)`;
    } else {
      el.style.transform = '';
      if (inner) inner.style.transform = '';
    }
  };
  addEventListener('pointermove', onMove, { passive: true });
  return { destroy: () => removeEventListener('pointermove', onMove) };
}
