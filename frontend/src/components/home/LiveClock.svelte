<script lang="ts">
  import { onMount } from 'svelte';

  export let timezone: string = 'UTC+7';

  const UTC_OFFSET_TO_IANA: Record<string, string> = {
    'UTC+7': 'Asia/Jakarta',
    'UTC+8': 'Asia/Singapore',
    'UTC+9': 'Asia/Tokyo',
    'UTC+0': 'UTC',
    'UTC-5': 'America/New_York',
    'UTC-8': 'America/Los_Angeles',
  };

  let clock = '--:--';

  onMount(() => {
    const tz = UTC_OFFSET_TO_IANA[timezone] || timezone;

    function tick() {
      try {
        clock = new Date().toLocaleTimeString('en-GB', {
          timeZone: tz,
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
  <iconify-icon icon="solar:clock-circle-linear" width="14" height="14"></iconify-icon>
  {timezone} · {clock}
</span>
