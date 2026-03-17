import { useState } from "react";

export default function ShippingCalculator({ product }) {

  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [error, setError] = useState(null);

  async function calculateShipping() {

    if (!cep) return;

    setLoading(true);
    setError(null);

    // garante que estamos enviando o ID correto
    const productId = product?.id || product?._id;

    console.log("Produto recebido:", product);
    console.log("ID enviado para API:", productId);

    try {

      const response = await fetch("http://localhost:8000/api/shipping/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product_id: productId,
          to_cep: cep.replace(/\D/g, ""),
          quantity: 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erro backend:", data);
        throw new Error(data?.detail || "Erro ao calcular frete");
      }

      console.log("Resposta frete:", data);

      setOptions(data.options || []);

    } catch (err) {

      console.error("Erro ao calcular frete:", err);
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
          onChange={(e) => setCep(e.target.value)}
          className="border rounded px-3 py-2 w-40"
        />

        <button
          onClick={calculateShipping}
          className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 transition"
        >
          Calcular
        </button>

      </div>

      {loading && (
        <p className="text-sm mt-2">Calculando...</p>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {options.length > 0 && (

        <div className="mt-3 space-y-2">

          {options.map((option, index) => (

            <div
              key={option.id || index}
              className="text-sm text-slate-700 border rounded p-2 flex justify-between items-center"
            >
              <span>{option.name}</span>
              <span>R$ {option.price}</span>
              <span>{option.delivery_time} dias</span>
            </div>

          ))}

        </div>

      )}

    </div>

  );

}