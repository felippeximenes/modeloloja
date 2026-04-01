import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getCart, getCartTotal, clearCart } from "../utils/cart";
import { createOrder, getMyAddresses } from "../services/api";
import { getStoredUser, isAuthenticated, logoutUser } from "../services/auth";
import { toast } from "sonner";
import { ShineButton } from "../components/ui/ShineButton";

const API_URL = "http://localhost:8000";

function formatCep(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function CheckoutField({ label, name, value, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition focus:border-[#31B0A9] focus:outline-none focus:ring-4 focus:ring-[#31B0A9]/10"
        {...props}
      />
    </label>
  );
}

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
  const [cepLoading, setCepLoading] = useState(false);
  const [lastFetchedCep, setLastFetchedCep] = useState("");

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

  const subtotal = useMemo(
    () =>
      cart.reduce((accumulator, item) => {
        return accumulator + Number(item.price || 0) * Number(item.quantity || 1);
      }, 0),
    [cart]
  );

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

  // Quando o CEP é preenchido, buscamos o endereço no ViaCEP para reduzir
  // atrito no checkout e deixar a experiência mais próxima de um e-commerce maduro.
  useEffect(() => {
    const cepDigits = form.to_cep.replace(/\D/g, "");

    if (cepDigits.length !== 8 || cepDigits === lastFetchedCep) return;

    async function fetchAddressByCep() {
      try {
        setCepLoading(true);

        const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
        const data = await response.json();

        if (data?.erro) {
          throw new Error("CEP não encontrado.");
        }

        setForm((prev) => ({
          ...prev,
          receiver_address: data.logradouro || prev.receiver_address,
          receiver_district: data.bairro || prev.receiver_district,
          receiver_city: data.localidade || prev.receiver_city,
          receiver_state: data.uf || prev.receiver_state,
          receiver_complement: data.complemento || prev.receiver_complement,
        }));

        setLastFetchedCep(cepDigits);
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toast.error("Não foi possível localizar o endereço pelo CEP.");
      } finally {
        setCepLoading(false);
      }
    }

    fetchAddressByCep();
  }, [form.to_cep, lastFetchedCep]);

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
      to_cep: formatCep(address.to_cep || ""),
    }));
  }

  function handleSelectAddress(address) {
    setSelectedAddressId(address.id);
    applyAddressToForm(address);
    toast.success("Endereço aplicado ao checkout");
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === "to_cep") {
      formattedValue = formatCep(value);
      if (value.replace(/\D/g, "").length < 8) {
        setLastFetchedCep("");
      }
    }

    if (name === "receiver_phone") {
      formattedValue = formatPhone(value);
    }

    if (name === "receiver_document") {
      formattedValue = formatCpf(value);
    }

    setForm((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
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

      const paymentResponse = await fetch(`${API_URL}/api/payments/${orderId}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbfd_0%,#ffffff_38%,#f8fafc_100%)] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#31B0A9]">
            Checkout
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Finalizar Compra
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
            Revise seus dados, confirme o endereço e siga para o pagamento com uma experiência mais limpa e segura.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {addressesLoading ? (
              <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm">
                <p className="text-sm text-slate-500">Carregando endereços salvos...</p>
              </div>
            ) : addresses.length > 0 ? (
              <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-sm">
                <div className="mb-5 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#31B0A9]" />
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">Endereços salvos</h2>
                    <p className="text-sm text-slate-500">Escolha um endereço já cadastrado para agilizar.</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {addresses.map((address) => {
                    const isSelected = selectedAddressId === address.id;

                    return (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => handleSelectAddress(address)}
                        className={`rounded-[1.4rem] border p-4 text-left transition ${
                          isSelected
                            ? "border-[#31B0A9] bg-[linear-gradient(180deg,rgba(49,176,169,0.12),rgba(49,176,169,0.04))] shadow-[0_14px_30px_rgba(49,176,169,0.10)]"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{address.title}</p>
                          {address.is_default && (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                              Padrão
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-slate-600">{address.receiver_name}</p>
                        <p className="text-sm text-slate-500">
                          {address.receiver_address}, {address.receiver_number}
                        </p>
                        <p className="text-sm text-slate-500">
                          {address.receiver_district} - {address.receiver_city}/{address.receiver_state}
                        </p>
                        <p className="text-sm text-slate-500">CEP: {address.to_cep}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* O formulário foi transformado em um card premium,
                com grid, hierarquia visual e autopreenchimento por CEP. */}
            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <Truck className="h-5 w-5 text-[#31B0A9]" />
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Dados de entrega</h2>
                  <p className="text-sm text-slate-500">Preencha as informações para envio e pagamento.</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <CheckoutField
                    label="Nome completo"
                    name="receiver_name"
                    value={form.receiver_name}
                    onChange={handleChange}
                    required
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="sm:col-span-2">
                  <CheckoutField
                    label="E-mail"
                    name="receiver_email"
                    type="email"
                    value={form.receiver_email}
                    onChange={handleChange}
                    required
                    placeholder="voce@email.com"
                  />
                </div>

                <CheckoutField
                  label="Telefone"
                  name="receiver_phone"
                  value={form.receiver_phone}
                  onChange={handleChange}
                  required
                  placeholder="(21) 99999-9999"
                />

                <CheckoutField
                  label="CPF"
                  name="receiver_document"
                  value={form.receiver_document}
                  onChange={handleChange}
                  required
                  placeholder="000.000.000-00"
                />

                <div className="sm:col-span-2">
                  <CheckoutField
                    label="CEP"
                    name="to_cep"
                    value={form.to_cep}
                    onChange={handleChange}
                    required
                    placeholder="00000-000"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    {cepLoading
                      ? "Buscando endereço automaticamente..."
                      : "Ao preencher o CEP, tentamos localizar o endereço automaticamente."}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <CheckoutField
                    label="Endereço"
                    name="receiver_address"
                    value={form.receiver_address}
                    onChange={handleChange}
                    required
                    placeholder="Rua, avenida, etc."
                  />
                </div>

                <CheckoutField
                  label="Número"
                  name="receiver_number"
                  value={form.receiver_number}
                  onChange={handleChange}
                  required
                  placeholder="123"
                />

                <CheckoutField
                  label="Complemento"
                  name="receiver_complement"
                  value={form.receiver_complement}
                  onChange={handleChange}
                  placeholder="Apto, bloco, referência"
                />

                <CheckoutField
                  label="Bairro"
                  name="receiver_district"
                  value={form.receiver_district}
                  onChange={handleChange}
                  required
                  placeholder="Seu bairro"
                />

                <CheckoutField
                  label="Cidade"
                  name="receiver_city"
                  value={form.receiver_city}
                  onChange={handleChange}
                  required
                  placeholder="Sua cidade"
                />

                <CheckoutField
                  label="Estado"
                  name="receiver_state"
                  value={form.receiver_state}
                  onChange={handleChange}
                  required
                  placeholder="RJ"
                />
              </div>

              <div className="mt-8 flex flex-col gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#31B0A9]" />
                  Compra protegida
                </div>
                <div className="flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-[#31B0A9]" />
                  Envio com rastreio
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#31B0A9]" />
                  Pagamento via Mercado Pago
                </div>
              </div>
            </form>
          </div>

          {/* O resumo lateral concentra os itens, frete e CTA final,
              deixando o checkout mais parecido com uma loja moderna. */}
          <aside className="h-fit rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))] p-6 shadow-[0_25px_80px_rgba(15,23,42,0.10)] xl:sticky xl:top-28">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#31B0A9]">
                Resumo
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Seu pedido</h2>
            </div>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}_${item.sku}`}
                  className="flex items-start gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-4"
                >
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    className="h-20 w-20 rounded-2xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-500">SKU: {item.sku}</p>
                    <p className="text-sm text-slate-500">Qtd: {item.quantity}</p>
                  </div>

                  <p className="text-right text-base font-bold text-slate-950">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.4rem] border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                <span>Frete</span>
                <span>
                  {selectedShipping
                    ? `R$ ${Number(selectedShipping.price || 0).toFixed(2)}`
                    : "Não selecionado"}
                </span>
              </div>

              {selectedShipping && (
                <p className="mt-2 text-xs text-slate-500">
                  {selectedShipping.company || "Transportadora"} •{" "}
                  {selectedShipping.service || selectedShipping.name} •{" "}
                  {selectedShipping.delivery_time} dias úteis
                </p>
              )}

              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-900">Total</span>
                  <span className="text-3xl font-black text-slate-950">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <ShineButton
              type="submit"
              form={undefined}
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 w-full min-h-[3.6rem]"
              size="lg"
            >
              {loading ? "Redirecionando para pagamento..." : "Pagar com Mercado Pago"}
            </ShineButton>
          </aside>
        </div>
      </div>
    </div>
  );
}
