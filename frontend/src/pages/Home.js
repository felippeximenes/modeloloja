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

  const heroImage = `${process.env.PUBLIC_URL}/hero-moldz3d.png`;

  return (
    <main className="bg-background">
      {/* HERO */}
      <section
        className="relative w-full min-h-[calc(100vh-4rem)] bg-center bg-cover bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url("${heroImage}")` }}
      >
        <div className="absolute inset-0 bg-slate-900/45" />
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

      {/*OS MAIS PEDIDOS (mosaico com produtos reais) */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 font-['Manrope']">
                Os mais pedidos
              </h2>
              <p className="mt-2 text-slate-600">
                Itens em evidência (layout vitrine).
              </p>
            </div>

            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-5 py-2 font-semibold text-slate-900 hover:border-primary/40 hover:text-primary transition"
            >
              Ver catálogo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/*
            Helpers locais (pra não depender do formato exato do products.js)
          */}
          {(() => {
            const imgOf = (p) =>
               (Array.isArray(p?.variants) && p.variants[0]?.images?.[0]) ||
                p?.image ||
                p?.imageUrl ||
                (Array.isArray(p?.images) ? p.images[0] : null) ||
                'https://images.unsplash.com/photo-1585079542156-2755d9c8a094?auto=format&fit=crop&w=1600&q=75';

            const priceOf = (p) => {
              const v = p?.price;
              if (typeof v === 'number') return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
              if (typeof v === 'string') return v; // caso já venha formatado
              return null;
            };

            const p0 = featured?.[0];
            const p1 = featured?.[1];
            const p2 = featured?.[2];
            const p3 = featured?.[3];

            // Se não tiver produtos suficientes, ainda renderiza com placeholders
            return (
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Card grande: Produto 0 */}
                <Link
                  to={p0?.id ? `/product/${p0.id}` : '/shop'}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 lg:col-span-7 min-h-[340px]"
                >
                  <div className="absolute inset-0">
                    <img
                      src={imgOf(p0)}
                      alt={p0?.name || p0?.title || 'Produto em destaque'}
                      className="h-full w-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/30 to-transparent" />
                  </div>

                  <div className="relative p-7 sm:p-9">
                    <div className="inline-flex items-center rounded-full bg-white/10 text-white px-4 py-2 text-sm font-semibold backdrop-blur">
                      Destaque da semana
                    </div>

                    <h3 className="mt-5 text-3xl sm:text-4xl font-extrabold text-white font-['Manrope'] leading-tight">
                      {p0?.name || p0?.title || 'Produto em destaque'}
                    </h3>

                    <p className="mt-3 text-white/85 max-w-md">
                      {p0?.description || 'Peça geek em impressão 3D com acabamento limpo e estética tech.'}
                    </p>

                    <div className="mt-5 flex items-center gap-3">
                      <span className="inline-flex rounded-full bg-primary text-primary-foreground px-5 py-2 font-semibold">
                        Ver produto <ArrowRight className="w-4 h-4 ml-2" />
                      </span>

                      {priceOf(p0) && (
                        <span className="text-white/90 font-semibold">{priceOf(p0)}</span>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-6 right-6">
                    <div className="h-14 w-14 rounded-full bg-yellow-300 text-slate-900 flex items-center justify-center font-extrabold text-sm shadow-sm">
                      TOP
                    </div>
                  </div>
                </Link>

                {/* Card editorial: Produto 1 (ou texto + botão) */}
                <Link
                  to={p1?.id ? `/product/${p1.id}` : '/shop'}
                  className="rounded-3xl border border-slate-200 bg-white lg:col-span-5 p-7 sm:p-9 hover:border-primary/30 transition"
                >
                  <p className="text-sm font-semibold text-primary">Em alta</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-slate-900 font-['Manrope']">
                    {p1?.name || p1?.title || 'Novidade da semana'}
                  </h3>
                  <p className="mt-3 text-slate-600 leading-relaxed">
                    {p1?.description || 'Uma peça perfeita pra setup e decoração.'}
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-900">
                      {priceOf(p1) || ' '}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary font-semibold px-5 py-2">
                      Ver detalhes <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>

                {/* Card médio: Produto 2 */}
                <Link
                  to={p2?.id ? `/product/${p2.id}` : '/shop'}
                  className="group rounded-3xl border border-slate-200 bg-sky-100 lg:col-span-4 overflow-hidden"
                >
                  <div className="p-7">
                    <h4 className="text-xl font-extrabold text-slate-900 font-['Manrope']">
                      {p2?.name || p2?.title || 'Produto'}
                    </h4>
                    <p className="mt-2 text-slate-700/80 line-clamp-2">
                      {p2?.description || 'Detalhe rápido do produto.'}
                    </p>

                    {priceOf(p2) && (
                      <p className="mt-3 font-semibold text-slate-900">{priceOf(p2)}</p>
                    )}
                  </div>

                  <div className="px-7 pb-7">
                    <img
                      src={imgOf(p2)}
                      alt={p2?.name || p2?.title || 'Produto'}
                      className="w-full h-44 object-cover rounded-2xl border border-black/5 group-hover:scale-[1.02] transition"
                    />
                  </div>
                </Link>

                {/* Card médio largo: Produto 3 */}
                <Link
                  to={p3?.id ? `/product/${p3.id}` : '/shop'}
                  className="group rounded-3xl border border-slate-200 bg-amber-200 lg:col-span-8 overflow-hidden"
                >
                  <div className="p-7">
                    <h4 className="text-xl font-extrabold text-slate-900 font-['Manrope']">
                      {p3?.name || p3?.title || 'Produto'}
                    </h4>
                    <p className="mt-2 text-slate-800/80 line-clamp-2">
                      {p3?.description || 'Descrição curta do produto.'}
                    </p>

                    {priceOf(p3) && (
                      <p className="mt-3 font-semibold text-slate-900">{priceOf(p3)}</p>
                    )}
                  </div>

                  <div className="px-7 pb-7">
                    <img
                      src={imgOf(p3)}
                      alt={p3?.name || p3?.title || 'Produto'}
                      className="w-full h-44 object-cover rounded-2xl border border-black/5 group-hover:scale-[1.02] transition"
                    />
                  </div>
                </Link>
              </div>
            );
          })()}
        </div>
      </section>


      {/* DESTAQUES (AGORA EM CIMA) */}
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

      

      {/* CATEGORIAS (AGORA EMBAIXO) */}
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
    </main>
  );
}
