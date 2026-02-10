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
            ui.showNotification(i18n.t(app.currentLang, 'error.ratelimit'), 'warning');
            return;
        }

        if (app.isValidating) return;

        var lotCode = searchInput.value.trim().toUpperCase();

        if (errorDiv) errorDiv.style.display = 'none';
        if (statusDiv) statusDiv.style.display = 'none';
        if (detailsContainer) detailsContainer.innerHTML = '';
        if (resultsDiv) resultsDiv.classList.remove('active');

        var skeletonDiv = utils.getElement('validation-skeleton');

        if (!lotCode) {
            showValidationError(app, i18n.t(app.currentLang, 'error.empty'));
            searchInput.focus();
            return;
        }

        if (!isValidLotCode(lotCode)) {
            showValidationError(app, i18n.t(app.currentLang, 'error.format'));
            return;
        }

        app.isValidating = true;
        app.lastValidationTime = now;

        if (validateBtn) validateBtn.disabled = true;
        if (statusIndicator) statusIndicator.className = 'status-indicator status-indicator--scanning';
        if (statusText) statusText.textContent = i18n.t(app.currentLang, 'status.verifying');
        if (scanningOverlay) scanningOverlay.classList.add('active');
        if (skeletonDiv) skeletonDiv.style.display = 'block';

        try {
            await ui.showScanningSteps(app.currentLang);
            var result = await fetchValidationData(app, lotCode);

            if (scanningOverlay) scanningOverlay.classList.remove('active');
            if (skeletonDiv) skeletonDiv.style.display = 'none';

            displayValidationResult(app, result);

        } catch (error) {
            utils.error('Validation error:', error);
            if (scanningOverlay) scanningOverlay.classList.remove('active');
            if (skeletonDiv) skeletonDiv.style.display = 'none';

            if (error.message === 'REQUEST_TIMEOUT') {
                showValidationError(app, i18n.t(app.currentLang, 'error.timeout') ||
                    (app.currentLang === 'es'
                        ? 'La solicitud ha expirado. Por favor intente de nuevo.'
                        : 'Request timed out. Please try again.'));
            } else if (error.message === 'NOT_FOUND') {
                showValidationError(app, i18n.t(app.currentLang, 'error.notfound'));
            } else {
                showValidationError(app, i18n.t(app.currentLang, 'error.connection'));
            }

            if (statusIndicator) statusIndicator.className = 'status-indicator status-indicator--ready';
            if (statusText) statusText.textContent = i18n.t(app.currentLang, 'status.ready');

        } finally {
            app.isValidating = false;
            if (validateBtn) validateBtn.disabled = false;
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

        if (data.status === 'valid') {
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator status-indicator--verified';
            }
            if (statusText) {
                statusText.textContent = i18n.t(app.currentLang, 'status.verified');
            }

            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.className = 'validation-card__status validation-card__status--valid';
                statusDiv.textContent = app.currentLang === 'es'
                    ? '\u2705 LOTE VERIFICADO - INTEGRIDAD GARANTIZADA'
                    : '\u2705 LOT VERIFIED - INTEGRITY GUARANTEED';
            }

            if (detailsContainer) {
                detailsContainer.innerHTML = buildDetailsHtml(app, data);
            }

            if (resultsDiv) {
                updateValidationResults(app, data);
                resultsDiv.classList.add('active');
            }

            ui.triggerSuccess(app);
        }
    }

    function buildDetailsHtml(app, data) {
        var labels = app.currentLang === 'es' ? {
            product: 'Producto', origin: 'Origen', harvest: 'Cosecha',
            export: 'Exportaci\u00f3n', destination: 'Destino', hash: 'Hash Blockchain',
            temp: 'Temperatura', quality: 'Calidad'
        } : {
            product: 'Product', origin: 'Origin', harvest: 'Harvest',
            export: 'Export', destination: 'Destination', hash: 'Blockchain Hash',
            temp: 'Temperature', quality: 'Quality'
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
        utils.setText('product-name', data.product || 'Producto Certificado');
        utils.setText('product-variety', data.variety ? 'Variedad: ' + data.variety : '');
        utils.setText('product-origin', data.origin || 'Mexico');
        utils.setText('product-producer', data.producer ? 'Productor: ' + data.producer : '');

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
            utils.setText('metric-primary-label', 'Materia Seca');
        } else {
            utils.setText('metric-primary-icon', '\ud83c\udf6c');
            utils.setText('metric-primary-value', data.brix || '--');
            utils.setText('metric-primary-label', 'Indice Brix');
        }

        utils.setText('metric-ph', data.ph || '--');
        utils.setText('metric-temp', data.avgTemp || '--');
        utils.setText('metric-quality', data.qualityScore || '--');
        utils.setText('seal-hash', 'SHA-256: ' + (data.blockchainHash || '...'));
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
            return '<div class="cert-badge" style="--cert-color: ' + utils.escapeHtml(config.color) + '" title="' + utils.escapeHtml(cert.type) + ': ' + utils.escapeHtml(cert.number) + '">' +
                '<span class="cert-badge__icon">' + config.icon + '</span>' +
                '<span class="cert-badge__name">' + utils.escapeHtml(config.name) + '</span>' +
                '<span class="cert-badge__status">Verificado</span>' +
                '</div>';
        }).join('');

        badgesContainer.innerHTML = badgesHtml;
    }

    function showValidationError(app, message, type) {
        if (type === undefined) type = 'generic';

        var errorDiv = utils.getElement('search-error');

        var errorMessages = app.currentLang === 'es' ? {
            empty: { title: 'Codigo requerido', message: 'Por favor ingrese un codigo de lote para validar', suggestion: 'Prueba con: AB-HASS-2026-001' },
            format: { title: 'Formato invalido', message: 'El codigo debe seguir el formato: AB-XXXX-YYYY-NNN', suggestion: 'Ejemplo valido: AB-FRES-2026-001' },
            notfound: { title: 'Codigo no encontrado', message: 'Este codigo de lote no esta registrado en el sistema', suggestion: 'Codigos disponibles: AB-HASS-2026-001, AB-ARAN-2026-045' },
            connection: { title: 'Error de conexion', message: 'No se pudo conectar con el servidor. Intente nuevamente.', suggestion: null }
        } : {
            empty: { title: 'Code required', message: 'Please enter a lot code to validate', suggestion: 'Try: AB-HASS-2026-001' },
            format: { title: 'Invalid format', message: 'The code must follow the format: AB-XXXX-YYYY-NNN', suggestion: 'Valid example: AB-FRES-2026-001' },
            notfound: { title: 'Code not found', message: 'This lot code is not registered in the system', suggestion: 'Available codes: AB-HASS-2026-001, AB-ARAN-2026-045' },
            connection: { title: 'Connection error', message: 'Could not connect to the server. Please try again.', suggestion: null }
        };

        var errorType = type;
        if (message.indexOf('ingrese') !== -1 || message.indexOf('enter') !== -1) {
            errorType = 'empty';
        } else if (message.indexOf('Formato') !== -1 || message.indexOf('format') !== -1) {
            errorType = 'format';
        } else if (message.indexOf('encontrado') !== -1 || message.indexOf('found') !== -1) {
            errorType = 'notfound';
        } else if (message.indexOf('conexion') !== -1 || message.indexOf('Connection') !== -1) {
            errorType = 'connection';
        }

        var error = errorMessages[errorType] || { title: 'Error', message: message, suggestion: null };

        if (errorDiv) {
            errorDiv.innerHTML =
                '<div class="error-content">' +
                '<span class="error-icon">&#9888;</span>' +
                '<div class="error-text">' +
                '<strong>' + utils.escapeHtml(error.title) + '</strong>' +
                '<p>' + utils.escapeHtml(error.message) + '</p>' +
                (error.suggestion ? '<small class="error-suggestion">' + utils.escapeHtml(error.suggestion) + '</small>' : '') +
                '</div></div>';
            errorDiv.style.display = 'block';
        }

        ui.showNotification(error.message, 'error');
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

        if (input) { input.value = ''; input.focus(); }
        if (resultsDiv) resultsDiv.classList.remove('active');
        if (statusIndicator) statusIndicator.className = 'status-indicator status-indicator--ready';
        if (statusText) statusText.textContent = i18n.t(app.currentLang, 'status.ready');
        if (errorDiv) errorDiv.style.display = 'none';

        var validationSection = document.querySelector('.validation-card');
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
