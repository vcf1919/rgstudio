/**
 * Words light up with the scroll (prototipo.html → statement). The spans are rendered
 * server-side; this only toggles `.on`. With reduced motion the CSS shows them all lit.
 */
import { onScroll } from '../lib/scroll';

export function init(el: HTMLElement) {
  const words = [...el.querySelectorAll<HTMLElement>('[data-w]')];
  const off = onScroll(() => {
    const vh = innerHeight;
    const b = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * 0.8 - b.top) / (b.height + vh * 0.3)));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
  });
  return { destroy: off };
}
