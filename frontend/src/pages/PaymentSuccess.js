import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../utils/cart";
import { ShineButton } from "../components/ui/ShineButton";

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

        <ShineButton
          onClick={() => navigate("/shop")}
          size="lg"
        >
          Voltar para a loja
        </ShineButton>
      </div>
    </div>
  );
}
