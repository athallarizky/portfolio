<script lang="ts">
  import Icon from './Icon.svelte';

  export let placeholder = 'Search…';
  export let selector = '.grid-3 > article, .grid-3 > a';

  let query = '';

  function filter() {
    const q = query.toLowerCase();
    const container = document.querySelector('.content-inner');
    if (!container) return;
    container.querySelectorAll(selector).forEach((card) => {
      const text = card.textContent?.toLowerCase() || '';
      (card as HTMLElement).style.display = q ? (text.includes(q) ? '' : 'none') : '';
    });
  }
</script>

<label class="search" style="max-width:320px;">
  <Icon icon="solar:magnifer-linear" width={16} height={16} />
  <input type="text" bind:value={query} on:input={filter} {placeholder} />
</label>
