function badRequest(message) {
  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ error: message })
  };
}

function sanitizeChannel(raw) {
  const value = String(raw || '').trim() || 'scoreboard-overlay-v1';
  if (!/^[A-Za-z0-9:_-]{1,64}$/.test(value)) return null;
  return value;
}

function sanitizeClientId(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (!/^[A-Za-z0-9:_-]{1,64}$/.test(value)) return '';
  return value;
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
      }
    };
  }

  const apiKeyRaw = String(process.env.ABLY_API_KEY || '').trim();
  if (!apiKeyRaw) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'ABLY_API_KEY env var is not set' })
    };
  }

  const keyParts = apiKeyRaw.split(':');
  const keyName = keyParts[0] || '';
  const keySecret = keyParts[1] || '';
  if (keyParts.length !== 2 || !keyName || !keySecret) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'ABLY_API_KEY must use keyName:keySecret format' })
    };
  }

  const channel = sanitizeChannel(event.queryStringParameters && event.queryStringParameters.channel);
  if (!channel) return badRequest('Invalid channel');

  const role = (event.queryStringParameters && event.queryStringParameters.role) === 'subscriber'
    ? 'subscriber'
    : 'publisher';
  const clientId = sanitizeClientId(event.queryStringParameters && event.queryStringParameters.clientId)
    || `scorepad-${role}`;

  const ttlMs = Number.parseInt(process.env.ABLY_TOKEN_TTL_MS || '3600000', 10);
  const ttl = Number.isNaN(ttlMs) ? 3600000 : Math.max(60000, Math.min(86400000, ttlMs));

  const capability = role === 'subscriber'
    ? { [channel]: ['subscribe', 'presence'] }
    : { [channel]: ['publish', 'subscribe', 'presence'] };

  try {
    const basic = Buffer.from(`${keyName}:${keySecret}`).toString('base64');
    const response = await fetch(`https://rest.ably.io/keys/${encodeURIComponent(keyName)}/requestToken`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId,
        ttl,
        capability: JSON.stringify(capability)
      })
    });

    const bodyText = await response.text();
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Ably requestToken failed',
          details: bodyText || response.statusText
        })
      };
    }

    const tokenRequest = bodyText ? JSON.parse(bodyText) : {};

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(tokenRequest)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to create token request', details: String(err && err.message || err) })
    };
  }
};
