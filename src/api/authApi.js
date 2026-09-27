import { apiRequest } from './client';

export function registerUser(payload) {
  return apiRequest('/auth/register', { method: 'POST', body: payload });
}

export function loginUser(payload) {
  return apiRequest('/auth/login', { method: 'POST', body: payload });
}

export function getMe(token) {
  return apiRequest('/auth/me', { token });
}

export function updateProfile(name, token) {
  return apiRequest('/auth/me', { method: 'PATCH', body: { name }, token });
}
