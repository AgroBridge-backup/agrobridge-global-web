/**
 * AgroBridge Validation Module
 * @description Validation engine, display, and error handling
 * @version 3.0.0
 */

window.AgroBridgeValidation = (function() {
    'use strict';

    var utils = window.AgroBridgeUtils;
    var ui = window.AgroBridgeUI;
    var i18n = window.AgroBridgeI18n;
    var demoData = window.AgroBridgeDemoData;
    if (!utils) { console.warn('AgroBridgeUtils not loaded'); return {}; }

    // ============================================
    // FOCUS TRAP (Accessibility)
    // ============================================

    var _overlayTrapHandler = null;

    function trapOverlayFocus(container) {
        var focusable = container.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
        if (focusable.length) {
            var first = focusable[0];
            var last = focusable[focusable.length - 1];
            _overlayTrapHandler = function(e) {
                if (e.key !== 'Tab') return;
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            };
            container.addEventListener('keydown', _overlayTrapHandler);
            first.focus();
        } else {
            container.setAttribute('tabindex', '-1');
            container.focus();
        }
    }

    function releaseOverlayFocus(container) {
        if (_overlayTrapHandler) {
            container.removeEventListener('keydown', _overlayTrapHandler);
            _overlayTrapHandler = null;
        }
        container.removeAttribute('tabindex');
    }

    // ============================================
    // VALIDATION SYSTEM (Bug #1, #3, #6 Fix)
    // ============================================

    function initValidationSystem(app) {
        var searchBtn = utils.getElement('search-button') || utils.getElement('validate-btn');
        var searchInput = utils.getElement('search-input') || utils.getElement('validation-input');
        var demoBtn = utils.getElement('demo-btn');

        if (searchBtn && searchInput) {
            app._trackListener(searchBtn, 'click', function() { app.validateLot(); });
            app._trackListener(searchInput, 'keypress', function(e) {
                if (e.key === 'Enter') app.validateLot();
            });
            app._trackListener(searchInput, 'input', function() {
                searchInput.value = searchInput.value.toUpperCase();
                searchInput.setAttribute('aria-invalid', 'false');

                var errorDiv = utils.getElement('search-error');
                if (errorDiv && errorDiv.innerHTML) {
                    errorDiv.innerHTML = '';
                    errorDiv.hidden = true;
                    errorDiv.style.display = 'none';
                }
            });
        }

        if (demoBtn) {
            app._trackListener(demoBtn, 'click', function() { runDemo(app); });
        }
    }

    async function runDemo(app) {
        var input = utils.getElement('search-input') || utils.getElement('validation-input');
        if (input) {
            input.value = 'AB-HASS-2026-001';
            input.focus();
            await app.validateLot();
        }
    }

    function isValidLotCode(code) {
        if (!code || typeof code !== 'string') return false;
        return /^[A-Z0-9-]+$/.test(code.toUpperCase());
    }

    function setVisibility(element, visible) {
        if (!element) return;
        element.hidden = !visible;
        element.style.display = visible ? 'block' : 'none';
    }

    function setCardState(state) {
        var card = utils.getElement('validation-card');
        if (!card) return;

        card.classList.remove('is-loading', 'is-success', 'is-error');
        if (state === 'loading') card.classList.add('is-loading');
        if (state === 'success') card.classList.add('is-success');
        if (state === 'error') card.classList.add('is-error');
    }

    function setButtonLoading(button, isLoading) {
        if (!button) return;
        button.disabled = isLoading;
        button.setAttribute('aria-disabled', isLoading ? 'true' : 'false');
        button.setAttribute('aria-busy', isLoading ? 'true' : 'false');
        if (isLoading) {
            button.classList.add('is-loading');
        } else {
            button.classList.remove('is-loading');
        }
    }

    function inferErrorType(app, message) {
        var candidates = ['empty', 'format', 'notfound', 'connection', 'timeout', 'ratelimit'];
        for (var i = 0; i < candidates.length; i++) {
            var key = 'error.' + candidates[i];
            if (i18n.t(app.currentLang, key) === message) {
                return candidates[i];
            }
        }
        return 'connection';
    }

    async function validateLot(app) {
        var searchInput = utils.getElement('search-input') || utils.getElement('validation-input');
        var errorDiv = utils.getElement('search-error');
        var statusDiv = utils.getElement('validation-status-message');
        var detailsContainer = utils.getElement('validation-details-container');
        var resultsDiv = utils.getElement('validation-results');
        var scanningOverlay = utils.getElement('scanning-overlay');
        var statusIndicator = utils.getElement('status-indicator');
        var statusText = utils.getElement('status-text');
        var validateBtn = utils.getElement('search-button') || utils.getElement('validate-btn');

        if (!searchInput) {
            utils.error('Search input not found');
            return;
        }

        var now = Date.now();
        if (now - app.lastValidationTime < app.RATE_LIMIT_MS) {
            showValidationError(app, i18n.t(app.currentLang, 'error.ratelimit'), 'ratelimit');
            return;
        }

        if (app.isValidating) return;

        var lotCode = searchInput.value.trim().toUpperCase();

        if (searchInput) {
            searchInput.setAttribute('aria-invalid', 'false');
            searchInput.removeAttribute('aria-busy');
        }

        if (errorDiv) {
            errorDiv.innerHTML = '';
            setVisibility(errorDiv, false);
        }
        if (statusDiv) {
            statusDiv.textContent = '';
            setVisibility(statusDiv, false);
        }
        if (detailsContainer) detailsContainer.innerHTML = '';
        if (resultsDiv) {
            resultsDiv.classList.remove('active');
            resultsDiv.setAttribute('aria-hidden', 'true');
        }
        setCardState('default');

        var skeletonDiv = utils.getElement('validation-skeleton');

        if (!lotCode) {
            showValidationError(app, i18n.t(app.currentLang, 'error.empty'), 'empty');
            searchInput.focus();
            return;
        }

        if (!isValidLotCode(lotCode)) {
            showValidationError(app, i18n.t(app.currentLang, 'error.format'), 'format');
            return;
        }

        app.isValidating = true;
        app.lastValidationTime = now;

        setCardState('loading');
        if (searchInput) searchInput.setAttribute('aria-busy', 'true');
        setButtonLoading(validateBtn, true);
        if (statusIndicator) statusIndicator.className = 'status-indicator status-indicator--scanning';
        if (statusText) statusText.textContent = i18n.t(app.currentLang, 'status.verifying');
        if (scanningOverlay) {
            scanningOverlay.classList.add('active');
            scanningOverlay.setAttribute('aria-busy', 'true');
            trapOverlayFocus(scanningOverlay);
        }
        if (skeletonDiv) {
            skeletonDiv.classList.remove('hidden');
            skeletonDiv.style.display = 'block';
        }

        var stopScanning = false;
        var scanningTask = ui.showScanningSteps(app.currentLang, {
            shouldStop: function() { return stopScanning; },
            stepDelay: 280
        });

        try {
            var result = await fetchValidationData(app, lotCode);
            stopScanning = true;
            await Promise.race([scanningTask, utils.delay(120)]);
            displayValidationResult(app, result);

        } catch (error) {
            stopScanning = true;
            utils.error('Validation error:', error);
            if (error.message === 'REQUEST_TIMEOUT') {
                showValidationError(app, i18n.t(app.currentLang, 'error.timeout'), 'timeout');
            } else if (error.message === 'NOT_FOUND') {
                showValidationError(app, i18n.t(app.currentLang, 'error.notfound'), 'notfound');
            } else {
                showValidationError(app, i18n.t(app.currentLang, 'error.connection'), 'connection');
            }

        } finally {
            stopScanning = true;
            app.isValidating = false;
            if (searchInput) searchInput.removeAttribute('aria-busy');
            setButtonLoading(validateBtn, false);
            if (scanningOverlay) {
                releaseOverlayFocus(scanningOverlay);
                scanningOverlay.classList.remove('active');
                scanningOverlay.setAttribute('aria-busy', 'false');
            }
            if (skeletonDiv) {
                skeletonDiv.style.display = 'none';
                skeletonDiv.classList.add('hidden');
            }
        }
    }

    async function fetchValidationData(app, lotCode) {
        if (app.USE_DEMO_MODE) {
            return demoData.getDemoData(lotCode);
        }

        var response = await window.AgroBridgeUtils.fetchWithTimeout(
            app.validationApi + '/' + encodeURIComponent(lotCode),
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Version': 'v2',
                    'Accept-Language': app.currentLang
                }
            },
            10000
        );

        var payload = null;
        try {
            payload = await response.json();
        } catch (error) {
            payload = null;
        }

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('NOT_FOUND');
            }
            throw new Error('HTTP error! status: ' + response.status);
        }

        if (!payload || payload.valid === false || payload.success === false) {
            throw new Error('NOT_FOUND');
        }

        return normalizeVerificationResponse(payload, lotCode);
    }

    function normalizeVerificationResponse(payload, lotCode) {
        var apiData = (payload && payload.data) ? payload.data : {};
        var specs = (apiData && apiData.specifications && typeof apiData.specifications === 'object')
            ? apiData.specifications : {};
        var placeholder = '--';
        var originParts = [];

        if (apiData.location && apiData.location.region) originParts.push(apiData.location.region);
        if (apiData.location && apiData.location.country) originParts.push(apiData.location.country);

        var origin = originParts.length ? originParts.join(', ') : (specs.origin || '');

        var timelineSource = (specs.timestamps && typeof specs.timestamps === 'object')
            ? specs.timestamps : {};

        var timestamps = {
            harvest: timelineSource.harvest || specs.harvest || placeholder,
            packing: timelineSource.packing || specs.packing || placeholder,
            cold: timelineSource.cold || specs.cold || placeholder,
            export: timelineSource.export || specs.export || placeholder
        };

        var qualityMetrics = (specs.qualityMetrics && typeof specs.qualityMetrics === 'object')
            ? specs.qualityMetrics : {};

        return {
            status: (payload && payload.valid) ? 'valid' : 'invalid',
            lotCode: apiData.lotCode || lotCode || '',
            product: apiData.productName || '',
            variety: specs.variety || '',
            origin: origin,
            producer: specs.producer || '',
            harvestDate: specs.harvestDate || specs.harvest || placeholder,
            exportDate: specs.exportDate || specs.export || placeholder,
            destination: specs.destination || placeholder,
            blockchainHash: specs.blockchainHash || '',
            avgTemp: specs.avgTemp || '',
            qualityScore: specs.qualityScore || '',
            brix: specs.brix || '',
            ph: specs.ph || '',
            timestamps: timestamps,
            certifications: Array.isArray(specs.certifications) ? specs.certifications : [],
            qualityMetrics: {
                dryMatter: qualityMetrics.dryMatter || specs.dryMatter || ''
            }
        };
    }

    function displayValidationResult(app, data) {
        var statusDiv = utils.getElement('validation-status-message');
        var detailsContainer = utils.getElement('validation-details-container');
        var resultsDiv = utils.getElement('validation-results');
        var statusIndicator = utils.getElement('status-indicator');
        var statusText = utils.getElement('status-text');
        var searchInput = utils.getElement('search-input') || utils.getElement('validation-input');
        var timeVerified = utils.getElement('time-verified');

        if (data.status === 'valid') {
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator status-indicator--verified';
            }
            if (statusText) {
                statusText.textContent = i18n.t(app.currentLang, 'status.verified');
            }
            if (searchInput) {
                searchInput.setAttribute('aria-invalid', 'false');
            }
            setCardState('success');

            if (statusDiv) {
                statusDiv.className = 'validation-feedback validation-feedback--success';
                statusDiv.textContent = i18n.t(app.currentLang, 'validation.result.banner');
                setVisibility(statusDiv, true);
            }

            if (detailsContainer) {
                detailsContainer.innerHTML = buildDetailsHtml(app, data);
            }

            if (resultsDiv) {
                updateValidationResults(app, data);
                resultsDiv.classList.add('active');
                resultsDiv.setAttribute('aria-hidden', 'false');
            }
            if (timeVerified) timeVerified.textContent = i18n.t(app.currentLang, 'validation.timeline.now');

            ui.triggerSuccess(app);
        }
    }

    function buildDetailsHtml(app, data) {
        var labels = {
            product: i18n.t(app.currentLang, 'validation.detail.product'),
            origin: i18n.t(app.currentLang, 'validation.detail.origin'),
            harvest: i18n.t(app.currentLang, 'validation.detail.harvest'),
            export: i18n.t(app.currentLang, 'validation.detail.export'),
            destination: i18n.t(app.currentLang, 'validation.detail.destination'),
            hash: i18n.t(app.currentLang, 'validation.detail.hash'),
            temp: i18n.t(app.currentLang, 'validation.detail.temp'),
            quality: i18n.t(app.currentLang, 'validation.detail.quality')
        };

        return '<div class="validation-details">' +
            '<div class="validation-detail"><span class="detail-label">' + labels.product + ':</span><span class="detail-value">' + utils.escapeHtml(data.product) + '</span></div>' +
            '<div class="validation-detail"><span class="detail-label">' + labels.origin + ':</span><span class="detail-value">' + utils.escapeHtml(data.origin) + '</span></div>' +
            '<div class="validation-detail"><span class="detail-label">' + labels.harvest + ':</span><span class="detail-value">' + utils.escapeHtml(data.harvestDate) + '</span></div>' +
            '<div class="validation-detail"><span class="detail-label">' + labels.export + ':</span><span class="detail-value">' + utils.escapeHtml(data.exportDate) + '</span></div>' +
            '<div class="validation-detail"><span class="detail-label">' + labels.destination + ':</span><span class="detail-value">' + utils.escapeHtml(data.destination) + '</span></div>' +
            '<div class="validation-detail"><span class="detail-label">' + labels.hash + ':</span><span class="detail-value hash">' + utils.escapeHtml(data.blockchainHash) + '</span></div>' +
            '<div class="validation-detail"><span class="detail-label">' + labels.temp + ':</span><span class="detail-value">' + utils.escapeHtml(data.avgTemp) + '</span></div>' +
            '<div class="validation-detail"><span class="detail-label">' + labels.quality + ':</span><span class="detail-value score">' + utils.escapeHtml(data.qualityScore) + '</span></div>' +
            '</div>';
    }

    function updateValidationResults(app, data) {
        var isAvocado = (data.product && data.product.toLowerCase().indexOf('aguacate') !== -1) ||
                        (data.product && data.product.toLowerCase().indexOf('hass') !== -1);

        var productIcons = {
            aguacate: '\ud83e\udd51', fresa: '\ud83c\udf53',
            arandano: '\ud83e\uded0', zarzamora: '\u26ab', frambuesa: '\ud83d\udd34'
        };

        var productIcon = '\ud83d\udce6';
        var productLower = (data.product || '').toLowerCase();
        if (productLower.indexOf('aguacate') !== -1 || productLower.indexOf('hass') !== -1) {
            productIcon = productIcons.aguacate;
        } else if (productLower.indexOf('fresa') !== -1) {
            productIcon = productIcons.fresa;
        } else if (productLower.indexOf('ar\u00e1ndano') !== -1 || productLower.indexOf('arandano') !== -1) {
            productIcon = productIcons.arandano;
        } else if (productLower.indexOf('zarzamora') !== -1) {
            productIcon = productIcons.zarzamora;
        } else if (productLower.indexOf('frambuesa') !== -1) {
            productIcon = productIcons.frambuesa;
        }

        utils.setText('product-icon', productIcon);
        utils.setText('product-name', data.product || i18n.t(app.currentLang, 'validation.product.default'));
        utils.setText('product-variety', data.variety ? i18n.t(app.currentLang, 'validation.product.varietyPrefix') + data.variety : '');
        utils.setText('product-origin', data.origin || 'Mexico');
        utils.setText('product-producer', data.producer ? i18n.t(app.currentLang, 'validation.product.producerPrefix') + data.producer : '');

        updateCertificationBadges(data.certifications || []);

        if (data.timestamps) {
            utils.setText('time-harvest', data.timestamps.harvest);
            utils.setText('time-packing', data.timestamps.packing);
            utils.setText('time-cold', data.timestamps.cold);
            utils.setText('time-export', data.timestamps.export);
        }

        if (isAvocado) {
            var dryMatter = (data.qualityMetrics && data.qualityMetrics.dryMatter) ? data.qualityMetrics.dryMatter : '--';
            utils.setText('metric-primary-icon', '\ud83d\udca7');
            utils.setText('metric-primary-value', dryMatter);
            utils.setText('metric-primary-label', i18n.t(app.currentLang, 'validation.metric.dryMatter'));
        } else {
            utils.setText('metric-primary-icon', '\ud83c\udf6c');
            utils.setText('metric-primary-value', data.brix || '--');
            utils.setText('metric-primary-label', i18n.t(app.currentLang, 'validation.metric.brix'));
        }

        utils.setText('metric-ph', data.ph || '--');
        utils.setText('metric-temp', data.avgTemp || '--');
        utils.setText('metric-quality', data.qualityScore || '--');
        utils.setText('seal-hash', i18n.t(app.currentLang, 'validation.seal.prefix') + (data.blockchainHash || '...'));
    }

    function updateCertificationBadges(certifications) {
        var badgesContainer = utils.getElement('certification-badges');
        if (!badgesContainer) return;

        var certConfig = {
            'SENASICA': { icon: '\ud83c\uddf2\ud83c\uddfd', color: '#006847', name: 'SENASICA' },
            'GlobalGAP': { icon: '\ud83c\udf0d', color: '#00a651', name: 'GlobalGAP' },
            'USDA Organic': { icon: '\ud83c\udf3f', color: '#4a7c23', name: 'USDA Organic' },
            'APEAM': { icon: '\ud83e\udd51', color: '#2d5016', name: 'APEAM' },
            'Rainforest Alliance': { icon: '\ud83d\udc38', color: '#00a650', name: 'Rainforest Alliance' }
        };

        if (certifications.length === 0) {
            badgesContainer.innerHTML = '';
            return;
        }

        var badgesHtml = certifications.map(function(cert) {
            var config = certConfig[cert.type] || { icon: '&#10003;', color: '#666', name: utils.escapeHtml(cert.type) };
            var currentLang = document.documentElement.getAttribute('data-ui-language') || 'es';
            return '<div class="cert-badge" style="--cert-color: ' + utils.escapeHtml(config.color) + '" title="' + utils.escapeHtml(cert.type) + ': ' + utils.escapeHtml(cert.number) + '">' +
                '<span class="cert-badge__icon">' + config.icon + '</span>' +
                '<span class="cert-badge__name">' + utils.escapeHtml(config.name) + '</span>' +
                '<span class="cert-badge__status">' + utils.escapeHtml(i18n.t(currentLang, 'validation.cert.verified')) + '</span>' +
                '</div>';
        }).join('');

        badgesContainer.innerHTML = badgesHtml;
    }

    function showValidationError(app, message, type) {
        if (type === undefined) type = 'generic';
        var errorType = type === 'generic' ? inferErrorType(app, message) : type;

        var errorDiv = utils.getElement('search-error');
        var searchInput = utils.getElement('search-input') || utils.getElement('validation-input');
        var statusIndicator = utils.getElement('status-indicator');
        var statusText = utils.getElement('status-text');
        var statusDiv = utils.getElement('validation-status-message');

        var errorMessages = {
            empty: {
                title: i18n.t(app.currentLang, 'validation.error.empty.title'),
                message: i18n.t(app.currentLang, 'validation.error.empty.message'),
                suggestion: i18n.t(app.currentLang, 'validation.error.empty.suggestion')
            },
            format: {
                title: i18n.t(app.currentLang, 'validation.error.format.title'),
                message: i18n.t(app.currentLang, 'validation.error.format.message'),
                suggestion: i18n.t(app.currentLang, 'validation.error.format.suggestion')
            },
            notfound: {
                title: i18n.t(app.currentLang, 'validation.error.notfound.title'),
                message: i18n.t(app.currentLang, 'validation.error.notfound.message'),
                suggestion: i18n.t(app.currentLang, 'validation.error.notfound.suggestion')
            },
            connection: {
                title: i18n.t(app.currentLang, 'validation.error.connection.title'),
                message: i18n.t(app.currentLang, 'validation.error.connection.message'),
                suggestion: null
            },
            timeout: {
                title: i18n.t(app.currentLang, 'validation.error.connection.title'),
                message: i18n.t(app.currentLang, 'error.timeout'),
                suggestion: null
            },
            ratelimit: {
                title: i18n.t(app.currentLang, 'status.error'),
                message: i18n.t(app.currentLang, 'error.ratelimit'),
                suggestion: null
            }
        };

        var knownMessages = [
            i18n.t(app.currentLang, 'error.empty'),
            i18n.t(app.currentLang, 'error.format'),
            i18n.t(app.currentLang, 'error.notfound'),
            i18n.t(app.currentLang, 'error.connection'),
            i18n.t(app.currentLang, 'error.timeout'),
            i18n.t(app.currentLang, 'error.ratelimit')
        ];
        var isCustomMessage = type === 'generic' && message && knownMessages.indexOf(message) === -1;

        var error = isCustomMessage ? {
            title: i18n.t(app.currentLang, 'status.error'),
            message: message,
            suggestion: null
        } : (errorMessages[errorType] || {
            title: i18n.t(app.currentLang, 'status.error'),
            message: message || i18n.t(app.currentLang, 'error.generic'),
            suggestion: null
        });

        if (errorDiv) {
            errorDiv.innerHTML =
                '<div class="error-content">' +
                '<span class="error-icon">&#9888;</span>' +
                '<div class="error-text">' +
                '<strong>' + utils.escapeHtml(error.title) + '</strong>' +
                '<p>' + utils.escapeHtml(error.message) + '</p>' +
                (error.suggestion ? '<small class="error-suggestion">' + utils.escapeHtml(error.suggestion) + '</small>' : '') +
                '</div></div>';
            setVisibility(errorDiv, true);
        }

        if (statusDiv) {
            statusDiv.textContent = '';
            setVisibility(statusDiv, false);
        }
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator status-indicator--error';
        }
        if (statusText) {
            statusText.textContent = i18n.t(app.currentLang, 'status.error');
        }
        if (searchInput) {
            searchInput.setAttribute('aria-invalid', 'true');
            searchInput.focus();
        }

        setCardState('error');
        ui.showNotification(error.message, errorType === 'ratelimit' ? 'warning' : 'error');
    }

    // ============================================
    // RESET VALIDATION (P1 Fix)
    // ============================================

    function initResetButton(app) {
        var resetBtn = utils.getElement('reset-validation-btn');
        if (resetBtn) {
            app._trackListener(resetBtn, 'click', function() { resetValidation(app); });
        }
    }

    function resetValidation(app) {
        var input = utils.getElement('search-input') || utils.getElement('validation-input');
        var resultsDiv = utils.getElement('validation-results');
        var statusIndicator = utils.getElement('status-indicator');
        var statusText = utils.getElement('status-text');
        var errorDiv = utils.getElement('search-error');
        var statusDiv = utils.getElement('validation-status-message');
        var detailsContainer = utils.getElement('validation-details-container');
        var timeVerified = utils.getElement('time-verified');

        if (input) {
            input.value = '';
            input.setAttribute('aria-invalid', 'false');
            input.removeAttribute('aria-busy');
            input.focus();
        }
        if (resultsDiv) {
            resultsDiv.classList.remove('active');
            resultsDiv.setAttribute('aria-hidden', 'true');
        }
        if (statusIndicator) statusIndicator.className = 'status-indicator status-indicator--ready';
        if (statusText) statusText.textContent = i18n.t(app.currentLang, 'status.ready');
        if (errorDiv) {
            errorDiv.innerHTML = '';
            setVisibility(errorDiv, false);
        }
        if (statusDiv) {
            statusDiv.textContent = '';
            setVisibility(statusDiv, false);
        }
        if (detailsContainer) {
            detailsContainer.innerHTML = '';
        }
        if (timeVerified) timeVerified.textContent = i18n.t(app.currentLang, 'validation.timeline.now');
        setCardState('default');

        var validationSection = document.querySelector('.validation-card-v2');
        if (validationSection) {
            validationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return {
        initValidationSystem: initValidationSystem,
        runDemo: runDemo,
        isValidLotCode: isValidLotCode,
        validateLot: validateLot,
        fetchValidationData: fetchValidationData,
        normalizeVerificationResponse: normalizeVerificationResponse,
        displayValidationResult: displayValidationResult,
        buildDetailsHtml: buildDetailsHtml,
        updateValidationResults: updateValidationResults,
        updateCertificationBadges: updateCertificationBadges,
        showValidationError: showValidationError,
        initResetButton: initResetButton,
        resetValidation: resetValidation
    };
})();
