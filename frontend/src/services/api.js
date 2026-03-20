const API_URL = "https://modeloloja-production.up.railway.app";

// ============================
// PRODUCTS
// ============================

export async function getProducts() {
  const response = await fetch(`${API_URL}/api/public/products`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function getProductById(id) {
  const response = await fetch(`${API_URL}/api/products/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
}

// ============================
// ORDERS
// ============================

export async function createOrder(orderData) {
  const token = localStorage.getItem("moldz3d_token");

  const response = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Failed to create order");
  }

  return data;
}

export async function getMyOrders() {
  const token = localStorage.getItem("moldz3d_token");

  const response = await fetch(`${API_URL}/api/orders/me`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Erro ao buscar pedidos");
  }

  return data;
}

export async function getOrderById(id) {
  const token = localStorage.getItem("moldz3d_token");

  const response = await fetch(`${API_URL}/api/orders/${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Erro ao buscar pedido");
  }

  return data;
}

export async function getOrderTracking(orderId) {
  const token = localStorage.getItem("moldz3d_token");

  const response = await fetch(`${API_URL}/api/orders/${orderId}/tracking`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Erro ao buscar rastreamento");
  }

  return data;
}

export async function getOrderLabel(orderId) {
  const token = localStorage.getItem("moldz3d_token");

  const response = await fetch(`${API_URL}/api/orders/${orderId}/label`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Erro ao buscar etiqueta");
  }

  return data;
}