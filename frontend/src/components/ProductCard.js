import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';

export const ProductCard = ({ product, onAddToCart }) => {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="group relative rounded-2xl bg-white border border-slate-100 overflow-hidden hover:border-emerald-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      data-testid={`product-card-${product.id}`}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div 
          className="absolute top-3 left-3 z-10 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full"
          data-testid="discount-badge"
        >
          -{discountPercentage}%
        </div>
      )}

      {/* Deal Badge */}
      {product.dealOfTheDay && (
        <div 
          className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full"
          data-testid="deal-badge"
        >
          Deal
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          data-testid="product-image"
        />
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <span 
          className="text-xs text-emerald-600 font-semibold uppercase tracking-wider"
          data-testid="product-category"
        >
          {product.category}
        </span>

        {/* Name */}
        <h3 
          className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors"
          data-testid="product-name"
        >
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span 
            className="text-sm text-slate-500"
            data-testid="product-reviews"
          >
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span 
              className="text-2xl font-bold text-slate-900"
              data-testid="product-price"
            >
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span 
                className="text-sm text-slate-400 line-through"
                data-testid="product-original-price"
              >
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-full transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          data-testid="add-to-cart-button"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{product.inStock ? 'Adicionar ao Carrinho' : 'Fora de Estoque'}</span>
        </button>
      </div>
    </Link>
  );
};
