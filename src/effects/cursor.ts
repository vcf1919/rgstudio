/**
 * Orange dot cursor (fine pointers only). Grows over `[data-cursor="glass"]` areas.
 */
import { finePointer } from '../lib/media';

export function init(el: HTMLElement) {
  if (!finePointer()) return { destroy() {} };
  let mx = -100, my = -100, raf = 0;
  const onMove = (e: PointerEvent) => {
    mx = e.clientX; my = e.clientY; el.style.opacity = '1';
    const t = e.target as Element | null;
    el.classList.toggle('big', !!t?.closest?.('[data-cursor="glass"]'));
    if (!raf) raf = requestAnimationFrame(draw);
  };
  const onLeave = () => { el.style.opacity = '0'; };
  function draw() { raf = 0; el.style.transform = `translate(${mx}px,${my}px)`; }
  addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  return {
    destroy() {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    },
  };
}
