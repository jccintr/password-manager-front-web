const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Gera salt aleatório (base64) para o KDF — enviado no register */
export function generateSalt(byteLength = 16) {
  const salt = crypto.getRandomValues(new Uint8Array(byteLength));
  return bufferToBase64(salt);
}

export const DEFAULT_KDF_PARAMS = {
  algorithm: 'pbkdf2',
  iterations: 310000,
  hash: 'SHA-256',
};

/**
 * Deriva a vaultKey a partir da senha mestra + salt.
 * Usa Web Crypto PBKDF2 (nativo no browser).
 */
export async function deriveVaultKey(masterPassword, kdfSaltBase64, kdfParams = DEFAULT_KDF_PARAMS) {
  const salt = base64ToBuffer(kdfSaltBase64);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: kdfParams.iterations || DEFAULT_KDF_PARAMS.iterations,
      hash: kdfParams.hash || DEFAULT_KDF_PARAMS.hash,
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/** Cifra um objeto JSON (title, username, password, url, notes) */
export async function encryptPayload(payload, vaultKey) {
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const plain = textEncoder.encode(JSON.stringify(payload));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    vaultKey,
    plain
  );

  return {
    ciphertext: bufferToBase64(encrypted),
    nonce: bufferToBase64(nonce),
  };
}

/** Descriptografa ciphertext+nonce → objeto */
export async function decryptPayload(ciphertextBase64, nonceBase64, vaultKey) {
  const ciphertext = base64ToBuffer(ciphertextBase64);
  const nonce = base64ToBuffer(nonceBase64);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(nonce) },
    vaultKey,
    ciphertext
  );
  return JSON.parse(textDecoder.decode(decrypted));
}
