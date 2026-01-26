import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, CreditCard, Headphones } from 'lucide-react';
import { products, categories } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { addToCart } from '../utils/cart';
import { toast } from 'sonner';

export default function Home() {
  const navigate = useNavigate();
  const [, setCartUpdate] = useState(0);

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const dealProducts = products.filter(p => p.dealOfTheDay);
  const bestSellingProducts = products.slice(0, 8);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setCartUpdate(prev => prev + 1);
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8" data-testid="hero-content">
              <div className="inline-block">
                <span className="bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full">
                  Novidade: Impressão 3D de Alta Resolução
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight font-['Manrope']">
                Onde Precisão <br />
                <span className="text-emerald-500">Encontra Imaginação</span>
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                Descubra itens geek únicos impressos em 3D. De dragões articulados a armaduras de cosplay, 
                criamos cada peça com dedicação artesanal.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-8 py-3.5 rounded-full transition-colors group"
                  data-testid="hero-cta-shop"
                >
                  Explorar Produtos
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/shop?category=cosplay"
                  className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-900 font-medium px-8 py-3.5 rounded-full border-2 border-slate-200 transition-colors"
                  data-testid="hero-cta-cosplay"
                >
                  Ver Cosplay Props
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
                <div>
                  <div className="text-3xl font-bold text-slate-900">500+</div>
                  <div className="text-sm text-slate-500">Produtos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">15K+</div>
                  <div className="text-sm text-slate-500">Clientes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">4.9</div>
                  <div className="text-sm text-slate-500">Avaliação</div>
                </div>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative" data-testid="hero-image">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-emerald-200 transition-shadow duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1679453081927-394ff1910032?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Golden 3D Printed Dragon"
                  className="w-full h-full object-cover"
                />
                
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">3D</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Qualidade Premium</div>
                      <div className="text-xs text-slate-500">Impressão de alta resolução</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 top-1/4 -right-10 w-72 h-72 bg-emerald-200 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -z-10 bottom-1/4 -left-10 w-72 h-72 bg-emerald-300 rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center space-x-3" data-testid="feature-shipping">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">Frete Grátis</div>
                <div className="text-xs text-slate-500">Acima de R$ 150</div>
              </div>
            </div>

            <div className="flex items-center space-x-3" data-testid="feature-secure">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">Pagamento Seguro</div>
                <div className="text-xs text-slate-500">Proteção 100%</div>
              </div>
            </div>

            <div className="flex items-center space-x-3" data-testid="feature-payment">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">Parcele 12x</div>
                <div className="text-xs text-slate-500">Sem juros</div>
              </div>
            </div>

            <div className="flex items-center space-x-3" data-testid="feature-support">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Headphones className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">Suporte 24/7</div>
                <div className="text-xs text-slate-500">Sempre disponível</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-['Manrope']">
                Produtos em Destaque
              </h2>
              <p className="text-slate-600 mt-2">Nossas criações mais populares</p>
            </div>
            <Link
              to="/shop"
              className="hidden md:inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold"
              data-testid="view-all-featured"
            >
              Ver todos
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-['Manrope'] mb-4">
              Explore por Categoria
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Descubra nossa coleção completa de itens geek impressos em 3D
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Deal of the Day */}
      {dealProducts.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="inline-block bg-red-100 text-red-600 text-sm font-semibold px-4 py-1 rounded-full mb-3">
                  Oferta Especial
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-['Manrope']">
                  Deal of the Day
                </h2>
                <p className="text-slate-600 mt-2">Ofertas imperdíveis por tempo limitado</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {dealProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-['Manrope']">
                Mais Vendidos
              </h2>
              <p className="text-slate-600 mt-2">Os favoritos da nossa comunidade</p>
            </div>
            <Link
              to="/shop"
              className="hidden md:inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold"
              data-testid="view-all-best-sellers"
            >
              Ver todos
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {bestSellingProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Manrope']">
              Fique por Dentro das Novidades
            </h2>
            <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
              Receba em primeira mão lançamentos exclusivos, ofertas especiais e dicas de impressão 3D
            </p>
            
            <form className="max-w-md mx-auto flex gap-3" data-testid="newsletter-form">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-6 py-3 rounded-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
                data-testid="newsletter-input"
              />
              <button
                type="submit"
                className="bg-white text-emerald-600 font-semibold px-8 py-3 rounded-full hover:bg-emerald-50 transition-colors"
                data-testid="newsletter-button"
              >
                Inscrever
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
