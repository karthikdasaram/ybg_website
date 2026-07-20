/**
 * Central place to configure and call the backend API.
 * Relative path: this assumes the frontend is served by the SAME Express
 * server as the API (see backend/server.js, which serves the frontend as
 * static files). That means this works unchanged whether you're running
 * locally (http://localhost:5000) or deployed (https://your-app.onrender.com)
 * -- no URL to update when you deploy.
 */
const API_BASE_URL = '/api';

const Auth = {
  getToken() {
    return localStorage.getItem('gym_token');
  },
  getUser() {
    const raw = localStorage.getItem('gym_user');
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    localStorage.setItem('gym_token', token);
    localStorage.setItem('gym_user', JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  isAdmin() {
    const u = this.getUser();
    return u && u.role === 'admin';
  },
  /**
   * Works out the correct relative path back to pages/login.html from wherever
   * the current page lives (pages/, pages/admin/, pages/member/, pages/trainer/,
   * or the site root). Using a relative path (instead of a hard-coded absolute
   * one) means this keeps working no matter what folder your static server's
   * document root is pointed at.
   */
  _loginPath() {
    const path = window.location.pathname;
    if (/\/pages\/(admin|member|trainer)\//.test(path)) return '../login.html';
    if (/\/pages\//.test(path)) return 'login.html';
    return 'pages/login.html';
  },
  logout() {
    this.clearSession();
    window.location.href = this._loginPath();
  },
  /** Redirects to login if not authenticated. Optionally enforce a required role. */
  requireAuth(requiredRole) {
    if (!this.isLoggedIn()) {
      window.location.href = this._loginPath();
      return false;
    }
    if (requiredRole && this.getUser().role !== requiredRole) {
      window.location.href = this._loginPath();
      return false;
    }
    return true;
  }
};

/**
 * Generic API call wrapper.
 * @param {string} path - e.g. '/members'
 * @param {object} options - { method, body }
 */
async function apiCall(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    if (res.status === 401) {
      // Token invalid/expired - force re-login
      Auth.clearSession();
    }
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

const api = {
  get: (path) => apiCall(path, { method: 'GET' }),
  post: (path, body) => apiCall(path, { method: 'POST', body }),
  put: (path, body) => apiCall(path, { method: 'PUT', body }),
  patch: (path, body) => apiCall(path, { method: 'PATCH', body }),
  delete: (path) => apiCall(path, { method: 'DELETE' })
};

// ---- small shared UI helpers ----
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(amount) {
  return '$' + Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function showMessage(el, message, isError = true) {
  if (!el) return;
  el.textContent = message;
  el.style.display = 'block';
  el.className = isError ? 'error-msg' : 'success-msg';
  el.style.display = 'block';
}

function hideMessage(el) {
  if (el) el.style.display = 'none';
}