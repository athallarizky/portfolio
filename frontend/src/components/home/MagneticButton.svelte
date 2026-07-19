<script lang="ts">
  /** Magnetic pull wrapper: the slotted button drifts toward the cursor
   *  (≤ MAX px) within RANGE px, springs back on leave. Off on touch / reduced-motion. */
  const MAX = 6
  const RANGE = 40
  let el: HTMLElement
  let enabled = false

  function onMove(e: PointerEvent) {
    if (!enabled) return
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, (v / RANGE) * MAX))
    el.style.transform = `translate(${clamp(dx)}px, ${clamp(dy)}px)`
  }
  function onLeave() {
    el.style.transform = ''
  }

  // $effect runs browser-side only (never during SSR) — safe to read window here.
  $effect(() => {
    enabled =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
</script>

<span class="magnetic" bind:this={el} onpointermove={onMove} onpointerleave={onLeave}>
  <slot />
</span>
