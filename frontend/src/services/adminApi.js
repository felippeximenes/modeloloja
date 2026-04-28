const API_URL = process.env.REACT_APP_API_URL || "https://modeloloja.onrender.com";

function authHeaders() {
  const token = localStorage.getItem("moldz3d_token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function req(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Erro desconhecido");
  }
  return res.json();
}

// ── Stats ─────────────────────────────────────────────────────
export const getStats = () => req("GET", "/api/admin/stats");

// ── Products ──────────────────────────────────────────────────
export const adminGetProducts = () => req("GET", "/api/admin/products");
export const adminGetProduct  = (id) => req("GET", `/api/admin/products/${id}`);
export const adminCreateProduct = (data) => req("POST", "/api/admin/products", data);
export const adminUpdateProduct = (id, data) => req("PUT", `/api/admin/products/${id}`, data);
export const adminDeleteProduct = (id) => req("DELETE", `/api/admin/products/${id}`);
export const adminToggleActive  = (id, active) =>
  req("PATCH", `/api/admin/products/${id}`, { active });

// ── Image upload ──────────────────────────────────────────────
export async function uploadImage(file) {
  const token = localStorage.getItem("moldz3d_token");
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/admin/images/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Erro no upload");
  }
  return res.json();
}
