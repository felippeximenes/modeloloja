import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";
import { adminGetProducts, adminDeleteProduct, adminToggleActive } from "../../services/adminApi";

export default function AdminProducts() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [deleting, setDeleting]   = useState(null);

  async function load() {
    try {
      const data = await adminGetProducts();
      setProducts(data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(product) {
    if (!window.confirm(`Excluir "${product.name}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(product.id);
    try {
      await adminDeleteProduct(product.id);
      toast.success("Produto excluído.");
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(null);
    }
  }

  async function handleToggle(product) {
    try {
      await adminToggleActive(product.id, !product.active);
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, active: !p.active } : p)
      );
      toast.success(product.active ? "Produto desativado." : "Produto ativado.");
    } catch (e) {
      toast.error(e.message);
    }
  }

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} produto(s) no catálogo</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" /> Novo produto
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Nenhum produto encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Produto</th>
                  <th className="px-4 py-3 text-left">Categorias</th>
                  <th className="px-4 py-3 text-right">Preço</th>
                  <th className="px-4 py-3 text-center">Estoque</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((product) => {
                  const firstVariation = product.variations?.[0];
                  const price = firstVariation?.price;
                  const stock = product.variations?.reduce((s, v) => s + (v.stock || 0), 0) ?? 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-contain bg-slate-100 border border-slate-200"
                          />
                          <span className="font-medium text-slate-800 line-clamp-2 max-w-xs">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(product.categories || []).slice(0, 3).map((c) => (
                            <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {price != null
                          ? `R$ ${price.toFixed(2).replace(".", ",")}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                        }`}>
                          {stock > 0 ? `${stock} un.` : "Sem estoque"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(product)}
                          title={product.active ? "Desativar" : "Ativar"}
                          className="text-slate-400 hover:text-emerald-500 transition"
                        >
                          {product.active
                            ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                            : <ToggleLeft className="w-6 h-6" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product)}
                            disabled={deleting === product.id}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition disabled:opacity-40"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
