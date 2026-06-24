# AgroBridge Global - Plataforma ZTD de Trazabilidad Agricola

Sistema de trazabilidad Zero-Trust Data (ZTD) para exportaciones agricolas mexicanas (aguacates, berries). Utiliza hashing criptografico SHA-256 para crear registros de auditoria inmutables desde la cosecha hasta la exportacion.

## Autor

**Alejandro Navarro Ayala** - CEO & Founder, AgroBridge

## Arquitectura del Repositorio

```
├── public_html/              # Frontend (servido estaticamente en Netlify)
│   ├── index.html            # Pagina principal
│   ├── config-production.js  # Configuracion de produccion
│   ├── scripts/              # 12 modulos JS del navegador
│   │   ├── app.js            # Inicializacion de la aplicacion
│   │   ├── contact.js        # Formulario de contacto y reCAPTCHA
│   │   ├── demo-data.js      # Datos de demostracion
│   │   ├── i18n.js           # Internacionalizacion (es/en)
│   │   ├── main.js           # Punto de entrada principal
│   │   ├── ui.js             # Componentes de interfaz
│   │   ├── utils.js          # Utilidades compartidas
│   │   ├── validation.js     # Validacion de lotes
│   │   ├── legal-core.js     # Motor de paginas legales
│   │   ├── legal-utils.js    # Utilidades legales
│   │   ├── legal-animations.js # Animaciones legales
│   │   └── legal-consent.js  # Gestion de consentimiento
│   ├── styles/               # CSS de paginas legales
│   │   ├── legal-base.css
│   │   ├── legal-components.css
│   │   ├── legal-layouts.css
│   │   ├── legal-animations.css
│   │   ├── legal-print.css
│   │   └── legal-utilities.css
│   ├── assets/               # CSS principal + recursos estaticos
│   │   ├── main.css          # Estilos principales
│   │   ├── critical.css      # CSS critico (above-the-fold)
│   │   ├── utilities.css     # Clases utilitarias
│   │   ├── accesibility.css  # Estilos de accesibilidad
│   │   └── compatibility.css # Compatibilidad entre navegadores
│   ├── legal/                # Paginas legales (privacidad, terminos, etc.)
├── src/                      # Backend (Node.js/Express)
│   ├── index.js              # Punto de entrada del servidor
│   ├── config/index.js       # Configuracion con validacion de secretos
│   ├── middleware/
│   │   ├── auth.js           # Autenticacion JWT
│   │   ├── security.js       # Helmet, CORS, rate limiting, CSRF
│   │   ├── validation.js     # Validacion de requests
│   │   └── errorHandler.js   # Manejo centralizado de errores
│   ├── routes/admin.js       # Rutas API admin
│   ├── services/authService.js # Logica de autenticacion
│   └── utils/
│       ├── logger.js         # Logging con Winston
│       └── shutdown.js       # Graceful shutdown
└── tests/
    ├── unit/                 # Tests unitarios (Jest)
    ├── integration/          # Tests de integracion
    ├── accessibility/        # Tests de accesibilidad
    └── e2e/                  # Tests E2E (Playwright)
```

## Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0

## Instalacion

```bash
npm install
```

## Scripts de Desarrollo

```bash
# Servidor de desarrollo (nodemon con auto-restart)
npm run dev

# Servidor de produccion
npm run start:prod

# Tests
npm test                   # Todos los tests con cobertura
npm run test:unit          # Solo tests unitarios
npm run test:integration   # Tests de integracion
npm run test:a11y          # Tests de accesibilidad
npm run test:e2e           # Tests E2E con Playwright
npm run test:watch         # Modo watch
```

## Configuracion

Copia `.env.example` a `.env` y configura:

```bash
# Secretos requeridos (genera con: openssl rand -base64 64)
JWT_ACCESS_SECRET=<64+ caracteres>
JWT_REFRESH_SECRET=<64+ caracteres, diferente al access>
CSRF_SECRET=<32+ caracteres>
MONGODB_URI=mongodb://localhost:27017/agrobridge
```

## Dependencias Principales

| Dependencia | Proposito |
|---|---|
| express | Framework web |
| helmet | Headers de seguridad HTTP |
| cors | Control de acceso CORS |
| csrf-csrf | Proteccion CSRF |
| jsonwebtoken | Autenticacion JWT dual (access + refresh) |
| express-rate-limit | Limitacion de requests |
| ioredis + rate-limit-redis | Rate limiting con Redis |
| mongoose | ODM para MongoDB |
| winston | Logging |
| bcryptjs | Hashing de passwords |
| express-mongo-sanitize | Prevencion de inyeccion NoSQL |

## Seguridad

- JWT dual con secretos de 64+ caracteres (access: 15m, refresh: 7d)
- Proteccion CSRF con `csrf-csrf`
- Rate limiting: 100 req/15 min (Redis-backed en produccion)
- Helmet para CSP, HSTS, XSS protection
- Sanitizacion MongoDB contra inyeccion NoSQL
- Passwords: 12+ caracteres con requisitos de complejidad

## Despliegue

- **Frontend**: Netlify (directorio `public_html/`)
- **Backend API**: El backend separado vive en `~/Documents/agrobridge-global-backend`
- **CI/CD**: GitHub Actions (lint -> test -> deploy)

## API

Endpoints principales (ver `INTEGRATION.md` para detalles completos):

- `GET /v2/verify/:code` - Verificar trazabilidad de un lote
- `POST /v2/leads` - Enviar formulario de contacto
- `GET /api/csrf-token` - Obtener token CSRF

## Licencia

UNLICENSED - Propiedad privada de AGROBRIDGE S.A. de C.V.
