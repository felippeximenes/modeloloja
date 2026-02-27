import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import {
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  getCartTotal,
  clearCart
} from '../utils/cart';
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

  // 🔥 identificador único (produto + variação)
  const getItemKey = (item) => {
    return item.variantId ? `${item.id}_${item.variantId}` : item.id;
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) return;

    updateCartItemQuantity(getItemKey(item), newQuantity);
    loadCart();
    setUpdate(prev => prev + 1);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemove = (item) => {
    removeFromCart(getItemKey(item));
    loadCart();
    setUpdate(prev => prev + 1);
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${item.name} removido do carrinho`);
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
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-slate-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Seu carrinho está vazio
          </h2>
          <Link
            to="/shop"
            className="inline-flex items-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-full transition-colors"
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

        <h1 className="text-4xl font-bold text-slate-900 mb-8">
          Carrinho de Compras
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Itens */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={getItemKey(item)}
                className="bg-white border border-slate-200 rounded-2xl p-6"
              >
                <div className="flex gap-6">

                  <Link
                    to={`/product/${item.id}`}
                    className="w-24 h-24 rounded-xl overflow-hidden bg-slate-50"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1">
                    <Link
                      to={`/product/${item.id}`}
                      className="font-semibold text-slate-900 block"
                    >
                      {item.name}
                    </Link>

                    {/* 🔥 Mostrar variação se existir */}
                    {item.variantLabel && (
                      <p className="text-sm text-slate-500 mt-1">
                        {item.variantLabel}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4">

                      {/* Quantidade */}
                      <div className="flex items-center border rounded-full">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="px-3 py-1"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="px-4">{item.quantity}</span>

                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="px-3 py-1"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Preço */}
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-500">
                          R$ {item.price.toFixed(2)} cada
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(item)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                </div>
              </div>
            ))}
          </div>

          {/* Resumo */}
          <div>
            <div className="bg-slate-50 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">
                Resumo do Pedido
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>{shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-full font-semibold"
              >
                Finalizar Compra
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}