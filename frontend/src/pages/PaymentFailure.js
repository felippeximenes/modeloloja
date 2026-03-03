import { useNavigate } from "react-router-dom";

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-lg text-center px-6">
        <h1 className="text-4xl font-bold text-red-600 mb-6">
          ❌ Pagamento não aprovado
        </h1>

        <p className="text-slate-600 mb-8">
          Algo deu errado com seu pagamento.
          Você pode tentar novamente.
        </p>

        <button
          onClick={() => navigate("/checkout")}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3 rounded-full transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}