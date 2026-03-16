import { useState } from "react";

export default function ShippingCalculator({ product }) {

  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [error, setError] = useState(null);

  async function calculateShipping() {

    if (!cep || cep.length < 8) {
      setError("Digite um CEP válido");
      return;
    }

    setLoading(true);
    setError(null);
    setOptions([]);

    try {

      const response = await fetch(
        "http://localhost:8000/api/shipping/quote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: product.id,
            to_cep: cep,
            quantity: 1,
          }),
        }
      );

      const data = await response.json();

      if (data.options) {
        setOptions(data.options);
      } else {
        setError("Nenhuma opção de frete encontrada");
      }

    } catch (error) {

      console.error("Erro ao calcular frete:", error);
      setError("Erro ao calcular frete");

    }

    setLoading(false);
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
          onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
          className="border rounded px-3 py-2 w-40"
        />

        <button
          onClick={calculateShipping}
          className="bg-slate-900 text-white px-4 py-2 rounded"
        >
          Calcular
        </button>

      </div>

      {loading && (
        <p className="text-sm mt-2">Calculando frete...</p>
      )}

      {error && (
        <p className="text-sm mt-2 text-red-500">{error}</p>
      )}

      {options.length > 0 && (

        <div className="mt-3 space-y-1">

          {options.map((option, index) => (

            <div
              key={index}
              className="text-sm text-slate-700 border rounded p-2 flex justify-between"
            >

              <span>
                {option.name} • {option.delivery_time} dias
              </span>

              <span className="font-semibold text-emerald-600">
                R$ {Number(option.price).toFixed(2)}
              </span>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}