/**
 * Sticky stacking cards (prototipo.html → process).
 * A card becomes `.on` (its visual animates) once its top passes 60 % of the viewport.
 * When the next card arrives, the previous one scales down to 0.94 and dims to 75 %.
 */
import { onScroll } from '../lib/scroll';
import { prefersReducedMotion } from '../lib/media';

export function init(el: HTMLElement, { scale = 0.06, dim = 0.25 } = {}) {
  const cards = [...el.querySelectorAll<HTMLElement>('[data-card]')];
  const reduce = prefersReducedMotion();
  const off = onScroll(() => {
    const vh = innerHeight;
    cards.forEach((c, i) => {
      const cb = c.getBoundingClientRect();
      c.classList.toggle('on', cb.top < vh * 0.6);
      const next = cards[i + 1];
      if (!next || reduce) return;
      const nb = next.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, 1 - (nb.top - cb.top) / cb.height));
      c.style.transform = `scale(${1 - k * scale})`;
      c.style.filter = `brightness(${1 - k * dim})`;
    });
  });
  return { destroy: off };
}
