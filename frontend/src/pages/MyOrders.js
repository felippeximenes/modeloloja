import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyOrders } from "../services/api";
import { logoutUser } from "../services/auth";
import { toast } from "sonner";

export default function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getMyOrders();
        setOrders(data || []);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);

        if (
          error.message?.toLowerCase().includes("401") ||
          error.message?.toLowerCase().includes("não autenticado") ||
          error.message?.toLowerCase().includes("unauthorized")
        ) {
          logoutUser();
          toast.error("Sua sessão expirou. Faça login novamente.");
          navigate("/login");
          return;
        }

        toast.error(error.message || "Erro ao carregar pedidos");
      }

      setLoading(false);
    }

    loadOrders();
  }, [navigate]);

  function getStatusLabel(status) {
    const map = {
      created: "Criado",
      paid: "Pago",
      pending: "Pendente",
      cancelled: "Cancelado",
      shipped: "Enviado",
      delivered: "Entregue",
    };

    return map[status] || status || "Sem status";
  }

  function getStatusClass(status) {
    const map = {
      created: "bg-slate-100 text-slate-700",
      paid: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      cancelled: "bg-red-100 text-red-700",
      shipped: "bg-blue-100 text-blue-700",
      delivered: "bg-green-100 text-green-700",
    };

    return map[status] || "bg-slate-100 text-slate-700";
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          to="/account"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Voltar para Minha Conta
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mt-3">
          Meus Pedidos
        </h1>

        <p className="text-slate-500 mt-2">
          Acompanhe suas compras realizadas na Moldz3D.
        </p>
      </div>

      {loading ? (
        <div className="border border-slate-200 rounded-2xl p-8 bg-white">
          <p className="text-slate-500">Carregando pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-slate-200 rounded-2xl p-8 bg-white">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Você ainda não fez pedidos
          </h2>
          <p className="text-slate-500 mb-6">
            Quando você finalizar uma compra, ela aparecerá aqui.
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full"
          >
            Ir para a loja
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-slate-200 rounded-2xl p-6 bg-white"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">
                    Pedido
                  </p>
                  <p className="font-semibold text-slate-900">
                    #{order.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Status
                  </p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Pagamento
                  </p>
                  <p className="font-medium text-slate-900">
                    {order.payment_status || "unpaid"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Itens
                  </p>
                  <p className="font-medium text-slate-900">
                    {order.items_count || 0}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Total
                  </p>
                  <p className="font-bold text-slate-900">
                    R$ {Number(order.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t text-sm text-slate-500">
                <p>
                  Cliente: {order.receiver || "-"}
                </p>
                <p>
                  Criado em:{" "}
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString("pt-BR")
                    : "-"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}