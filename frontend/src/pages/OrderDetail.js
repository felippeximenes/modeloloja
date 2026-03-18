import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrderById } from "../services/api";
import { logoutUser } from "../services/auth";
import { toast } from "sonner";

export default function OrderDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (error) {

        console.error("Erro ao carregar pedido:", error);

        if (
          error.message?.includes("401") ||
          error.message?.toLowerCase().includes("unauthorized")
        ) {
          logoutUser();
          toast.error("Sessão expirada");
          navigate("/login");
          return;
        }

        toast.error("Erro ao carregar pedido");
      }

      setLoading(false);
    }

    loadOrder();
  }, [id, navigate]);

  if (loading) {
    return <div className="p-10">Carregando pedido...</div>;
  }

  if (!order) {
    return <div className="p-10">Pedido não encontrado</div>;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">

      <Link to="/account/orders" className="text-sm text-slate-500">
        ← Voltar para pedidos
      </Link>

      <h1 className="text-3xl font-bold mt-4">
        Pedido #{order.id}
      </h1>

      {/* STATUS */}
      <div className="mt-4 flex gap-4">
        <span className="px-3 py-1 rounded-full bg-slate-100">
          Status: {order.status}
        </span>

        <span className="px-3 py-1 rounded-full bg-emerald-100">
          Pagamento: {order.payment_status}
        </span>
      </div>

      {/* ITENS */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Itens
        </h2>

        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="border rounded-xl p-4 flex justify-between"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-slate-500">
                  {item.model} • {item.color} • {item.size}
                </p>
                <p className="text-sm text-slate-500">
                  Quantidade: {item.quantity}
                </p>
              </div>

              <div className="font-semibold">
                R$ {(item.unit_price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ENDEREÇO */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Endereço de entrega
        </h2>

        <div className="border rounded-xl p-4 text-sm text-slate-600">
          <p>{order.address.receiver_name}</p>
          <p>{order.address.receiver_address}, {order.address.receiver_number}</p>
          <p>{order.address.receiver_district}</p>
          <p>{order.address.receiver_city} - {order.address.receiver_state}</p>
          <p>CEP: {order.address.to_cep}</p>
        </div>
      </div>

      {/* FRETE */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Frete
        </h2>

        <div className="border rounded-xl p-4 text-sm text-slate-600">
          <p>Transportadora: {order.shipping.company_name}</p>
          <p>Prazo: {order.shipping.delivery_time} dias</p>
          <p>Valor: R$ {Number(order.shipping.price).toFixed(2)}</p>
        </div>
      </div>

      {/* TOTAL */}
      <div className="mt-8 border-t pt-6 text-right">
        <p>Subtotal: R$ {order.subtotal.toFixed(2)}</p>
        <p>Frete: R$ {order.shipping_price.toFixed(2)}</p>
        <p className="text-xl font-bold mt-2">
          Total: R$ {order.total.toFixed(2)}
        </p>
      </div>

    </main>
  );
}