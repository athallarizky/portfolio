import { writable } from 'svelte/store';

function getInitial(): 'light' | 'dark' {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  return 'light';
}

export const theme = writable<'light' | 'dark'>(getInitial());

export function toggleTheme() {
  theme.update(t => {
    const next = t === 'dark' ? 'light' : 'dark';
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('portfolio-theme', next);
    return next;
  });
}
