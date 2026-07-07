<script lang="ts">
  import { onMount } from 'svelte';
  import { mobileDrawerOpen, sidebarCollapsed, toggleSidebarCollapsed } from '../../lib/stores/shell';
  import ThemeToggle from './ThemeToggle.svelte';
  import Icon from '../ui/Icon.svelte';
  import type { Nav } from '../../lib/api-types';

  export let activeNav: string;
  export let menuItems: Nav['menuItems'];
  export let connectLinks: Nav['connectLinks'];
  export let initials: string;
  export let name: string;
  export let role: string;

  let sidebarEl: HTMLElement;
  let backdropEl: HTMLElement;

  function closeDrawer() {
    $mobileDrawerOpen = false;
  }

  function onResize() {
    if (window.innerWidth >= 768) {
      $mobileDrawerOpen = false;
    }
  }

  onMount(() => {
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  function isActive(href: string): boolean {
    if (activeNav === '/' && href === '/') return true;
    if (activeNav !== '/' && href !== '/' && activeNav.startsWith(href)) return true;
    return false;
  }
</script>

<div
  id="sidebar-backdrop"
  class="sidebar-backdrop"
  class:is-open={$mobileDrawerOpen}
  on:click={closeDrawer}
  role="presentation"
></div>

<aside
  id="sidebar"
  class="sidebar"
  class:is-open={$mobileDrawerOpen}
  class:is-collapsed={$sidebarCollapsed}
  bind:this={sidebarEl}
>
  <div class="sidebar-top">
    <div class="avatar-block">
      <div class="avatar">{initials}</div>
      <div class="avatar-meta">
        <span class="avatar-name">{name}</span>
        <span class="avatar-role">{role}</span>
      </div>
    </div>
  </div>

  <nav class="sidebar-nav">
    <div class="sidebar-section-title">Menu</div>
    {#each menuItems.sort((a, b) => a.order - b.order) as item}
      <a
        class="sidebar-link"
        class:is-active={isActive(item.href)}
        href={item.href}
        on:click={closeDrawer}
      >
        <Icon icon={item.icon || 'solar:question-circle-outline'} width={20} height={20} />
        <span class="label">{item.label}</span>
      </a>
    {/each}
  </nav>

  <div class="sidebar-section">
    <div class="sidebar-section-title">Connect</div>
    {#each connectLinks.sort((a, b) => a.order - b.order) as link}
      <a
        class="sidebar-link"
        href={link.href}
        target={link.href.startsWith('http') ? '_blank' : undefined}
        rel={link.href.startsWith('http') ? 'noopener' : undefined}
      >
        <Icon icon={link.icon || 'solar:link-circle-bold'} width={20} height={20} />
        <span class="label">{link.label}</span>
      </a>
    {/each}
  </div>

  <div class="halation"></div>

  <div class="sidebar-bottom">
    <ThemeToggle />
    <button
      id="sidebar-collapse"
      class="icon-btn"
      title={$sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      on:click={toggleSidebarCollapsed}
    >
      <Icon icon="solar:alt-arrow-left-linear" width={18} height={18} />
    </button>
  </div>
</aside>
