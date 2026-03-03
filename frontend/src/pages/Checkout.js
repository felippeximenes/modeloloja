import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, getCartTotal, clearCart } from "../utils/cart";
import { createOrder } from "../services/api";
import { toast } from "sonner";

const API_URL = "http://localhost:8000";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = getCart();
  const total = getCartTotal();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    receiver_name: "",
    receiver_email: "",
    receiver_phone: "",
    receiver_document: "",
    receiver_address: "",
    receiver_number: "",
    receiver_district: "",
    receiver_city: "",
    receiver_state: "",
    to_cep: "",
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

      // 🔹 1. Criar pedido
      const orderPayload = {
        items: cart.map((item) => ({
          product_id: item.id,
          sku: item.sku,
          quantity: item.quantity,
        })),
        address: form,
        shipping: {
          service_id: 1,
          company_name: "Correios",
          price: 15,
          delivery_time: 7,
        },
      };

      const orderResponse = await createOrder(orderPayload);

      const orderId = orderResponse.id;

      // 🔹 2. Criar pagamento
      const paymentResponse = await fetch(
        `${API_URL}/api/payments/${orderId}/create`,
        {
          method: "POST",
        }
      );

      if (!paymentResponse.ok) {
        throw new Error("Erro ao criar pagamento");
      }

      const paymentData = await paymentResponse.json();

      if (!paymentData.checkout_url) {
        throw new Error("URL de pagamento não retornada");
      }

      // 🔹 3. Redirecionar automaticamente
      window.location.href = paymentData.checkout_url;

    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar checkout.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">
          Finalizar Compra
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input name="receiver_name" placeholder="Nome completo" required onChange={handleChange} className="w-full border p-3 rounded-xl" />
          <input name="receiver_email" placeholder="Email" required onChange={handleChange} className="w-full border p-3 rounded-xl" />
          <input name="receiver_phone" placeholder="Telefone" required onChange={handleChange} className="w-full border p-3 rounded-xl" />
          <input name="receiver_document" placeholder="CPF" required onChange={handleChange} className="w-full border p-3 rounded-xl" />

          <input name="receiver_address" placeholder="Endereço" required onChange={handleChange} className="w-full border p-3 rounded-xl" />
          <input name="receiver_number" placeholder="Número" required onChange={handleChange} className="w-full border p-3 rounded-xl" />
          <input name="receiver_district" placeholder="Bairro" required onChange={handleChange} className="w-full border p-3 rounded-xl" />
          <input name="receiver_city" placeholder="Cidade" required onChange={handleChange} className="w-full border p-3 rounded-xl" />
          <input name="receiver_state" placeholder="Estado" required onChange={handleChange} className="w-full border p-3 rounded-xl" />
          <input name="to_cep" placeholder="CEP" required onChange={handleChange} className="w-full border p-3 rounded-xl" />

          <div className="bg-slate-50 p-6 rounded-2xl mt-6">
            <h2 className="text-xl font-semibold mb-4">
              Resumo
            </h2>

            {cart.map((item) => (
              <div key={`${item.id}_${item.sku}`} className="flex justify-between mb-2">
                <span>{item.name} x {item.quantity}</span>
                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
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
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-full transition mt-6 disabled:opacity-50"
          >
            {loading ? "Redirecionando para pagamento..." : "Pagar com MercadoPago"}
          </button>

        </form>
      </div>
    </div>
  );
}