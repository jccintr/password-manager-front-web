import { apiRequest } from './client';

export function listVaultItems(token) {
  return apiRequest('/vault-items', { token });
}

export function createVaultItem(payload, token) {
  return apiRequest('/vault-items', { method: 'POST', body: payload, token });
}

export function updateVaultItem(id, payload, token) {
  return apiRequest(`/vault-items/${id}`, {
    method: 'PATCH',
    body: payload,
    token,
  });
}

export function deleteVaultItem(id, token) {
  return apiRequest(`/vault-items/${id}`, { method: 'DELETE', token });
}
