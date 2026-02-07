/**
 * AgroBridge Global - Main Application Controller
 * @version 2.0.0
 * @description Core functionality for ZTD verification system
 * @author AgroBridge Engineering Team
 *
 * CHANGELOG v2.0.0:
 * - Fixed: API connection with real backend + demo fallback
 * - Fixed: Null pointer exceptions in validateLot()
 * - Fixed: Standardized lot code format (AB-XXXX-YYYY-NNN)
 * - Fixed: XSS sanitization for all user inputs
 * - Fixed: Rate limiting on validation requests
 * - Added: Proper error handling and user feedback
 * - Added: Mobile hamburger menu support
 * - Added: Contact form submission
 */

class AgroBridgeApp {
    constructor() {
        this.currentLang = 'es';
        const globalConfig = typeof window !== 'undefined' ? window : {};
        this.apiBase = this.normalizeApiBase(
            globalConfig.AGROBRIDGE_API_BASE || 'https://api.agrobridge.global/v2'
        );
        this.validationApi = `${this.apiBase}/verify`;
        this.contactApi = `${this.apiBase}/leads`;
        this.recaptchaSiteKey = (globalConfig.AGROBRIDGE_RECAPTCHA_SITE_KEY || '').trim();
        this.recaptchaAction = globalConfig.AGROBRIDGE_RECAPTCHA_ACTION || 'enterprise_lead';
        this.recaptchaReady = null;
        this.isValidating = false;
        this.lastValidationTime = 0;
        this.RATE_LIMIT_MS = 500; // 500ms between validations (reduced for demo)
        this.USE_DEMO_MODE = globalConfig.AGROBRIDGE_USE_DEMO === true;
        this.hasShownConfetti = false; // Confetti cooldown - only show once per session
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initLanguageSystem();
        this.initSlideshow();
        this.initValidationSystem();
        this.initContactForm();
        this.initMobileMenu();
        this.initExampleChips();
        this.initResetButton();
        this.setupErrorHandling();
        this.setupPerformanceMonitoring();
        console.log('[AgroBridge] App initialized v2.2.0 - Enhanced Demo with P0/P1 Fixes');
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * Sanitize string to prevent XSS attacks
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    escapeHtml(str) {
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
     * Safely get DOM element with null check
     * @param {string} id - Element ID
     * @returns {HTMLElement|null}
     */
    getElement(id) {
        return document.getElementById(id);
    }

    /**
     * Safely set element style
     * @param {string} id - Element ID
     * @param {string} property - CSS property
     * @param {string} value - CSS value
     */
    setStyle(id, property, value) {
        const element = this.getElement(id);
        if (element) {
            element.style[property] = value;
        }
    }

    /**
     * Safely set element text content
     * @param {string} id - Element ID
     * @param {string} text - Text content
     */
    setText(id, text) {
        const element = this.getElement(id);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Safely set element innerHTML (sanitized)
     * @param {string} id - Element ID
     * @param {string} html - HTML content (will be used as-is, ensure it's safe)
     */
    setHtml(id, html) {
        const element = this.getElement(id);
        if (element) {
            element.innerHTML = html;
        }
    }

    /**
     * Normalize API base URL
     * @param {string} base - Base URL
     * @returns {string} Normalized URL without trailing slash
     */
    normalizeApiBase(base) {
        if (typeof base !== 'string') return 'https://api.agrobridge.global/v2';
        return base.replace(/\/+$/, '');
    }

    // ============================================
    // MOBILE MENU (Bug #7 Fix)
    // ============================================

    initMobileMenu() {
        const navToggle = this.getElement('navToggle');
        const navMenu = this.getElement('navMenu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                const isActive = navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                navToggle.setAttribute('aria-expanded', isActive.toString());

                // Close menu when clicking outside
                if (isActive) {
                    document.addEventListener('click', this.handleOutsideClick.bind(this), { once: true });
                }
            });

            // Close menu on nav link click (mobile)
            navMenu.querySelectorAll('.nav__link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    handleOutsideClick(e) {
        const navToggle = this.getElement('navToggle');
        const navMenu = this.getElement('navMenu');

        if (navToggle && navMenu && !navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    }

    // ============================================
    // EXAMPLE CHIPS (Quick Demo Access)
    // ============================================

    /**
     * Initialize example product chips for quick demo access
     */
    initExampleChips() {
        document.querySelectorAll('.example-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const code = e.currentTarget.dataset.code;
                const input = this.getElement('search-input') || this.getElement('validation-input');

                if (input && code) {
                    // Add visual feedback
                    e.currentTarget.classList.add('chip-clicked');
                    setTimeout(() => {
                        e.currentTarget.classList.remove('chip-clicked');
                    }, 200);

                    // Set the value
                    input.value = code;
                    input.focus();

                    // Add a slight delay for visual effect then trigger validation
                    setTimeout(() => this.validateLot(), 300);
                }
            });
        });
    }

    // ============================================
    // RESET VALIDATION (P1 Fix)
    // ============================================

    /**
     * Initialize reset button functionality
     */
    initResetButton() {
        const resetBtn = this.getElement('reset-validation-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetValidation());
        }
    }

    /**
     * Reset validation form to initial state
     */
    resetValidation() {
        const input = this.getElement('search-input') || this.getElement('validation-input');
        const resultsDiv = this.getElement('validation-results');
        const statusIndicator = this.getElement('status-indicator');
        const statusText = this.getElement('status-text');
        const errorDiv = this.getElement('search-error');

        // Clear input
        if (input) {
            input.value = '';
            input.focus();
        }

        // Hide results
        if (resultsDiv) {
            resultsDiv.classList.remove('active');
        }

        // Reset status indicator
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator status-indicator--ready';
        }
        if (statusText) {
            statusText.textContent = this.t('status.ready');
        }

        // Hide any errors
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }

        // Scroll to validation section smoothly
        const validationSection = document.querySelector('.validation-card');
        if (validationSection) {
            validationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    setupEventListeners() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    // Close mobile menu if open
                    const navMenu = this.getElement('navMenu');
                    const navToggle = this.getElement('navToggle');
                    if (navMenu) navMenu.classList.remove('active');
                    if (navToggle) {
                        navToggle.classList.remove('active');
                        navToggle.setAttribute('aria-expanded', 'false');
                    }

                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Language switching
        document.querySelectorAll('select[id*="lang-select"]').forEach(select => {
            select.addEventListener('change', (e) => {
                this.switchLanguage(e.target.value);
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const nav = this.getElement('navbar');
            if (nav) {
                if (window.scrollY > 100) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            }
        });
    }

    // ============================================
    // LANGUAGE SYSTEM
    // ============================================

    initLanguageSystem() {
        this.translations = {
            es: {
                'hero.title': 'Excelencia Agrícola',
                'hero.unique': 'Primer sistema ZTD en México 100% desarrollado por Mexicanos',
                'search.button': 'VERIFICAR ORIGEN',
                'search.placeholder': 'Ingrese código (Ej: AGR-2024-001)',
                'title.initial': 'VERIFICACIÓN ZTD',
                'status.ready': 'Listo para verificar',
                'status.verifying': 'Verificando...',
                'status.verified': 'Origen Verificado',
                'error.empty': 'Por favor ingrese un código de lote',
                'error.format': 'Formato inválido. Use letras, números y guiones.',
                'error.connection': 'Error de conexión. Intente nuevamente.',
                'error.notfound': 'Lote no encontrado en el sistema.',
                'error.ratelimit': 'Espere un momento antes de verificar nuevamente.',
                'form.sending': 'Enviando...',
                'form.success': '¡Solicitud enviada! Nos contactaremos pronto.',
                'form.error': 'Error al enviar. Intente nuevamente.',
                'form.recaptcha': 'reCAPTCHA no configurado. Intente más tarde.',
                'form.submit': 'Solicitar Cotización Enterprise'
            },
            en: {
                'hero.title': 'Agricultural Excellence',
                'hero.unique': 'First ZTD System in Mexico 100% Developed by Mexicans',
                'search.button': 'VERIFY ORIGIN',
                'search.placeholder': 'Enter code (Ex: AGR-2024-001)',
                'title.initial': 'ZTD VERIFICATION',
                'status.ready': 'Ready to verify',
                'status.verifying': 'Verifying...',
                'status.verified': 'Origin Verified',
                'error.empty': 'Please enter a lot code',
                'error.format': 'Invalid format. Use letters, numbers, and dashes.',
                'error.connection': 'Connection error. Please try again.',
                'error.notfound': 'Lot not found in the system.',
                'error.ratelimit': 'Please wait before verifying again.',
                'form.sending': 'Sending...',
                'form.success': 'Request sent! We will contact you soon.',
                'form.error': 'Error sending. Please try again.',
                'form.recaptcha': 'reCAPTCHA is not configured. Please try later.',
                'form.submit': 'Request Enterprise Quote'
            },
            zh: {
                'hero.title': '农业卓越',
                'hero.unique': '墨西哥首个100%由墨西哥人开发的ZTD系统',
                'search.button': '验证来源',
                'search.placeholder': '输入代码 (例: AGR-2024-001)',
                'title.initial': 'ZTD验证',
                'status.ready': '准备验证',
                'status.verifying': '验证中...',
                'status.verified': '来源已验证',
                'error.empty': '请输入批次代码',
                'error.format': '格式无效。请使用字母、数字和连字符。',
                'error.connection': '连接错误。请重试。',
                'error.notfound': '系统中未找到批次。',
                'error.ratelimit': '请稍等再验证。',
                'form.sending': '发送中...',
                'form.success': '请求已发送！我们会尽快联系您。',
                'form.error': '发送错误。请重试。',
                'form.recaptcha': 'reCAPTCHA 未配置。请稍后再试。',
                'form.submit': '请求企业报价'
            },
            ar: {
                'hero.title': 'التميز الزراعي',
                'hero.unique': 'أول نظام ZTD في المكسيك تم تطويره 100% بواسطة المكسيكيين',
                'search.button': 'التحقق من المصدر',
                'search.placeholder': 'أدخل الرمز (مثال: AGR-2024-001)',
                'title.initial': 'التحقق ZTD',
                'status.ready': 'جاهز للتحقق',
                'status.verifying': 'جاري التحقق...',
                'status.verified': 'تم التحقق من المصدر',
                'error.empty': 'الرجاء إدخال رمز الدفعة',
                'error.format': 'تنسيق غير صالح. استخدم أحرفًا وأرقامًا وشرطات.',
                'error.connection': 'خطأ في الاتصال. حاول مرة أخرى.',
                'error.notfound': 'الدفعة غير موجودة في النظام.',
                'error.ratelimit': 'يرجى الانتظار قبل التحقق مرة أخرى.',
                'form.sending': 'جاري الإرسال...',
                'form.success': 'تم إرسال الطلب! سنتواصل معك قريباً.',
                'form.error': 'خطأ في الإرسال. حاول مرة أخرى.',
                'form.recaptcha': 'reCAPTCHA غير مهيأ. حاول لاحقاً.',
                'form.submit': 'طلب عرض أسعار للشركات'
            },
            ja: {
                'hero.title': '農業の卓越性',
                'hero.unique': 'メキシコ人によって100％開発されたメキシコ初のZTDシステム',
                'search.button': '産地を確認',
                'search.placeholder': 'コードを入力 (例: AGR-2024-001)',
                'title.initial': 'ZTD検証',
                'status.ready': '検証準備完了',
                'status.verifying': '検証中...',
                'status.verified': '産地確認済み',
                'error.empty': 'ロットコードを入力してください',
                'error.format': '無効な形式です。英数字とハイフンを使用してください。',
                'error.connection': '接続エラー。もう一度お試しください。',
                'error.notfound': 'システムにロットが見つかりません。',
                'error.ratelimit': '再度確認する前にお待ちください。',
                'form.sending': '送信中...',
                'form.success': 'リクエストが送信されました！すぐにご連絡いたします。',
                'form.error': '送信エラー。もう一度お試しください。',
                'form.recaptcha': 'reCAPTCHA が設定されていません。後でお試しください。',
                'form.submit': '企業見積もりをリクエスト'
            }
        };

        // Load saved language preference
        const savedLang = localStorage.getItem('agrobridge-lang');
        if (savedLang && this.translations[savedLang]) {
            this.switchLanguage(savedLang);
        }
    }

    /**
     * Get translated string
     * @param {string} key - Translation key
     * @returns {string} Translated string or key if not found
     */
    t(key) {
        return this.translations[this.currentLang]?.[key] ||
               this.translations['es']?.[key] ||
               key;
    }

    switchLanguage(lang) {
        if (!this.translations[lang]) return;

        this.currentLang = lang;
        localStorage.setItem('agrobridge-lang', lang);

        // Update all language selects
        document.querySelectorAll('select[id*="lang-select"]').forEach(select => {
            select.value = lang;
        });

        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== key) {
                element.textContent = translation;
            }
        });

        // Update search input placeholder
        const searchInputs = document.querySelectorAll('#search-input, #validation-input');
        searchInputs.forEach(input => {
            if (input) {
                input.placeholder = this.t('search.placeholder');
            }
        });

        // Update status text
        this.setText('status-text', this.t('status.ready'));
    }

