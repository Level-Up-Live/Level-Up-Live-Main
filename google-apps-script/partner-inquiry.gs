/**
 * Level Up Live — Partner inquiry form → Google Sheet
 *
 * Setup:
 * 1. New Google Sheet → Extensions → Apps Script → paste this file.
 * 2. Run setupSheet once (authorize when prompted).
 * 3. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone
 * 4. Copy the /exec URL into content/data/partner-form-config.js
 *
 * Optional: paste your Sheet ID from the URL (between /d/ and /edit) into SPREADSHEET_ID below.
 */

var SHEET_NAME = 'Submissions';

/** Leave blank to use the spreadsheet this script is bound to. */
var SPREADSHEET_ID = '';

var HEADERS = [
  'Timestamp',
  'Name',
  'Email',
  'Phone',
  'Company Name',
  'Website',
  'Position',
  'Street Address',
  'City',
  'State',
  'ZIP',
  'Venue Type',
  'Food & Beverage',
  'Timeline',
  'Budget',
  'Page URL'
];

function getSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSubmissionSheet_() {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function setupSheet() {
  var sheet = getSubmissionSheet_();
  if (sheet.getLastRow() < 1) {
    sheet.appendRow(HEADERS);
  } else {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
}

function parsePostBody_(e) {
  var body = {};
  if (!e) {
    return body;
  }
  if (e.parameter) {
    Object.keys(e.parameter).forEach(function (key) {
      body[key] = e.parameter[key];
    });
  }
  if (e.postData && e.postData.contents) {
    var type = String(e.postData.type || '').toLowerCase();
    var contents = String(e.postData.contents);
    if (type.indexOf('application/json') !== -1) {
      try {
        var jsonBody = JSON.parse(contents);
        Object.keys(jsonBody).forEach(function (key) {
          body[key] = jsonBody[key];
        });
      } catch (jsonErr) {}
    } else if (type.indexOf('application/x-www-form-urlencoded') !== -1) {
      contents.split('&').forEach(function (pair) {
        var idx = pair.indexOf('=');
        if (idx === -1) {
          return;
        }
        var key = decodeURIComponent(pair.slice(0, idx).replace(/\+/g, ' '));
        var val = decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, ' '));
        body[key] = val;
      });
    } else {
      try {
        var fallbackJson = JSON.parse(contents);
        Object.keys(fallbackJson).forEach(function (key) {
          body[key] = fallbackJson[key];
        });
      } catch (fallbackErr) {}
    }
  }
  return body;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    setupSheet();
    var sheet = getSubmissionSheet_();
    var body = parsePostBody_(e);

    if (!String(body.name || '').trim()) {
      throw new Error('Missing name');
    }
    if (!String(body.email || '').trim()) {
      throw new Error('Missing email');
    }

    sheet.appendRow([
      new Date(),
      String(body.name || '').trim(),
      String(body.email || '').trim(),
      String(body.phone || '').trim(),
      String(body.companyName || '').trim(),
      String(body.website || '').trim(),
      String(body.position || '').trim(),
      String(body.streetAddress || '').trim(),
      String(body.city || '').trim(),
      String(body.state || '').trim(),
      String(body.zipCode || '').trim(),
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

/** Run once from the editor to verify a row is written (check Submissions tab). */
function testWriteRow() {
  doPost({
    parameter: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '555-0100',
      companyName: 'Test Co',
      website: 'https://example.com',
      position: 'Owner',
      streetAddress: '123 Main St',
      city: 'Cleveland',
      state: 'OH',
      zipCode: '44101',
      venueType: 'Entertainment center / FEC',
      foodBeverage: 'Yes',
      timeline: 'Exploring options',
      budget: 'Not sure yet',
      pageUrl: 'manual-test'
    }
  });
}
