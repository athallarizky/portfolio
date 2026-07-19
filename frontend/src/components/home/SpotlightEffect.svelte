<script lang="ts">
  import { onMount } from 'svelte';

  let glowEl: HTMLElement;

  onMount(() => {
    if (!glowEl) return;
    // The overlay is `pointer-events: none`, so listen on the hero section
    // (pointermove bubbles up from its children) and set --mx/--my there —
    // custom properties inherit, so the overlay picks them up.
    const hero = glowEl.closest('.hero') as HTMLElement | null;
    if (!hero) return;

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || reduced.matches) return;

    function move(e: PointerEvent) {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }
    hero.addEventListener('pointermove', move);
    return () => hero.removeEventListener('pointermove', move);
  });
</script>

<div class="hero-spotlight" bind:this={glowEl}></div>
