// Cart utilities using localStorage
const CART_KEY = 'moldz3d_cart';
const LEGACY_CART_KEY = 'polyforge_cart';

const migrateLegacyCartIfNeeded = () => {
  try {
    const hasNew = localStorage.getItem(CART_KEY);
    const legacy = localStorage.getItem(LEGACY_CART_KEY);

    // If new cart doesn't exist but legacy does, migrate it
    if (!hasNew && legacy) {
      localStorage.setItem(CART_KEY, legacy);
      localStorage.removeItem(LEGACY_CART_KEY);
    }
  } catch (error) {
    // Ignore storage errors (private mode / blocked storage)
  }
};

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
  migrateLegacyCartIfNeeded();

  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

export const addToCart = (product, quantity = 1) => {
  migrateLegacyCartIfNeeded();

  const cart = getCart();
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId) => {
  migrateLegacyCartIfNeeded();

  const cart = getCart();
  const updatedCart = cart.filter((item) => item.id !== productId);
  saveCart(updatedCart);
  return updatedCart;
};

export const updateCartItemQuantity = (productId, quantity) => {
  migrateLegacyCartIfNeeded();

  const cart = getCart();
  const item = cart.find((item) => item.id === productId);

  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart(cart);
  }

  return cart;
};

export const clearCart = () => {
  migrateLegacyCartIfNeeded();

  try {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(LEGACY_CART_KEY);
  } catch (error) {
    // Ignore
  }

  return [];
};

export const getCartTotal = () => {
  migrateLegacyCartIfNeeded();

  const cart = getCart();
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const getCartCount = () => {
  migrateLegacyCartIfNeeded();

  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};
