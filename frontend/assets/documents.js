/* Documents registry + renderer.
 *
 * This is the single source of truth for the Documents page. The page is
 * rendered from the two arrays below — there is no hardcoded card markup in
 * documents.html.
 *
 * ── How to add a document ──────────────────────────────────────────────
 *   1. Drop the file into  assets/documents/
 *   2. Add one entry to DOCUMENTS below (copy an existing one, edit fields)
 *   3. Reload documents.html — it appears under its category
 *
 * ── How to add / reorder a category ────────────────────────────────────
 *   Add or move an entry in CATEGORIES. `category` on a document must match
 *   a CATEGORIES[].id. Empty categories are hidden automatically.
 *
 * (Static site, no backend — "uploading" means registering a file here.)
 */
(function () {
  'use strict';

  /* Registered categories — array order is the display order on the page. */
  var CATEGORIES = [
    { id: 'pinned',   label: 'Pinned',   icon: 'solar:pin-bold-duotone', hint: 'The essentials — résumé, CV, cover letter.' },
    { id: 'research', label: 'Research', icon: 'solar:book-2-outline',   hint: 'Write-ups, templates, and notes I keep returning to.' },
    { id: 'other',    label: 'Other',    icon: 'solar:folder-2-outline', hint: 'Miscellaneous files and references.' }
  ];

  /* Registered documents. `category` must match a CATEGORIES[].id. */
  var DOCUMENTS = [
    // — Pinned —
    { title: 'Résumé', category: 'pinned', file: 'atha-tharizky-resume.pdf', size: '~184 KB', updated: 'Jul 2026',
      excerpt: 'One-page summary of my experience, roles, and the work I have shipped.' },
    { title: 'CV — Detailed', category: 'pinned', file: 'atha-tharizky-cv.pdf', size: '~260 KB', updated: 'Jun 2026',
      excerpt: 'Full chronology: roles, talks, open-source contributions, and side projects.' },
    { title: 'Cover Letter Template', category: 'pinned', file: 'atha-tharizky-cover-letter.pdf', size: '~92 KB', updated: 'Apr 2026',
      excerpt: 'A reusable template I tailor for each role I apply to.' },
    // — Research —
    { title: 'AI Workflow Template', category: 'research', file: 'ai-workflow-template.md', size: '~16 KB', updated: 'Jul 2026',
      excerpt: 'How I run a software project with an AI agent — PRD to production, phase by phase.' },
    { title: 'Case Study — Rent-House-AI', category: 'research', file: 'rent-house-ai-case-study.pdf', size: '~1.2 MB', updated: 'May 2026',
      excerpt: 'Deep dive: listing scraper → RAG pipeline → semantic search across five services.' },
    // — Other —
    { title: 'References', category: 'other', file: 'atha-tharizky-references.pdf', size: '~70 KB', updated: 'Mar 2026',
      excerpt: 'Contact details for past collaborators and managers — available on request.' }
  ];

  var DIR = 'assets/documents/';

  /* File-type badge from the extension, e.g. resume.pdf → "PDF". */
  function fileType(file) {
    var dot = file.lastIndexOf('.');
    return dot > -1 ? file.slice(dot + 1).toUpperCase() : 'FILE';
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Build one compact document card — horizontal row: icon | info | download. */
  function card(doc) {
    var type = fileType(doc.file);
    var href = DIR + doc.file;
    return '' +
      '<article class="card is-hoverable doc-card">' +
        '<div class="doc-icon">' +
          '<iconify-icon icon="solar:file-bold-duotone" width="22" height="22"></iconify-icon>' +
        '</div>' +
        '<div class="doc-info">' +
          '<div class="card-header">' +
            '<span class="card-title">' + escapeHtml(doc.title) + '</span>' +
            '<span class="tag is-secondary">' + type + '</span>' +
          '</div>' +
          '<p class="card-excerpt">' + escapeHtml(doc.excerpt) + '</p>' +
          '<div class="doc-meta">' +
            '<span class="text-xs text-desc">Updated ' + escapeHtml(doc.updated) + '</span>' +
            '<span class="text-xs text-desc dot">·</span>' +
            '<span class="text-xs text-desc">' + escapeHtml(doc.size) + '</span>' +
          '</div>' +
        '</div>' +
        '<a class="icon-btn doc-download" href="' + encodeURI(href) + '" download="' + escapeHtml(doc.file) + '" title="Download ' + escapeHtml(doc.title) + '">' +
          '<iconify-icon icon="solar:download-bold" width="18" height="18"></iconify-icon>' +
        '</a>' +
      '</article>';
  }

  /* Build one category section. */
  function group(cat, docs) {
    return '' +
      '<section class="doc-group">' +
        '<div class="doc-group-head">' +
          '<iconify-icon icon="' + cat.icon + '" width="18" height="18"></iconify-icon>' +
          '<h2 class="doc-group-title">' + escapeHtml(cat.label) + '</h2>' +
          '<span class="doc-group-count">' + docs.length + '</span>' +
        '</div>' +
        '<p class="doc-group-hint text-desc text-sm">' + escapeHtml(cat.hint) + '</p>' +
        '<div class="grid-2">' + docs.map(card).join('') + '</div>' +
      '</section>';
  }

  function render() {
    var root = document.getElementById('documents-root');
    if (!root) return;
    var html = '';
    CATEGORIES.forEach(function (cat) {
      var docs = DOCUMENTS.filter(function (d) { return d.category === cat.id; });
      if (docs.length) html += group(cat, docs);   // hide empty categories
    });
    root.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', render);
})();
