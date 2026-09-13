<script lang="ts">
  import type { Project } from '../../lib/api-types';
  import Icon from '../ui/Icon.svelte';
  import SearchInput from '../ui/SearchInput.svelte';

  export let projects: Project[] = [];
  export let pageSize = 4;
  /** Link base for detail URLs — '' for the EN zone, '/id' for the Indonesian zone. */
  export let base = '';

  let query = '';
  let currentPage = 1;

  $: matching = projects.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      (p.excerpt || '').toLowerCase().includes(q) ||
      p.techTags.some((t) => t.name.toLowerCase().includes(q))
    );
  });

  $: totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
  $: start = (currentPage - 1) * pageSize;
  $: paged = matching.slice(start, start + pageSize);

  $: if (currentPage > totalPages) currentPage = totalPages;
</script>

<SearchInput bind:value={query} placeholder="Search projects" maxWidth="100%" />

<div style="margin-top:1.25rem;" class="grid-3">
  {#each paged as p}
    <article class="card is-hoverable project-card">
      <a href={`${base}/projects/${p.slug}`} style="display:block; text-decoration:none; color:inherit;">
        <div style={`height: 140px; border-radius: 12px; background: ${p.bannerColor}; display:flex; align-items:center; justify-content:center; margin-bottom:12px;`}>
          <Icon icon={p.bannerIcon || 'solar:rocket-bold'} width={48} height={48} />
        </div>
        <div class="card-header">
          <span class="card-title">{p.title}</span>
        </div>
        <p class="card-excerpt">{p.excerpt}</p>
        <div class="flex flex-wrap mt-2">
          {#each p.techTags.slice(0, 3) as t}
            <span class="tag is-secondary">{t.name}</span>
          {/each}
        </div>
      </a>
      <div class="card-footer">
        <span class="text-xs text-desc">{[p.descriptor, p.year].filter(Boolean).join(' · ')}</span>
        <div class="flex gap-2">
          {#each p.links as l}
            <a class="icon-btn" href={l.url || '#'} title={l.label} aria-label={l.label} target="_blank" rel="noopener">
              <Icon icon={l.icon || 'solar:link-circle-bold'} width={18} height={18} />
            </a>
          {/each}
        </div>
      </div>
    </article>
  {/each}
  {#if projects.length === 0}
    <div class="empty-state">
      <p class="text-desc text-sm">No projects to show right now.</p>
    </div>
  {/if}
  {#if matching.length === 0 && projects.length > 0}
    <div class="empty-state">
      <p class="text-desc text-sm">No projects match your search.</p>
    </div>
  {/if}
</div>

{#if totalPages > 1}
  <nav class="pagination mt-4" aria-label="Project pagination">
    <button class="btn btn-outline" disabled={currentPage <= 1} on:click={() => currentPage--}>
      <Icon icon="solar:alt-arrow-left-linear" width={16} height={16} />
      Previous
    </button>
    <span class="pagination-info text-desc text-sm">Page {currentPage} of {totalPages}</span>
    <button class="btn btn-outline" disabled={currentPage >= totalPages} on:click={() => currentPage++}>
      Next
      <Icon icon="solar:alt-arrow-right-linear" width={16} height={16} />
    </button>
  </nav>
{/if}
