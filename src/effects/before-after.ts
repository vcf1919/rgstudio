/**
 * Before / after slider. Drag anywhere (mouse or finger; vertical page scroll keeps working),
 * or use the native range input with the keyboard.
 */
export function init(el: HTMLElement) {
  const range = el.querySelector<HTMLInputElement>('input[type=range]')!;
  let dragging = false;
  const set = (v: number) => {
    v = Math.min(100, Math.max(0, v));
    el.style.setProperty('--x', v + '%');
    range.value = String(v);
  };
  const fromEvent = (e: PointerEvent) => { const b = el.getBoundingClientRect(); set(((e.clientX - b.left) / b.width) * 100); };
  const down = (e: PointerEvent) => { if (e.target === range) return; dragging = true; el.setPointerCapture(e.pointerId); fromEvent(e); };
  const move = (e: PointerEvent) => { if (dragging) fromEvent(e); };
  const up = () => { dragging = false; };
  const input = () => set(+range.value);
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  range.addEventListener('input', input);
  set(+range.value);
  return {
    destroy() {
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      range.removeEventListener('input', input);
    },
  };
}
