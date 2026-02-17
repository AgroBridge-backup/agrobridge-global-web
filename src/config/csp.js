const JSON_LD_SCRIPT_HASH = "'sha256-OMsjk0Rr0y2j21NMPqmahkA84vQQcv30MpieOtJnIs8='";

const cspDirectives = Object.freeze({
  defaultSrc: ["'self'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  objectSrc: ["'none'"],
  frameAncestors: ["'none'"],
  scriptSrc: [
    "'self'",
    JSON_LD_SCRIPT_HASH,
    'https://www.google.com/recaptcha/',
    'https://www.gstatic.com/recaptcha/',
    'https://browser.sentry-cdn.com',
    'https://cdn.jsdelivr.net',
    'https://www.googletagmanager.com',
  ],
  styleSrc: [
    "'self'",
    'https://fonts.googleapis.com',
  ],
  imgSrc: ["'self'", 'data:', 'https:'],
  connectSrc: [
    "'self'",
    'https://api.agrobridge.global',
    'https://staging-api.agrobridge.global',
    'https://www.google.com/recaptcha/',
    'https://www.gstatic.com/recaptcha/',
    'https://browser.sentry-cdn.com',
    'https://*.ingest.sentry.io',
  ],
  fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  frameSrc: [
    "'self'",
    'https://www.google.com/recaptcha/',
    'https://recaptcha.google.com/recaptcha/',
  ],
  manifestSrc: ["'self'"],
  mediaSrc: ["'self'"],
  workerSrc: ["'self'", 'blob:'],
  upgradeInsecureRequests: [],
});

const toDirectiveName = (key) => key.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);

const serializeCspDirectives = (directives = cspDirectives) => Object.entries(directives)
  .map(([key, values]) => {
    const directiveName = toDirectiveName(key);
    if (!Array.isArray(values) || values.length === 0) {
      return directiveName;
    }

    return `${directiveName} ${values.join(' ')}`;
  })
  .join('; ');

const cspHeaderValue = serializeCspDirectives(cspDirectives);

export {
  JSON_LD_SCRIPT_HASH,
  cspDirectives,
  cspHeaderValue,
  serializeCspDirectives,
};

export default cspDirectives;
