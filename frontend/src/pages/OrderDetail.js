import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrderById, getOrderTracking, getOrderLabel } from "../services/api";
import { logoutUser } from "../services/auth";
import { toast } from "sonner";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [label, setLabel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState(true);

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

        toast.error(error.message || "Erro ao carregar pedido");
      }

      setLoading(false);
    }

    loadOrder();
  }, [id, navigate]);

  useEffect(() => {
    async function loadTrackingData() {
      try {
        const trackingData = await getOrderTracking(id);
        setTracking(trackingData);
      } catch (error) {
        console.error("Erro ao carregar tracking:", error);
        setTracking(null);
      }

      try {
        const labelData = await getOrderLabel(id);
        setLabel(labelData);
      } catch (error) {
        console.error("Etiqueta ainda não disponível:", error);
        setLabel(null);
      }

      setTrackingLoading(false);
    }

    loadTrackingData();
  }, [id]);

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

  function getPaymentStatusLabel(status) {
    const map = {
      unpaid: "Não pago",
      paid: "Pago",
      failed: "Falhou",
      pending: "Pendente",
    };

    return map[status] || status || "Sem status";
  }

  function getLabelUrl() {
    if (!label) return null;
    if (typeof label === "string") return label;
    if (label.label_url) return label.label_url;
    if (label.url) return label.url;
    return null;
  }

  const trackingInfo = useMemo(() => {
    const raw = tracking?.tracking;

    if (!raw) {
      return {
        available: false,
        code: null,
        status: null,
        content: null,
      };
    }

    if (typeof raw === "string") {
      return {
        available: true,
        code: null,
        status: null,
        content: raw,
      };
    }

    const code =
      raw.tracking_code ||
      raw.code ||
      raw.codigo ||
      raw.label ||
      null;

    const status =
      raw.status ||
      raw.situacao ||
      raw.current_status ||
      null;

    return {
      available: true,
      code,
      status,
      content: raw,
    };
  }, [tracking]);

  if (loading) {
    return <div className="p-10">Carregando pedido...</div>;
  }

  if (!order) {
    return <div className="p-10">Pedido não encontrado</div>;
  }

  const labelUrl = getLabelUrl();

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/account/orders" className="text-sm text-slate-500 hover:text-slate-900">
        ← Voltar para pedidos
      </Link>

      <h1 className="text-3xl font-bold mt-4">
        Pedido #{order.id}
      </h1>

      <div className="mt-4 flex flex-wrap gap-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
          Status: {getStatusLabel(order.status)}
        </span>

        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
          Pagamento: {getPaymentStatusLabel(order.payment_status)}
        </span>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Itens
        </h2>

        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="border rounded-xl p-4 flex justify-between gap-4"
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

              <div className="font-semibold whitespace-nowrap">
                R$ {(item.unit_price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

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

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Frete
        </h2>

        <div className="border rounded-xl p-4 text-sm text-slate-600">
          <p>Transportadora: {order.shipping.company_name}</p>
          <p>Serviço: {order.shipping.service_name || "-"}</p>
          <p>Prazo: {order.shipping.delivery_time} dias</p>
          <p>Valor: R$ {Number(order.shipping.price).toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Rastreamento
        </h2>

        <div className="border rounded-xl p-5 bg-white space-y-4">
          {trackingLoading ? (
            <p className="text-sm text-slate-500">
              Carregando rastreamento...
            </p>
          ) : !trackingInfo.available ? (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                O rastreamento ainda não está disponível para este pedido.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Código de rastreio
                  </p>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {trackingInfo.code || "Ainda não informado"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Status do envio
                  </p>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {trackingInfo.status || "Aguardando atualização"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">
                  Retorno da transportadora
                </p>

                {typeof trackingInfo.content === "string" ? (
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words">
                    {trackingInfo.content}
                  </pre>
                ) : (
                  <pre className="text-xs text-slate-700 whitespace-pre-wrap break-words overflow-auto">
                    {JSON.stringify(trackingInfo.content, null, 2)}
                  </pre>
                )}
              </div>
            </>
          )}

          {labelUrl && (
            <a
              href={labelUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex bg-slate-900 hover:bg-slate-700 text-white font-semibold px-5 py-3 rounded-full"
            >
              Abrir etiqueta
            </a>
          )}
        </div>
      </div>

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