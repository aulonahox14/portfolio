/* Main menu: mobile toggle + current-section highlight */
(function () {
  var doc = document;
  function setOpen(nav, open) {
    nav.classList.toggle('open', open);
    var b = nav.querySelector('.nav-toggle');
    if (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
  }
  doc.addEventListener('click', function (e) {
    var t = e.target.closest('.nav-toggle');
    if (t) { var nav = t.closest('nav'); setOpen(nav, !nav.classList.contains('open')); return; }
    var a = e.target.closest('.nav-links a');
    if (a) { setOpen(a.closest('nav'), false); return; }
    doc.querySelectorAll('nav.open').forEach(function (n) { if (!n.contains(e.target)) setOpen(n, false); });
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    doc.querySelectorAll('nav.open').forEach(function (n) { setOpen(n, false); var b = n.querySelector('.nav-toggle'); if (b) b.focus(); });
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) doc.querySelectorAll('nav.open').forEach(function (n) { setOpen(n, false); });
  });

  /* highlight the menu item for the section in view (homepage only) */
  var links = [].slice.call(doc.querySelectorAll('nav > .nav-links a[href^="#"]')).filter(function (a) { return a.getAttribute('href').length > 1; });
  if (!links.length || !('IntersectionObserver' in window)) return;
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  function mark(id) {
    links.forEach(function (a) { var on = byId[id] === a; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) mark(en.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['home'].concat(Object.keys(byId)).forEach(function (id) { var el = doc.getElementById(id); if (el) io.observe(el); });
})();
