import fs from 'node:fs/promises';
import path from 'node:path';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_ENV = [
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_SHEET_ID'
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const TAB_NAME = process.env.GOOGLE_SHEET_TAB || '';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

const sheets = google.sheets({ version: 'v4', auth });

let selectedTab = TAB_NAME;
if (!selectedTab) {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    fields: 'sheets.properties.title'
  });
  selectedTab = metadata.data.sheets?.[0]?.properties?.title || 'Sheet1';
}

const getValuesForTab = async (tabName) =>
  sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `${tabName}!A:Z`
  });

let response;
try {
  response = await getValuesForTab(selectedTab);
} catch (error) {
  // If configured tab name is wrong, fall back to first sheet tab.
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    fields: 'sheets.properties.title'
  });
  const fallbackTab = metadata.data.sheets?.[0]?.properties?.title;
  if (!fallbackTab || fallbackTab === selectedTab) {
    throw error;
  }
  selectedTab = fallbackTab;
  response = await getValuesForTab(selectedTab);
}

const rows = response.data.values || [];
if (rows.length < 2) {
  throw new Error(`No event rows found in tab "${selectedTab}".`);
}

const headers = rows[0].map((value) => String(value).trim());
const requiredColumns = [
  'event_name',
  'date',
  'location_name',
  'registration_url',
  'status'
];

for (const col of requiredColumns) {
  if (!headers.includes(col)) {
    throw new Error(`Missing required column "${col}" in row 1.`);
  }
}

const events = rows
  .slice(1)
  .map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] ?? '';
    });
    return obj;
  })
  .filter((event) => event.event_name && event.date && event.status !== 'cancelled')
  .sort((a, b) => {
    const parseSortDate = (value) => {
      const text = String(value || '').trim();
      if (!text) return Infinity;

      const direct = Date.parse(text);
      if (!Number.isNaN(direct)) return direct;

      // Support date ranges like "06/07/2026-06/08/2026" or "06/07/2026 to 06/08/2026"
      const rangeMatch = text.match(/^(.+?)(?:\s+to\s+|\s*–\s*|\s*-\s*)(.+)$/i);
      if (rangeMatch) {
        const start = Date.parse(rangeMatch[1].trim());
        if (!Number.isNaN(start)) return start;
      }

      return Infinity;
    };

    const aTs = parseSortDate(a.date);
    const bTs = parseSortDate(b.date);
    return aTs - bTs;
  });

const outPath = path.resolve('content', 'data', 'events.json');
const outJsPath = path.resolve('content', 'data', 'events-data.js');
await fs.mkdir(path.dirname(outPath), { recursive: true });
const payload = {
  generated_at: new Date().toISOString(),
  source_sheet_id: process.env.GOOGLE_SHEET_ID,
  tab: selectedTab,
  events
};
await fs.writeFile(
  outPath,
  JSON.stringify(payload, null, 2),
  'utf8'
);
await fs.writeFile(
  outJsPath,
  `window.__EVENTS_DATA__ = ${JSON.stringify(payload, null, 2)};\n`,
  'utf8'
);

console.log(`Synced ${events.length} events to ${outPath}`);
