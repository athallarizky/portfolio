import { writable } from 'svelte/store';

export const mobileDrawerOpen = writable(false);

const savedCollapsed = typeof localStorage !== 'undefined'
  ? localStorage.getItem('portfolio-sidebar-collapsed') === '1'
  : false;

export const sidebarCollapsed = writable(savedCollapsed);

export function toggleSidebarCollapsed() {
  sidebarCollapsed.update(v => {
    const next = !v;
    localStorage.setItem('portfolio-sidebar-collapsed', next ? '1' : '0');
    return next;
  });
}
