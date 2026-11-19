/**
 * Mount effects on every page load (first load and after each View Transition)
 * and tear them down before the DOM is swapped.
 */
export type Destroy = () => void;
type Mount = (root: Document) => Destroy | Destroy[] | void;

const mounts: Mount[] = [];
let active: Destroy[] = [];
let wired = false;

function runAll() {
  for (const m of mounts) {
    const d = m(document);
    if (d) active.push(...(Array.isArray(d) ? d : [d]));
  }
}

export function onPage(mount: Mount) {
  mounts.push(mount);
  if (!wired) {
    wired = true;
    document.addEventListener('astro:page-load', () => { active.forEach((d) => d()); active = []; runAll(); });
    document.addEventListener('astro:before-swap', () => { active.forEach((d) => d()); active = []; });
  }
}
