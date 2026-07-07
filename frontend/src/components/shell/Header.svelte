<script lang="ts">
  import { mobileDrawerOpen } from '../../lib/stores/shell';
  import Icon from '../ui/Icon.svelte';

  export let pageTitle: string;
</script>

<header class="header">
  <div class="header-left">
    <button id="hamburger" class="icon-btn hamburger" on:click={() => ($mobileDrawerOpen = true)}>
      <Icon icon="solar:hamburger-menu-outline" width={24} height={24} />
    </button>
    <div class="header-title-row">
      <div class="accent-bar"></div>
      <span class="page-title">{pageTitle}</span>
      <span class="sync-icon" title="Refresh">
        <Icon icon="fluent:arrow-sync-12-filled" width={20} height={20} />
      </span>
    </div>
  </div>
  <div class="header-right">
    <slot name="header-right" />
  </div>
</header>
