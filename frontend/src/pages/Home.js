import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import BlurText from '../components/BlurText';
import HomeGradientBackground from '../components/HomeGradientBackground';
import MagicBento, { MagicBentoCard } from '../components/MagicBento';
import { ShineButton } from '../components/ui/ShineButton';
import { getProducts } from '../services/api';

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    async function loadHomeProducts() {
      try {
        const data = await getProducts();

        const formatted = (Array.isArray(data) ? data : []).map((product) => ({
          ...product,
          id: product._id,
          price: product.variations?.[0]?.price || 0,
          image: product.images?.[0] || "",
          inStock: product.variations?.some((variation) => variation.stock > 0) || false,
        }));

        setFeatured(formatted.slice(0, 8));
      } catch (error) {
        console.error("Error loading home products:", error);
        setFeatured([]);
      }
    }

    loadHomeProducts();
  }, []);

  const categories = [
    {
      title: 'Suportes',
      description: 'Organizacao e setups com cara de gamer/tech.',
      image:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=70',
      link: '/shop?category=suportes',
    },
    {
      title: 'Quadros',
      description: 'Decoracao geek minimalista e cheia de presenca.',
      image:
        'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=70',
      link: '/shop?category=quadros',
    },
    {
      title: 'Miniaturas',
      description: 'Colecionaveis e itens pra mesa, prateleira e RPG.',
      image:
        'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=1200&q=70',
      link: '/shop?category=miniaturas',
    },
  ];

  const heroImage = `${process.env.PUBLIC_URL}/hero-moldz3d.png`;

  return (
    <main className="relative isolate overflow-hidden bg-slate-950">
      {/* Novo teste de fundo global: gradiente orgânico com grão.
          Ele substitui temporariamente o GhostCursor para avaliar outra atmosfera visual. */}
      <HomeGradientBackground className="absolute inset-0" />

      {/* Todo o conteudo principal fica acima do background animado. */}
      <div className="relative z-10">
      <section
        className="relative w-full min-h-[calc(100vh-4rem)] bg-center bg-cover bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url("${heroImage}")` }}
      >
        {/* Overlays ajustados para integrar melhor a imagem do hero ao novo fundo */}
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/35 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] flex items-center">
          <div className="max-w-2xl py-16">
            <p className="inline-flex items-center rounded-full bg-white/10 text-white px-4 py-2 text-sm font-semibold backdrop-blur">
              Moldz3D • Impressao 3D • Geek
            </p>

            <div className="mt-6 space-y-1">
              <BlurText
                text="BEM-VINDO"
                delay={130}
                animateBy="words"
                direction="top"
                className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white font-['Manrope'] leading-[1.05]"
              />
              <BlurText
                text="A MOLDZ3D"
                delay={130}
                animateBy="words"
                direction="top"
                className="text-5xl sm:text-6xl font-extrabold tracking-tight text-primary font-['Manrope'] leading-[1.05]"
              />
            </div>

            <p className="mt-5 text-lg sm:text-xl text-white/85 leading-relaxed">
              Suportes, quadros e miniaturas com acabamento limpo e estetica tech.
              Perfeito pra setup, decoracao e presentes.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <ShineButton asChild size="lg">
                <Link to="/shop">
                  Ver catalogo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </ShineButton>

              <ShineButton
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/15 hover:text-white"
              >
                <Link to="/shop?category=suportes">Explorar suportes</Link>
              </ShineButton>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-white font-['Manrope']">
                Os mais pedidos
              </h2>
              <p className="mt-2 text-slate-300">
                Itens em evidencia (layout vitrine).
              </p>
            </div>

            <ShineButton
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex border-white/15 bg-white/10 text-white backdrop-blur hover:text-primary"
            >
              <Link to="/shop">
                Ver catalogo <ArrowRight className="w-4 h-4" />
              </Link>
            </ShineButton>
          </div>

          {(() => {
            const imgOf = (p) =>
              (Array.isArray(p?.variants) && p.variants[0]?.images?.[0]) ||
              p?.image ||
              p?.imageUrl ||
              (Array.isArray(p?.images) ? p.images[0] : null) ||
              'https://images.unsplash.com/photo-1585079542156-2755d9c8a094?auto=format&fit=crop&w=1600&q=75';

            const priceOf = (p) => {
              const v = p?.price;
              if (typeof v === 'number')
                return v.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                });
              if (typeof v === 'string') return v;
              return null;
            };

            const p0 = featured?.[0];
            const p1 = featured?.[1];
            const p2 = featured?.[2];
            const p3 = featured?.[3];

            return (
              <MagicBento
                className="mt-8"
                textAutoHide
                enableStars
                enableSpotlight
                enableBorderGlow
                enableTilt={false}
                enableMagnetism={false}
                clickEffect
                spotlightRadius={400}
                particleCount={12}
                glowColor="49, 176, 169"
                disableAnimations={false}
              >
                {/* Os quatro cards reais da seção passam a ser envolvidos pelo MagicBento.
                    Assim mantemos o conteúdo do projeto, mas adicionamos o efeito visual
                    ao redor dos cards em vez de usar os dados demo da documentação. */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <MagicBentoCard className="lg:col-span-7 rounded-3xl">
                <Link
                  to={p0?.id ? `/product/${p0.id}` : '/shop'}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 lg:col-span-7 min-h-[340px]"
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
                      {p0?.description ||
                        'Peca geek em impressao 3D com acabamento limpo e estetica tech.'}
                    </p>

                    <div className="mt-5 flex items-center gap-3">
                      <ShineButton size="sm">
                        Ver produto <ArrowRight className="w-4 h-4 ml-2" />
                      </ShineButton>

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
                </MagicBentoCard>

                <MagicBentoCard className="lg:col-span-5 rounded-3xl">
                <Link
                  to={p1?.id ? `/product/${p1.id}` : '/shop'}
                  className="rounded-3xl border border-white/10 bg-slate-950/70 lg:col-span-5 p-7 sm:p-9 hover:border-primary/30 transition"
                >
                  <p className="text-sm font-semibold text-primary">Em alta</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-white font-['Manrope']">
                    {p1?.name || p1?.title || 'Novidade da semana'}
                  </h3>
                  <p className="mt-3 text-white/80 leading-relaxed">
                    {p1?.description || 'Uma peca perfeita pra setup e decoracao.'}
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <span className="font-semibold text-white">
                      {priceOf(p1) || ' '}
                    </span>

                    <ShineButton variant="outline" size="sm">
                      Ver detalhes <ArrowRight className="w-4 h-4" />
                    </ShineButton>
                  </div>
                </Link>
                </MagicBentoCard>

                <MagicBentoCard className="lg:col-span-4 rounded-3xl">
                <Link
                  to={p2?.id ? `/product/${p2.id}` : '/shop'}
                  className="group rounded-3xl border border-white/10 bg-slate-950/70 lg:col-span-4 overflow-hidden"
                >
                  <div className="p-7">
                    <h4 className="text-xl font-extrabold text-white font-['Manrope']">
                      {p2?.name || p2?.title || 'Produto'}
                    </h4>
                    <p className="mt-2 text-white/80 line-clamp-2">
                      {p2?.description || 'Detalhe rapido do produto.'}
                    </p>

                    {priceOf(p2) && (
                      <p className="mt-3 font-semibold text-white">{priceOf(p2)}</p>
                    )}
                  </div>

                  <div className="px-7 pb-7">
                    <img
                      src={imgOf(p2)}
                      alt={p2?.name || p2?.title || 'Produto'}
                      className="w-full h-44 object-cover rounded-2xl border border-white/10 group-hover:scale-[1.02] transition"
                    />
                  </div>
                </Link>
                </MagicBentoCard>

                <MagicBentoCard className="lg:col-span-8 rounded-3xl">
                <Link
                  to={p3?.id ? `/product/${p3.id}` : '/shop'}
                  className="group rounded-3xl border border-white/10 bg-slate-950/70 lg:col-span-8 overflow-hidden"
                >
                  <div className="p-7">
                    <h4 className="text-xl font-extrabold text-white font-['Manrope']">
                      {p3?.name || p3?.title || 'Produto'}
                    </h4>
                    <p className="mt-2 text-white/80 line-clamp-2">
                      {p3?.description || 'Descricao curta do produto.'}
                    </p>

                    {priceOf(p3) && (
                      <p className="mt-3 font-semibold text-white">{priceOf(p3)}</p>
                    )}
                  </div>

                  <div className="px-7 pb-7">
                    <img
                      src={imgOf(p3)}
                      alt={p3?.name || p3?.title || 'Produto'}
                      className="w-full h-44 object-cover rounded-2xl border border-white/10 group-hover:scale-[1.02] transition"
                    />
                  </div>
                </Link>
                </MagicBentoCard>
                </div>
              </MagicBento>
            );
          })()}
        </div>
      </section>

      {/* Secao de destaque ajustada para um visual translúcido,
          permitindo que o background novo continue visivel. */}
      <section className="relative border-y border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-white font-['Manrope']">
                Destaques
              </h2>
              <p className="mt-2 text-slate-300">
                Os queridinhos para setup e decoracao.
              </p>
            </div>

            <ShineButton
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex border-white/15 bg-white/10 text-white backdrop-blur hover:text-primary"
            >
              <Link to="/shop">
                Ir para catalogo <ArrowRight className="w-4 h-4" />
              </Link>
            </ShineButton>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} electric />
            ))}
          </div>
        </div>
      </section>

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white font-['Manrope']">
              Categorias
            </h2>
            <p className="mt-2 text-slate-300">
              Escolha uma linha e encontre rapido o que combina com seu estilo.
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
      </div>
    </main>
  );
}
