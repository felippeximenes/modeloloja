import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { getProducts } from "../services/api";
import { addToCart } from "../utils/cart";
import { toast } from "sonner";

export default function Shop() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  const [priceRange, setPriceRange] = useState([0, 300]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // ===============================
  // LOAD PRODUCTS FROM API
  // ===============================
  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    }

    loadProducts();
  }, []);

  // ===============================
  // FILTER LOGIC
  // ===============================
  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, priceRange, sortBy]);

  const getMinPrice = (product) => {
    if (!product.variations || product.variations.length === 0) return 0;
    return Math.min(...product.variations.map((v) => v.price));
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (p) =>
          p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by price range (based on minimum variation price)
    filtered = filtered.filter((p) => {
      const minPrice = getMinPrice(p);
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => getMinPrice(a) - getMinPrice(b));
        break;
      case "price-high":
        filtered.sort((a, b) => getMinPrice(b) - getMinPrice(a));
        break;
      case "newest":
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceRange([0, 300]);
    setSortBy("featured");
  };

  const handleAddToCart = (product) => {
    // Add first variation by default (temporary solution)
    const variation = product.variations?.[0];

    if (!variation) {
      toast.error("Produto sem variações disponíveis");
      return;
    }

    addToCart(
      {
        ...product,
        selectedVariation: variation,
        price: variation.price,
      },
      1
    );

    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Loja
          </h1>
          <p className="text-slate-600">
            {filteredProducts.length} produtos encontrados
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24">
              <h3 className="font-semibold text-slate-900 mb-6">Filtros</h3>

              {/* Category */}
              <div className="mb-6">
                <h4 className="font-medium text-slate-900 mb-3">Categoria</h4>
                {["suportes", "miniaturas", "decoracao"].map((category) => (
                  <label key={category} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="category"
                      checked={
                        selectedCategory.toLowerCase() === category.toLowerCase()
                      }
                      onChange={() => setSelectedCategory(category)}
                      className="mr-2"
                    />
                    {category}
                  </label>
                ))}
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === ""}
                    onChange={() => setSelectedCategory("")}
                    className="mr-2"
                  />
                  Todas
                </label>
              </div>

              {/* Price */}
              <div>
                <h4 className="font-medium text-slate-900 mb-3">
                  Faixa de Preço
                </h4>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([0, parseInt(e.target.value)])
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-600 mt-2">
                  <span>R$0</span>
                  <span>R${priceRange[1]}</span>
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 rounded-full"
              >
                Limpar Filtros
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      price: getMinPrice(product),
                    }}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <button
                  onClick={clearFilters}
                  className="bg-emerald-500 text-white px-6 py-2 rounded-full"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}