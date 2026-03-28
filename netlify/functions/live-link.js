const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'live-links';
const STORE_KEY = 'current-youtube-live';
const TTL_MINUTES = 150;
const TTL_MS = TTL_MINUTES * 60 * 1000;
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be'
]);

function buildHeaders() {
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Live-Link-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  };
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: buildHeaders(),
    body: JSON.stringify(body)
  };
}

function getStoreInstance() {
  return getStore(STORE_NAME);
}

function isExpired(record) {
  return !record || !record.expiresAt || Number(record.expiresAt) <= Date.now();
}

function sanitizeYoutubeUrl(raw) {
  let parsed;
  try {
    parsed = new URL(String(raw || '').trim());
  } catch (error) {
    return null;
  }

  if (parsed.protocol !== 'https:') return null;
  if (!YOUTUBE_HOSTS.has(parsed.hostname.toLowerCase())) return null;
  return parsed.toString();
}

async function readCurrentLink(store) {
  const record = await store.get(STORE_KEY, { type: 'json', consistency: 'strong' });
  if (!record) {
    return { active: false, url: '', expiresAt: 0, updatedAt: 0, ttlMinutes: TTL_MINUTES };
  }

  if (isExpired(record)) {
    await store.delete(STORE_KEY);
    return { active: false, url: '', expiresAt: 0, updatedAt: 0, ttlMinutes: TTL_MINUTES };
  }

  return {
    active: true,
    url: String(record.url || ''),
    expiresAt: Number(record.expiresAt) || 0,
    updatedAt: Number(record.updatedAt) || 0,
    ttlMinutes: TTL_MINUTES
  };
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: buildHeaders() };
  }

  const store = getStoreInstance();

  if (event.httpMethod === 'GET') {
    const current = await readCurrentLink(store);
    return json(200, current);
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const expectedToken = String(process.env.LIVE_LINK_WRITE_TOKEN || '').trim();
  if (expectedToken) {
    const providedToken = String(event.headers['x-live-link-token'] || event.headers['X-Live-Link-Token'] || '').trim();
    if (providedToken !== expectedToken) {
      return json(401, { error: 'Invalid live link token' });
    }
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (error) {
    return json(400, { error: 'Invalid JSON body' });
  }

  const url = sanitizeYoutubeUrl(body.url);
  if (!url) {
    return json(400, { error: 'A valid HTTPS YouTube URL is required' });
  }

  const now = Date.now();
  const record = {
    url,
    updatedAt: now,
    expiresAt: now + TTL_MS
  };

  await store.setJSON(STORE_KEY, record);
  return json(200, {
    active: true,
    url: record.url,
    updatedAt: record.updatedAt,
    expiresAt: record.expiresAt,
    ttlMinutes: TTL_MINUTES
  });
};