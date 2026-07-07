<script lang="ts">
  import { onMount } from 'svelte';

  const ROLES = [
    'Full-Stack Engineer',
    'Backend-leaning builder',
    'AI-tooling tinkerer',
    'TypeScript · Go · Python',
  ];

  let roleText = ROLES[0];
  let reduce = false;

  onMount(() => {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      roleText = ROLES[0];
      return;
    }

    let ri = 0;
    let ci = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    function step() {
      const word = ROLES[ri];
      if (!deleting) {
        ci++;
        roleText = word.slice(0, ci);
        if (ci >= word.length) {
          deleting = true;
          timer = setTimeout(step, 1700);
          return;
        }
        timer = setTimeout(step, 60 + Math.random() * 45);
        return;
      }
      ci--;
      roleText = word.slice(0, ci);
      if (ci <= 0) {
        deleting = false;
        ri = (ri + 1) % ROLES.length;
        timer = setTimeout(step, 280);
        return;
      }
      timer = setTimeout(step, 28);
    }

    timer = setTimeout(step, 700);
    return () => clearTimeout(timer);
  });
</script>

<span>{roleText}</span><span class="caret" aria-hidden="true"></span>
