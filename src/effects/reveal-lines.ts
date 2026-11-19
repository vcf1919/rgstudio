/**
 * Masked line reveal: adds `.in` to every `.ri` once 40 % of it is visible.
 */
export function init(root: ParentNode) {
  const io = new IntersectionObserver(
    (es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }),
    { threshold: 0.4 },
  );
  root.querySelectorAll('.ri').forEach((el) => io.observe(el));
  return { destroy: () => io.disconnect() };
}
