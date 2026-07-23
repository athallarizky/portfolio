<script lang="ts">
  const _apiUrl = (import.meta as any).env?.PUBLIC_API_URL;
  const API = _apiUrl || '/api';
  const API_ORIGIN = _apiUrl ? _apiUrl.replace(/\/api\/?$/, '') : '';

  export interface ScreenshotItem {
    id?: number
    alt?: string | null
    url?: string | null
    thumbnailURL?: string | null
    filename?: string | null
    width?: number | null
    height?: number | null
    /** Legacy fallback: bannerColor + icon when no image */
    bannerColor?: string | null
    icon?: string | null
    label?: string | null
  }

  interface Props { items: ScreenshotItem[] }
  let { items }: Props = $props()

  function imgUrl(s: ScreenshotItem): string | null {
    if (s.url) return s.url.startsWith('http') ? s.url : `${API_ORIGIN}${s.url}`
    if (s.filename) return `${API_ORIGIN}/api/media/file/${s.filename}`
    return null
  }
  function thumbUrl(s: ScreenshotItem): string | null {
    if (s.thumbnailURL) return s.thumbnailURL.startsWith('http') ? s.thumbnailURL : `${API_ORIGIN}${s.thumbnailURL}`
    return imgUrl(s)
  }

  let open = $state(false)
  let index = $state(0)
  let scale = $state(1)
  let x = $state(0)
  let y = $state(0)

  const reset = () => { scale = 1; x = 0; y = 0 }
  const show = (i: number) => { index = i; reset(); open = true }
  const close = () => { open = false }
  const goto = (dir: number) => {
    if ((items?.length ?? 0) < 2) return
    index = (index + dir + items.length) % items.length
    reset()
  }

  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    scale = Math.max(1, Math.min(5, scale - e.deltaY * 0.0015))
  }
  const toggleZoom = () => { scale = scale > 1 ? 1 : 2.2 }

  let drag = false
  let sx = 0; let sy = 0; let ox = 0; let oy = 0
  const onDown = (e: PointerEvent) => {
    drag = true; sx = e.clientX; sy = e.clientY; ox = x; oy = y
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: PointerEvent) => {
    if (!drag) return
    x = ox + (e.clientX - sx)
    y = oy + (e.clientY - sy)
  }
  const onUp = () => { drag = false }

  const onKey = (e: KeyboardEvent) => {
    if (!open) return
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowLeft') goto(-1)
    else if (e.key === 'ArrowRight') goto(1)
  }

  const portal = (node: HTMLElement) => {
    document.body.appendChild(node)
    return { destroy() { node.remove() } }
  }

  $effect(() => {
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })
</script>

