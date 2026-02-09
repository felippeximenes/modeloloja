import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, ShieldCheck, Palette } from 'lucide-react';

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

  return (
    <main className="bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* fundo decorativo */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                Impressão 3D • Geek • Personalizável
              </div>

              <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-['Manrope']">
                Peças e acessórios geek em <span className="text-primary">impressão 3D</span>
              </h1>

              <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl">
                Suportes, quadros e miniaturas feitos com acabamento limpo e estilo “tech”.
                Ideal pra setup, decoração e presentes.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-primary/90 transition"
                >
                  Ver catálogo
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/shop?category=suportes"
                  className="inline-flex items-center justify-center rounded-full bg-white border border-slate-200 px-6 py-3 font-semibold text-slate-900 hover:border-primary/40 hover:text-primary transition"
                >
                  Explorar suportes
                </Link>
              </div>

              {/* trust badges */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                <div className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 p-4">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Acabamento caprichado</p>
                    <p className="text-xs text-slate-600">peças bem finalizadas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 p-4">
                  <Palette className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Personalização</p>
                    <p className="text-xs text-slate-600">cores e variações</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 p-4">
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Envio/retirada</p>
                    <p className="text-xs text-slate-600">combinar por contato</p>
                  </div>
                </div>
              </div>
            </div>

            {/* card destaque */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <p className="text-sm font-semibold text-primary">Destaques da semana</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900 font-['Manrope']">
                    Monte seu setup com personalidade
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Comece pelos suportes e finalize com um quadro geek minimalista.
                  </p>

                  <div className="mt-5 flex gap-3">
                    <Link
                      to="/shop?category=quadros"
                      className="flex-1 text-center rounded-xl bg-primary/10 text-primary font-semibold px-4 py-3 hover:bg-primary/15 transition"
                    >
                      Ver Quadros
                    </Link>
                    <Link
                      to="/shop?category=miniaturas"
                      className="flex-1 text-center rounded-xl bg-slate-900 text-white font-semibold px-4 py-3 hover:bg-slate-800 transition"
                    >
                      Ver Miniaturas
                    </Link>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs text-slate-500">Dica</p>
                    <p className="text-sm font-semibold text-slate-900">
                      Quer algo exclusivo? Dá pra personalizar.
                    </p>
                    <p className="text-sm text-slate-600">
                      Na fase 2 a gente coloca um CTA de WhatsApp aqui.
                    </p>
                  </div>
                </div>
              </div>
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

      {/* MAIS VENDIDOS / DESTAQUES */}
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

      {/* CTA FINAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="rounded-2xl bg-primary text-primary-foreground p-8 sm:p-10 flex flex-col lg:flex-row gap-8 items-center justify-between">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-['Manrope']">
              Quer um modelo exclusivo?
            </h3>
            <p className="mt-2 text-primary-foreground/90 max-w-2xl">
              A gente pode criar variações de cor e detalhes pra combinar com seu setup.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-full bg-white text-slate-900 px-7 py-3 font-semibold hover:bg-white/90 transition"
          >
            Começar pelo catálogo
          </Link>
        </div>
      </section>
    </main>
  );
}
