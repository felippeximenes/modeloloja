import { useNavigate } from "react-router-dom";
import { ShineButton } from "../components/ui/ShineButton";

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

        <ShineButton
          onClick={() => navigate("/checkout")}
          size="lg"
        >
          Tentar novamente
        </ShineButton>
      </div>
    </div>
  );
}
