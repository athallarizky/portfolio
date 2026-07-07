<script lang="ts">
  import IconifyIcon from '@iconify/svelte/dist/Icon.svelte';
  export let icon: string;
  export let width: number | string = 20;
  export let height: number | string = 20;
</script>

<IconifyIcon {icon} {width} {height} />
