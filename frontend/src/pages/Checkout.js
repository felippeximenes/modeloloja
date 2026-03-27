import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, getCartTotal, clearCart } from "../utils/cart";
import { createOrder, getMyAddresses } from "../services/api";
import { getStoredUser, isAuthenticated, logoutUser } from "../services/auth";
import { toast } from "sonner";
import { ShineButton } from "../components/ui/ShineButton";

const API_URL = "http://localhost:8000";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = getCart();
  const total = getCartTotal();
  const user = getStoredUser();
  const selectedShipping = cart[0]?.selectedShipping || null;

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

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
    receiver_complement: "",
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Faça login para finalizar a compra.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    async function loadAddresses() {
      try {
        const data = await getMyAddresses();
        const list = data || [];
        setAddresses(list);

        const defaultAddress = list.find((item) => item.is_default) || list[0];

        if (defaultAddress) {
          applyAddressToForm(defaultAddress);
          setSelectedAddressId(defaultAddress.id);
        }
      } catch (error) {
        console.error("Erro ao carregar endereços:", error);

        if (
          error.message?.toLowerCase().includes("401") ||
          error.message?.toLowerCase().includes("não autenticado") ||
          error.message?.toLowerCase().includes("unauthorized")
        ) {
          logoutUser();
          toast.error("Sua sessão expirou. Faça login novamente.");
          navigate("/login");
          return;
        }
      }

      setAddressesLoading(false);
    }

    loadAddresses();
  }, [navigate]);

  function applyAddressToForm(address) {
    setForm((prev) => ({
      ...prev,
      receiver_name: address.receiver_name || prev.receiver_name,
      receiver_email: address.receiver_email || prev.receiver_email,
      receiver_phone: address.receiver_phone || "",
      receiver_document: address.receiver_document || "",
      receiver_address: address.receiver_address || "",
      receiver_number: address.receiver_number || "",
      receiver_complement: address.receiver_complement || "",
      receiver_district: address.receiver_district || "",
      receiver_city: address.receiver_city || "",
      receiver_state: address.receiver_state || "",
      to_cep: address.to_cep || "",
    }));
  }

  function handleSelectAddress(address) {
    setSelectedAddressId(address.id);
    applyAddressToForm(address);
    toast.success("Endereço aplicado ao checkout");
  }

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

        {addressesLoading ? (
          <div className="mb-6 border border-slate-200 rounded-2xl p-5 bg-white">
            <p className="text-sm text-slate-500">Carregando endereços salvos...</p>
          </div>
        ) : addresses.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Escolha um endereço salvo
            </h2>

            <div className="space-y-3">
              {addresses.map((address) => {
                const isSelected = selectedAddressId === address.id;

                return (
                  <ShineButton
                    key={address.id}
                    type="button"
                    onClick={() => handleSelectAddress(address)}
                    variant="outline"
                    className={`h-auto w-full justify-start rounded-2xl p-4 text-left ${
                      isSelected
                        ? "border-[#31B0A9] bg-[#31B0A9]/10"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {address.title}
                      </p>

                      {address.is_default && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                          Padrão
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 mt-2">
                      {address.receiver_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {address.receiver_address}, {address.receiver_number}
                    </p>
                    <p className="text-sm text-slate-500">
                      {address.receiver_district} - {address.receiver_city}/{address.receiver_state}
                    </p>
                    <p className="text-sm text-slate-500">
                      CEP: {address.to_cep}
                    </p>
                  </ShineButton>
                );
              })}
            </div>
          </div>
        ) : null}

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
            name="receiver_complement"
            placeholder="Complemento"
            value={form.receiver_complement}
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

          <ShineButton
            type="submit"
            disabled={loading}
            className="mt-6 w-full"
            size="lg"
          >
            {loading ? "Redirecionando para pagamento..." : "Pagar com MercadoPago"}
          </ShineButton>
        </form>
      </div>
    </div>
  );
}
