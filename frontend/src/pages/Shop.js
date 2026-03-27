import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { addToCart } from "../utils/cart";
import { toast } from "sonner";
import { getProducts } from "../services/api";
import { ShineButton } from "../components/ui/ShineButton";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [, setCartUpdate] = useState(0);

  // ===============================
  // LOAD PRODUCTS FROM API
  // ===============================
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
        setFilteredProducts(formatted);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    }

    loadProducts();
  }, []);

  // ===============================
  // FILTER BY CATEGORY
  // ===============================
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter((p) =>
        p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, products]);

  const clearFilters = () => {
    setSelectedCategory("");
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Loja</h1>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64">
            <div className="border rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Categoria</h3>

              {["Suportes", "Miniaturas", "Cosplay", "Decoração"].map(
                (category) => (
                  <ShineButton
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    variant="ghost"
                    size="sm"
                    className={`mb-2 w-full justify-start ${
                      selectedCategory === category
                        ? "text-emerald-600 font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    {category}
                  </ShineButton>
                )
              )}

              <ShineButton
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="mt-4 justify-start px-0 text-emerald-600 hover:bg-transparent"
              >
                Limpar Filtros
              </ShineButton>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <p>Nenhum produto encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
