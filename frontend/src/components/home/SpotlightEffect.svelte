<script lang="ts">
  import { onMount } from 'svelte';

  let heroEl: HTMLElement;

  onMount(() => {
    if (!heroEl) return;
    function move(e: PointerEvent) {
      const r = heroEl.getBoundingClientRect();
      heroEl.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      heroEl.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }
    heroEl.addEventListener('pointermove', move);
    return () => heroEl.removeEventListener('pointermove', move);
  });
</script>

<div class="hero-spotlight"></div>
