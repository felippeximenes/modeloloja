import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { getCart, removeFromCart, updateCartItemQuantity, getCartTotal, clearCart } from '../utils/cart';
import { toast } from 'sonner';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [, setUpdate] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    setCart(getCart());
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(productId, newQuantity);
    loadCart();
    setUpdate(prev => prev + 1);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemove = (productId, productName) => {
    removeFromCart(productId);
    loadCart();
    setUpdate(prev => prev + 1);
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${productName} removido do carrinho`);
  };

  const handleClearCart = () => {
    if (window.confirm('Tem certeza que deseja limpar o carrinho?')) {
      clearCart();
      loadCart();
      setUpdate(prev => prev + 1);
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Carrinho limpo com sucesso');
    }
  };

  const subtotal = getCartTotal();
  const shipping = subtotal >= 150 ? 0 : 15;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4" data-testid="empty-cart">
          <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-slate-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 font-['Manrope']">
            Seu carrinho está vazio
          </h2>
          <p className="text-slate-600 mb-8">
            Parece que você ainda não adicionou nada ao carrinho. Explore nossa coleção!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-full transition-colors"
            data-testid="continue-shopping-empty"
          >
            Continuar Comprando
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 font-['Manrope']" data-testid="cart-title">
              Carrinho de Compras
            </h1>
            <p className="text-slate-600 mt-2">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} itens no carrinho
            </p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
              data-testid="clear-cart-button"
            >
              Limpar carrinho
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-100 transition-colors"
                data-testid={`cart-item-${item.id}`}
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <Link
                    to={`/product/${item.id}`}
                    className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-slate-50"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors block mb-1"
                      data-testid={`cart-item-name-${item.id}`}
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-slate-500 mb-3">
                      {item.category} • {item.material}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center border-2 border-slate-200 rounded-full">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-slate-600 hover:text-emerald-600 font-bold transition-colors"
                          data-testid={`decrease-quantity-${item.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span 
                          className="px-4 py-1 font-semibold text-slate-900"
                          data-testid={`quantity-${item.id}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-slate-600 hover:text-emerald-600 font-bold transition-colors"
                          data-testid={`increase-quantity-${item.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div 
                          className="text-xl font-bold text-slate-900"
                          data-testid={`item-total-${item.id}`}
                        >
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-500">
                          ${item.price.toFixed(2)} cada
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item.id, item.name)}
                    className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 transition-colors"
                    data-testid={`remove-item-${item.id}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-50 rounded-2xl p-6 sticky top-24" data-testid="order-summary">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Resumo do Pedido
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium" data-testid="subtotal">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Frete</span>
                  <span className="font-medium" data-testid="shipping">
                    {shipping === 0 ? 'Grátis' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                {subtotal < 150 && shipping > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <p className="text-xs text-emerald-700">
                      Faltam ${(150 - subtotal).toFixed(2)} para frete grátis!
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between text-slate-900">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold" data-testid="total">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-6 rounded-full transition-colors mb-3"
                data-testid="checkout-button"
              >
                Finalizar Compra
              </button>

              <Link
                to="/shop"
                className="block text-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                data-testid="continue-shopping"
              >
                Continuar Comprando
              </Link>

              {/* Features */}
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-start text-sm text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Pagamento 100% seguro</span>
                </div>
                <div className="flex items-start text-sm text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Garantia de 30 dias</span>
                </div>
                <div className="flex items-start text-sm text-slate-600">
                  <svg className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Suporte ao cliente 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
