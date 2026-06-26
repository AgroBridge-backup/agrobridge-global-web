/**
 * Contact form submit-path tests
 * @description handleContactSubmit() is the lead-capture conversion path
 * (revenue). The success / validation-fail / reCAPTCHA-missing / server-error
 * / timeout branches previously had no unit coverage. Also covers the pure
 * inquiry-mapping helper.
 */
import { jest } from '@jest/globals';

const AgroBridgeApp = await global.loadAgroBridgeModules();
const contact = window.AgroBridgeContact;

describe('mapInquiryType', () => {
  test('maps known select values to API inquiry types', () => {
    expect(contact.mapInquiryType('cotizacion')).toBe('product');
    expect(contact.mapInquiryType('partnership')).toBe('partnership');
    expect(contact.mapInquiryType('informacion')).toBe('other');
    expect(contact.mapInquiryType('support')).toBe('support');
  });

  test('defaults unknown / missing values to "other"', () => {
    expect(contact.mapInquiryType('unknown')).toBe('other');
    expect(contact.mapInquiryType('')).toBe('other');
    expect(contact.mapInquiryType(undefined)).toBe('other');
  });
});

describe('handleContactSubmit', () => {
  let app, form, notifySpy;

  beforeEach(() => {
    global.testUtils.createMockDOM();
    app = new AgroBridgeApp();
    app._construct();
    form = document.getElementById('enterprise-form');
    const status = document.createElement('div');
    status.id = 'contact-status';
    form.appendChild(status);
    notifySpy = jest.spyOn(window.AgroBridgeUI, 'showNotification');
  });

  function fillForm(overrides = {}) {
    form.querySelector('[name="name"]').value = overrides.name ?? 'Alejandro Navarro';
    form.querySelector('[name="email"]').value = overrides.email ?? 'alex@agrobridge.global';
    form.querySelector('[name="company"]').value = overrides.company ?? 'AgroBridge Global';
    form.querySelector('[name="phone"]').value = overrides.phone ?? '+5215555555555';
    form.querySelector('[name="message"]').value = overrides.message ?? 'Solicito cotizacion enterprise para 40 contenedores de aguacate.';
    form.querySelector('[name="inquiry_type"]').value = overrides.inquiry_type ?? 'cotizacion';
  }

  function submitEvent() {
    return { preventDefault: jest.fn(), target: form };
  }

  test('rejects submission and notifies on validation failure (empty required fields)', async () => {
    await contact.handleContactSubmit(app, submitEvent());
    expect(notifySpy).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(fetch).not.toHaveBeenCalled();
  });

  test('succeeds in demo mode, notifies success, and resets the form', async () => {
    app.USE_DEMO_MODE = true;
    fillForm();
    jest.spyOn(window.AgroBridgeUtils, 'delay').mockResolvedValue(undefined);

    await contact.handleContactSubmit(app, submitEvent());

    expect(notifySpy).toHaveBeenCalledWith(expect.any(String), 'success');
    expect(form.querySelector('[name="name"]').value).toBe('');
  });

  test('fails in live mode when the reCAPTCHA token is unavailable', async () => {
    app.USE_DEMO_MODE = false;
    app.recaptchaSiteKey = '';
    fillForm();

    await contact.handleContactSubmit(app, submitEvent());

    expect(notifySpy).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(fetch).not.toHaveBeenCalled();
  });

  test('succeeds in live mode when token is present and the API accepts the lead', async () => {
    app.USE_DEMO_MODE = false;
    app.getRecaptchaToken = jest.fn().mockResolvedValue('fake-recaptcha-token');
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) });
    fillForm();

    await contact.handleContactSubmit(app, submitEvent());

    expect(app.getRecaptchaToken).toHaveBeenCalledWith(app.recaptchaAction);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(notifySpy).toHaveBeenCalledWith(expect.any(String), 'success');
    expect(form.querySelector('[name="email"]').value).toBe('');
  });

  test('surfaces the server error message when the API rejects with !ok', async () => {
    app.USE_DEMO_MODE = false;
    app.getRecaptchaToken = jest.fn().mockResolvedValue('tok');
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Email ya registrado' })
    });
    fillForm();

    await contact.handleContactSubmit(app, submitEvent());

    expect(notifySpy).toHaveBeenCalledWith('Email ya registrado', 'error');
  });

  test('reports a timeout when fetch aborts (REQUEST_TIMEOUT)', async () => {
    app.USE_DEMO_MODE = false;
    app.getRecaptchaToken = jest.fn().mockResolvedValue('tok');
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    fetch.mockRejectedValueOnce(abortError);
    fillForm();

    await contact.handleContactSubmit(app, submitEvent());

    expect(notifySpy).toHaveBeenCalledWith(expect.any(String), 'error');
  });
});
