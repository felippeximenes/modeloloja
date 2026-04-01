const API_URL = "http://localhost:8000";

// ==============================
// STORAGE KEYS
// ==============================

const TOKEN_KEY = "moldz3d_token";
const USER_KEY = "moldz3d_user";

// ==============================
// HELPERS
// ==============================

export function saveAuth(data) {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!getToken();
}

// ==============================
// AUTH API
// ==============================

export async function registerUser(payload) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Erro ao registrar");
  }

  saveAuth(data);
  return data;
}

export async function loginUser(payload) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Erro ao fazer login");
  }

  saveAuth(data);
  return data;
}

// ==============================
// USER
// ==============================

export async function getMe() {
  const token = getToken();

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Erro ao buscar usuário");
  }

  return data;
}
