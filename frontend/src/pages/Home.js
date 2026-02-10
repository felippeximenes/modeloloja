import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { products } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';

export default function Home() {
  const featured = Array.isArray(products) ? products.slice(0, 8) : [];

  const categories = [
    {
      title: 'Suportes',
      description: 'Organização e setups com cara de gamer/tech.',
      image:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=70',
      link: '/shop?category=suportes',
    },
    {
      title: 'Quadros',
      description: 'Decoração geek minimalista e cheia de presença.',
      image:
        'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=70',
      link: '/shop?category=quadros',
    },
    {
      title: 'Miniaturas',
      description: 'Colecionáveis e itens pra mesa, prateleira e RPG.',
      image:
        'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=1200&q=70',
      link: '/shop?category=miniaturas',
    },
  ];

  // imagem full (coloque esse arquivo em: frontend/public/hero-moldz3d.jpg)
  const heroImage = '/hero-moldz3d.jpg';

  return (
    <main className="bg-background">
      {/* HERO FULLSCREEN (WELCOME HOME STYLE) */}
      <section
        className="relative w-full min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4rem)] bg-center bg-cover bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* overlay para dar leitura no texto */}
        <div className="absolute inset-0 bg-slate-900/45" />

        {/* leve “vinheta” mais elegante */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] flex items-center">
          <div className="max-w-2xl py-16">
            <p className="inline-flex items-center rounded-full bg-white/10 text-white px-4 py-2 text-sm font-semibold backdrop-blur">
              Moldz3D • Impressão 3D • Geek
            </p>

            <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold tracking-tight text-white font-['Manrope'] leading-[1.05]">
              BEM-VINDO
              <br />
              <span className="text-primary">À MOLDZ3D</span>
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-white/85 leading-relaxed">
              Suportes, quadros e miniaturas com acabamento limpo e estética tech.
              Perfeito pra setup, decoração e presentes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3 font-semibold hover:bg-primary/90 transition"
              >
                Ver catálogo
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/shop?category=suportes"
                className="inline-flex items-center justify-center rounded-full bg-white/10 text-white border border-white/20 px-7 py-3 font-semibold hover:bg-white/15 transition backdrop-blur"
              >
                Explorar suportes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-['Manrope']">
              Categorias
            </h2>
            <p className="mt-2 text-slate-600">
              Escolha uma linha e encontre rápido o que combina com seu estilo.
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Ver tudo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.title} category={cat} />
          ))}
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 font-['Manrope']">
                Destaques
              </h2>
              <p className="mt-2 text-slate-600">
                Os queridinhos para setup e decoração.
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-5 py-2 font-semibold text-slate-900 hover:border-primary/40 hover:text-primary transition"
            >
              Ir para catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
