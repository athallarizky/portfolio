<script lang="ts">
  import { theme, toggleTheme } from '../../lib/stores/theme';
  import Icon from '../ui/Icon.svelte';

  $: iconName = $theme === 'dark' ? 'solar:sun-bold' : 'solar:moon-bold';
</script>

<button id="theme-toggle" class="icon-btn" title="Toggle theme" on:click={toggleTheme} aria-label="Toggle theme">
  <Icon icon={iconName} width={20} height={20} />
</button>
