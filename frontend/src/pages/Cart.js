import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import {
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  getCartSubtotal,
  getCartShippingTotal,
  getCartTotal,
  clearCart
} from "../utils/cart";
import { toast } from "sonner";
import { ShineButton } from "../components/ui/ShineButton";

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

  const handleQuantityChange = (productId, variantId, newQuantity) => {
    if (newQuantity < 1) return;

    updateCartItemQuantity(productId, variantId, newQuantity);
    loadCart();
    setUpdate((prev) => prev + 1);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleRemove = (productId, variantId, productName) => {
    removeFromCart(productId, variantId);
    loadCart();
    setUpdate((prev) => prev + 1);
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(`${productName} removido do carrinho`);
  };

  const handleClearCart = () => {
    if (window.confirm("Tem certeza que deseja limpar o carrinho?")) {
      clearCart();
      loadCart();
      setUpdate((prev) => prev + 1);
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Carrinho limpo com sucesso");
    }
  };

  const subtotal = getCartSubtotal();
  const shipping = getCartShippingTotal();
  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ShoppingBag className="w-16 h-16 text-slate-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Seu carrinho está vazio
          </h2>
          <ShineButton asChild size="lg">
            <Link to="/shop">
              Continuar Comprando
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </ShineButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Carrinho de Compras
            </h1>
            <p className="text-slate-600 mt-2">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} itens no carrinho
            </p>
          </div>

          <ShineButton
            onClick={handleClearCart}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Limpar carrinho
          </ShineButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.id}_${item.variantId || item.sku || "default"}`}
                className="bg-white border border-slate-200 rounded-2xl p-6"
              >
                <div className="flex gap-6">
                  <Link
                    to={`/product/${item.id}`}
                    className="w-24 h-24 rounded-xl overflow-hidden bg-slate-50"
                  >
                    <img
                      src={item.images?.[0] || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1">
                    <Link
                      to={`/product/${item.id}`}
                      className="font-semibold text-slate-900 hover:text-emerald-600 block"
                    >
                      {item.name}
                    </Link>

                    {(item.size || item.color) && (
                      <p className="text-sm text-slate-500 mt-1">
                        {item.size ? item.size : ""}{item.size && item.color ? " • " : ""}{item.color ? item.color : ""}
                      </p>
                    )}

                    {item.selectedShipping && (
                      <div className="mt-2 text-sm text-slate-500">
                        <p>
                          Frete: {item.selectedShipping.company || "Transportadora"} -{" "}
                          {item.selectedShipping.service || item.selectedShipping.name}
                        </p>
                        <p>
                          R$ {Number(item.selectedShipping.price).toFixed(2)} •{" "}
                          {item.selectedShipping.delivery_time} dias
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border rounded-full">
                        <ShineButton
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.variantId || item.sku,
                              item.quantity - 1
                            )
                          }
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <Minus className="w-4 h-4" />
                        </ShineButton>

                        <span className="px-4 font-semibold">
                          {item.quantity}
                        </span>

                        <ShineButton
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              item.variantId || item.sku,
                              item.quantity + 1
                            )
                          }
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <Plus className="w-4 h-4" />
                        </ShineButton>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold">
                          R$ {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-500">
                          R$ {Number(item.price).toFixed(2)} cada
                        </div>
                      </div>
                    </div>
                  </div>

                  <ShineButton
                    onClick={() =>
                      handleRemove(item.id, item.variantId || item.sku, item.name)
                    }
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </ShineButton>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-slate-50 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">
                Resumo do Pedido
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>R$ {shipping.toFixed(2)}</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <ShineButton
                onClick={() => navigate("/checkout")}
                className="mt-6 w-full"
                size="lg"
              >
                Finalizar Compra
              </ShineButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
