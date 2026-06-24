/**
 * AgroBridge Global - WhatsApp Link Configuration
 * @description Reads window.AGROBRIDGE_WHATSAPP_NUMBER (set by config-production.js)
 *              and updates the floating WhatsApp link href with the configured number.
 *              Falls back gracefully to the default number baked into index.html.
 * @version 1.0.0
 */
(function() {
  'use strict';

  var DEFAULT_MESSAGE = 'Hola AgroBridge, me interesa solicitar una cotización enterprise para exportación.';

  document.addEventListener('DOMContentLoaded', function() {
    var num = window.AGROBRIDGE_WHATSAPP_NUMBER;
    if (!num) {
      return;
    }

    var el = document.getElementById('whatsapp-link');
    if (!el) {
      return;
    }

    var msg = encodeURIComponent(DEFAULT_MESSAGE);
    el.href = 'https://wa.me/' + num + '?text=' + msg;
    el.dataset.whatsappNumber = num;
  });
})();
