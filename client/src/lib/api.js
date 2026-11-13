/**
 * Centralized API client wrapper
 */

// Resolves the API base URL cleanly across development and production environments:
// 1. If VITE_API_BASE_URL is specified (e.g. in Vercel), it is used and normalized to include '/api'.
// 2. In local development (Vite dev server), it defaults to '/api' which is proxied to http://localhost:5000/api.
// 3. In production, it defaults to the deployed Render backend: 'https://expense-tracker-ia0u.onrender.com/api'.
function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    // If full domain provided without /api suffix, append /api
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      if (!clean.endsWith('/api')) {
        clean = `${clean}/api`;
      }
    } else if (!clean.startsWith('/')) {
      clean = `/${clean}`;
    }
    return clean;
  }

  // Local development default (proxied by Vite)
  if (import.meta.env.DEV) {
    return '/api';
  }

  // Production default: Render backend API endpoint
  return 'https://expense-tracker-ia0u.onrender.com/api';
}

export const BASE_URL = resolveApiBaseUrl();

export function buildUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BASE_URL}${cleanEndpoint}`;
}

export async function apiRequest(endpoint, options = {}) {
  const url = buildUrl(endpoint);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // send session cookies across origins
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (netErr) {
    const error = new Error('Network error. Check your internet connection.');
    error.isNetworkError = true;
    throw error;
  }

  // Handle CSV or non-JSON responses
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    if (!response.ok) throw new Error('Failed to download CSV export');
    return response.blob();
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.details = data.details;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => apiRequest('/auth/register', { method: 'POST', body }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  me: () => apiRequest('/auth/me'),
  changePassword: (body) => apiRequest('/auth/change-password', { method: 'POST', body }),

  // Profile
  getProfile: () => apiRequest('/profile'),
  updateProfile: (body) => apiRequest('/profile', { method: 'PATCH', body }),

  // Categories
  getCategories: (includeArchived = false) =>
    apiRequest(`/categories?includeArchived=${includeArchived}`),
  createCategory: (body) => apiRequest('/categories', { method: 'POST', body }),
  updateCategory: (id, body) => apiRequest(`/categories/${id}`, { method: 'PATCH', body }),
  deleteCategory: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),

  // Needs & Contributions
  getNeeds: (month, includeArchived = false) =>
    apiRequest(`/needs?month=${month || ''}&includeArchived=${includeArchived}`),
  getNeedById: (id, month) => apiRequest(`/needs/${id}?month=${month || ''}`),
  createNeed: (body) => apiRequest('/needs', { method: 'POST', body }),
  updateNeed: (id, body) => apiRequest(`/needs/${id}`, { method: 'PATCH', body }),
  archiveNeed: (id) => apiRequest(`/needs/${id}`, { method: 'DELETE' }),
  getContributions: (needId) => apiRequest(`/needs/${needId}/contributions`),
  addContribution: (needId, body) =>
    apiRequest(`/needs/${needId}/contributions`, { method: 'POST', body }),
  deleteContribution: (needId, contribId) =>
    apiRequest(`/needs/${needId}/contributions/${contribId}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return apiRequest(`/transactions?${query.toString()}`);
  },
  getTransactionById: (id) => apiRequest(`/transactions/${id}`),
  createTransaction: (body) => apiRequest('/transactions', { method: 'POST', body }),
  syncTransactions: (transactions) =>
    apiRequest('/transactions/sync', { method: 'POST', body: { transactions } }),
  updateTransaction: (id, body) => apiRequest(`/transactions/${id}`, { method: 'PATCH', body }),
  deleteTransaction: (id) => apiRequest(`/transactions/${id}`, { method: 'DELETE' }),
  exportTransactionsCsv: () => apiRequest('/transactions/export'),

  // Dashboard & Budgets
  getDashboard: (month) => apiRequest(`/dashboard?month=${month || ''}`),
  getReports: (month) => apiRequest(`/dashboard/reports?month=${month || ''}`),
  getBudget: (month) => apiRequest(`/budgets/${month}`),
  setBudget: (month, body) => apiRequest(`/budgets/${month}`, { method: 'PUT', body }),

  // Admin
  getAdminOverview: () => apiRequest('/admin/overview'),
  getAdminUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users?${q}`);
  },
  getAdminUserById: (id) => apiRequest(`/admin/users/${id}`),
  updateAdminUserStatus: (id, status) =>
    apiRequest(`/admin/users/${id}/status`, { method: 'PATCH', body: { status } }),
  updateAdminUserPrivileges: (id, privileges) =>
    apiRequest(`/admin/users/${id}/privileges`, { method: 'PATCH', body: { privileges } }),
  getAdminAuditLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/admin/audit-logs?${q}`);
  },
};
