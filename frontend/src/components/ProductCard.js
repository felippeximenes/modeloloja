import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export const ProductCard = ({ product, onAddToCart }) => {

  const hasVariations = product.variations && product.variations.length > 0;

  const minPrice = hasVariations
    ? Math.min(...product.variations.map((v) => v.price))
    : 0;

  const hasStock = hasVariations
    ? product.variations.some((v) => v.stock > 0)
    : false;

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]
      : "/placeholder.png";

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (!hasStock) return;

    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const productId = product._id || product.id;

  return (

    <Link
      to={`/product/${productId}`}
      className="group relative rounded-2xl bg-white border border-slate-100 overflow-hidden hover:border-emerald-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >

      <div className="relative aspect-square overflow-hidden bg-slate-50">

        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

      </div>

      <div className="p-4 space-y-3">

        <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">
          {product.category}
        </span>

        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">

          <div className="flex flex-col">

            <span className="text-xs text-slate-500">
              A partir de
            </span>

            <span className="text-2xl font-bold text-slate-900">
              R$ {minPrice.toFixed(2)}
            </span>

          </div>

        </div>

        <button
          onClick={handleAddToCart}
          disabled={!hasStock}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-full transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >

          <ShoppingCart className="w-4 h-4" />

          <span>
            {hasStock ? "Adicionar ao Carrinho" : "Fora de Estoque"}
          </span>

        </button>

      </div>

    </Link>

  );

};