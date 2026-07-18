<script lang="ts">
  import IconifyIcon from '@iconify/svelte';
  export let icon: string;
  export let width: number | string = 20;
  export let height: number | string = 20;
  export let label: string = '';
</script>

<IconifyIcon {icon} {width} {height} aria-hidden={!label} aria-label={label || undefined} />
