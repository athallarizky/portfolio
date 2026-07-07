<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '../ui/Icon.svelte';

  export let timezone: string = 'UTC+7';

  let clock = '--:--';

  onMount(() => {
    function tick() {
      try {
        clock = new Date().toLocaleTimeString('en-GB', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        clock = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      }
    }
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  });
</script>

<span class="hero-chip">
  <Icon icon="solar:clock-circle-linear" width={14} height={14} />
  {timezone} · {clock}
</span>
