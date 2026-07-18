<script lang="ts">
  import Icon from './Icon.svelte';

  export let placeholder = 'Search\u2026';
  export let value = '';
  export let maxWidth = '320px';
</script>

<label class="search" style="max-width:{maxWidth};">
  <Icon icon="solar:magnifer-linear" width={16} height={16} />
  <input type="text" bind:value on:input {placeholder} />
</label>
