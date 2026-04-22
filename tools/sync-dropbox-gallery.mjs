import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_ENV = [
  'DROPBOX_ACCESS_TOKEN',
  'DROPBOX_GALLERY_FOLDER_PATH'
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const DROPBOX_API = 'https://api.dropboxapi.com/2';
const token = process.env.DROPBOX_ACCESS_TOKEN;
const rawFolderPath = String(process.env.DROPBOX_GALLERY_FOLDER_PATH || '').trim();
const folderPath = rawFolderPath === '/' ? '' : rawFolderPath;
const maxImages = Number(process.env.DROPBOX_GALLERY_MAX_IMAGES || '60');

const fetchDropbox = async (endpoint, body) => {
  const response = await fetch(`${DROPBOX_API}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Dropbox API error ${response.status} at ${endpoint}: ${text}`);
  }
  return response.json();
};

const toDisplayName = (value) => String(value || '').replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();

const isImage = (entry) => {
  if (!entry || entry['.tag'] !== 'file') return false;
  const ext = String(entry.name || '').toLowerCase().split('.').pop();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(ext);
};

const ensureSharedLink = async (entry) => {
  const listResult = await fetchDropbox('/sharing/list_shared_links', {
    path: entry.path_lower,
    direct_only: true
  });

  if (listResult.links && listResult.links.length) {
    return listResult.links[0].url;
  }

  const createResult = await fetchDropbox('/sharing/create_shared_link_with_settings', {
    path: entry.path_lower
  });
  return createResult.url;
};

const toRawImageUrl = (sharedUrl) => {
  const url = new URL(sharedUrl);
  url.searchParams.delete('dl');
  url.searchParams.set('raw', '1');
  return url.toString();
};

const listAllImageFiles = async () => {
  let result = await fetchDropbox('/files/list_folder', {
    path: folderPath,
    recursive: false,
    include_deleted: false,
    include_non_downloadable_files: false
  });

  const all = [...(result.entries || [])];
  while (result.has_more) {
    result = await fetchDropbox('/files/list_folder/continue', { cursor: result.cursor });
    all.push(...(result.entries || []));
  }

  return all.filter(isImage).sort((a, b) => (a.server_modified < b.server_modified ? 1 : -1));
};

const files = await listAllImageFiles();
const selected = files.slice(0, maxImages);

const images = [];
for (const entry of selected) {
  const sharedUrl = await ensureSharedLink(entry);
  images.push({
    name: entry.name,
    alt: toDisplayName(entry.name),
    url: toRawImageUrl(sharedUrl),
    modified_at: entry.server_modified
  });
}

const payload = {
  generated_at: new Date().toISOString(),
  source: {
    type: 'dropbox',
    folder_path: folderPath
  },
  images
};

const outPath = path.resolve('content', 'data', 'gallery.json');
await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, JSON.stringify(payload, null, 2), 'utf8');

console.log(`Synced ${images.length} gallery images to ${outPath}`);