<div class="screenshot-row">
  {#each items as s, i}
    <button
      type="button"
      class="thumb"
      class:has-image={!!imgUrl(s)}
      style={imgUrl(s) ? '' : `background:${s.bannerColor || 'linear-gradient(135deg,#9936e6,#5b21b6)'}`}
      onclick={() => show(i)}
      aria-label={s.alt || s.label || 'Open screenshot'}
    >
      {#if imgUrl(s)}
        <img src={thumbUrl(s) || imgUrl(s)!} alt={s.alt || s.label || ''} loading="lazy" />
      {:else}
        <iconify-icon icon={s.icon || 'solar:gallery-linear'} width="48" height="48" style="color:#fff; opacity:.6"></iconify-icon>
      {/if}
      <span class="expand-hint"><iconify-icon icon="solar:maximize-square-bold" width="16" height="16"></iconify-icon></span>
    </button>
  {/each}
</div>

{#if open}
  <div class="lightbox" use:portal role="dialog" aria-modal="true" aria-label="Screenshot viewer">
    <div
      class="lb-backdrop"
      onclick={close}
      onwheel={onWheel}
      onpointerdown={onDown}
      onpointermove={onMove}
      onpointerup={onUp}
      onpointercancel={onUp}
    ></div>

    <div
      class="lb-photo"
      class:lb-has-img={!!imgUrl(items[index])}
      style={imgUrl(items[index])
        ? ``
        : `transform: translate(${x}px, ${y}px) scale(${scale}); background:${items[index].bannerColor || 'linear-gradient(135deg,#9936e6,#5b21b6)'}`}
      onclick={(e) => e.stopPropagation()}
      ondblclick={toggleZoom}
      onpointerdown={onDown}
      onpointermove={onMove}
      onpointerup={onUp}
      onpointercancel={onUp}
      onwheel={onWheel}
      role="img"
    >
      {#if imgUrl(items[index])}
        <img
          src={imgUrl(items[index])!}
          alt={items[index].alt || items[index].label || ''}
          style={`transform: translate(${x}px, ${y}px) scale(${scale})`}
          ondblclick={toggleZoom}
          onpointerdown={onDown}
          onpointermove={onMove}
          onpointerup={onUp}
          onpointercancel={onUp}
          onwheel={onWheel}
        />
      {:else}
        <iconify-icon icon={items[index].icon || 'solar:gallery-linear'} width="140" height="140" style="color:#fff; opacity:.5"></iconify-icon>
      {/if}
    </div>

    <button class="lb-btn lb-close" onclick={close} aria-label="Close">
      <iconify-icon icon="solar:close-circle-bold" width="26" height="26"></iconify-icon>
    </button>
    {#if (items?.length ?? 0) > 1}
      <button class="lb-btn lb-prev" onclick={() => goto(-1)} aria-label="Previous">
        <iconify-icon icon="solar:alt-arrow-left-linear" width="30" height="30"></iconify-icon>
      </button>
      <button class="lb-btn lb-next" onclick={() => goto(1)} aria-label="Next">
        <iconify-icon icon="solar:alt-arrow-right-linear" width="30" height="30"></iconify-icon>
      </button>
      <span class="lb-count">{index + 1} / {items.length}</span>
    {/if}
  </div>
{/if}

<style>
  .thumb {
    position: relative;
    height: 160px; width: 100%;
    border: 0; border-radius: 12px; padding: 0; font: inherit;
    display: flex; align-items: center; justify-content: center;
    cursor: zoom-in; overflow: hidden;
    transition: transform .15s ease;
  }
  .thumb:hover { transform: translateY(-2px); }
  .thumb.has-image { background: var(--card) !important; }
  .thumb img {
    width: 100%; height: 100%; object-fit: cover;
  }
  .expand-hint {
    position: absolute; top: 8px; right: 8px;
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(0, 0, 0, .35); color: #fff;
    opacity: 0; transition: opacity .15s ease;
  }
  .thumb:hover .expand-hint,
  .thumb:focus-visible .expand-hint { opacity: 1; }
  .thumb:focus-visible { outline: 2px solid var(--secondary); outline-offset: 2px; }

  .lightbox {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    animation: lb-fade .15s ease;
  }
  .lb-backdrop {
    position: absolute; inset: 0;
    background: rgba(0, 0, 0, .92);
    backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
    cursor: grab; touch-action: none;
  }
  .lb-backdrop:active { cursor: grabbing; }
  .lb-photo {
    position: relative; z-index: 1;
    width: min(90vw, 1000px); height: min(72vh, 620px);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 24px 70px rgba(0, 0, 0, .55);
    transform-origin: center center; will-change: transform;
    transition: transform .08s ease-out; user-select: none;
    cursor: zoom-in; touch-action: none;
    overflow: hidden;
  }
  .lb-photo.lb-has-img {
    background: var(--card) !important;
    width: min(90vw, none); max-width: 90vw;
    height: auto; max-height: 85vh;
  }
  .lb-photo img {
    max-width: 90vw; max-height: 85vh; object-fit: contain;
    border-radius: 12px;
    transform-origin: center center;
    cursor: zoom-in; user-select: none;
  }
  .lb-btn {
    position: absolute; z-index: 2;
    display: flex; align-items: center; justify-content: center;
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(255, 255, 255, .2); border: 0; color: #fff;
    cursor: pointer;
    backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    transition: background .15s ease;
    box-shadow: 0 4px 16px rgba(0, 0, 0, .35);
  }
  .lb-btn:hover { background: rgba(255, 255, 255, .36); }
  .lb-close { top: 20px; right: 20px; }
  .lb-prev { left: 20px; top: 50%; transform: translateY(-50%); }
  .lb-next { right: 20px; top: 50%; transform: translateY(-50%); }
  .lb-count {
    position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 2;
    color: #fff; font-size: 13px; font-weight: 600;
    background: rgba(0, 0, 0, .4); padding: 5px 12px; border-radius: 9999px;
  }
  @keyframes lb-fade { from { opacity: 0 } to { opacity: 1 } }
  @media (prefers-reduced-motion: reduce) {
    .thumb, .lb-photo, .lightbox, .lb-btn { transition: none; animation: none; }
  }
</style>
