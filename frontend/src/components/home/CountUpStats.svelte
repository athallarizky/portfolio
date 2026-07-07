<script lang="ts">
  import { onMount } from 'svelte';

  export let stats: { value: string; suffix?: string | null; label: string }[] = [];

  let reduce = false;

  onMount(() => {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    function countUp(el: HTMLElement, target: number, dur: number) {
      let start: number | null = null;
      function frame(ts: number) {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    const nums = document.querySelectorAll<HTMLElement>('[data-count]');
    nums.forEach(num => {
      const t = num.getAttribute('data-count');
      if (!t || isNaN(Number(t))) return;
      countUp(num, Number(t), 1500);
    });
  });
</script>

<section class="stats reveal" style="--d:.14s">
  {#each stats as stat}
    <div class="stat">
      <div class="stat-value">
        <span class="stat-num" data-count={isNaN(Number(stat.value)) ? undefined : stat.value}>
          {reduce || isNaN(Number(stat.value)) ? stat.value : '0'}
        </span>
        {#if stat.suffix}
          <span class="stat-suffix">{stat.suffix}</span>
        {/if}
      </div>
      <span class="stat-label">{stat.label}</span>
    </div>
  {/each}
</section>
