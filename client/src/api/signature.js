// src/api/signature.js
// Utility to generate HMAC-SHA256 signatures for GET/POST requests.
// Adds headers: X-Signature, X-Timestamp, X-Nonce, optionally X-Signature-KeyId.

const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

async function hmacSha256(secret, message) {
  if (!window.crypto || !window.crypto.subtle || !textEncoder) {
    // Environment doesn’t support SubtleCrypto; skip signing
    return null;
  }
  const keyData = textEncoder.encode(secret);
  const msgData = textEncoder.encode(message);
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await window.crypto.subtle.sign('HMAC', key, msgData);
  const bytes = new Uint8Array(signatureBuffer);
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex;
}

export async function makeSignatureHeaders(method, url, body) {
  const secret = import.meta.env.VITE_SIGNATURE_SECRET;
  const keyId = import.meta.env.VITE_SIGNATURE_KEY_ID; // optional
  if (!secret) return {}; // no secret configured, do not add signature

  const timestamp = new Date().toISOString();
  const nonce = Math.random().toString(36).slice(2);
  let bodyStr = '';
  try {
    if (body != null) {
      bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    }
  } catch (_) {
    bodyStr = '';
  }

  const message = [method?.toUpperCase() || 'GET', url || '', timestamp, nonce, bodyStr].join('|');
  const sig = await hmacSha256(secret, message);

  if (!sig) return {}; // cannot sign in this environment
  const headers = {
    'X-Signature': sig,
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
  };
  if (keyId) headers['X-Signature-KeyId'] = keyId;
  return headers;
}

export async function signAxiosConfig(config) {
  const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
  const headers = await makeSignatureHeaders(config.method, fullUrl, config.data);
  if (headers && Object.keys(headers).length > 0) {
    config.headers = {
      ...(config.headers || {}),
      ...headers,
    };
  }
  return config;
}