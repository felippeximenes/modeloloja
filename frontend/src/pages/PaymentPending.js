import { useNavigate } from "react-router-dom";

export default function PaymentPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-lg text-center px-6">
        <h1 className="text-4xl font-bold text-amber-500 mb-6">
          ⏳ Pagamento pendente
        </h1>

        <p className="text-slate-600 mb-8">
          Seu pagamento está sendo processado.
          Assim que for aprovado, seu pedido será confirmado.
        </p>

        <button
          onClick={() => navigate("/shop")}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3 rounded-full transition"
        >
          Voltar para a loja
        </button>
      </div>
    </div>
  );
}