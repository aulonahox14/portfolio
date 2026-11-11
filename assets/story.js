/* 3D story layer: scroll progress, depth shapes, perspective reveals, card tilt, count-up.
   Progressive enhancement: skipped entirely when the visitor prefers reduced motion. */
(function () {
  var d = document, root = d.documentElement;
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  root.classList.add('story');

  /* scroll progress bar */
  var bar = d.createElement('div'); bar.className = 'story-progress'; bar.setAttribute('aria-hidden', 'true'); d.body.appendChild(bar);

  /* depth shapes */
  [].forEach.call(d.querySelectorAll('.hero-r,.case-hero'), function (host) {
    var w = d.createElement('div'); w.className = 'depth'; w.setAttribute('aria-hidden', 'true');
    w.innerHTML = '<i class="l1"></i><i class="l2"></i><i class="l3"></i>';
    host.insertBefore(w, host.firstChild);
  });

  /* perspective reveals, staggered within each group */
  var sel = '.proj-card,.exp-item,.ct-item,.xe,.result-item,.quote,.cred,.case-stats .stat,.case-steps li,.case-media,.case-figure,.case-callout,.more-card';
  var counts = new Map();
  function prep(el, cls) {
    var p = el.parentElement, i = counts.get(p) || 0; counts.set(p, i + 1);
    el.style.setProperty('--d', (Math.min(i, 5) * 0.08).toFixed(2) + 's'); el.classList.add(cls);
  }
  [].forEach.call(d.querySelectorAll(sel), function (el) { prep(el, 'd3'); });
  [].forEach.call(d.querySelectorAll('.pillars .pillar'), function (el) { prep(el, 'd3y'); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; io.unobserve(el); el.classList.add('in');
      setTimeout(function () { el.classList.remove('d3', 'd3y', 'in'); el.style.removeProperty('--d'); }, 1500);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  [].forEach.call(d.querySelectorAll('.d3,.d3y'), function (el) { io.observe(el); });

  /* tilt + glare */
  if (fine) {
    [].forEach.call(d.querySelectorAll('.proj-card'), function (c) {
      c.classList.add('tilt');
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
        c.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - y) * 5).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 6).toFixed(2) + 'deg) translateY(-3px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
    window.addEventListener('pointermove', function (e) {
      root.style.setProperty('--mx', ((e.clientX / window.innerWidth - 0.5) * 36).toFixed(1) + 'px');
      root.style.setProperty('--my', ((e.clientY / window.innerHeight - 0.5) * 24).toFixed(1) + 'px');
    }, { passive: true });
  }

  /* scroll: progress + depth parallax (works inside the preview's story overlay too) */
  var ticking = false;
  function metrics() {
    var ov = d.querySelector('.case-view.open');
    if (ov) return { y: ov.scrollTop, max: ov.scrollHeight - ov.clientHeight };
    return { y: window.scrollY, max: root.scrollHeight - window.innerHeight };
  }
  function frame() {
    ticking = false; var m = metrics();
    bar.style.transform = 'scaleX(' + (m.max > 0 ? Math.min(Math.max(m.y / m.max, 0), 1) : 0).toFixed(4) + ')';
    root.style.setProperty('--sy', Math.min(m.y, 1200).toFixed(0) + 'px');
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  d.addEventListener('scroll', onScroll, { passive: true, capture: true });
  window.addEventListener('resize', onScroll, { passive: true });
  frame();

  /* count-up for the percentage results */
  var res = d.querySelector('.results');
  if (res) {
    var nums = [].filter.call(res.querySelectorAll('.result-icon'), function (n) { return /^\d+%$/.test(n.textContent.trim()); });
    nums.forEach(function (n) { n.setAttribute('data-t', n.textContent.trim()); n.textContent = '0%'; });
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return; o.disconnect();
      nums.forEach(function (n) {
        var target = parseInt(n.getAttribute('data-t'), 10), t0 = null;
        (function step(ts) {
          if (!t0) t0 = ts; var p = Math.min((ts - t0) / 1200, 1), e = 1 - Math.pow(1 - p, 3);
          n.textContent = Math.round(target * e) + '%'; if (p < 1) requestAnimationFrame(step); else n.textContent = n.getAttribute('data-t');
        })(performance.now());
      });
    }, { threshold: 0.35 }).observe(res);
  }
})();
