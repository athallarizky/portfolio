/* Home page interactions — kept deliberately light:
 *   - typing role under the name
 *   - count-up stats
 *   - hero pointer spotlight (radial glow follows cursor)
 *   - live local-time clock
 * All respect prefers-reduced-motion.
 */
(function () {
  'use strict';

  var ROLES = [
    'Full-Stack Engineer',
    'Backend-leaning builder',
    'AI-tooling tinkerer',
    'TypeScript · Go · Python'
  ];
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* typing role */
  function initTyper() {
    var el = document.getElementById('typed-role');
    if (!el) return;
    if (REDUCE) { el.textContent = ROLES[0]; return; }
    var ri = 0, ci = 0, deleting = false;
    function step() {
      var word = ROLES[ri];
      if (!deleting) {
        ci++; el.textContent = word.slice(0, ci);
        if (ci >= word.length) { deleting = true; return setTimeout(step, 1700); }
        return setTimeout(step, 60 + Math.random() * 45);
      }
      ci--; el.textContent = word.slice(0, ci);
      if (ci <= 0) { deleting = false; ri = (ri + 1) % ROLES.length; return setTimeout(step, 280); }
      setTimeout(step, 28);
    }
    setTimeout(step, 700);
  }

  /* count-up stats */
  function countUp(el, target, dur) {
    if (REDUCE) { el.textContent = String(target); return; }
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function initCounters() {
    document.querySelectorAll('.stat-num[data-count]').forEach(function (num) {
      var t = num.getAttribute('data-count');
      if (t === '' || isNaN(Number(t))) return;
      countUp(num, Number(t), 1500);
    });
  }

  /* hero pointer spotlight */
  function initSpotlight() {
    var hero = document.getElementById('hero');
    if (!hero) return;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  /* live local time (persona is UTC+7 / Jakarta) */
  function initClock() {
    var el = document.getElementById('local-time');
    if (!el) return;
    function tick() {
      try {
        el.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        el.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      }
    }
    tick();
    setInterval(tick, 15000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTyper();
    initCounters();
    initSpotlight();
    initClock();
  });
})();
