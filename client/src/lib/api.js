'use client';

/**
 * Thin API client. Holds the access token in memory + localStorage and
 * attaches it to requests. All backend business logic stays server-side;
 * this module only transports requests/responses.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'gasta_access_token';
const REFRESH_KEY = 'gasta_refresh_token';

export const tokenStore = {
  get access() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  get refresh() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  set({ accessToken, refreshToken }) {
    if (typeof window === 'undefined') return;
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

async function request(path, { method = 'GET', body, auth = true, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (auth && tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.details = data.details;
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  // Claims
  listClaims: () => request('/claims'),
  claimStats: () => request('/claims/stats'),
  getClaim: (id) => request(`/claims/${id}`),
  createClaim: (formData) => request('/claims', { method: 'POST', body: formData, isForm: true }),

  // Admin
  adminClaims: (status) => request(`/claims/admin/all${status ? `?status=${status}` : ''}`),
  reviewClaim: (id, payload) => request(`/claims/admin/${id}/review`, { method: 'PATCH', body: payload }),

  // AI
  chat: (message, history) => request('/ai/chat', { method: 'POST', body: { message, history } }),
  requiredDocs: (category) => request(`/ai/required-docs/${category}`),

  // Notifications
  notifications: () => request('/notifications'),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  // Authenticated document download -> returns an object URL the UI can open.
  downloadDocument: async (id) => {
    const res = await fetch(`${BASE_URL}/documents/${id}/download`, {
      headers: tokenStore.access ? { Authorization: `Bearer ${tokenStore.access}` } : {},
    });
    if (!res.ok) throw new Error('Unable to download document');
    return URL.createObjectURL(await res.blob());
  },
};

