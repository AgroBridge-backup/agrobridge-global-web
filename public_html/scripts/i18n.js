/* istanbul ignore file */
/**
 * AgroBridge Internationalization (i18n) Module
 * @description Translation system with multi-language support
 * @version 4.0.0
 */

window.AgroBridgeI18n = (function() {
    'use strict';

    var translations = {
        es: {
            'skip.content': 'Saltar al contenido principal',
            'menu.open': 'Abrir menú de navegación',
            'language.label': 'Seleccionar idioma',
            'language.review': 'Este idioma está en revisión editorial. Mostramos versión en inglés temporalmente.',
            'notification.close': 'Cerrar notificación',

            'nav.home': 'Inicio',
            'nav.portfolio': 'Portafolio',
            'nav.technology': 'Tecnología',
            'nav.cases': 'Casos de Éxito',
            'nav.contact': 'Contacto',
            'nav.mainAria': 'Navegación principal',

            'hero.title': 'Excelencia Agrícola',
            'hero.headline': 'Trazabilidad Premium para Exportación Global.',
            'hero.titleAccent': 'Confianza Verificable.',
            'hero.subtitle': 'Desde Michoacán hacia mercados internacionales con evidencia técnica de origen, calidad y cadena de custodia en cada lote.',
            'hero.ctaPrimary': 'Hablar con un Asesor Senior',
            'hero.ctaSecondary': 'Verificación en Vivo',
            'hero.proofLabel.integrity': 'Integridad',
            'hero.proofValue.integrity': 'Hash verificable',
            'hero.proofLabel.compliance': 'Cumplimiento',
            'hero.proofValue.compliance': 'Documentación trazable',
            'hero.proofLabel.coldChain': 'Cadena de frío',
            'hero.proofValue.coldChain': 'Monitoreo continuo',
            'hero.proofLabel.support': 'Atención',
            'hero.proofValue.support': 'Equipo ejecutivo',
            'hero.proof.aria': 'Indicadores clave de confianza',

            'section.trustInfraTitle': 'Infraestructura de Confianza para Compradores Premium',
            'section.feature.crypto.title': 'Trazabilidad Criptográfica',
            'section.feature.crypto.text': 'Cada movimiento de lote queda registrado con evidencia verificable para auditoría comercial y regulatoria.',
            'section.feature.quality.title': 'Control de Calidad y Frío',
            'section.feature.quality.text': 'Supervisión térmica y métricas de calidad de origen para sostener especificaciones durante tránsito internacional.',
            'section.feature.enterprise.title': 'Operación Enterprise',
            'section.feature.enterprise.text': 'Estandarización técnica para contratos de gran volumen con tiempos de respuesta claros y procesos auditables.',
            'section.portfolioTitle': 'Portafolio Exportable con Especificación Técnica',
            'product.hass.aria': 'Aguacate Hass Premium - Producto certificado',
            'product.hass.title': 'Aguacate Hass para Programas de Abasto Premium',
            'product.hass.text': 'Maduración, firmeza y trazabilidad documental listas para cadenas retail y distribuidores exigentes.',
            'product.berries.aria': 'Berries Selectas - Grado de exportación élite',
            'product.berries.title': 'Berries Selectas de Exportación',
            'product.berries.text': 'Fresa, arándano, frambuesa y zarzamora con control técnico de lote para mercados internacionales de alto valor.',

            'techProof.title': 'Operación Activa en Campo y Exportación',
            'techProof.subtitle': 'Infraestructura digital aplicada por productores certificados en México',
            'techProof.stats.activeLots': 'Lotes Activos',
            'techProof.stats.producers': 'Productores',
            'techProof.stats.precision': 'Precisión',
            'techProof.note': 'Dashboard Enterprise en vivo',
            'techProof.showcaseTitle': 'Visibilidad Operativa para Clientes Internacionales',
            'techProof.point.api': '150+ endpoints de API funcionales',
            'techProof.point.blockchain': 'Trazabilidad blockchain en tiempo real',
            'techProof.point.certs': 'Validación de certificaciones automática',
            'techProof.point.gps': 'Monitoreo GPS de origen del producto',
            'techProof.link': 'Ver Dashboard Real',

            'metrics.card1.label': 'Lotes Validados',
            'metrics.card1.trend': '+342 este mes',
            'metrics.card2.label': 'Productores Certificados',
            'metrics.card2.trend': '+8 este trimestre',
            'metrics.card3.label': 'Hectáreas Monitoreadas',
            'metrics.card3.trend': 'Michoacán, Jalisco, Guanajuato',
            'metrics.card4.label': 'Precisión de Validación',
            'metrics.card4.trend': 'Blockchain verified',

            'process.title': 'Data Flow. Nuestro Protocolo de Fidelidad.',
            'process.step1.title': 'Acopio y Calibración Digital',
            'process.step1.text': 'Inspección de calidad y registro de variables Brix/pH. Los datos se digitalizan en la Cosecha Zero.',
            'process.step2.title': 'Generación de Hash y Cierre',
            'process.step2.text': 'Los datos de lote se combinan para generar el Hash SHA-256. El paquete es sellado para garantizar la integridad.',
            'process.step3.title': 'Auditoría en Cadena de Frío',
            'process.step3.text': 'Monitoreo continuo. La validación ZTD confirma que el Hash ha permanecido inalterado hasta la entrega final.',

            'techEdge.title': 'Ventaja Tecnológica AgroBridge',
            'techEdge.subtitle': 'Diseño operativo centrado en trazabilidad, continuidad de datos y evidencia utilizable en decisiones comerciales.',
            'techFlow.farm': 'Campo',
            'techFlow.packing': 'Empaque',
            'techFlow.export': 'Exportación',
            'techFlow.delivery': 'Entrega',
            'techPillar.badge': 'Tecnología propietaria',
            'techPillar.zeroLoss.titleHtml': 'AgroBridge <span>ZeroLoss™</span> Protocol',
            'techPillar.zeroLoss.description': 'Protocolo propietario de cero pérdida de trazabilidad. Cada punto de datos se registra criptográficamente para conservar integridad total desde cosecha hasta entrega.',
            'techPillar.trustChain.titleHtml': '<span>TrustChain™</span> (SHA-256)',
            'techPillar.trustChain.description': 'Cadena de confianza inmutable de origen a destino. Cifrado SHA-256 de nivel empresarial para detectar cualquier alteración de datos.',
            'techPillar.coldChain.titleHtml': 'Monitoreo de <span>Cadena de Frío</span>',
            'techPillar.coldChain.description': 'Sensores IoT en tiempo real supervisan temperatura, humedad y condiciones de transporte para proteger calidad 24/7.',
            'cases.title': 'Casos de Éxito',
            'cases.subtitle': 'Clientes enterprise que confían en AgroBridge para sus operaciones globales.',
            'cases.eu.title': 'Distribuidor Europeo - Luxemburgo',
            'cases.eu.metric': '+500 toneladas',
            'cases.eu.description': 'Berries premium exportadas con trazabilidad TrustChain™. Cero rechazos en aduanas europeas.',
            'cases.asia.title': 'Importador Asiático - China',
            'cases.asia.metric': '98.5% frescura',
            'cases.asia.description': 'Aguacate Hass con protocolo ZeroLoss™. Vida de anaquel optimizada para tránsitos de más de 30 días.',
            'cases.mena.title': 'Cadena Premium - Emiratos',
            'cases.mena.metric': 'Monitoreo 24/7',
            'cases.mena.description': 'Cold Chain IoT activo. Monitoreo en tiempo real desde Michoacán hasta Dubái.',
            'producer.titleHtml': '+40 Socios. <span class="producer-title-accent">La Verdadera Extensión de AgroBridge.</span>',
            'producer.subtitle': 'Nuestra red de productores certificados respalda continuidad de suministro y calidad de exportación en cada temporada.',
            'producer.cta': 'Iniciar Evaluación Comercial',

            'validation.badge': 'Powered by TrustChain™',
            'validation.title': 'Verificación Criptográfica de Lote',
            'validation.subtitle': 'Verifique en segundos origen, certificaciones, cadena de frío y evidencia hash de cualquier lote.',
            'validation.scan.text': 'Verificando en TrustChain™...',
            'validation.scan.initial': 'Conectando con blockchain...',
            'validation.scan.step.connect': 'Conectando con TrustChain™...',
            'validation.scan.step.hash': 'Verificando hash SHA-256...',
            'validation.scan.step.origin': 'Consultando registro de origen...',
            'validation.scan.step.cold': 'Validando cadena de frío...',
            'validation.scan.step.certificate': 'Generando certificado...',
            'validation.demo': 'Ver Demo',
            'search.button': 'Verificar Origen',
            'search.placeholder': 'Ingrese código de lote...',
            'search.aria': 'Código de trazabilidad',
            'search.hint': 'Formato: AB-HASS-2026-001 | Prueba los ejemplos abajo',
            'search.examples': 'Prueba con:',
            'search.example.avocado': 'Aguacate Hass',
            'search.example.strawberry': 'Fresas',
            'search.example.blueberry': 'Arándanos',
            'search.example.blackberry': 'Zarzamoras',
            'search.example.raspberry': 'Frambuesas',

            'status.ready': 'Listo para verificar',
            'status.verifying': 'Verificando...',
            'status.verified': 'Origen Verificado',
            'status.error': 'Atención requerida',

            'validation.timeline.harvest': 'Cosecha',
            'validation.timeline.packing': 'Empaque',
            'validation.timeline.cold': 'Cadena de frío',
            'validation.timeline.export': 'Exportación',
            'validation.timeline.verified': 'Verificado',
            'validation.timeline.now': 'Ahora',
            'validation.metric.brix': 'Índice Brix',
            'validation.metric.dryMatter': 'Materia seca',
            'validation.metric.ph': 'Nivel pH',
            'validation.metric.temp': 'Temp. promedio',
            'validation.metric.quality': 'Score calidad',
            'validation.seal.title': 'ORIGEN VERIFICADO - TrustChain™',
            'validation.seal.prefix': 'SHA-256: ',
            'validation.reset': 'Validar otro lote',
            'validation.cert.verified': 'Verificado',
            'validation.product.default': 'Producto certificado',
            'validation.product.varietyPrefix': 'Variedad: ',
            'validation.product.producerPrefix': 'Productor: ',
            'validation.result.banner': '✅ LOTE VERIFICADO - INTEGRIDAD GARANTIZADA',
            'validation.detail.product': 'Producto',
            'validation.detail.origin': 'Origen',
            'validation.detail.harvest': 'Cosecha',
            'validation.detail.export': 'Exportación',
            'validation.detail.destination': 'Destino',
            'validation.detail.hash': 'Hash Blockchain',
            'validation.detail.temp': 'Temperatura',
            'validation.detail.quality': 'Calidad',

            'error.empty': 'Por favor ingrese un código de lote',
            'error.format': 'Formato inválido. Use letras, números y guiones.',
            'error.connection': 'Error de conexión. Intente nuevamente.',
            'error.notfound': 'Lote no encontrado en el sistema.',
            'error.ratelimit': 'Espere un momento antes de verificar nuevamente.',
            'error.timeout': 'La solicitud ha expirado. Por favor intente de nuevo.',
            'error.generic': 'Ocurrió un error inesperado.',

            'validation.error.empty.title': 'Código requerido',
            'validation.error.empty.message': 'Ingrese un código de lote para iniciar la verificación.',
            'validation.error.empty.suggestion': 'Pruebe con: AB-HASS-2026-001',
            'validation.error.format.title': 'Formato inválido',
            'validation.error.format.message': 'Use el formato: AB-XXXX-YYYY-NNN',
            'validation.error.format.suggestion': 'Ejemplo válido: AB-FRES-2026-001',
            'validation.error.notfound.title': 'Código no encontrado',
            'validation.error.notfound.message': 'El lote no aparece en nuestra red de trazabilidad.',
            'validation.error.notfound.suggestion': 'Códigos demo: AB-HASS-2026-001, AB-ARAN-2026-045',
            'validation.error.connection.title': 'Error de conexión',
            'validation.error.connection.message': 'No fue posible completar la consulta. Intente nuevamente.',

            'contact.title': 'Converse con Nuestro Equipo Comercial',
            'contact.subtitle': 'Atendemos oportunidades de volumen para importadores, distribuidores y cadenas premium.',
            'contact.form.aria': 'Formulario de contacto enterprise',
            'form.label.name': 'Nombre Completo *',
            'form.label.company': 'Empresa *',
            'form.label.email': 'Email Corporativo *',
            'form.label.phone': 'Teléfono / WhatsApp *',
            'form.label.type': 'Tipo de Consulta *',
            'form.label.message': 'Mensaje *',
            'form.placeholder.name': 'Su nombre completo',
            'form.placeholder.company': 'Nombre de su empresa',
            'form.placeholder.email': 'correo@empresa.com',
            'form.placeholder.phone': '+52 XXX XXX XXXX',
            'form.placeholder.message': 'Describa su solicitud',
            'form.option.select': 'Seleccione tipo de consulta',
            'form.option.quote': 'Cotización Enterprise',
            'form.option.partnership': 'Partnership / Alianza Comercial',
            'form.option.info': 'Información General',

            'form.required': 'Por favor complete todos los campos requeridos.',
            'form.invalid_email': 'Por favor ingrese un email válido.',
            'form.message_short': 'Por favor ingrese un mensaje más detallado.',
            'form.sending': 'Enviando...',
            'form.success': '¡Solicitud enviada! Nos contactaremos pronto.',
            'form.error': 'Error al enviar. Intente nuevamente.',
            'form.recaptcha': 'reCAPTCHA no configurado. Intente más tarde.',
            'form.submit': 'Solicitar Cotización Enterprise',

            'contact.inquiry.product': 'Cotización Enterprise',
            'contact.inquiry.partnership': 'Partnership / Alianza Comercial',
            'contact.inquiry.support': 'Soporte',
            'contact.inquiry.other': 'Información General',
            'contact.message.autogen': 'Solicitud enterprise desde el sitio web.\nEmpresa: {company}\nTeléfono: {phone}\nTipo: {inquiry}',

            'footer.copy': '© 2026 AGRO BRIDGE. Propiedad Intelectual Corporativa. | Zamora, Michoacán, México.',
            'footer.execContact': 'Contacto Ejecutivo',
            'footer.instagram': 'Síguenos en Instagram',
            'footer.ztd': 'ZTD Protocol',
            'footer.privacy': 'Privacidad',
            'footer.terms': 'Términos',
            'footer.cookies': 'Cookies',
            'whatsapp.tooltip': 'Cotización Inmediata',
            'whatsapp.aria': 'Contactar por WhatsApp Business'
        },
        en: {
            'skip.content': 'Skip to main content',
            'menu.open': 'Open navigation menu',
            'language.label': 'Select language',
            'language.review': 'This language is under editorial review. Showing the English version for now.',
            'notification.close': 'Close notification',

            'nav.home': 'Home',
            'nav.portfolio': 'Portfolio',
            'nav.technology': 'Technology',
            'nav.cases': 'Case Studies',
            'nav.contact': 'Contact',
            'nav.mainAria': 'Main navigation',

            'hero.title': 'Agricultural Excellence',
            'hero.headline': 'Premium Traceability for Global Exports.',
            'hero.titleAccent': 'Verifiable Trust.',
            'hero.subtitle': 'From Michoacán to international markets with technical evidence of origin, quality, and chain of custody in every lot.',
            'hero.ctaPrimary': 'Speak with a Senior Advisor',
            'hero.ctaSecondary': 'Live Verification',
            'hero.proofLabel.integrity': 'Integrity',
            'hero.proofValue.integrity': 'Verifiable hash',
            'hero.proofLabel.compliance': 'Compliance',
            'hero.proofValue.compliance': 'Traceable documentation',
            'hero.proofLabel.coldChain': 'Cold chain',
            'hero.proofValue.coldChain': 'Continuous monitoring',
            'hero.proofLabel.support': 'Support',
            'hero.proofValue.support': 'Executive team',
            'hero.proof.aria': 'Key trust indicators',

            'section.trustInfraTitle': 'Trust Infrastructure for Premium Buyers',
            'section.feature.crypto.title': 'Cryptographic Traceability',
            'section.feature.crypto.text': 'Every lot movement is recorded with verifiable evidence for commercial and regulatory audits.',
            'section.feature.quality.title': 'Quality and Cold-Chain Control',
            'section.feature.quality.text': 'Thermal supervision and origin quality metrics to sustain specifications during international transit.',
            'section.feature.enterprise.title': 'Enterprise Operations',
            'section.feature.enterprise.text': 'Technical standardization for high-volume contracts with clear response times and auditable processes.',
            'section.portfolioTitle': 'Export Portfolio with Technical Specification',
            'product.hass.aria': 'Premium Hass avocado - Certified product',
            'product.hass.title': 'Hass Avocado for Premium Supply Programs',
            'product.hass.text': 'Ripeness, firmness, and documented traceability ready for demanding retail chains and distributors.',
            'product.berries.aria': 'Selected berries - Elite export grade',
            'product.berries.title': 'Selected Export Berries',
            'product.berries.text': 'Strawberry, blueberry, raspberry, and blackberry with technical lot control for high-value international markets.',

            'techProof.title': 'Active Field and Export Operations',
            'techProof.subtitle': 'Digital infrastructure deployed by certified producers in Mexico',
            'techProof.stats.activeLots': 'Active Lots',
            'techProof.stats.producers': 'Producers',
            'techProof.stats.precision': 'Precision',
            'techProof.note': 'Live Enterprise dashboard',
            'techProof.showcaseTitle': 'Operational Visibility for International Clients',
            'techProof.point.api': '150+ functional API endpoints',
            'techProof.point.blockchain': 'Real-time blockchain traceability',
            'techProof.point.certs': 'Automated certification validation',
            'techProof.point.gps': 'GPS origin monitoring per product',
            'techProof.link': 'View Live Dashboard',

            'metrics.card1.label': 'Validated Lots',
            'metrics.card1.trend': '+342 this month',
            'metrics.card2.label': 'Certified Producers',
            'metrics.card2.trend': '+8 this quarter',
            'metrics.card3.label': 'Monitored Hectares',
            'metrics.card3.trend': 'Michoacán, Jalisco, Guanajuato',
            'metrics.card4.label': 'Validation Accuracy',
            'metrics.card4.trend': 'Blockchain verified',

            'process.title': 'Data Flow. Our Fidelity Protocol.',
            'process.step1.title': 'Collection and Digital Calibration',
            'process.step1.text': 'Quality inspection and Brix/pH variable registration. Data is digitized at zero-defect harvest.',
            'process.step2.title': 'Hash Generation and Sealing',
            'process.step2.text': 'Lot data is combined to generate the SHA-256 hash. The package is sealed to guarantee integrity.',
            'process.step3.title': 'Cold-Chain Audit',
            'process.step3.text': 'Continuous monitoring. ZTD validation confirms the hash remained unaltered until final delivery.',

            'techEdge.title': 'AgroBridge Technology Edge',
            'techEdge.subtitle': 'Operational design focused on traceability, data continuity, and evidence usable in commercial decisions.',
            'techFlow.farm': 'Farm',
            'techFlow.packing': 'Packing',
            'techFlow.export': 'Export',
            'techFlow.delivery': 'Delivery',
            'techPillar.badge': 'Proprietary technology',
            'techPillar.zeroLoss.titleHtml': 'AgroBridge <span>ZeroLoss™</span> Protocol',
            'techPillar.zeroLoss.description': 'Proprietary zero-loss traceability protocol. Every data point is cryptographically recorded to preserve full integrity from harvest to delivery.',
            'techPillar.trustChain.titleHtml': '<span>TrustChain™</span> (SHA-256)',
            'techPillar.trustChain.description': 'Immutable trust chain from origin to destination. Enterprise-grade SHA-256 encryption detects any data tampering.',
            'techPillar.coldChain.titleHtml': '<span>Cold Chain</span> Monitoring',
            'techPillar.coldChain.description': 'Real-time IoT sensors track temperature, humidity, and transport conditions to protect quality 24/7.',
            'cases.title': 'Case Studies',
            'cases.subtitle': 'Enterprise clients relying on AgroBridge for global supply operations.',
            'cases.eu.title': 'European Distributor - Luxembourg',
            'cases.eu.metric': '+500 tons',
            'cases.eu.description': 'Premium berries exported with TrustChain™ traceability. Zero rejection events at EU customs.',
            'cases.asia.title': 'Asian Importer - China',
            'cases.asia.metric': '98.5% freshness',
            'cases.asia.description': 'Hass avocado under the ZeroLoss™ protocol. Shelf life optimized for transit windows above 30 days.',
            'cases.mena.title': 'Premium Chain - UAE',
            'cases.mena.metric': '24/7 monitoring',
            'cases.mena.description': 'Active IoT cold-chain controls. Real-time monitoring from Michoacán to Dubai.',
            'producer.titleHtml': '40+ Partners. <span class="producer-title-accent">The True Extension of AgroBridge.</span>',
            'producer.subtitle': 'Our certified producer network ensures supply continuity and export-grade quality every season.',
            'producer.cta': 'Start Commercial Assessment',

            'validation.badge': 'Powered by TrustChain™',
            'validation.title': 'Cryptographic Lot Verification',
            'validation.subtitle': 'Verify origin, certifications, cold chain, and hash evidence for any lot in seconds.',
            'validation.scan.text': 'Verifying on TrustChain™...',
            'validation.scan.initial': 'Connecting to blockchain...',
            'validation.scan.step.connect': 'Connecting to TrustChain™...',
            'validation.scan.step.hash': 'Verifying SHA-256 hash...',
            'validation.scan.step.origin': 'Querying origin registry...',
            'validation.scan.step.cold': 'Validating cold chain...',
            'validation.scan.step.certificate': 'Generating certificate...',
            'validation.demo': 'Run Demo',
            'search.button': 'Verify Origin',
            'search.placeholder': 'Enter lot code...',
            'search.aria': 'Traceability code',
            'search.hint': 'Format: AB-HASS-2026-001 | Try the examples below',
            'search.examples': 'Try with:',
            'search.example.avocado': 'Hass Avocado',
            'search.example.strawberry': 'Strawberries',
            'search.example.blueberry': 'Blueberries',
            'search.example.blackberry': 'Blackberries',
            'search.example.raspberry': 'Raspberries',

            'status.ready': 'Ready to verify',
            'status.verifying': 'Verifying...',
            'status.verified': 'Origin Verified',
            'status.error': 'Action required',

            'validation.timeline.harvest': 'Harvest',
            'validation.timeline.packing': 'Packing',
            'validation.timeline.cold': 'Cold Chain',
            'validation.timeline.export': 'Export',
            'validation.timeline.verified': 'Verified',
            'validation.timeline.now': 'Now',
            'validation.metric.brix': 'Brix Index',
            'validation.metric.dryMatter': 'Dry matter',
            'validation.metric.ph': 'pH level',
            'validation.metric.temp': 'Average temp.',
            'validation.metric.quality': 'Quality score',
            'validation.seal.title': 'ORIGIN VERIFIED - TrustChain™',
            'validation.seal.prefix': 'SHA-256: ',
            'validation.reset': 'Validate another lot',
            'validation.cert.verified': 'Verified',
            'validation.product.default': 'Certified product',
            'validation.product.varietyPrefix': 'Variety: ',
            'validation.product.producerPrefix': 'Producer: ',
            'validation.result.banner': '✅ LOT VERIFIED - INTEGRITY GUARANTEED',
            'validation.detail.product': 'Product',
            'validation.detail.origin': 'Origin',
            'validation.detail.harvest': 'Harvest',
            'validation.detail.export': 'Export',
            'validation.detail.destination': 'Destination',
            'validation.detail.hash': 'Blockchain hash',
            'validation.detail.temp': 'Temperature',
            'validation.detail.quality': 'Quality',

            'error.empty': 'Please enter a lot code',
            'error.format': 'Invalid format. Use letters, numbers, and dashes.',
            'error.connection': 'Connection error. Please try again.',
            'error.notfound': 'Lot not found in the system.',
            'error.ratelimit': 'Please wait before verifying again.',
            'error.timeout': 'Request timed out. Please try again.',
            'error.generic': 'An unexpected error occurred.',

            'validation.error.empty.title': 'Code required',
            'validation.error.empty.message': 'Enter a lot code to start verification.',
            'validation.error.empty.suggestion': 'Try: AB-HASS-2026-001',
            'validation.error.format.title': 'Invalid format',
            'validation.error.format.message': 'Use the format: AB-XXXX-YYYY-NNN',
            'validation.error.format.suggestion': 'Valid example: AB-FRES-2026-001',
            'validation.error.notfound.title': 'Code not found',
            'validation.error.notfound.message': 'This lot is not in our traceability network.',
            'validation.error.notfound.suggestion': 'Demo codes: AB-HASS-2026-001, AB-ARAN-2026-045',
            'validation.error.connection.title': 'Connection error',
            'validation.error.connection.message': 'The request could not be completed. Please try again.',

            'contact.title': 'Speak with Our Commercial Team',
            'contact.subtitle': 'We support volume opportunities for importers, distributors, and premium retail chains.',
            'contact.form.aria': 'Enterprise contact form',
            'form.label.name': 'Full name *',
            'form.label.company': 'Company *',
            'form.label.email': 'Business email *',
            'form.label.phone': 'Phone / WhatsApp *',
            'form.label.type': 'Inquiry type *',
            'form.label.message': 'Message *',
            'form.placeholder.name': 'Your full name',
            'form.placeholder.company': 'Your company name',
            'form.placeholder.email': 'email@company.com',
            'form.placeholder.phone': '+1 XXX XXX XXXX',
            'form.placeholder.message': 'Describe your request',
            'form.option.select': 'Select inquiry type',
            'form.option.quote': 'Enterprise quote',
            'form.option.partnership': 'Partnership',
            'form.option.info': 'General information',

            'form.required': 'Please complete all required fields.',
            'form.invalid_email': 'Please enter a valid email address.',
            'form.message_short': 'Please provide a more detailed message.',
            'form.sending': 'Sending...',
            'form.success': 'Request sent! We will contact you soon.',
            'form.error': 'Submission failed. Please try again.',
            'form.recaptcha': 'reCAPTCHA is not configured. Please try later.',
            'form.submit': 'Request Enterprise Quote',

            'contact.inquiry.product': 'Enterprise quote',
            'contact.inquiry.partnership': 'Partnership',
            'contact.inquiry.support': 'Support',
            'contact.inquiry.other': 'General information',
            'contact.message.autogen': 'Enterprise request from website.\nCompany: {company}\nPhone: {phone}\nType: {inquiry}',

            'footer.copy': '© 2026 AGRO BRIDGE. Corporate Intellectual Property. | Zamora, Michoacán, Mexico.',
            'footer.execContact': 'Executive contact',
            'footer.instagram': 'Follow us on Instagram',
            'footer.ztd': 'ZTD Protocol',
            'footer.privacy': 'Privacy',
            'footer.terms': 'Terms',
            'footer.cookies': 'Cookies',
            'whatsapp.tooltip': 'Instant quote',
            'whatsapp.aria': 'Contact on WhatsApp Business'
        },
        zh: {
            'language.review': '此语言正在人工审核中，当前显示英文版本。'
        },
        ar: {
            'language.review': 'هذه اللغة قيد المراجعة التحريرية. يتم عرض النسخة الإنجليزية مؤقتًا.'
        },
        ja: {
            'language.review': 'この言語は現在レビュー中です。現在は英語版を表示しています。'
        }
    };

    var reviewRequiredLangs = ['zh', 'ar', 'ja'];
    var storageAccessWarned = false;

    function getStoredLanguage() {
        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                return null;
            }
            return window.localStorage.getItem('agrobridge-lang');
        } catch (error) {
            if (!storageAccessWarned && window.AgroBridgeUtils && typeof window.AgroBridgeUtils.warn === 'function') {
                window.AgroBridgeUtils.warn('i18n: localStorage getItem unavailable, using in-memory language only.');
                storageAccessWarned = true;
            }
            return null;
        }
    }

    function persistLanguage(lang) {
        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                return false;
            }
            window.localStorage.setItem('agrobridge-lang', lang);
            return true;
        } catch (error) {
            if (!storageAccessWarned && window.AgroBridgeUtils && typeof window.AgroBridgeUtils.warn === 'function') {
                window.AgroBridgeUtils.warn('i18n: localStorage setItem unavailable, language will not persist.');
                storageAccessWarned = true;
            }
            return false;
        }
    }

    function resolveLanguage(currentLang) {
        if (reviewRequiredLangs.indexOf(currentLang) !== -1) {
            return 'en';
        }
        return currentLang;
    }

    function t(currentLang, key) {
        var activeLang = resolveLanguage(currentLang);
        return (translations[activeLang] && translations[activeLang][key]) ||
               (translations[currentLang] && translations[currentLang][key]) ||
               (translations.en && translations.en[key]) ||
               (translations.es && translations.es[key]) ||
               key;
    }

    function sanitizeHtml(html) {
        return html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/\bon\w+\s*=/gi, 'data-blocked=');
    }

    function applyI18nToDom(lang) {
        document.querySelectorAll('[data-i18n]').forEach(function(element) {
            var key = element.getAttribute('data-i18n');
            var translated = t(lang, key);
            if (translated !== key) {
                element.textContent = translated;
            }
        });

        document.querySelectorAll('[data-i18n-html]').forEach(function(element) {
            var key = element.getAttribute('data-i18n-html');
            var translated = t(lang, key);
            if (translated !== key) {
                element.innerHTML = sanitizeHtml(translated);
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(function(element) {
            var key = element.getAttribute('data-i18n-placeholder');
            var translated = t(lang, key);
            if (translated !== key) {
                element.setAttribute('placeholder', translated);
            }
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach(function(element) {
            var key = element.getAttribute('data-i18n-aria-label');
            var translated = t(lang, key);
            if (translated !== key) {
                element.setAttribute('aria-label', translated);
            }
        });

        document.querySelectorAll('[data-i18n-title]').forEach(function(element) {
            var key = element.getAttribute('data-i18n-title');
            var translated = t(lang, key);
            if (translated !== key) {
                element.setAttribute('title', translated);
            }
        });
    }

    function updateStatusText(lang) {
        var statusText = document.getElementById('status-text');
        var statusIndicator = document.getElementById('status-indicator');
        if (!statusText || !statusIndicator) {
            return;
        }

        var key = 'status.ready';
        if (statusIndicator.classList.contains('status-indicator--scanning')) {
            key = 'status.verifying';
        } else if (statusIndicator.classList.contains('status-indicator--verified')) {
            key = 'status.verified';
        } else if (statusIndicator.classList.contains('status-indicator--error')) {
            key = 'status.error';
        }

        statusText.textContent = t(lang, key);
    }

    function initLanguageSystem(app) {
        app.translations = translations;
        app.reviewRequiredLangs = reviewRequiredLangs.slice();
        if (!app._reviewLanguageNoticeShown) {
            app._reviewLanguageNoticeShown = {};
        }

        var savedLang = getStoredLanguage();
        if (savedLang && translations[savedLang]) {
            switchLanguage(app, savedLang);
        } else {
            switchLanguage(app, app.currentLang || 'es');
        }
    }

    function switchLanguage(app, lang) {
        if (!translations[lang]) return;

        app.currentLang = lang;
        persistLanguage(lang);

        var resolvedLang = resolveLanguage(lang);
        document.documentElement.setAttribute('lang', resolvedLang);
        document.documentElement.setAttribute('data-ui-language', lang);

        document.querySelectorAll('select[id*="lang-select"]').forEach(function(select) {
            select.value = lang;
        });

        applyI18nToDom(lang);
        updateStatusText(lang);

        if (reviewRequiredLangs.indexOf(lang) !== -1 && !app._reviewLanguageNoticeShown[lang]) {
            if (window.AgroBridgeUI && typeof window.AgroBridgeUI.showNotification === 'function') {
                window.AgroBridgeUI.showNotification(t(lang, 'language.review'), 'info');
            }
            app._reviewLanguageNoticeShown[lang] = true;
        }
    }

    return {
        translations: translations,
        reviewRequiredLangs: reviewRequiredLangs,
        resolveLanguage: resolveLanguage,
        t: t,
        initLanguageSystem: initLanguageSystem,
        switchLanguage: switchLanguage
    };
})();
