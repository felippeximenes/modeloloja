import { useState } from "react";

export default function ShippingCalculator({ product }) {

  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  async function calculateShipping() {

    if (!cep) return;

    setLoading(true);

    try {

      const response = await fetch(
        `http://localhost:8000/api/shipping/calculate?cep=${cep}&product_id=${product.id}`
      );

      const data = await response.json();

      setOptions(data);

    } catch (error) {

      console.error("Erro ao calcular frete:", error);

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
          onChange={(e) => setCep(e.target.value)}
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
        <p className="text-sm mt-2">Calculando...</p>
      )}

      {options.length > 0 && (

        <div className="mt-3 space-y-1">

          {options.map((option, index) => (

            <div
              key={index}
              className="text-sm text-slate-700"
            >
              {option.name} • R$ {option.price} • {option.delivery_time} dias
            </div>

          ))}

        </div>

      )}

    </div>

  );

}