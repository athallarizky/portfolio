<script lang="ts">
  import { mobileDrawerOpen } from '../../lib/stores/shell';
  import Icon from '../ui/Icon.svelte';

  export let pageTitle: string;
</script>

<header class="header">
  <div class="header-left">
    <button id="hamburger" class="icon-btn hamburger" on:click={() => ($mobileDrawerOpen = true)} aria-label="Open menu" aria-expanded={$mobileDrawerOpen}>
      <Icon icon="solar:hamburger-menu-outline" width={24} height={24} />
    </button>
    <div class="header-title-row">
      <div class="accent-bar"></div>
      <!-- single-line ellipsis (sprint-31 fix): long titles kept the bar at a stable
           64px on mobile instead of wrapping — full title stays in the page content
           and in this hover tooltip. -->
      <span class="page-title" title={pageTitle}>{pageTitle}</span>
    </div>
  </div>
  <div class="header-right">
    <slot name="header-right" />
  </div>
</header>
