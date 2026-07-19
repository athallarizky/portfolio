<script lang="ts">
  import { onMount } from 'svelte'
  import { glow } from '../../lib/actions/glow'

  /**
   * Thin slot-wrapper island: applies the `glow` action to every slotted
   * `.glowable` descendant. Keeps the cards themselves as plain Astro markup
   * (SSR, no per-card hydration) — only this wrapper hydrates, once per grid.
   */
  let el: HTMLElement
  const cleanups: (() => void)[] = []

  onMount(() => {
    if (!el) return
    el.querySelectorAll<HTMLElement>('.glowable').forEach((node) => {
      const res = glow(node)
      if (typeof res?.destroy === 'function') cleanups.push(res.destroy)
    })
    return () => cleanups.forEach((fn) => fn())
  })
</script>

<div bind:this={el} class="glow-grid">
  <slot />
</div>
