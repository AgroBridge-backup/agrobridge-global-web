(function() {
  'use strict';

  var config = window.AGROBRIDGE_CONFIG;

  if (!('sendBeacon' in navigator) || !('PerformanceObserver' in window)) {
    return;
  }

  var vitals = {};

  try {
    var observer = new PerformanceObserver(function(list) {
      list.getEntries().forEach(function(entry) {
        try {
          if (entry.entryType === 'largest-contentful-paint') {
            vitals.lcp = Math.round(entry.startTime);
          } else if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            vitals.cls = (vitals.cls || 0) + entry.value;
          } else if (entry.entryType === 'first-input') {
            vitals.fid = Math.round(entry.processingStart - entry.startTime);
          } else if (entry.entryType === 'paint' && entry.name === 'first-paint') {
            vitals.fp = Math.round(entry.startTime);
          } else if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            vitals.fcp = Math.round(entry.startTime);
          }
        } catch (_error) {
          // Ignore malformed performance entries.
        }
      });
    });

    observer.observe({
      entryTypes: ['largest-contentful-paint', 'layout-shift', 'first-input', 'paint']
    });
  } catch (error) {
    console.warn('PerformanceObserver not supported:', error);
    return;
  }

  var vitalsSent = false;

  function sendVitals() {
    if (!config || !config.apiBase || Object.keys(vitals).length === 0) {
      return;
    }

    try {
      var data = new Blob([JSON.stringify(vitals)], {
        type: 'application/json'
      });

      var success = navigator.sendBeacon(config.apiBase + '/vitals', data);
      if (!success) {
        console.warn('Web vitals send failed: sendBeacon returned false');
      }
    } catch (error) {
      console.error('Failed to send web vitals:', error);
    }
  }

  function flushVitals() {
    if (vitalsSent) {
      return;
    }

    sendVitals();
    vitalsSent = true;
  }

  window.addEventListener('beforeunload', flushVitals);
  window.addEventListener('pagehide', flushVitals);

  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      flushVitals();
    }
  });
})();
