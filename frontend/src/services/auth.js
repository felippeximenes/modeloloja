const API_URL = "https://modeloloja-production.up.railway.app";
const TOKEN_KEY = "moldz3d_token";
const USER_KEY = "moldz3d_user";

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
    throw new Error(data?.detail || "Erro ao cadastrar usuário");
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

export async function getMe() {
  const token = getToken();

  if (!token) {
    throw new Error("Usuário não autenticado");
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Erro ao carregar usuário");
  }

  localStorage.setItem(USER_KEY, JSON.stringify(data));
  return data;
}

export function saveAuth(data) {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  window.dispatchEvent(new Event("authUpdated"));
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("authUpdated"));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getToken();
}