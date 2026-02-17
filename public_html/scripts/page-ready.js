(function() {
  'use strict';

  function markBodyReady() {
    var body = document.getElementById('body-main');
    if (body) {
      body.classList.add('ready');
    }
  }

  function initFadeInObserver() {
    if (!('IntersectionObserver' in window)) {
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.fade-in').forEach(function(element) {
      observer.observe(element);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    markBodyReady();
    initFadeInObserver();
  });
})();
