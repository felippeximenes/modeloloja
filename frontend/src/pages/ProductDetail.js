import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Check } from 'lucide-react';
import { products } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { addToCart } from '../utils/cart';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [, setCartUpdate] = useState(0);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      navigate('/shop');
    }
  }, [id, navigate]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setCartUpdate(prev => prev + 1);
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/cart');
  };

  const handleRelatedProductAddToCart = (relatedProduct) => {
    addToCart(relatedProduct, 1);
    setCartUpdate(prev => prev + 1);
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${relatedProduct.name} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/shop"
          className="inline-flex items-center text-slate-600 hover:text-emerald-600 font-medium mb-8 transition-colors"
          data-testid="back-button"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para a loja
        </Link>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4" data-testid="product-images">
            {/* Main Image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="main-product-image"
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                  -{discountPercentage}% OFF
                </div>
              )}
              {product.dealOfTheDay && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                  Deal of the Day
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6" data-testid="product-info">
            {/* Category */}
            <div>
              <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-['Manrope']" data-testid="product-title">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-4" data-testid="product-rating">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-600">
                {product.rating} ({product.reviews} avaliações)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-4">
              <span className="text-5xl font-bold text-slate-900" data-testid="product-price">
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-2xl text-slate-400 line-through" data-testid="product-original-price">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-lg text-slate-600 leading-relaxed" data-testid="product-description">
              {product.description}
            </p>

            {/* Specifications */}
            <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
              <h3 className="font-semibold text-slate-900 mb-4">Especificações Técnicas</h3>
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="font-medium text-slate-900">{value}</span>
                </div>
              ))}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-slate-700 font-medium">Quantidade:</span>
              <div className="flex items-center border-2 border-slate-200 rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-slate-600 hover:text-emerald-600 font-bold transition-colors"
                  data-testid="decrease-quantity"
                >
                  -
                </button>
                <span className="px-6 py-2 font-semibold text-slate-900" data-testid="quantity-display">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-slate-600 hover:text-emerald-600 font-bold transition-colors"
                  data-testid="increase-quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-full transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                data-testid="add-to-cart-button-detail"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Adicionar ao Carrinho</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-8 rounded-full transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                data-testid="buy-now-button"
              >
                Comprar Agora
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-4">
              <button className="flex-1 border-2 border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-600 font-medium py-3 px-6 rounded-full transition-colors flex items-center justify-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Favoritar</span>
              </button>
              <button className="flex-1 border-2 border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-600 font-medium py-3 px-6 rounded-full transition-colors flex items-center justify-center space-x-2">
                <Share2 className="w-5 h-5" />
                <span>Compartilhar</span>
              </button>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2 text-emerald-600" data-testid="stock-status">
              <Check className="w-5 h-5" />
              <span className="font-medium">Em estoque e pronto para envio</span>
            </div>

            {/* Features */}
            <div className="border-t border-slate-200 pt-6 space-y-3">
              <div className="flex items-center text-sm text-slate-600">
                <Check className="w-5 h-5 text-emerald-500 mr-3" />
                Garantia de 30 dias
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Check className="w-5 h-5 text-emerald-500 mr-3" />
                Frete grátis acima de R$ 150
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Check className="w-5 h-5 text-emerald-500 mr-3" />
                Parcelamento em até 12x sem juros
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-16 border-t border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 font-['Manrope'] mb-8">
              Produtos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard 
                  key={relatedProduct.id} 
                  product={relatedProduct} 
                  onAddToCart={handleRelatedProductAddToCart}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
