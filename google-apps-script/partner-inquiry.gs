/**
 * Level Up Live — Partner inquiry form → Google Sheet
 *
 * Setup:
 * 1. New Google Sheet (e.g. "Level Up Live Partner Inquiries").
 * 2. Extensions → Apps Script → replace Code.gs with this file.
 * 3. Run setupSheet (authorize when prompted).
 * 4. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web app URL (/exec) into content/data/partner-form-config.js
 */

var SHEET_NAME = 'Submissions';

var HEADERS = [
  'Timestamp',
  'Name',
  'Company Name',
  'Phone',
  'Position',
  'Company Address',
  'Venue Type',
  'Food & Beverage',
  'Timeline',
  'Budget',
  'Page URL'
];

function getSubmissionSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function setupSheet() {
  var sheet = getSubmissionSheet_();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    setupSheet();
    var sheet = getSubmissionSheet_();
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    sheet.appendRow([
      new Date(),
      String(body.name || '').trim(),
      String(body.companyName || '').trim(),
      String(body.phone || '').trim(),
      String(body.position || '').trim(),
      String(body.companyAddress || '').trim(),
      String(body.venueType || '').trim(),
      String(body.foodBeverage || '').trim(),
      String(body.timeline || '').trim(),
      String(body.budget || '').trim(),
      String(body.pageUrl || '').trim()
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, message: 'Level Up Live partner form endpoint' })
  ).setMimeType(ContentService.MimeType.JSON);
}
