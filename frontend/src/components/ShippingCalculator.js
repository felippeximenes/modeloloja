import { useState } from "react";

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

  function getCarrierLogo(option) {
    const company = (option.company || "").toLowerCase();
    const service = (option.service || option.name || "").toLowerCase();

    if (
      company.includes("correios") ||
      service.includes("sedex") ||
      service.includes("pac")
    ) {
      return "/logos/correios.png";
    }

    if (company.includes("jadlog")) {
      return "/logos/jadlog.png";
    }

    if (company.includes("loggi")) {
      return "/logos/loggi.png";
    }

    return "/logos/default.png";
  }

  async function calculateShipping() {
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      setError("Digite um CEP válido com 8 números");
      setOptions([]);
      setSelectedOption(null);
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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product_id: productId,
          to_cep: cleanCep,
          quantity: 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erro backend:", data);
        throw new Error(data?.detail || "Erro ao calcular frete");
      }

      setOptions(data.options || []);
      setSelectedOption(null);
    } catch (err) {
      console.error("Erro ao calcular frete:", err);
      setError("Erro ao calcular frete");
      setOptions([]);
      setSelectedOption(null);
    }

    setLoading(false);
  }

  function handleSelectOption(option) {
    setSelectedOption(option);

    if (onSelectShipping) {
      onSelectShipping(option);
    }
  }

  return (
    <div className="mt-6">
      <p className="font-semibold mb-2">
        Calcular Frete
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Digite seu CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          className="border rounded px-3 py-2 w-40"
          maxLength={9}
        />

        <button
          onClick={calculateShipping}
          className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 transition"
        >
          Calcular
        </button>
      </div>

      {loading && (
        <p className="text-sm mt-2 text-slate-500">
          Calculando...
        </p>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-2">
          {error}
        </p>
      )}

      {options.length > 0 && (
        <div className="mt-3 space-y-2">
          {options.map((option, index) => {
            const isSelected = selectedOption?.id === option.id;

            return (
              <button
                type="button"
                key={option.id || index}
                onClick={() => handleSelectOption(option)}
                className={`w-full border rounded p-3 flex items-center justify-between gap-3 text-left transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-white border rounded p-1">
                    <img
                      src={getCarrierLogo(option)}
                      alt={getCarrierName(option)}
                      className="w-8 h-8 object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {getCarrierName(option)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {getServiceName(option)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    R$ {Number(option.price).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {option.delivery_time} dias
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedOption && (
        <p className="text-sm text-emerald-600 mt-3 font-medium">
          Frete selecionado: {getCarrierName(selectedOption)} - {getServiceName(selectedOption)}
        </p>
      )}
    </div>
  );
}