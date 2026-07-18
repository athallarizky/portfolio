<script lang="ts">
  import SearchInput from './SearchInput.svelte';

  export let placeholder = 'Search\u2026';
  export let selector = '.grid-3 > article, .grid-3 > a';
  export let maxWidth = '100%';

  let query = '';
  let noResults = false;

  function filter() {
    const q = query.toLowerCase();
    const container = document.querySelector('.content-inner');
    if (!container) return;
    let visible = 0;
    container.querySelectorAll(selector).forEach((card) => {
      const text = card.textContent?.toLowerCase() || '';
      if (q) {
        const match = text.includes(q);
        (card as HTMLElement).style.display = match ? '' : 'none';
        if (match) visible++;
      } else {
        (card as HTMLElement).style.display = '';
        visible++;
      }
    });
    noResults = q.length > 0 && visible === 0;
  }
</script>

<SearchInput bind:value={query} on:input={filter} {placeholder} maxWidth={maxWidth} />

{#if noResults}
  <p class="text-desc text-sm" style="margin-top:1rem;">No results match your search.</p>
{/if}
