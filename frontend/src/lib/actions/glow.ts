import type { Action } from 'svelte/action'

/**
 * Cursor-tracking radial glow. Writes `--gx` / `--gy` (percentages) which the
 * `.glowable::after` CSS paints as a radial highlight.
 *
 * Self-disables on touch / coarse pointers and under prefers-reduced-motion,
 * so it only ever attaches on a fine-pointer desktop that wants motion.
 */
export const glow: Action<HTMLElement> = (node) => {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (!fine.matches || reduced.matches) return

  const onMove = (e: PointerEvent) => {
    const r = node.getBoundingClientRect()
    node.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`)
    node.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`)
  }
  node.addEventListener('pointermove', onMove)
  return { destroy: () => node.removeEventListener('pointermove', onMove) }
}
