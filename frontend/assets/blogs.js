/* Blog category filter.
 *
 * Derives the category chips from each article's existing tags (no hardcoded
 * list) and filters the list when a chip is clicked. 'All' resets the filter.
 */
(function () {
  'use strict';

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function init() {
    var list = document.querySelector('.blog-list');
    var box = document.getElementById('blog-categories');
    if (!list || !box) return;

    var articles = Array.prototype.filter.call(list.children, function (el) {
      return el.tagName === 'ARTICLE';
    });

    /* Per-article category set, read straight from the tag chips in the DOM. */
    var articleTags = articles.map(function (a) {
      return Array.prototype.map.call(
        a.querySelectorAll('.blog-card-meta .tag'),
        function (t) { return t.textContent.trim(); }
      );
    });

    /* Unique categories (sorted), 'All' first. */
    var counts = {};
    articleTags.forEach(function (tags) {
      tags.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
    });
    var cats = ['All'].concat(Object.keys(counts).sort());

    box.innerHTML = cats.map(function (c) {
      var active = c === 'All' ? ' is-active' : '';
      return '<button type="button" class="chip' + active + '" data-cat="' + escapeHtml(c) + '">' +
        escapeHtml(c) + '</button>';
    }).join('');

    box.addEventListener('click', function (e) {
      var btn = e.target.closest('.chip');
      if (!btn) return;
      var cat = btn.getAttribute('data-cat');
      Array.prototype.forEach.call(box.querySelectorAll('.chip'), function (c) {
        c.classList.toggle('is-active', c === btn);
      });
      articles.forEach(function (a, i) {
        var show = cat === 'All' || articleTags[i].indexOf(cat) > -1;
        a.style.display = show ? '' : 'none';
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
