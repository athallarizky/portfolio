<script lang="ts">
  import { onMount } from 'svelte'

  /** One-shot scroll reveal. IO rooted at `.content-scroll` (the app shell's
   *  scroll container — the body itself doesn't scroll). Reduced-motion →
   *  shown immediately. */
  export let delay = '0s'
  let el: HTMLElement

  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-in')
          io.disconnect()
        }
      },
      { root: el.closest('.content-scroll'), threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  })
</script>

<div bind:this={el} class="reveal-io" style="--d:{delay}">
  <slot />
</div>
