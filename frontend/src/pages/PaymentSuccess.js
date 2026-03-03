import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../utils/cart";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    //  Limpa carrinho após pagamento aprovado
    clearCart();
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-lg text-center px-6">
        <h1 className="text-4xl font-bold text-emerald-600 mb-6">
          🎉 Pagamento aprovado!
        </h1>

        <p className="text-slate-600 mb-8">
          Seu pedido foi recebido com sucesso.
          Você receberá um e-mail com os detalhes.
        </p>

        <button
          onClick={() => navigate("/shop")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-full transition"
        >
          Voltar para a loja
        </button>
      </div>
    </div>
  );
}