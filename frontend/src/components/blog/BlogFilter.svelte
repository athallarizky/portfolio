<script lang="ts">
  import type { Article } from '../../lib/api-types';
  import Icon from '../ui/Icon.svelte';
  import SearchInput from '../ui/SearchInput.svelte';

  export let articles: Article[];
  /** Link base for detail URLs — '' for the EN zone, '/id' for the Indonesian zone. */
  export let base = '';
  /** Content language of this zone — drives the Language toggle in the sidebar. */
  export let lang: 'en' | 'id' = 'en';

  let activeCat = 'All';
  let searchQuery = '';

  const tagCounts: Record<string, number> = {};
  articles.forEach(a => {
    a.tags.forEach(t => {
      tagCounts[t.name] = (tagCounts[t.name] || 0) + 1;
    });
  });
  const categories = ['All', ...Object.keys(tagCounts).sort()];

  /** Zone switch: replaces the history entry (rapid toggling must not bury the back stack). */
  const langTarget = lang === 'en' ? '/id/blogs' : '/blogs';
  const langLabel = lang === 'en' ? 'Baca dalam Bahasa Indonesia' : 'Read in English';

  function switchLang(e: MouseEvent) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    location.replace(langTarget);
  }

  function select(cat: string) {
    activeCat = cat;
  }

  $: categoryFiltered = activeCat === 'All'
    ? articles
    : articles.filter(a => a.tags.some(t => t.name === activeCat));

  $: filteredArticles = (() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return categoryFiltered;
    return categoryFiltered.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.excerpt || '').toLowerCase().includes(q) ||
      a.tags.some(t => t.name.toLowerCase().includes(q))
    );
  })();

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
</script>

<div class="blog-layout">
  <div class="blog-list">
    <SearchInput bind:value={searchQuery} placeholder="Search articles" maxWidth="100%" />

    {#each filteredArticles as article}
      <article class="card is-hoverable">
        <div class="blog-card-tags">
          {#each article.tags as tag}
            <span class="tag is-secondary">{tag.name}</span>
          {/each}
        </div>
        <a href={`${base}/blogs/${article.slug}`} style="text-decoration:none; color:inherit;">
          <h2 class="blog-card-title">{article.title}</h2>
        </a>
        <div class="blog-card-meta">
          <span class="text-xs text-desc">Published {formatDate(article.publishedAt)}</span>
          {#if article.readMinutes}
            <span class="meta-item read-est">
              <Icon icon="solar:clock-circle-linear" width={14} height={14} />
              {article.readMinutes} min read
            </span>
          {/if}
        </div>
        <p class="blog-card-excerpt">{article.excerpt}</p>
        <div class="card-footer">
          <a class="btn btn-ghost" href={`${base}/blogs/${article.slug}`}>
            Read article
            <Icon icon="solar:alt-arrow-right-linear" width={16} height={16} />
          </a>
        </div>
      </article>
    {/each}

    {#if filteredArticles.length === 0}
      <div class="empty-state">
        <p>No articles match your filters.</p>
      </div>
    {/if}
  </div>

  <aside class="blog-filter">
    <div class="filter-head">
      <Icon icon="solar:translation-linear" width={16} height={16} />
      <span>Language</span>
    </div>
    <div class="blog-lang-toggle">
      <a href={langTarget} class="lang-toggle" title={langLabel} aria-label={langLabel} on:click={switchLang}>
        <span class="lang-toggle-track">
          <span class="lang-toggle-opt" aria-hidden="true">🇬🇧</span>
          <span class="lang-toggle-opt" aria-hidden="true">🇮🇩</span>
          <span class="lang-toggle-knob" class:is-id={lang === 'id'} aria-hidden="true">
            {lang === 'en' ? '🇬🇧' : '🇮🇩'}
          </span>
        </span>
      </a>
    </div>

    <div class="filter-head" style="margin-top:20px">
      <Icon icon="solar:filter-linear" width={16} height={16} />
      <span>Categories</span>
    </div>
    <div class="filter-chips">
      {#each categories as cat}
        <button
          type="button"
          class="chip"
          class:is-active={activeCat === cat}
          on:click={() => select(cat)}
        >
          {cat}
          {#if cat !== 'All'}
            <span class="chip-count">{tagCounts[cat]}</span>
          {/if}
        </button>
      {/each}
    </div>
  </aside>
</div>
