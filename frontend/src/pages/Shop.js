import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { addToCart } from "../utils/cart";
import { toast } from "sonner";
import { getProducts } from "../services/api";

const CATEGORIES = ["Suportes", "Miniaturas", "Cosplay", "Decoração"];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [, setCartUpdate] = useState(0);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        const formatted = data.map((p) => ({
          ...p,
          id: p._id,
          price: p.variations?.[0]?.price || 0,
          image: p.images?.[0] || "",
          inStock: p.variations?.[0]?.stock > 0 || false,
        }));
        setProducts(formatted);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    }
    loadProducts();
  }, []);

  const countFor = (cat) =>
    cat
      ? products.filter((p) =>
          p.category?.toLowerCase().includes(cat.toLowerCase())
        ).length
      : products.length;

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) =>
      p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [selectedCategory, products]);

  const handleAddToCart = (product) => {
    if (!product.variations?.length) return;
    const firstVariation = product.variations[0];
    addToCart(
      {
        id: product.id,
        name: product.name,
        image: product.image,
        sku: firstVariation.sku,
        price: firstVariation.price,
      },
      1
    );
    setCartUpdate((prev) => prev + 1);
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#020c15" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold text-teal-500 uppercase tracking-[0.2em] mb-1">
              Moldz3D
            </p>
            <h1 className="text-4xl font-extrabold text-white font-['Montserrat'] tracking-tight">
              Loja
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "produto" : "produtos"}
            </span>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen((v) => !v)}
              className="lg:hidden inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors duration-150"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
              {selectedCategory && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
                  1
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile filter chips ──────────────────────────────── */}
        {mobileFilterOpen && (
          <div className="lg:hidden mb-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Categoria
              </span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSelectedCategory(""); setMobileFilterOpen(false); }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all duration-150 ${
                  !selectedCategory
                    ? "bg-teal-500/15 border-teal-500/40 text-teal-300"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                Todos ({products.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setMobileFilterOpen(false); }}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all duration-150 ${
                    selectedCategory === cat
                      ? "bg-teal-500/15 border-teal-500/40 text-teal-300"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {cat} ({countFor(cat)})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-8 items-start">

          {/* ── Sidebar filter (desktop) ────────────────────────── */}
          <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-24">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-md overflow-hidden">

              {/* Header do filtro */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-white/8">
                <SlidersHorizontal className="w-4 h-4 text-teal-500" />
                <span className="text-sm font-semibold text-white">Filtros</span>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="ml-auto text-xs text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Todos */}
              <div className="px-3 pt-3 pb-1">
                <span className="px-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                  Categoria
                </span>
              </div>

              <ul className="px-3 pb-4 space-y-1">
                <li>
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group ${
                      !selectedCategory
                        ? "bg-teal-500/12 text-teal-300 shadow-[0_0_18px_rgba(49,176,169,0.1)]"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>Todos</span>
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 font-semibold transition-colors ${
                        !selectedCategory
                          ? "bg-teal-500/20 text-teal-400"
                          : "bg-white/8 text-slate-500 group-hover:text-slate-400"
                      }`}
                    >
                      {products.length}
                    </span>
                  </button>
                </li>

                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat;
                  const count = countFor(cat);
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group ${
                          active
                            ? "bg-teal-500/12 text-teal-300 shadow-[0_0_18px_rgba(49,176,169,0.1)]"
                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(49,176,169,0.8)]" />
                          )}
                          {cat}
                        </span>
                        <span
                          className={`text-xs rounded-full px-2 py-0.5 font-semibold transition-colors ${
                            active
                              ? "bg-teal-500/20 text-teal-400"
                              : "bg-white/8 text-slate-500 group-hover:text-slate-400"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Linha separadora + active filter pill */}
              {selectedCategory && (
                <div className="px-4 pb-4 border-t border-white/8 pt-3">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">
                    Filtro ativo
                  </p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 px-3 py-1 text-xs font-medium text-teal-300">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="hover:text-white transition-colors"
                      aria-label="Remover filtro"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </div>
              )}
            </div>
          </aside>

          {/* ── Product grid ────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-7 h-7 text-slate-600" />
                </div>
                <p className="text-slate-400 font-medium">
                  Nenhum produto encontrado
                </p>
                <p className="text-slate-600 text-sm mt-1">
                  Tente remover os filtros aplicados
                </p>
                <button
                  onClick={() => setSelectedCategory("")}
                  className="mt-4 text-sm text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