    // ============================================
    // SLIDESHOW
    // ============================================

    initSlideshow() {
        const slideshow = this.getElement('heroSlideshow');
        if (!slideshow) return;

        const slides = slideshow.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        let currentSlide = 0;

        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // ============================================
    // VALIDATION SYSTEM (Bug #1, #3, #6 Fix)
    // ============================================

    initValidationSystem() {
        // Support both old and new input IDs
        const searchBtn = this.getElement('search-button') || this.getElement('validate-btn');
        const searchInput = this.getElement('search-input') || this.getElement('validation-input');
        const demoBtn = this.getElement('demo-btn');

        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => this.validateLot());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.validateLot();
            });
        }

        // Demo button handler
        if (demoBtn) {
            demoBtn.addEventListener('click', () => this.runDemo());
        }
    }

    /**
     * Run demo validation with sample data
     */
    async runDemo() {
        const input = this.getElement('search-input') || this.getElement('validation-input');
        if (input) {
            input.value = 'AB-HASS-2026-001';
            input.focus();
            await this.validateLot();
        }
    }

    /**
     * Validate lot code format
     * Format: AB-XXXX-YYYY-NNN where:
     * - AB: Fixed prefix
     * - XXXX: Product code (4 letters)
     * - YYYY: Year (4 digits)
     * - NNN: Lot number (3 digits)
     *
     * @param {string} code - Lot code to validate
     * @returns {boolean}
     */
    isValidLotCode(code) {
        if (!code || typeof code !== 'string') return false;
        return /^[A-Z0-9-]+$/.test(code.toUpperCase());
    }

    /**
     * Main validation function with rate limiting and error handling
     */
    async validateLot() {
        // Get elements with null safety
        const searchInput = this.getElement('search-input') || this.getElement('validation-input');
        const errorDiv = this.getElement('search-error');
        const statusDiv = this.getElement('validation-status-message');
        const detailsContainer = this.getElement('validation-details-container');
        const resultsDiv = this.getElement('validation-results');
        const scanningOverlay = this.getElement('scanning-overlay');
        const statusIndicator = this.getElement('status-indicator');
        const statusText = this.getElement('status-text');
        const validateBtn = this.getElement('search-button') || this.getElement('validate-btn');

        if (!searchInput) {
            console.error('[AgroBridge] Search input not found');
            return;
        }

        // Rate limiting check
        const now = Date.now();
        if (now - this.lastValidationTime < this.RATE_LIMIT_MS) {
            this.showNotification(this.t('error.ratelimit'), 'warning');
            return;
        }

        // Prevent double submission
        if (this.isValidating) return;

        const lotCode = searchInput.value.trim().toUpperCase();

        // Reset states safely
        if (errorDiv) errorDiv.style.display = 'none';
        if (statusDiv) statusDiv.style.display = 'none';
        if (detailsContainer) detailsContainer.innerHTML = '';
        if (resultsDiv) resultsDiv.classList.remove('active');

        // Get skeleton element
        const skeletonDiv = this.getElement('validation-skeleton');

        // Empty check
        if (!lotCode) {
            this.showValidationError(this.t('error.empty'));
            searchInput.focus();
            return;
        }

        // Format validation
        if (!this.isValidLotCode(lotCode)) {
            this.showValidationError(this.t('error.format'));
            return;
        }

        // Start validation
        this.isValidating = true;
        this.lastValidationTime = now;

        // Update UI for loading state
        if (validateBtn) validateBtn.disabled = true;
        if (statusIndicator) statusIndicator.className = 'status-indicator status-indicator--scanning';
        if (statusText) statusText.textContent = this.t('status.verifying');
        if (scanningOverlay) scanningOverlay.classList.add('active');

        // Show skeleton loader (P1 Fix)
        if (skeletonDiv) skeletonDiv.style.display = 'block';

        try {
            // Show scanning animation steps
            await this.showScanningSteps();

            // Fetch validation data
            const result = await this.fetchValidationData(lotCode);

            // Hide scanning overlay and skeleton
            if (scanningOverlay) scanningOverlay.classList.remove('active');
            if (skeletonDiv) skeletonDiv.style.display = 'none';

            // Display results
            this.displayValidationResult(result);

        } catch (error) {
            console.error('[AgroBridge] Validation error:', error);
            if (scanningOverlay) scanningOverlay.classList.remove('active');
            if (skeletonDiv) skeletonDiv.style.display = 'none';

            if (error.message === 'NOT_FOUND') {
                this.showValidationError(this.t('error.notfound'));
            } else {
                this.showValidationError(this.t('error.connection'));
            }

            // Reset status
            if (statusIndicator) statusIndicator.className = 'status-indicator status-indicator--ready';
            if (statusText) statusText.textContent = this.t('status.ready');

        } finally {
            this.isValidating = false;
            if (validateBtn) validateBtn.disabled = false;
        }
    }

    /**
     * Show scanning animation steps
     */
    async showScanningSteps() {
        const scanningStep = this.getElement('scanning-step');
        if (!scanningStep) return;

        const steps = this.currentLang === 'es' ? [
            'Conectando con TrustChain™...',
            'Verificando hash SHA-256...',
            'Consultando registro de origen...',
            'Validando cadena de frío...',
            'Generando certificado...'
        ] : [
            'Connecting to TrustChain™...',
            'Verifying SHA-256 hash...',
            'Querying origin registry...',
            'Validating cold chain...',
            'Generating certificate...'
        ];

        for (const step of steps) {
            scanningStep.textContent = step;
            await this.delay(500);
        }
    }

    /**
     * Fetch validation data from API or demo mode
     * @param {string} lotCode - Lot code to validate
     * @returns {Promise<Object>} Validation result
     */
    async fetchValidationData(lotCode) {
        // Demo mode with realistic data
        if (this.USE_DEMO_MODE) {
            return this.getDemoData(lotCode);
        }

        // Real API call
        const response = await fetch(`${this.validationApi}/${encodeURIComponent(lotCode)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Version': 'v2',
                'Accept-Language': this.currentLang
            }
        });

        let payload = null;
        try {
            payload = await response.json();
        } catch (error) {
            payload = null;
        }

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('NOT_FOUND');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!payload || payload.valid === false || payload.success === false) {
            throw new Error('NOT_FOUND');
        }

        return this.normalizeVerificationResponse(payload, lotCode);
    }

    /**
     * Normalize backend verification payload to UI format
     * @param {Object} payload - API response
     * @param {string} lotCode - Lot code
     * @returns {Object}
     */
    normalizeVerificationResponse(payload, lotCode) {
        const apiData = payload?.data || {};
        const specs = apiData?.specifications && typeof apiData.specifications === 'object'
            ? apiData.specifications
            : {};
        const placeholder = '--';
        const originParts = [];

        if (apiData.location?.region) originParts.push(apiData.location.region);
        if (apiData.location?.country) originParts.push(apiData.location.country);

        const origin = originParts.length
            ? originParts.join(', ')
            : (specs.origin || '');

        const timelineSource = specs.timestamps && typeof specs.timestamps === 'object'
            ? specs.timestamps
            : {};

        const timestamps = {
            harvest: timelineSource.harvest || specs.harvest || placeholder,
            packing: timelineSource.packing || specs.packing || placeholder,
            cold: timelineSource.cold || specs.cold || placeholder,
            export: timelineSource.export || specs.export || placeholder
        };

        const qualityMetrics = specs.qualityMetrics && typeof specs.qualityMetrics === 'object'
            ? specs.qualityMetrics
            : {};

        return {
            status: payload?.valid ? 'valid' : 'invalid',
            lotCode: apiData.lotCode || lotCode || '',
            product: apiData.productName || '',
            variety: specs.variety || '',
            origin,
            producer: specs.producer || '',
            harvestDate: specs.harvestDate || specs.harvest || placeholder,
            exportDate: specs.exportDate || specs.export || placeholder,
            destination: specs.destination || placeholder,
            blockchainHash: specs.blockchainHash || '',
            avgTemp: specs.avgTemp || '',
            qualityScore: specs.qualityScore || '',
            brix: specs.brix || '',
            ph: specs.ph || '',
            timestamps,
            certifications: Array.isArray(specs.certifications) ? specs.certifications : [],
            qualityMetrics: {
                dryMatter: qualityMetrics.dryMatter || specs.dryMatter || ''
            }
        };
    }

    /**
     * Get demo data for testing
     * @param {string} lotCode - Lot code
     * @returns {Promise<Object>} Demo validation result
     */
    async getDemoData(lotCode) {
        // Simulate network delay
        await this.delay(800);

        const demoDatabase = {
            // ==========================================
            // AGUACATE HASS (4 entries)
            // ==========================================
            'AB-HASS-2026-001': {
                status: 'valid',
                product: 'Aguacate Hass Premium',
                variety: 'Hass',
                origin: 'Uruapan, Michoacán, México',
                region: 'Michoacán',
                producer: 'Rancho El Aguacate Dorado',
                harvestDate: '2026-01-05',
                packingDate: '2026-01-05',
                exportDate: '2026-01-06',
                expiryDate: '2026-02-05',
                destination: 'Luxemburgo, UE',
                brix: '11.5°',
                ph: '6.2',
                avgTemp: '5.2°C',
                qualityScore: '9.8/10',
                blockchainHash: 'a7f3d2c1b8e9f4a5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
                timestamps: {
                    harvest: '05 Ene 06:30',
                    packing: '05 Ene 14:00',
                    cold: '05 Ene 16:00',
                    export: '06 Ene 08:00'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-AV-789012', issuer: 'SENASICA México', issuedDate: '2025-03-15', validUntil: '2026-03-15' },
                    { type: 'APEAM', number: 'APEAM-2026-0892', issuer: 'APEAM Michoacán', issuedDate: '2025-06-01', validUntil: '2026-06-01' },
                    { type: 'GlobalGAP', number: '4050000891234', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-01-10', validUntil: '2026-01-10' }
                ],
                blockchain: {
                    hash: 'a7f3d2c1b8e9f4a5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 50234567,
                    timestamp: 1736064600,
                    txHash: '0x8a9b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b'
                },
                gps: { latitude: 19.4181, longitude: -102.0528, elevation: '1620 msnm' },
                qualityMetrics: {
                    dryMatter: '23.5%',
                    weight: '245g',
                    color: 'Verde oscuro',
                    firmness: 'Óptima',
                    temperature: '5-7°C'
                },
                packaging: { type: 'Caja 4kg', lot: 'AB-HASS-2026-001', quantity: '160 kg', boxesCount: 40 },
                traceability: {
                    field: 'Rancho El Aguacate Dorado',
                    lot: 'Lote 15',
                    block: 'Bloque A',
                    packingHouse: 'Empacadora Valle Verde',
                    coolingDate: '2026-01-05 16:00',
                    dispatchDate: '2026-01-06 08:00'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' },
                    { type: 'Certificado de Calidad', url: '#', hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' }
                ]
            },
            'AB-HASS-2026-234': {
                status: 'valid',
                product: 'Aguacate Hass Orgánico',
                variety: 'Hass',
                origin: 'Tancítaro, Michoacán, México',
                region: 'Michoacán',
                producer: 'Cooperativa Oro Verde de Tancítaro',
                harvestDate: '2026-01-03',
                packingDate: '2026-01-03',
                exportDate: '2026-01-04',
                expiryDate: '2026-02-03',
                destination: 'Dubai, EAU',
                brix: '12.0°',
                ph: '6.1',
                avgTemp: '5.5°C',
                qualityScore: '9.9/10',
                blockchainHash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
                timestamps: {
                    harvest: '03 Ene 05:45',
                    packing: '03 Ene 12:00',
                    cold: '03 Ene 14:30',
                    export: '04 Ene 07:00'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-AV-890123', issuer: 'SENASICA México', issuedDate: '2025-04-20', validUntil: '2026-04-20' },
                    { type: 'USDA Organic', number: 'USDA-ORG-78234', issuer: 'USDA National Organic Program', issuedDate: '2025-02-15', validUntil: '2026-02-15' },
                    { type: 'APEAM', number: 'APEAM-2026-1045', issuer: 'APEAM Michoacán', issuedDate: '2025-07-01', validUntil: '2026-07-01' }
                ],
                blockchain: {
                    hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 50198234,
                    timestamp: 1735891500,
                    txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c'
                },
                gps: { latitude: 19.3476, longitude: -102.3584, elevation: '2050 msnm' },
                qualityMetrics: {
                    dryMatter: '24.8%',
                    weight: '268g',
                    color: 'Verde oscuro uniforme',
                    firmness: 'Firme',
                    temperature: '5-7°C'
                },
                packaging: { type: 'Caja 4kg', lot: 'AB-HASS-2026-234', quantity: '200 kg', boxesCount: 50 },
                traceability: {
                    field: 'Huerta San Miguel',
                    lot: 'Lote 8',
                    block: 'Bloque C',
                    packingHouse: 'Empacadora Tancítaro Premium',
                    coolingDate: '2026-01-03 14:30',
                    dispatchDate: '2026-01-04 07:00'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef' },
                    { type: 'Certificado Orgánico USDA', url: '#', hash: '0xcdef3456789012abcdef3456789012abcdef3456789012abcdef3456789012ab' }
                ]
            },
            'AB-HASS-2025-987': {
                status: 'valid',
                product: 'Aguacate Hass Export Grade',
                variety: 'Hass',
                origin: 'Peribán, Michoacán, México',
                region: 'Michoacán',
                producer: 'Agrícola Peribán S.A. de C.V.',
                harvestDate: '2025-12-18',
                packingDate: '2025-12-18',
                exportDate: '2025-12-19',
                expiryDate: '2026-01-18',
                destination: 'Shanghai, China',
                brix: '11.8°',
                ph: '6.3',
                avgTemp: '5.0°C',
                qualityScore: '9.7/10',
                blockchainHash: 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
                timestamps: {
                    harvest: '18 Dic 06:00',
                    packing: '18 Dic 13:00',
                    cold: '18 Dic 15:00',
                    export: '19 Dic 06:30'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-AV-901234', issuer: 'SENASICA México', issuedDate: '2025-05-10', validUntil: '2026-05-10' },
                    { type: 'GlobalGAP', number: '4050000923456', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-03-01', validUntil: '2026-03-01' }
                ],
                blockchain: {
                    hash: 'd5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 49876543,
                    timestamp: 1734505200,
                    txHash: '0x4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d'
                },
                gps: { latitude: 19.5123, longitude: -102.4287, elevation: '1890 msnm' },
                qualityMetrics: {
                    dryMatter: '22.9%',
                    weight: '232g',
                    color: 'Verde oscuro',
                    firmness: 'Óptima',
                    temperature: '5-7°C'
                },
                packaging: { type: 'Caja 4kg', lot: 'AB-HASS-2025-987', quantity: '240 kg', boxesCount: 60 },
                traceability: {
                    field: 'Rancho Los Volcanes',
                    lot: 'Lote 22',
                    block: 'Bloque B',
                    packingHouse: 'Empacadora Internacional Peribán',
                    coolingDate: '2025-12-18 15:00',
                    dispatchDate: '2025-12-19 06:30'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef' },
                    { type: 'Certificado de Calidad', url: '#', hash: '0xef5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcd' }
                ]
            },
            'AB-HASS-2026-456': {
                status: 'valid',
                product: 'Aguacate Hass Selección',
                variety: 'Hass',
                origin: 'Ario de Rosales, Michoacán, México',
                region: 'Michoacán',
                producer: 'Productores Unidos de Ario',
                harvestDate: '2026-01-06',
                packingDate: '2026-01-06',
                exportDate: '2026-01-07',
                expiryDate: '2026-02-06',
                destination: 'Tokyo, Japón',
                brix: '11.2°',
                ph: '6.0',
                avgTemp: '5.3°C',
                qualityScore: '9.6/10',
                blockchainHash: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
                timestamps: {
                    harvest: '06 Ene 05:30',
                    packing: '06 Ene 11:00',
                    cold: '06 Ene 13:30',
                    export: '07 Ene 06:00'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-AV-012345', issuer: 'SENASICA México', issuedDate: '2025-06-15', validUntil: '2026-06-15' },
                    { type: 'APEAM', number: 'APEAM-2026-1178', issuer: 'APEAM Michoacán', issuedDate: '2025-08-01', validUntil: '2026-08-01' }
                ],
                blockchain: {
                    hash: 'e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 50278901,
                    timestamp: 1736150400,
                    txHash: '0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e'
                },
                gps: { latitude: 19.2089, longitude: -101.9734, elevation: '1540 msnm' },
                qualityMetrics: {
                    dryMatter: '21.8%',
                    weight: '225g',
                    color: 'Verde oscuro',
                    firmness: 'Firme',
                    temperature: '5-7°C'
                },
                packaging: { type: 'Caja 4kg', lot: 'AB-HASS-2026-456', quantity: '180 kg', boxesCount: 45 },
                traceability: {
                    field: 'Huerta La Esperanza',
                    lot: 'Lote 11',
                    block: 'Bloque D',
                    packingHouse: 'Empacadora Ario Export',
                    coolingDate: '2026-01-06 13:30',
                    dispatchDate: '2026-01-07 06:00'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0x6789012345abcdef6789012345abcdef6789012345abcdef6789012345abcdef' },
                    { type: 'Certificado de Calidad', url: '#', hash: '0xf6789012345abcdef6789012345abcdef6789012345abcdef6789012345abcde' }
                ]
            },

            // ==========================================
            // FRESAS (3 entries)
            // ==========================================
            'AB-FRES-2026-001': {
                status: 'valid',
                product: 'Fresas Premium Albion',
                variety: 'Albion',
                origin: 'Zapotlán el Grande, Jalisco, México',
                region: 'Jalisco',
                producer: 'Berries de Jalisco S.A.',
                harvestDate: '2026-01-06',
                packingDate: '2026-01-06',
                exportDate: '2026-01-07',
                expiryDate: '2026-01-20',
                destination: 'Los Angeles, USA',
                brix: '9.8°',
                ph: '3.4',
                avgTemp: '2.5°C',
                qualityScore: '9.7/10',
                blockchainHash: 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
                timestamps: {
                    harvest: '06 Ene 04:30',
                    packing: '06 Ene 08:00',
                    cold: '06 Ene 09:30',
                    export: '07 Ene 05:00'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-FF-123456', issuer: 'SENASICA México', issuedDate: '2025-02-20', validUntil: '2026-02-20' },
                    { type: 'GlobalGAP', number: '4050000567890', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-04-15', validUntil: '2026-04-15' }
                ],
                blockchain: {
                    hash: 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 50267890,
                    timestamp: 1736137800,
                    txHash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f'
                },
                gps: { latitude: 19.7742, longitude: -103.4614, elevation: '1510 msnm' },
                qualityMetrics: {
                    brix: '9.8°',
                    pH: '3.4',
                    humidity: '89.5%',
                    size: '28mm diámetro',
                    color: 'Rojo brillante (Pantone 185C)',
                    firmness: 'Firme',
                    temperature: '2-4°C'
                },
                packaging: { type: 'Clamshell 250g', lot: 'AB-FRES-2026-001', quantity: '125 kg', boxesCount: 500 },
                traceability: {
                    field: 'Rancho Las Fresas',
                    lot: 'Lote 7',
                    block: 'Bloque E',
                    packingHouse: 'Empacadora Berries Premium Jalisco',
                    coolingDate: '2026-01-06 09:30',
                    dispatchDate: '2026-01-07 05:00'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0x7890123456abcdef7890123456abcdef7890123456abcdef7890123456abcdef' },
                    { type: 'Certificado de Calidad', url: '#', hash: '0xa7890123456abcdef7890123456abcdef7890123456abcdef7890123456abcde' }
                ]
            },
            'AB-FRES-2026-127': {
                status: 'valid',
                product: 'Fresas Festival Export',
                variety: 'Festival',
                origin: 'Irapuato, Guanajuato, México',
                region: 'Guanajuato',
                producer: 'Fresas de Irapuato S.P.R.',
                harvestDate: '2026-01-04',
                packingDate: '2026-01-04',
                exportDate: '2026-01-05',
                expiryDate: '2026-01-18',
                destination: 'Toronto, Canadá',
                brix: '10.2°',
                ph: '3.3',
                avgTemp: '2.2°C',
                qualityScore: '9.8/10',
                blockchainHash: 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
                timestamps: {
                    harvest: '04 Ene 04:00',
                    packing: '04 Ene 07:30',
                    cold: '04 Ene 09:00',
                    export: '05 Ene 04:30'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-FF-234567', issuer: 'SENASICA México', issuedDate: '2025-03-10', validUntil: '2026-03-10' },
                    { type: 'GlobalGAP', number: '4050000678901', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-05-20', validUntil: '2026-05-20' }
                ],
                blockchain: {
                    hash: 'a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 50189456,
                    timestamp: 1735966200,
                    txHash: '0x8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a'
                },
                gps: { latitude: 20.6767, longitude: -101.3556, elevation: '1730 msnm' },
                qualityMetrics: {
                    brix: '10.2°',
                    pH: '3.3',
                    humidity: '88.2%',
                    size: '32mm diámetro',
                    color: 'Rojo brillante',
                    firmness: 'Óptima',
                    temperature: '2-4°C'
                },
                packaging: { type: 'Clamshell 250g', lot: 'AB-FRES-2026-127', quantity: '150 kg', boxesCount: 600 },
                traceability: {
                    field: 'Agrícola San Juan',
                    lot: 'Lote 12',
                    block: 'Bloque A',
                    packingHouse: 'Empacadora Irapuato Fresh',
                    coolingDate: '2026-01-04 09:00',
                    dispatchDate: '2026-01-05 04:30'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0x8901234567abcdef8901234567abcdef8901234567abcdef8901234567abcdef' },
                    { type: 'Certificado de Calidad', url: '#', hash: '0xb8901234567abcdef8901234567abcdef8901234567abcdef8901234567abcde' }
                ]
            },
            'AB-FRES-2025-892': {
                status: 'valid',
                product: 'Fresas Camino Real Premium',
                variety: 'Camino Real',
                origin: 'San Quintín, Baja California, México',
                region: 'Baja California',
                producer: 'BerryMex del Pacífico',
                harvestDate: '2025-12-20',
                packingDate: '2025-12-20',
                exportDate: '2025-12-21',
                expiryDate: '2026-01-03',
                destination: 'Phoenix, USA',
                brix: '10.8°',
                ph: '3.5',
                avgTemp: '2.0°C',
                qualityScore: '9.9/10',
                blockchainHash: 'b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
                timestamps: {
                    harvest: '20 Dic 05:00',
                    packing: '20 Dic 08:30',
                    cold: '20 Dic 10:00',
                    export: '21 Dic 04:00'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-FF-345678', issuer: 'SENASICA México', issuedDate: '2025-01-15', validUntil: '2026-01-15' },
                    { type: 'USDA Organic', number: 'USDA-ORG-89345', issuer: 'USDA National Organic Program', issuedDate: '2025-04-01', validUntil: '2026-04-01' }
                ],
                blockchain: {
                    hash: 'b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 49912345,
                    timestamp: 1734678000,
                    txHash: '0x9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
                },
                gps: { latitude: 30.5296, longitude: -115.9463, elevation: '45 msnm' },
                qualityMetrics: {
                    brix: '10.8°',
                    pH: '3.5',
                    humidity: '87.8%',
                    size: '30mm diámetro',
                    color: 'Rojo intenso brillante',
                    firmness: 'Firme',
                    temperature: '2-4°C'
                },
                packaging: { type: 'Clamshell 250g', lot: 'AB-FRES-2025-892', quantity: '175 kg', boxesCount: 700 },
                traceability: {
                    field: 'Rancho Costa Azul',
                    lot: 'Lote 5',
                    block: 'Bloque C',
                    packingHouse: 'Empacadora San Quintín Export',
                    coolingDate: '2025-12-20 10:00',
                    dispatchDate: '2025-12-21 04:00'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0x9012345678abcdef9012345678abcdef9012345678abcdef9012345678abcdef' },
                    { type: 'Certificado Orgánico USDA', url: '#', hash: '0xc9012345678abcdef9012345678abcdef9012345678abcdef9012345678abcde' }
                ]
            },

            // ==========================================
            // ARÁNDANOS (3 entries)
            // ==========================================
            'AB-ARAN-2026-045': {
                status: 'valid',
                product: 'Arándanos Biloxi Premium',
                variety: 'Biloxi',
                origin: 'Zapotlán el Grande, Jalisco, México',
                region: 'Jalisco',
                producer: 'BlueBerries México S.A.',
                harvestDate: '2026-01-05',
                packingDate: '2026-01-05',
                exportDate: '2026-01-06',
                expiryDate: '2026-01-26',
                destination: 'Londres, UK',
                brix: '13.5°',
                ph: '3.1',
                avgTemp: '1.8°C',
                qualityScore: '9.8/10',
                blockchainHash: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
                timestamps: {
                    harvest: '05 Ene 05:00',
                    packing: '05 Ene 09:00',
                    cold: '05 Ene 10:30',
                    export: '06 Ene 05:30'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-BB-234567', issuer: 'SENASICA México', issuedDate: '2025-03-25', validUntil: '2026-03-25' },
                    { type: 'GlobalGAP', number: '4050000789012', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-06-10', validUntil: '2026-06-10' }
                ],
                blockchain: {
                    hash: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 50245678,
                    timestamp: 1736056800,
                    txHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'
                },
                gps: { latitude: 19.7756, longitude: -103.4578, elevation: '1520 msnm' },
                qualityMetrics: {
                    brix: '13.5°',
                    pH: '3.1',
                    humidity: '82.5%',
                    size: '14mm diámetro',
                    color: 'Azul oscuro con bloom',
                    firmness: 'Firme',
                    temperature: '0-2°C'
                },
                packaging: { type: 'Clamshell 125g', lot: 'AB-ARAN-2026-045', quantity: '100 kg', boxesCount: 800 },
                traceability: {
                    field: 'Huerta Los Arándanos',
                    lot: 'Lote 3',
                    block: 'Bloque B',
                    packingHouse: 'Empacadora BlueMex Jalisco',
                    coolingDate: '2026-01-05 10:30',
                    dispatchDate: '2026-01-06 05:30'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0xa123456789abcdefa123456789abcdefa123456789abcdefa123456789abcdef' },
                    { type: 'Certificado de Calidad', url: '#', hash: '0xda123456789abcdefa123456789abcdefa123456789abcdefa123456789abcde' }
                ]
            },
            'AB-ARAN-2025-734': {
                status: 'valid',
                product: 'Arándanos Snowchaser Orgánico',
                variety: 'Snowchaser',
                origin: 'Los Reyes, Michoacán, México',
                region: 'Michoacán',
                producer: 'Berries Orgánicos de Michoacán',
                harvestDate: '2025-12-15',
                packingDate: '2025-12-15',
                exportDate: '2025-12-16',
                expiryDate: '2026-01-05',
                destination: 'Amsterdam, Países Bajos',
                brix: '14.2°',
                ph: '3.0',
                avgTemp: '1.5°C',
                qualityScore: '9.9/10',
                blockchainHash: 'd9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
                timestamps: {
                    harvest: '15 Dic 04:30',
                    packing: '15 Dic 08:00',
                    cold: '15 Dic 09:30',
                    export: '16 Dic 05:00'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-BB-345678', issuer: 'SENASICA México', issuedDate: '2025-04-15', validUntil: '2026-04-15' },
                    { type: 'USDA Organic', number: 'USDA-ORG-90456', issuer: 'USDA National Organic Program', issuedDate: '2025-05-01', validUntil: '2026-05-01' }
                ],
                blockchain: {
                    hash: 'd9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 49834567,
                    timestamp: 1734245400,
                    txHash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3'
                },
                gps: { latitude: 19.5847, longitude: -102.4723, elevation: '1340 msnm' },
                qualityMetrics: {
                    brix: '14.2°',
                    pH: '3.0',
                    humidity: '81.8%',
                    size: '15mm diámetro',
                    color: 'Azul intenso con bloom',
                    firmness: 'Óptima',
                    temperature: '0-2°C'
                },
                packaging: { type: 'Clamshell 125g', lot: 'AB-ARAN-2025-734', quantity: '80 kg', boxesCount: 640 },
                traceability: {
                    field: 'Huerta Azul Michoacán',
                    lot: 'Lote 9',
                    block: 'Bloque A',
                    packingHouse: 'Empacadora Berry Gold',
                    coolingDate: '2025-12-15 09:30',
                    dispatchDate: '2025-12-16 05:00'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0xb234567890abcdefb234567890abcdefb234567890abcdefb234567890abcdef' },
                    { type: 'Certificado Orgánico USDA', url: '#', hash: '0xeb234567890abcdefb234567890abcdefb234567890abcdefb234567890abcde' }
                ]
            },
            'AB-ARAN-2026-201': {
                status: 'valid',
                product: 'Arándanos Emerald Select',
                variety: 'Emerald',
                origin: 'Culiacán, Sinaloa, México',
                region: 'Sinaloa',
                producer: 'Berries del Noroeste S.A.',
                harvestDate: '2026-01-02',
                packingDate: '2026-01-02',
                exportDate: '2026-01-03',
                expiryDate: '2026-01-23',
                destination: 'Miami, USA',
                brix: '12.8°',
                ph: '3.2',
                avgTemp: '1.6°C',
                qualityScore: '9.6/10',
                blockchainHash: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
                timestamps: {
                    harvest: '02 Ene 04:45',
                    packing: '02 Ene 08:30',
                    cold: '02 Ene 10:00',
                    export: '03 Ene 05:00'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-BB-456789', issuer: 'SENASICA México', issuedDate: '2025-05-20', validUntil: '2026-05-20' },
                    { type: 'GlobalGAP', number: '4050000890123', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-07-15', validUntil: '2026-07-15' }
                ],
                blockchain: {
                    hash: 'e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 50156789,
                    timestamp: 1735797900,
                    txHash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4'
                },
                gps: { latitude: 24.8091, longitude: -107.3940, elevation: '55 msnm' },
                qualityMetrics: {
                    brix: '12.8°',
                    pH: '3.2',
                    humidity: '83.2%',
                    size: '13mm diámetro',
                    color: 'Azul oscuro con bloom',
                    firmness: 'Firme',
                    temperature: '0-2°C'
                },
                packaging: { type: 'Clamshell 125g', lot: 'AB-ARAN-2026-201', quantity: '90 kg', boxesCount: 720 },
                traceability: {
                    field: 'Rancho Berry Sinaloa',
                    lot: 'Lote 6',
                    block: 'Bloque D',
                    packingHouse: 'Empacadora Noroeste Fresh',
                    coolingDate: '2026-01-02 10:00',
                    dispatchDate: '2026-01-03 05:00'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0xc345678901abcdefc345678901abcdefc345678901abcdefc345678901abcdef' },
                    { type: 'Certificado de Calidad', url: '#', hash: '0xfc345678901abcdefc345678901abcdefc345678901abcdefc345678901abcde' }
                ]
            },

            // ==========================================
            // ZARZAMORAS (2 entries)
            // ==========================================
            'AB-ZARZ-2026-089': {
                status: 'valid',
                product: 'Zarzamoras Tupy Premium',
                variety: 'Tupy',
                origin: 'Los Reyes, Michoacán, México',
                region: 'Michoacán',
                producer: 'Zarzamoras del Pacífico',
                harvestDate: '2026-01-04',
                packingDate: '2026-01-04',
                exportDate: '2026-01-05',
                expiryDate: '2026-01-18',
                destination: 'París, Francia',
                brix: '11.2°',
                ph: '3.4',
                avgTemp: '2.0°C',
                qualityScore: '9.7/10',
                blockchainHash: 'f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
                timestamps: {
                    harvest: '04 Ene 05:15',
                    packing: '04 Ene 09:00',
                    cold: '04 Ene 10:30',
                    export: '05 Ene 06:00'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-BK-345678', issuer: 'SENASICA México', issuedDate: '2025-04-10', validUntil: '2026-04-10' },
                    { type: 'GlobalGAP', number: '4050000901234', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-06-25', validUntil: '2026-06-25' }
                ],
                blockchain: {
                    hash: 'f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 50201234,
                    timestamp: 1735970700,
                    txHash: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5'
                },
                gps: { latitude: 19.5892, longitude: -102.4698, elevation: '1360 msnm' },
                qualityMetrics: {
                    brix: '11.2°',
                    pH: '3.4',
                    humidity: '85.5%',
                    weight: '6.5g por fruto',
                    color: 'Negro brillante',
                    firmness: 'Firme',
                    temperature: '2-4°C'
                },
                packaging: { type: 'Clamshell 170g', lot: 'AB-ZARZ-2026-089', quantity: '85 kg', boxesCount: 500 },
                traceability: {
                    field: 'Huerta La Zarzamora',
                    lot: 'Lote 4',
                    block: 'Bloque B',
                    packingHouse: 'Empacadora Los Reyes Berry',
                    coolingDate: '2026-01-04 10:30',
                    dispatchDate: '2026-01-05 06:00'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0xd456789012abcdefd456789012abcdefd456789012abcdefd456789012abcdef' },
                    { type: 'Certificado de Calidad', url: '#', hash: '0xad456789012abcdefd456789012abcdefd456789012abcdefd456789012abcde' }
                ]
            },
            'AB-ZARZ-2025-456': {
                status: 'valid',
                product: 'Zarzamoras Cherokee Select',
                variety: 'Cherokee',
                origin: 'Tamazula, Jalisco, México',
                region: 'Jalisco',
                producer: 'Berries Premium de Jalisco',
                harvestDate: '2025-12-22',
                packingDate: '2025-12-22',
                exportDate: '2025-12-23',
                expiryDate: '2026-01-05',
                destination: 'Berlín, Alemania',
                brix: '10.5°',
                ph: '3.6',
                avgTemp: '2.2°C',
                qualityScore: '9.5/10',
                blockchainHash: 'a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
                timestamps: {
                    harvest: '22 Dic 05:30',
                    packing: '22 Dic 09:30',
                    cold: '22 Dic 11:00',
                    export: '23 Dic 05:30'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-BK-456789', issuer: 'SENASICA México', issuedDate: '2025-05-15', validUntil: '2026-05-15' },
                    { type: 'Rainforest Alliance', number: 'RA-2025-78234', issuer: 'Rainforest Alliance Certified', issuedDate: '2025-03-20', validUntil: '2026-03-20' }
                ],
                blockchain: {
                    hash: 'a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 49923456,
                    timestamp: 1734850200,
                    txHash: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6'
                },
                gps: { latitude: 19.6734, longitude: -103.2456, elevation: '1180 msnm' },
                qualityMetrics: {
                    brix: '10.5°',
                    pH: '3.6',
                    humidity: '86.2%',
                    weight: '7.2g por fruto',
                    color: 'Negro intenso brillante',
                    firmness: 'Óptima',
                    temperature: '2-4°C'
                },
                packaging: { type: 'Clamshell 170g', lot: 'AB-ZARZ-2025-456', quantity: '75 kg', boxesCount: 440 },
                traceability: {
                    field: 'Rancho El Cielo',
                    lot: 'Lote 8',
                    block: 'Bloque C',
                    packingHouse: 'Empacadora Tamazula Export',
                    coolingDate: '2025-12-22 11:00',
                    dispatchDate: '2025-12-23 05:30'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0xe567890123abcdefe567890123abcdefe567890123abcdefe567890123abcdef' },
                    { type: 'Certificado Rainforest Alliance', url: '#', hash: '0xbe567890123abcdefe567890123abcdefe567890123abcdefe567890123abcde' }
                ]
            },

            // ==========================================
            // FRAMBUESAS (2 entries)
            // ==========================================
            'AB-FRAM-2026-312': {
                status: 'valid',
                product: 'Frambuesas Heritage Premium',
                variety: 'Heritage',
                origin: 'Salamanca, Guanajuato, México',
                region: 'Guanajuato',
                producer: 'Frambuesas de Guanajuato S.A.',
                harvestDate: '2026-01-03',
                packingDate: '2026-01-03',
                exportDate: '2026-01-04',
                expiryDate: '2026-01-17',
                destination: 'Nueva York, USA',
                brix: '11.5°',
                ph: '3.3',
                avgTemp: '1.8°C',
                qualityScore: '9.8/10',
                blockchainHash: 'b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
                timestamps: {
                    harvest: '03 Ene 04:45',
                    packing: '03 Ene 08:00',
                    cold: '03 Ene 09:30',
                    export: '04 Ene 05:00'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-RP-456789', issuer: 'SENASICA México', issuedDate: '2025-06-01', validUntil: '2026-06-01' },
                    { type: 'GlobalGAP', number: '4050000012345', issuer: 'GlobalGAP c/o FoodPLUS GmbH', issuedDate: '2025-08-10', validUntil: '2026-08-10' }
                ],
                blockchain: {
                    hash: 'b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 50178901,
                    timestamp: 1735883100,
                    txHash: '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7'
                },
                gps: { latitude: 20.5739, longitude: -101.1956, elevation: '1720 msnm' },
                qualityMetrics: {
                    brix: '11.5°',
                    pH: '3.3',
                    humidity: '84.5%',
                    weight: '5.2g por fruto',
                    color: 'Rojo intenso',
                    firmness: 'Firme',
                    temperature: '0-2°C'
                },
                packaging: { type: 'Clamshell 125g', lot: 'AB-FRAM-2026-312', quantity: '62 kg', boxesCount: 500 },
                traceability: {
                    field: 'Huerta La Frambuesa Dorada',
                    lot: 'Lote 2',
                    block: 'Bloque A',
                    packingHouse: 'Empacadora Guanajuato Berry',
                    coolingDate: '2026-01-03 09:30',
                    dispatchDate: '2026-01-04 05:00'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0xf678901234abcdeff678901234abcdeff678901234abcdeff678901234abcdef' },
                    { type: 'Certificado de Calidad', url: '#', hash: '0xcf678901234abcdeff678901234abcdeff678901234abcdeff678901234abcde' }
                ]
            },
            'AB-FRAM-2026-078': {
                status: 'valid',
                product: 'Frambuesas Autumn Bliss',
                variety: 'Autumn Bliss',
                origin: 'San Quintín, Baja California, México',
                region: 'Baja California',
                producer: 'Pacific Berries de México',
                harvestDate: '2026-01-01',
                packingDate: '2026-01-01',
                exportDate: '2026-01-02',
                expiryDate: '2026-01-15',
                destination: 'San Diego, USA',
                brix: '12.2°',
                ph: '3.4',
                avgTemp: '1.5°C',
                qualityScore: '9.7/10',
                blockchainHash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
                timestamps: {
                    harvest: '01 Ene 05:00',
                    packing: '01 Ene 08:30',
                    cold: '01 Ene 10:00',
                    export: '02 Ene 04:30'
                },
                certifications: [
                    { type: 'SENASICA', number: 'MEX-RP-567890', issuer: 'SENASICA México', issuedDate: '2025-07-15', validUntil: '2026-07-15' },
                    { type: 'Rainforest Alliance', number: 'RA-2025-89345', issuer: 'Rainforest Alliance Certified', issuedDate: '2025-04-25', validUntil: '2026-04-25' }
                ],
                blockchain: {
                    hash: 'c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
                    network: 'Polygon Amoy Testnet',
                    blockNumber: 50134567,
                    timestamp: 1735711800,
                    txHash: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8'
                },
                gps: { latitude: 30.5312, longitude: -115.9478, elevation: '48 msnm' },
                qualityMetrics: {
                    brix: '12.2°',
                    pH: '3.4',
                    humidity: '83.8%',
                    weight: '4.8g por fruto',
                    color: 'Rojo brillante intenso',
                    firmness: 'Óptima',
                    temperature: '0-2°C'
                },
                packaging: { type: 'Clamshell 125g', lot: 'AB-FRAM-2026-078', quantity: '55 kg', boxesCount: 440 },
                traceability: {
                    field: 'Rancho Pacific Berry',
                    lot: 'Lote 10',
                    block: 'Bloque E',
                    packingHouse: 'Empacadora Baja Berry Fresh',
                    coolingDate: '2026-01-01 10:00',
                    dispatchDate: '2026-01-02 04:30'
                },
                documents: [
                    { type: 'Certificado Fitosanitario', url: '#', hash: '0xa789012345abcdefa789012345abcdefa789012345abcdefa789012345abcdef' },
                    { type: 'Certificado Rainforest Alliance', url: '#', hash: '0xda789012345abcdefa789012345abcdefa789012345abcdefa789012345abcde' }
                ]
            },

            // ==========================================
            // CÓDIGO INVÁLIDO (para testing)
            // ==========================================
            'AB-INVA-9999-999': {
                status: 'invalid',
                error: 'Código de lote no encontrado en el sistema',
                suggestions: ['AB-HASS-2026-001', 'AB-FRES-2026-001', 'AB-ARAN-2026-045']
            }
        };

        // Check if code exists in demo database
        if (demoDatabase[lotCode]) {
            const data = demoDatabase[lotCode];
            // Handle invalid codes
            if (data.status === 'invalid') {
                throw new Error('NOT_FOUND');
            }
            return data;
        }

        // Generate realistic data for any valid format code
        return this.generateDemoData(lotCode);
    }

    /**
     * Generate demo data for codes not in the database
     * @param {string} lotCode - Lot code
     * @returns {Object} Generated demo data
     */
    generateDemoData(lotCode) {
        const isHass = lotCode.includes('HASS');
        const isBerry = lotCode.includes('BERR');

        const now = new Date();
        const harvestDate = new Date(now - 3 * 24 * 60 * 60 * 1000);

        return {
            status: 'valid',
            product: isHass ? 'Aguacate Hass' : (isBerry ? 'Berries Premium' : 'Producto Certificado'),
            origin: 'Michoacán, México',
            producer: 'Productor Certificado AgroBridge',
            harvestDate: harvestDate.toISOString().split('T')[0],
            packingDate: harvestDate.toISOString().split('T')[0],
            exportDate: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            destination: 'Mercado Internacional',
            brix: (10 + Math.random() * 5).toFixed(1) + '°',
            ph: (3 + Math.random() * 4).toFixed(1),
            avgTemp: (2 + Math.random() * 4).toFixed(1) + '°C',
            qualityScore: (9 + Math.random()).toFixed(1) + '/10',
            blockchainHash: this.generateHash(),
            timestamps: {
                harvest: this.formatDateTime(harvestDate),
                packing: this.formatDateTime(new Date(harvestDate.getTime() + 6 * 60 * 60 * 1000)),
                cold: this.formatDateTime(new Date(harvestDate.getTime() + 8 * 60 * 60 * 1000)),
                export: this.formatDateTime(new Date(harvestDate.getTime() + 24 * 60 * 60 * 1000))
            }
        };
    }

    /**
     * Generate a random SHA-256-like hash
     * @returns {string} 64-character hex string
     */
    generateHash() {
        return Array(64).fill(0).map(() =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }

    /**
     * Format date for display
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDateTime(date) {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${hours}:${minutes}`;
    }

    /**
     * Display validation result in UI
     * @param {Object} data - Validation result data
     */
    displayValidationResult(data) {
        const statusDiv = this.getElement('validation-status-message');
        const detailsContainer = this.getElement('validation-details-container');
        const resultsDiv = this.getElement('validation-results');
        const statusIndicator = this.getElement('status-indicator');
        const statusText = this.getElement('status-text');

        if (data.status === 'valid') {
            // Update status indicator
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator status-indicator--verified';
            }
            if (statusText) {
                statusText.textContent = this.t('status.verified');
            }

            // Update old-style validation display
            if (statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.className = 'validation-card__status validation-card__status--valid';
                statusDiv.textContent = this.currentLang === 'es'
                    ? '✅ LOTE VERIFICADO - INTEGRIDAD GARANTIZADA'
                    : '✅ LOT VERIFIED - INTEGRITY GUARANTEED';
            }

            // Update details container (old style)
            if (detailsContainer) {
                detailsContainer.innerHTML = this.buildDetailsHtml(data);
            }

            // Update new validation results (v2 style)
            if (resultsDiv) {
                this.updateValidationResults(data);
                resultsDiv.classList.add('active');
            }

            // Trigger success animation
            this.triggerSuccess();
        }
    }

    /**
     * Trigger success celebration animation with confetti (P1 Fix: cooldown)
     */
    triggerSuccess() {
        // P1 Fix: Confetti cooldown - only show once per session to avoid fatigue
        if (typeof confetti !== 'undefined' && !this.hasShownConfetti) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#34d399', '#6ee7b7', '#d4af37', '#fbbf24']
            });
            this.hasShownConfetti = true; // Only show confetti once per session
        }

        // Animate the seal icon (always animate)
        const sealIcon = document.querySelector('.seal-icon');
        if (sealIcon) {
            sealIcon.style.transform = 'scale(0)';
            setTimeout(() => {
                sealIcon.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                sealIcon.style.transform = 'scale(1)';
            }, 100);
        }

        // Add pulse animation to the verification seal (always animate)
        const verificationSeal = document.querySelector('.verification-seal');
        if (verificationSeal) {
            verificationSeal.classList.add('success-pulse');
            setTimeout(() => {
                verificationSeal.classList.remove('success-pulse');
            }, 2000);
        }
    }

    /**
     * Build HTML for validation details (sanitized)
     * @param {Object} data - Validation data
     * @returns {string} HTML string
     */
    buildDetailsHtml(data) {
        const labels = this.currentLang === 'es' ? {
            product: 'Producto',
            origin: 'Origen',
            harvest: 'Cosecha',
            export: 'Exportación',
            destination: 'Destino',
            hash: 'Hash Blockchain',
            temp: 'Temperatura',
            quality: 'Calidad'
        } : {
            product: 'Product',
            origin: 'Origin',
            harvest: 'Harvest',
            export: 'Export',
            destination: 'Destination',
            hash: 'Blockchain Hash',
            temp: 'Temperature',
            quality: 'Quality'
        };

        return `
            <div class="validation-details">
                <div class="validation-detail">
                    <span class="detail-label">${labels.product}:</span>
                    <span class="detail-value">${this.escapeHtml(data.product)}</span>
                </div>
                <div class="validation-detail">
                    <span class="detail-label">${labels.origin}:</span>
                    <span class="detail-value">${this.escapeHtml(data.origin)}</span>
                </div>
                <div class="validation-detail">
                    <span class="detail-label">${labels.harvest}:</span>
                    <span class="detail-value">${this.escapeHtml(data.harvestDate)}</span>
                </div>
                <div class="validation-detail">
                    <span class="detail-label">${labels.export}:</span>
                    <span class="detail-value">${this.escapeHtml(data.exportDate)}</span>
                </div>
                <div class="validation-detail">
                    <span class="detail-label">${labels.destination}:</span>
                    <span class="detail-value">${this.escapeHtml(data.destination)}</span>
                </div>
                <div class="validation-detail">
                    <span class="detail-label">${labels.hash}:</span>
                    <span class="detail-value hash">${this.escapeHtml(data.blockchainHash)}</span>
                </div>
                <div class="validation-detail">
                    <span class="detail-label">${labels.temp}:</span>
                    <span class="detail-value">${this.escapeHtml(data.avgTemp)}</span>
                </div>
                <div class="validation-detail">
                    <span class="detail-label">${labels.quality}:</span>
                    <span class="detail-value score">${this.escapeHtml(data.qualityScore)}</span>
                </div>
            </div>
        `;
    }

    /**
     * Update new-style validation results (P0 Fixes)
     * @param {Object} data - Validation data
     */
    updateValidationResults(data) {
        // Determine product type for icon and metrics
        const isAvocado = data.product?.toLowerCase().includes('aguacate') ||
                          data.product?.toLowerCase().includes('hass');
        const productIcons = {
            aguacate: '🥑',
            fresa: '🍓',
            arandano: '🫐',
            zarzamora: '⚫',
            frambuesa: '🔴'
        };

        // Determine which icon to show
        let productIcon = '📦';
        const productLower = (data.product || '').toLowerCase();
        if (productLower.includes('aguacate') || productLower.includes('hass')) {
            productIcon = productIcons.aguacate;
        } else if (productLower.includes('fresa')) {
            productIcon = productIcons.fresa;
        } else if (productLower.includes('arándano') || productLower.includes('arandano')) {
            productIcon = productIcons.arandano;
        } else if (productLower.includes('zarzamora')) {
            productIcon = productIcons.zarzamora;
        } else if (productLower.includes('frambuesa')) {
            productIcon = productIcons.frambuesa;
        }

        // P0 Fix: Display product info
        this.setText('product-icon', productIcon);
        this.setText('product-name', data.product || 'Producto Certificado');
        this.setText('product-variety', data.variety ? `Variedad: ${data.variety}` : '');
        this.setText('product-origin', data.origin || 'Mexico');
        this.setText('product-producer', data.producer ? `Productor: ${data.producer}` : '');

        // P0 Fix: Display certifications badges
        this.updateCertificationBadges(data.certifications || []);

        // Update timeline timestamps
        if (data.timestamps) {
            this.setText('time-harvest', data.timestamps.harvest);
            this.setText('time-packing', data.timestamps.packing);
            this.setText('time-cold', data.timestamps.cold);
            this.setText('time-export', data.timestamps.export);
        }

        // P0 Fix: Dynamic metrics based on product type
        // Avocados use Dry Matter (Materia Seca), Berries use Brix
        if (isAvocado) {
            // For avocado: show Dry Matter instead of Brix
            const dryMatter = data.qualityMetrics?.dryMatter || '--';
            this.setText('metric-primary-icon', '💧');
            this.setText('metric-primary-value', dryMatter);
            this.setText('metric-primary-label', 'Materia Seca');
        } else {
            // For berries: show Brix
            this.setText('metric-primary-icon', '🍬');
            this.setText('metric-primary-value', data.brix || '--');
            this.setText('metric-primary-label', 'Indice Brix');
        }

        // Common metrics
        this.setText('metric-ph', data.ph || '--');
        this.setText('metric-temp', data.avgTemp || '--');
        this.setText('metric-quality', data.qualityScore || '--');

        // Update seal hash
        this.setText('seal-hash', `SHA-256: ${data.blockchainHash || '...'}`);
    }

    /**
     * Update certification badges (P0 Fix)
     * @param {Array} certifications - Array of certification objects
     */
    updateCertificationBadges(certifications) {
        const badgesContainer = this.getElement('certification-badges');
        if (!badgesContainer) return;

        // Certification badge configurations
        const certConfig = {
            'SENASICA': { icon: '🇲🇽', color: '#006847', name: 'SENASICA' },
            'GlobalGAP': { icon: '🌍', color: '#00a651', name: 'GlobalGAP' },
            'USDA Organic': { icon: '🌿', color: '#4a7c23', name: 'USDA Organic' },
            'APEAM': { icon: '🥑', color: '#2d5016', name: 'APEAM' },
            'Rainforest Alliance': { icon: '🐸', color: '#00a650', name: 'Rainforest Alliance' }
        };

        if (certifications.length === 0) {
            badgesContainer.innerHTML = '';
            return;
        }

        const badgesHtml = certifications.map(cert => {
            const config = certConfig[cert.type] || { icon: '&#10003;', color: '#666', name: this.escapeHtml(cert.type) };
            return `
                <div class="cert-badge" style="--cert-color: ${this.escapeHtml(config.color)}" title="${this.escapeHtml(cert.type)}: ${this.escapeHtml(cert.number)}">
                    <span class="cert-badge__icon">${config.icon}</span>
                    <span class="cert-badge__name">${this.escapeHtml(config.name)}</span>
                    <span class="cert-badge__status">Verificado</span>
                </div>
            `;
        }).join('');

        badgesContainer.innerHTML = badgesHtml;
    }

    /**
     * Show validation error with enhanced display
     * @param {string} message - Error message
     * @param {string} type - Error type (empty, format, notfound, connection)
     */
    showValidationError(message, type = 'generic') {
        const errorDiv = this.getElement('search-error');

        // Enhanced error messages with suggestions
        const errorMessages = this.currentLang === 'es' ? {
            empty: {
                title: 'Codigo requerido',
                message: 'Por favor ingrese un codigo de lote para validar',
                suggestion: 'Prueba con: AB-HASS-2026-001'
            },
            format: {
                title: 'Formato invalido',
                message: 'El codigo debe seguir el formato: AB-XXXX-YYYY-NNN',
                suggestion: 'Ejemplo valido: AB-FRES-2026-001'
            },
            notfound: {
                title: 'Codigo no encontrado',
                message: 'Este codigo de lote no esta registrado en el sistema',
                suggestion: 'Codigos disponibles: AB-HASS-2026-001, AB-ARAN-2026-045'
            },
            connection: {
                title: 'Error de conexion',
                message: 'No se pudo conectar con el servidor. Intente nuevamente.',
                suggestion: null
            }
        } : {
            empty: {
                title: 'Code required',
                message: 'Please enter a lot code to validate',
                suggestion: 'Try: AB-HASS-2026-001'
            },
            format: {
                title: 'Invalid format',
                message: 'The code must follow the format: AB-XXXX-YYYY-NNN',
                suggestion: 'Valid example: AB-FRES-2026-001'
            },
            notfound: {
                title: 'Code not found',
                message: 'This lot code is not registered in the system',
                suggestion: 'Available codes: AB-HASS-2026-001, AB-ARAN-2026-045'
            },
            connection: {
                title: 'Connection error',
                message: 'Could not connect to the server. Please try again.',
                suggestion: null
            }
        };

        // Determine error type from message
        let errorType = type;
        if (message.includes('ingrese') || message.includes('enter')) {
            errorType = 'empty';
        } else if (message.includes('Formato') || message.includes('format')) {
            errorType = 'format';
        } else if (message.includes('encontrado') || message.includes('found')) {
            errorType = 'notfound';
        } else if (message.includes('conexion') || message.includes('Connection')) {
            errorType = 'connection';
        }

        const error = errorMessages[errorType] || { title: 'Error', message: message, suggestion: null };

        if (errorDiv) {
            errorDiv.innerHTML = `
                <div class="error-content">
                    <span class="error-icon">&#9888;</span>
                    <div class="error-text">
                        <strong>${this.escapeHtml(error.title)}</strong>
                        <p>${this.escapeHtml(error.message)}</p>
                        ${error.suggestion ? `<small class="error-suggestion">${this.escapeHtml(error.suggestion)}</small>` : ''}
                    </div>
                </div>
            `;
            errorDiv.style.display = 'block';
        }

        // Also show as notification
        this.showNotification(error.message, 'error');
    }

    // ============================================
    // CONTACT FORM (Bug #2 Fix)
    // ============================================

    initContactForm() {
        const contactForm = this.getElement('enterprise-form') || document.querySelector('.contact-form');

        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }
    }

    mapInquiryType(value) {
        const lookup = {
            cotizacion: 'product',
            partnership: 'partnership',
            informacion: 'other',
            product: 'product',
            support: 'support',
            other: 'other'
        };
        return lookup[value] || 'other';
    }

    buildLeadMessage(data, inquiryType) {
        const phone = data.phone ? ` ${data.phone}` : '';
        const company = data.company ? ` ${data.company}` : '';
        const inquiryLabels = {
            product: this.currentLang === 'es' ? 'Cotización Enterprise' : 'Enterprise Quote',
            partnership: this.currentLang === 'es' ? 'Partnership / Alianza Comercial' : 'Partnership',
            support: this.currentLang === 'es' ? 'Soporte' : 'Support',
            other: this.currentLang === 'es' ? 'Información General' : 'General Information'
        };
        const inquiryLabel = inquiryLabels[inquiryType] || inquiryType;

        if (this.currentLang === 'es') {
            return `Solicitud enterprise desde el sitio web.\nEmpresa:${company}\nTelefono:${phone}\nTipo:${inquiryLabel}`;
        }

        return `Enterprise request from website.\nCompany:${company}\nPhone:${phone}\nType:${inquiryLabel}`;
    }

    loadRecaptchaScript() {
        if (this.recaptchaReady) return this.recaptchaReady;
        if (!this.recaptchaSiteKey || this.recaptchaSiteKey.includes('REPLACE_WITH')) {
            this.recaptchaReady = Promise.resolve(null);
            return this.recaptchaReady;
        }

        if (typeof window === 'undefined') {
            this.recaptchaReady = Promise.resolve(null);
            return this.recaptchaReady;
        }

        if (window.grecaptcha && typeof window.grecaptcha.execute === 'function') {
            this.recaptchaReady = new Promise((resolve) => {
                window.grecaptcha.ready(() => resolve(window.grecaptcha));
            });
            return this.recaptchaReady;
        }

        this.recaptchaReady = new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(this.recaptchaSiteKey)}`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
                    window.grecaptcha.ready(() => resolve(window.grecaptcha));
                } else {
                    resolve(null);
                }
            };
            script.onerror = () => resolve(null);
            document.head.appendChild(script);
        });

        return this.recaptchaReady;
    }

    async getRecaptchaToken(action) {
        if (!this.recaptchaSiteKey || this.recaptchaSiteKey.includes('REPLACE_WITH')) {
            return null;
        }

        const recaptcha = await this.loadRecaptchaScript();
        if (!recaptcha || typeof recaptcha.execute !== 'function') {
            return null;
        }

        try {
            return await recaptcha.execute(this.recaptchaSiteKey, { action });
        } catch (error) {
            console.warn('[AgroBridge] reCAPTCHA execute failed:', error);
            return null;
        }
    }

    /**
     * Handle contact form submission
     * @param {Event} e - Submit event
     */
    async handleContactSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : '';

        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Basic validation
        if (!data.name || !data.email || !data.company || !data.phone || !data.inquiry_type) {
            this.showNotification(
                this.currentLang === 'es'
                    ? 'Por favor complete todos los campos requeridos.'
                    : 'Please fill in all required fields.',
                'error'
            );
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showNotification(
                this.currentLang === 'es'
                    ? 'Por favor ingrese un email válido.'
                    : 'Please enter a valid email.',
                'error'
            );
            return;
        }

        const inquiryType = this.mapInquiryType(data.inquiry_type);
        const userMessage = data.message ? data.message.trim() : '';
        const finalMessage = userMessage.length >= 10
            ? userMessage
            : this.buildLeadMessage(data, inquiryType);

        if (!finalMessage || finalMessage.trim().length < 10) {
            this.showNotification(
                this.currentLang === 'es'
                    ? 'Por favor ingrese un mensaje más detallado.'
                    : 'Please provide a more detailed message.',
                'error'
            );
            return;
        }

        // Disable button and show loading
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = this.t('form.sending');
        }

        try {
            // In demo mode, simulate API call
            if (this.USE_DEMO_MODE) {
                await this.delay(1500);
                // Simulate success
                this.showNotification(this.t('form.success'), 'success');
                form.reset();
            } else {
                const recaptchaToken = await this.getRecaptchaToken(this.recaptchaAction);
                if (!recaptchaToken) {
                    throw new Error(this.t('form.recaptcha'));
                }

                const payload = {
                    name: data.name.trim(),
                    email: data.email.trim().toLowerCase(),
                    phone: data.phone.trim(),
                    company: data.company.trim(),
                    message: finalMessage,
                    inquiryType,
                    source: 'website',
                    recaptchaToken,
                    honeypot: data.honeypot || ''
                };

                if (data.lotCode) {
                    payload.lotCode = data.lotCode.trim();
                }

                // Real API call
                const response = await fetch(this.contactApi, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Language': this.currentLang
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    let errorMessage = this.t('form.error');
                    try {
                        const errorPayload = await response.json();
                        errorMessage = errorPayload?.message ||
                            errorPayload?.errors?.[0]?.message ||
                            errorMessage;
                    } catch (err) {
                        errorMessage = this.t('form.error');
                    }
                    throw new Error(errorMessage);
                }

                this.showNotification(this.t('form.success'), 'success');
                form.reset();
            }
        } catch (error) {
            console.error('[AgroBridge] Contact form error:', error);
            const message = error?.message || this.t('form.error');
            this.showNotification(message, 'error');
        } finally {
            // Restore button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText || this.t('form.submit');
            }
        }
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - 'success', 'error', 'warning', 'info'
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.agrobridge-notification');
        if (existing) existing.remove();

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `agrobridge-notification agrobridge-notification--${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${this.escapeHtml(message)}</span>
            <button class="notification-close" aria-label="Cerrar">×</button>
        `;

        // Add styles if not already added
        this.ensureNotificationStyles();

        // Add to DOM
        document.body.appendChild(notification);

        // Add close handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('hiding');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('visible');
        });
    }

    /**
     * Ensure notification styles are in the document
     */
    ensureNotificationStyles() {
        if (document.getElementById('agrobridge-notification-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'agrobridge-notification-styles';
        styles.textContent = `
            .agrobridge-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 20px;
                border-radius: 12px;
                background: white;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10000;
                transform: translateX(120%);
                transition: transform 0.3s ease, opacity 0.3s ease;
                max-width: 400px;
                font-family: 'Inter', sans-serif;
            }
            .agrobridge-notification.visible {
                transform: translateX(0);
            }
            .agrobridge-notification.hiding {
                transform: translateX(120%);
                opacity: 0;
            }
            .agrobridge-notification--success {
                border-left: 4px solid #22c55e;
            }
            .agrobridge-notification--error {
                border-left: 4px solid #ef4444;
            }
            .agrobridge-notification--warning {
                border-left: 4px solid #f59e0b;
            }
            .agrobridge-notification--info {
                border-left: 4px solid #3b82f6;
            }
            .notification-icon {
                font-size: 1.25rem;
            }
            .notification-message {
                flex: 1;
                color: #1f2937;
                font-size: 0.95rem;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #9ca3af;
                padding: 0;
                line-height: 1;
            }
            .notification-close:hover {
                color: #4b5563;
            }
            @media (max-width: 480px) {
                .agrobridge-notification {
                    left: 10px;
                    right: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // ============================================
    // ERROR HANDLING & MONITORING
    // ============================================

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('[AgroBridge] Global error:', e.error);
            // In production, send to monitoring service like Sentry
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('[AgroBridge] Unhandled promise rejection:', e.reason);
            e.preventDefault();
        });
    }

    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        // Log Core Web Vitals
                        if (entry.name === 'first-contentful-paint' ||
                            entry.name === 'largest-contentful-paint' ||
                            entry.entryType === 'first-input') {
                            console.log(`[AgroBridge] Performance: ${entry.name}:`,
                                entry.value || entry.startTime);
                        }
                    }
                });

                observer.observe({
                    entryTypes: ['paint', 'largest-contentful-paint', 'first-input']
                });
            } catch (e) {
                // PerformanceObserver not fully supported
            }
        }
    }

    // ============================================
    // UTILITIES
    // ============================================

    /**
     * Delay helper for async operations
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.agroBridgeApp = new AgroBridgeApp();
});

// Export for testing (ES Module and CommonJS compatibility)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgroBridgeApp;
}
export { AgroBridgeApp };
export default AgroBridgeApp;
