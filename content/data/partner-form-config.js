/**
 * Partner inquiry form → Google Sheet
 *
 * 1. Create a Google Sheet (see google-apps-script/partner-inquiry.gs).
 * 2. Extensions → Apps Script → paste partner-inquiry.gs → Run setupSheet once.
 * 3. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 * 4. Copy the /exec URL and paste it below (ends with .../exec, not .../dev).
 */
window.LEVELUP_PARTNER_FORM = {
  endpoint: 'https://script.google.com/macros/s/AKfycbyOp_tV77MiN_bCr5HQiDFJxxsSOWgq85pqT0P4jQvmGWASOm5a55BHiuFY6mqsWTPq/exec'
};
