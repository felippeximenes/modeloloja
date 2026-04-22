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
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [maxPrice, setMaxPrice] = useState(0);
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

        const top = Math.ceil(Math.max(...formatted.map((p) => p.price), 0) / 10) * 10;
        setMaxPrice(top);
        setPriceRange([0, top]);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    }
    loadProducts();
  }, []);

  const hasCategory = (p, cat) => {
    if (!cat) return true;
    const cats = Array.isArray(p.categories) ? p.categories : p.category ? [p.category] : [];
    return cats.some((c) => c.toLowerCase().includes(cat.toLowerCase()));
  };

  const countFor = (cat) =>
    cat ? products.filter((p) => hasCategory(p, cat)).length : products.length;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = hasCategory(p, selectedCategory);
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchCat && matchPrice;
    });
  }, [selectedCategory, priceRange, products]);

  const hasActiveFilters = selectedCategory || priceRange[0] > 0 || priceRange[1] < maxPrice;

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceRange([0, maxPrice]);
  };

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

  const formatPrice = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 font-['Montserrat'] tracking-tight">
              Loja
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </p>
          </div>

          <button
            onClick={() => setMobileFilterOpen((v) => !v)}
            className="lg:hidden inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors duration-150"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
                !
              </span>
            )}
          </button>
        </div>

        {/* ── Mobile filter panel ──────────────────────────────── */}
        {mobileFilterOpen && (
          <div className="lg:hidden mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-800">Filtros</span>
              <button onClick={() => setMobileFilterOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Categoria</p>
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setSelectedCategory("")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all duration-150 ${
                  !selectedCategory
                    ? "bg-teal-500 border-teal-500 text-white"
                    : "border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600"
                }`}
              >
                Todos
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all duration-150 ${
                    selectedCategory === cat
                      ? "bg-teal-500 border-teal-500 text-white"
                      : "border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <PriceRangeSlider
              min={0}
              max={maxPrice}
              value={priceRange}
              onChange={setPriceRange}
              formatPrice={formatPrice}
              light
            />
          </div>
        )}

        <div className="flex gap-8 items-start">

          {/* ── Sidebar (desktop) ───────────────────────────────── */}
          <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-24">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* Header */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                <SlidersHorizontal className="w-4 h-4 text-teal-500" />
                <span className="text-sm font-semibold text-slate-800">Filtros</span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto text-xs text-teal-500 hover:text-teal-600 font-medium transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Categoria */}
              <div className="px-3 pt-4 pb-1">
                <span className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Categoria
                </span>
              </div>
              <ul className="px-3 pb-4 space-y-0.5">
                <li>
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group ${
                      !selectedCategory
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {!selectedCategory && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                      Todos
                    </span>
                    <span className={`text-xs rounded-full px-2 py-0.5 font-semibold ${
                      !selectedCategory ? "bg-teal-100 text-teal-600" : "bg-slate-100 text-slate-500"
                    }`}>
                      {products.length}
                    </span>
                  </button>
                </li>
                {CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group ${
                          active
                            ? "bg-teal-50 text-teal-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {active && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                          {cat}
                        </span>
                        <span className={`text-xs rounded-full px-2 py-0.5 font-semibold ${
                          active ? "bg-teal-100 text-teal-600" : "bg-slate-100 text-slate-500"
                        }`}>
                          {countFor(cat)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Divider */}
              <div className="border-t border-slate-100 mx-3" />

              {/* Preço */}
              <div className="px-5 py-5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-4">
                  Faixa de Preço
                </span>
                <PriceRangeSlider
                  min={0}
                  max={maxPrice}
                  value={priceRange}
                  onChange={setPriceRange}
                  formatPrice={formatPrice}
                />
              </div>

              {/* Active filters */}
              {hasActiveFilters && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">
                    Ativos
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-medium text-teal-700">
                        {selectedCategory}
                        <button onClick={() => setSelectedCategory("")} className="hover:text-teal-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-medium text-teal-700">
                        {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
                        <button onClick={() => setPriceRange([0, maxPrice])} className="hover:text-teal-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
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
                <div className="w-16 h-16 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-700 font-medium">Nenhum produto encontrado</p>
                <p className="text-slate-400 text-sm mt-1">Tente remover os filtros aplicados</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-teal-500 hover:text-teal-600 font-medium transition-colors"
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

/* ── Price Range Slider ─────────────────────────────────────────── */
function PriceRangeSlider({ min, max, value, onChange, formatPrice, light }) {
  if (max === 0) return null;

  const pct = (v) => ((v - min) / (max - min)) * 100;

  return (
    <div>
      {/* Labels */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-semibold ${light ? "text-slate-800" : "text-slate-700"}`}>
          {formatPrice(value[0])}
        </span>
        <span className={`text-sm font-semibold ${light ? "text-slate-800" : "text-slate-700"}`}>
          {formatPrice(value[1])}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-1.5 rounded-full bg-slate-100 mx-2">
        {/* Active range highlight */}
        <div
          className="absolute h-full rounded-full bg-teal-500"
          style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={5}
          value={value[0]}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < value[1]) onChange([v, value[1]]);
          }}
          className="price-thumb absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: value[0] > max - 10 ? 5 : 3 }}
        />

        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={5}
          value={value[1]}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > value[0]) onChange([value[0], v]);
          }}
          className="price-thumb absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />

        {/* Visual thumbs */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-teal-500 shadow-sm pointer-events-none"
          style={{ left: `calc(${pct(value[0])}% - 8px)` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-teal-500 shadow-sm pointer-events-none"
          style={{ left: `calc(${pct(value[1])}% - 8px)` }}
        />
      </div>

      <style>{`
        .price-thumb::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; }
        .price-thumb::-moz-range-thumb { width: 16px; height: 16px; border: none; background: transparent; }
      `}</style>
    </div>
  );
}
