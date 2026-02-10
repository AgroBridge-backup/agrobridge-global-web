# AgroBridge Frontend-Backend Integration Guide

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start backend with MongoDB
cd ../agrobridge-global-backend
docker-compose -f docker-compose.dev.yml up -d

# Seed test data
npm run seed:products

# Serve frontend
cd ../agrobridge-global-web
npx serve public_html -l 5000

# Open http://localhost:5000
# Test lot codes: AGR-2024-001, AGR-2024-002, AGR-2024-003, AGR-2024-004
```

### Option 2: Local MongoDB

```bash
# Start MongoDB (if installed via brew)
brew services start mongodb-community

# Or start MongoDB manually
mongod --dbpath /usr/local/var/mongodb

# Start backend
cd ../agrobridge-global-backend
cp .env.example .env  # Edit MONGODB_URI if needed
npm run dev

# In another terminal, seed data
npm run seed:products

# Serve frontend
cd ../agrobridge-global-web
npx serve public_html -l 5000
```

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│  Frontend (Web)  │────▶│  Backend (API)   │────▶│    MongoDB       │
│  localhost:5000  │     │  localhost:3000  │     │  localhost:27017 │
│                  │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
      │                         │
      │                         │
      ▼                         ▼
  public_html/              /v2/verify/:code
  scripts/main.js           /v2/leads
```

## API Endpoints

### Verify Lot Code

```
GET /v2/verify/:code

Response (success):
{
  "success": true,
  "valid": true,
  "message": "Lot code verified successfully",
  "data": {
    "lotCode": "AGR-2024-001",
    "productName": "Aguacate Hass Premium",
    "specifications": {
      "variety": "Hass",
      "origin": "Uruapan, Michoacán, México",
      "producer": "Rancho El Aguacate Dorado",
      "harvestDate": "2024-01-05",
      "exportDate": "2024-01-06",
      "destination": "Luxemburgo, UE",
      "brix": "11.5°",
      "ph": "6.2",
      "avgTemp": "5.2°C",
      "qualityScore": "9.8/10",
      "blockchainHash": "a7f3d2c1...",
      "timestamps": {
        "harvest": "05 Ene 06:30",
        "packing": "05 Ene 14:00",
        "cold": "05 Ene 16:00",
        "export": "06 Ene 08:00"
      },
      "certifications": [
        { "type": "SENASICA", "number": "MEX-AV-789012" },
        { "type": "GlobalGAP", "number": "4050000891234" }
      ],
      "qualityMetrics": {
        "dryMatter": "23.5%",
        "weight": "245g",
        "color": "Verde oscuro",
        "firmness": "Óptima"
      }
    },
    "location": {
      "country": "Mexico",
      "region": "Uruapan, Michoacán"
    }
  }
}

Response (not found):
{
  "success": false,
  "valid": false,
  "message": "Lot code not found or invalid",
  "data": null
}
```

### Submit Lead

```
POST /v2/leads

Request:
{
  "name": "John Doe",              // Required, 2-100 chars
  "email": "john@example.com",     // Required, valid email
  "message": "Enterprise inquiry", // Required, 10-2000 chars
  "recaptchaToken": "...",         // Required
  "company": "Acme Corp",          // Optional
  "phone": "+521234567890",        // Optional
  "inquiryType": "product",        // product|partnership|support|other
  "source": "website",             // website|referral|social|direct|other
  "honeypot": ""                   // Must be empty (spam prevention)
}

Response (success):
{
  "success": true,
  "message": "Lead submitted successfully",
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## Configuration

### Frontend (public_html/index.html)

The frontend auto-detects localhost and uses appropriate configuration:

```javascript
// Automatic for localhost:
window.AGROBRIDGE_API_BASE = 'http://localhost:3000/v2';
window.AGROBRIDGE_RECAPTCHA_SITE_KEY = '6LeIxAcT...'; // Google test key

// For production, set:
window.AGROBRIDGE_API_BASE = 'https://api.agrobridge.global/v2';
window.AGROBRIDGE_RECAPTCHA_SITE_KEY = 'YOUR_PRODUCTION_KEY';
```

### Backend (.env)

```bash
# Development
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/agrobridge_dev

# Google reCAPTCHA v3 test keys (always pass)
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

# Production
# MONGODB_URI=mongodb+srv://...
# RECAPTCHA_SECRET_KEY=your_real_secret
```

## Test Lot Codes

After running `npm run seed:products`:

| Code | Product | Origin |
|------|---------|--------|
| AGR-2024-001 | Aguacate Hass Premium | Uruapan, Michoacán |
| AGR-2024-002 | Aguacate Hass Orgánico | Tancítaro, Michoacán |
| AGR-2024-003 | Fresa Premium Zamora | Zamora, Michoacán |
| AGR-2024-004 | Arándano Azul Premium | Los Reyes, Michoacán |

## Data Flow

### Verification Flow

```
1. User enters lot code in search input
2. Frontend calls: GET /v2/verify/{code}
3. Backend queries MongoDB for product
4. Backend returns full traceability data
5. Frontend normalizes response via normalizeVerificationResponse()
6. UI renders product info, certifications, metrics, timeline
```

### Contact Form Flow

```
1. User fills contact form
2. Frontend validates required fields
3. Frontend gets reCAPTCHA token
4. Frontend calls: POST /v2/leads
5. Backend validates payload + reCAPTCHA
6. Backend stores lead in MongoDB
7. Backend sends email notification
8. Frontend shows success toast
```

## Troubleshooting

### "Network Error" on verification

- Check backend is running: `curl http://localhost:3000/health`
- Check CORS is configured: Backend should have `CORS_ORIGIN=*` for dev
- Check browser console for actual error

### "reCAPTCHA not configured"

- Ensure `AGROBRIDGE_RECAPTCHA_SITE_KEY` is set in HTML
- For dev, use Google's test key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`

### Empty verification results

- Ensure products are seeded: `npm run seed:products`
- Check lot code format: Must match `/^[A-Z0-9-]+$/`
- Check backend logs for errors

### Form submission fails

- Ensure all required fields: name, email, company, phone, inquiry_type
- Message is optional (auto-generated from inquiry type if omitted or under 10 characters)
- Check backend reCAPTCHA secret matches frontend site key

## Running E2E Tests

```bash
# Start backend + MongoDB (Docker)
cd ../agrobridge-global-backend
docker-compose -f docker-compose.dev.yml up -d
npm run seed:products

# Start frontend
cd ../agrobridge-global-web
npx serve public_html -l 5000 &

# Run integration tests
npx playwright test tests/e2e/integration.spec.js
```

## Production Deployment Checklist

- [ ] Set `AGROBRIDGE_API_BASE` to production API URL
- [ ] Set real reCAPTCHA site key (v3)
- [ ] Set `AGROBRIDGE_USE_DEMO = false`
- [ ] Configure CORS on backend for production domain
- [ ] Set real MongoDB connection string
- [ ] Set real reCAPTCHA secret key
- [ ] Configure email service (Resend)
- [ ] Set secure JWT secrets (access and refresh)
- [ ] Enable Redis for rate limiting (optional)
