/**
 * AgroBridge Global - Shared Utilities
 * @description Single source of truth for common utility functions
 * @version 4.0.0
 *
 * This module provides debounce, throttle, escapeHtml, DOM helpers,
 * and other shared utilities used across all AgroBridge modules.
 * All other modules should reference window.AgroBridgeUtils rather
 * than re-implementing these functions.
 */

window.AgroBridgeUtils = (function() {
    'use strict';

    /**
     * Debounce function - delays invoking func until after wait ms
     * have elapsed since the last time the debounced function was invoked.
     * @param {Function} func - The function to debounce
     * @param {number} wait - The number of milliseconds to delay
     * @returns {Function} The debounced function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function - ensures func is called at most once per limit ms.
     * @param {Function} func - The function to throttle
     * @param {number} limit - The time limit in milliseconds
     * @returns {Function} The throttled function
     */
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Sanitize string to prevent XSS attacks by escaping HTML entities.
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string with HTML entities escaped
     */
    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        const htmlEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        return str.replace(/[&<>"'`=\/]/g, char => htmlEntities[char]);
    }

    /**
     * Normalize API base URL
     * @param {string} base - Base URL
     * @returns {string} Normalized URL without trailing slash
     */
    function normalizeApiBase(base) {
        if (typeof base !== 'string') return 'https://api.agrobridge.global/v2';
        return base.replace(/\/+$/, '');
    }

    /**
     * Delay helper for async operations
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise<void>}
     */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Safely get DOM element with null check
     * @param {string} id - Element ID
     * @returns {HTMLElement|null}
     */
    function getElement(id) {
        return document.getElementById(id);
    }

    /**
     * Safely set element style
     * @param {string} id - Element ID
     * @param {string} property - CSS property
     * @param {string} value - CSS value
     */
    function setStyle(id, property, value) {
        const element = document.getElementById(id);
        if (element) {
            element.style[property] = value;
        }
    }

    /**
     * Safely set element text content
     * @param {string} id - Element ID
     * @param {string} text - Text content
     */
    function setText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Safely set element innerHTML (sanitized)
     * @param {string} id - Element ID
     * @param {string} html - HTML content (will be used as-is, ensure it's safe)
     */
    function setHtml(id, html, raw) {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = raw ? html : escapeHtml(html);
        }
    }

    /**
     * Generate a random SHA-256-like hash
     * // DEMO ONLY — NOT cryptographically secure. Uses Math.random for mock hash display.
     * @returns {string} 64-character hex string
     */
    function generateHash() {
        return Array(64).fill(0).map(function() {
            return Math.floor(Math.random() * 16).toString(16);
        }).join('');
    }

    /**
     * Format date for display
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    function formatDateTime(date) {
        var lang = document.documentElement.lang || 'es';
        return new Intl.DateTimeFormat(lang, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    // ============================================
    // FETCH WITH TIMEOUT
    // ============================================

    /**
     * Fetch with AbortController timeout.
     * Wraps the native fetch API with automatic timeout support.
     *
     * @param {string} url - The URL to fetch
     * @param {Object} [options={}] - Standard fetch options
     * @param {number} [timeoutMs=10000] - Timeout in milliseconds (default 10s)
     * @returns {Promise<Response>} The fetch response
     * @throws {Error} Throws with message 'REQUEST_TIMEOUT' on timeout
     */
    async function fetchWithTimeout(url, options, timeoutMs) {
        if (options === undefined) options = {};
        if (timeoutMs === undefined) timeoutMs = 10000;

        var controller = new AbortController();
        var timeout = setTimeout(function() { controller.abort(); }, timeoutMs);
        try {
            var mergedOptions = Object.assign({}, options, { signal: controller.signal });
            var response = await fetch(url, mergedOptions);
            return response;
        } catch (err) {
            if (err.name === 'AbortError') {
                throw new Error('REQUEST_TIMEOUT');
            }
            throw err;
        } finally {
            clearTimeout(timeout);
        }
    }

    // ============================================
    // DEBUG LOGGING
    // ============================================

    var DEBUG = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.AGROBRIDGE_DEBUG === true;

    /**
     * Debug log - only outputs on localhost or when AGROBRIDGE_DEBUG is true
     * @param {...*} args - Arguments to log
     */
    function log() {
        if (DEBUG) {
            console.log.apply(console, ['[AgroBridge]'].concat(Array.prototype.slice.call(arguments)));
        }
    }

    /**
     * Error log - always outputs (errors should never be silenced)
     * @param {...*} args - Arguments to log
     */
    function error() {
        console.error.apply(console, ['[AgroBridge]'].concat(Array.prototype.slice.call(arguments)));
    }

    /**
     * Warning log - only outputs on localhost or when AGROBRIDGE_DEBUG is true
     * @param {...*} args - Arguments to log
     */
    function warn() {
        if (DEBUG) {
            console.warn.apply(console, ['[AgroBridge]'].concat(Array.prototype.slice.call(arguments)));
        }
    }

    return {
        debounce: debounce,
        throttle: throttle,
        escapeHtml: escapeHtml,
        normalizeApiBase: normalizeApiBase,
        delay: delay,
        getElement: getElement,
        setStyle: setStyle,
        setText: setText,
        setHtml: setHtml,
        generateHash: generateHash,
        formatDateTime: formatDateTime,
        fetchWithTimeout: fetchWithTimeout,
        log: log,
        error: error,
        warn: warn
    };
})();
