import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Users, ShoppingCart, TrendingUp, Plus } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { getStats } from "../../services/adminApi";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Visão geral da loja</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" /> Novo produto
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Package}
          label="Produtos ativos"
          value={stats?.products.active}
          color="bg-emerald-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Total de produtos"
          value={stats?.products.total}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Usuários"
          value={stats?.users}
          color="bg-violet-500"
        />
        <StatCard
          icon={ShoppingCart}
          label="Pedidos"
          value={stats?.orders}
          color="bg-amber-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Ações rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" /> Adicionar produto
          </Link>
          <Link
            to="/admin/products"
            className="flex items-center gap-2 border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Package className="w-4 h-4" /> Gerenciar produtos
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
