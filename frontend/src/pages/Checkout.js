import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, getCartTotal, clearCart } from "../utils/cart";
import { createOrder } from "../services/api";
import { getStoredUser, isAuthenticated } from "../services/auth";
import { toast } from "sonner";

const API_URL = "http://localhost:8000";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = getCart();
  const total = getCartTotal();
  const user = getStoredUser();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    receiver_name: user?.name || "",
    receiver_email: user?.email || "",
    receiver_phone: "",
    receiver_document: "",
    receiver_address: "",
    receiver_number: "",
    receiver_district: "",
    receiver_city: "",
    receiver_state: "",
    to_cep: "",
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Faça login para finalizar a compra.");
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Faça login para finalizar a compra.");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      toast.error("Seu carrinho está vazio.");
      return;
    }

    const selectedShipping = cart[0]?.selectedShipping;

    if (!selectedShipping) {
      toast.error("Selecione um frete antes de finalizar a compra.");
      return;
    }

    try {
      setLoading(true);

      const cepClean = form.to_cep.replace(/\D/g, "");

      const orderPayload = {
        items: cart.map((item) => {
          if (!item.sku) {
            throw new Error(`Produto ${item.name} sem SKU.`);
          }

          return {
            product_id: item.id,
            sku: item.sku,
            quantity: item.quantity,
          };
        }),

        address: {
          ...form,
          to_cep: cepClean,
        },

        shipping: {
          service_id: Number(selectedShipping.id),
          company_name: selectedShipping.company || "Transportadora",
          service_name: selectedShipping.service || selectedShipping.name || "Serviço",
          price: Number(selectedShipping.price || 0),
          delivery_time: Number(selectedShipping.delivery_time || 0),
        },
      };

      const orderResponse = await createOrder(orderPayload);

      if (!orderResponse?.id) {
        throw new Error("Pedido não retornou ID");
      }

      const orderId = orderResponse.id;

      const paymentResponse = await fetch(
        `${API_URL}/api/payments/${orderId}/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        console.error(errorText);
        throw new Error("Erro ao criar pagamento");
      }

      const paymentData = await paymentResponse.json();

      if (!paymentData.checkout_url) {
        throw new Error("URL de pagamento não retornada");
      }

      clearCart();
      window.dispatchEvent(new Event("cartUpdated"));

      window.location.href = paymentData.checkout_url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Erro ao processar checkout.");
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
          <input
            name="receiver_name"
            placeholder="Nome completo"
            required
            value={form.receiver_name}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="receiver_email"
            placeholder="Email"
            required
            type="email"
            value={form.receiver_email}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="receiver_phone"
            placeholder="Telefone"
            required
            value={form.receiver_phone}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="receiver_document"
            placeholder="CPF"
            required
            value={form.receiver_document}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="receiver_address"
            placeholder="Endereço"
            required
            value={form.receiver_address}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="receiver_number"
            placeholder="Número"
            required
            value={form.receiver_number}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="receiver_district"
            placeholder="Bairro"
            required
            value={form.receiver_district}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="receiver_city"
            placeholder="Cidade"
            required
            value={form.receiver_city}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="receiver_state"
            placeholder="Estado (RJ, SP...)"
            required
            value={form.receiver_state}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

          <input
            name="to_cep"
            placeholder="CEP"
            required
            value={form.to_cep}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          />

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

            {selectedShipping && (
              <div className="flex justify-between mb-2 text-slate-600 pt-3 border-t mt-3">
                <span>
                  Frete ({selectedShipping.company || "Transportadora"} - {selectedShipping.service || selectedShipping.name})
                </span>
                <span>R$ {Number(selectedShipping.price || 0).toFixed(2)}</span>
              </div>
            )}

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