import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, getCartTotal, clearCart } from "../utils/cart";
import { createOrder } from "../services/api";
import { toast } from "sonner";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = getCart();
  const total = getCartTotal();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }

    try {
      setLoading(true);

      const orderPayload = {
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
        },
        items: cart.map((item) => ({
          product_id: item.id,
          variant_id: item.variantId || null,
          quantity: item.quantity,
          price: item.price,
        })),
        total,
      };

      await createOrder(orderPayload);

      clearCart();
      toast.success("Pedido realizado com sucesso!");

      navigate("/shop");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao finalizar pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-4">

        <h1 className="text-4xl font-bold mb-8">
          Finalizar Compra
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            name="name"
            placeholder="Nome completo"
            required
            onChange={handleChange}
            className="w-full border rounded-xl p-4"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="w-full border rounded-xl p-4"
          />

          <input
            type="text"
            name="phone"
            placeholder="Telefone"
            required
            onChange={handleChange}
            className="w-full border rounded-xl p-4"
          />

          <div className="bg-slate-50 p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">
              Resumo
            </h2>

            {cart.map((item) => (
              <div
                key={`${item.id}_${item.variantId || "default"}`}
                className="flex justify-between mb-2"
              >
                <span>
                  {item.name} {item.variantLabel && `(${item.variantLabel})`} x {item.quantity}
                </span>
                <span>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-full transition"
          >
            {loading ? "Processando..." : "Confirmar Pedido"}
          </button>

        </form>
      </div>
    </div>
  );
}