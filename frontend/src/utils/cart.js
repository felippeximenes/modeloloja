// Cart utilities using localStorage

const CART_KEY = 'moldz3d_cart';
const LEGACY_CART_KEY = 'polyforge_cart';

const migrateLegacyCartIfNeeded = () => {
  try {
    const hasNew = localStorage.getItem(CART_KEY);
    const legacy = localStorage.getItem(LEGACY_CART_KEY);

    if (!hasNew && legacy) {
      localStorage.setItem(CART_KEY, legacy);
      localStorage.removeItem(LEGACY_CART_KEY);
    }
  } catch (error) {}
};

// ============================
// Helpers
// ============================

// Cada item agora é identificado por:
// productId + variantId (se existir)
const getItemKey = (product) => {
  return `${product.id}_${product.variantId || 'default'}`;
};

// ============================
// Get Cart
// ============================

export const getCart = () => {
  migrateLegacyCartIfNeeded();

  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error reading cart:', error);
    return [];
  }
};

export const saveCart = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

// ============================
// Add to Cart
// ============================

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const itemKey = getItemKey(product);

  const existingItem = cart.find(
    (item) => getItemKey(item) === itemKey
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      ...product,
      quantity,
    });
  }

  saveCart(cart);
  return cart;
};

// ============================
// Remove
// ============================

export const removeFromCart = (productId, variantId = null) => {
  const cart = getCart();

  const updatedCart = cart.filter(
    (item) =>
      !(item.id === productId &&
        (item.variantId || null) === (variantId || null))
  );

  saveCart(updatedCart);
  return updatedCart;
};

// ============================
// Update Quantity
// ============================

export const updateCartItemQuantity = (productId, variantId, quantity) => {
  const cart = getCart();

  const item = cart.find(
    (item) =>
      item.id === productId &&
      (item.variantId || null) === (variantId || null)
  );

  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart(cart);
  }

  return cart;
};

// ============================
// Clear
// ============================

export const clearCart = () => {
  try {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(LEGACY_CART_KEY);
  } catch (error) {}

  return [];
};

// ============================
// Totals
// ============================

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

export const getCartCount = () => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};