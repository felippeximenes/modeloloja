import { useState } from "react";
import { AlertTriangle, ChevronUp, Truck } from "lucide-react";
import { ShineButton } from "./ui/ShineButton";

export default function ShippingCalculator({ product, onSelectShipping }) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);

  function getCarrierName(option) {
    return option.company || "Transportadora";
  }

  function getServiceName(option) {
    if (option.service) return option.service;

    const rawName = option.name || "";
    if (rawName === ".Package") return "Package";
    if (rawName === ".Com") return "Com";

    return rawName;
  }

  async function calculateShipping() {
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      setError("Digite um CEP válido com 8 números");
      setOptions([]);
      setSelectedOption(null);
      if (onSelectShipping) onSelectShipping(null);
      return;
    }

    setLoading(true);
    setError(null);

    const productId = product?._id || product?.id;

    if (!productId) {
      setLoading(false);
      setError("Produto sem identificador válido");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/shipping/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          to_cep: cleanCep,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Erro ao calcular frete");
      }

      setOptions(data.options || []);
      setSelectedOption(null);
      if (onSelectShipping) onSelectShipping(null);
    } catch (err) {
      console.error("Erro ao calcular frete:", err);
      setError("Erro ao calcular frete");
      setOptions([]);
      setSelectedOption(null);
      if (onSelectShipping) onSelectShipping(null);
    }

    setLoading(false);
  }

  function handleSelectOption(option) {
    setSelectedOption(option);
    if (onSelectShipping) onSelectShipping(option);
  }

  return (
    <div className="mt-8 rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.94))] p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#31B0A9]" />
          <p className="font-semibold uppercase tracking-[0.14em] text-slate-800">
            Meios de envio
          </p>
        </div>

        <ChevronUp className="w-5 h-5 text-slate-700" />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm">
          Entregas para o CEP: <span className="font-semibold">{cep || "Digite seu CEP"}</span>
        </div>

        <ShineButton
          onClick={calculateShipping}
          size="sm"
          variant="subtle"
          className="min-w-[10rem] bg-slate-900 text-white hover:bg-slate-800"
        >
          Alterar CEP
        </ShineButton>
      </div>

      <div className="mt-3">
        <input
          type="text"
          placeholder="Digite seu CEP"
          value={cep}
          onChange={(event) => setCep(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#31B0A9]"
          maxLength={9}
        />
      </div>

      <div className="mt-4 rounded-xl border border-orange-300 bg-orange-50/70 p-4 text-orange-600">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <p className="text-sm leading-6">
            Os prazos de entrega apresentados são estimativas fornecidas pela transportadora e podem sofrer alterações devido a fatores externos, como condições climáticas, imprevistos logísticos ou operacionais.
          </p>
        </div>
      </div>

      {loading && (
        <p className="mt-4 text-sm text-slate-500">
          Calculando opções de frete...
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500">
          {error}
        </p>
      )}

      {options.length > 0 && (
        <div className="mt-5">
          <p className="font-semibold text-slate-900 mb-3">
            Envio a domicílio
          </p>

          <div className="space-y-3">
            {options.map((option, index) => {
              const isSelected = selectedOption?.id === option.id;

              return (
                <button
                  type="button"
                  key={option.id || index}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full rounded-xl border bg-white px-5 py-4 text-left shadow-sm transition ${
                    isSelected
                      ? "border-[#31B0A9] ring-2 ring-[#31B0A9]/15 shadow-[0_12px_30px_rgba(49,176,169,0.10)]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold uppercase text-slate-900">
                        {getCarrierName(option)}: {getServiceName(option)}
                      </p>
                      <p className="mt-1 text-slate-500">
                        Chega em {option.delivery_time} dias úteis
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-slate-900">
                      R${Number(option.price).toFixed(2)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedOption && (
        <p className="mt-4 text-sm font-medium text-emerald-600">
          Frete selecionado: {getCarrierName(selectedOption)} - {getServiceName(selectedOption)}
        </p>
      )}
    </div>
  );
}
