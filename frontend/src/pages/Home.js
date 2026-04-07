import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import BlurText from '../components/BlurText';
import HomeGradientBackground from '../components/HomeGradientBackground';
import TiltedCard from '../components/TiltedCard';
import LiquidEther from '../components/LiquidEther';
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
          image: product.images?.[0] || '',
          inStock: product.variations?.some((variation) => variation.stock > 0) || false,
        }));

        setFeatured(formatted.slice(0, 8));
      } catch (error) {
        console.error('Error loading home products:', error);
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

  const topProducts = featured.slice(0, 4);

  const imgOf = (product) =>
    (Array.isArray(product?.variants) && product.variants[0]?.images?.[0]) ||
    product?.image ||
    product?.imageUrl ||
    (Array.isArray(product?.images) ? product.images[0] : null) ||
    'https://images.unsplash.com/photo-1585079542156-2755d9c8a094?auto=format&fit=crop&w=1600&q=75';

  const priceOf = (product) => {
    const value = product?.price;
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    }
    if (typeof value === 'string') return value;
    return null;
  };

  return (
    <main className="relative isolate overflow-hidden bg-slate-950">
      <HomeGradientBackground className="absolute inset-0" />

      <div className="relative z-10">
        {/* ── Hero Split Diagonal ── */}
        <section className="relative w-full min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 rounded-b-[2.5rem]">

          {/* Painel esquerdo — LiquidEther, visível apenas em desktop */}
          <div
            className="absolute inset-0 hidden lg:block"
            style={{ clipPath: 'polygon(0 0, 56% 0, 52% 100%, 0 100%)' }}
          >
            <LiquidEther
              colors={['#31B0A9', '#0f172a', '#5eead4']}
              mouseForce={20}
              cursorSize={100}
              isViscous
              viscous={30}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.5}
              isBounce={false}
              autoDemo
              autoSpeed={0.5}
              autoIntensity={2.2}
              takeoverDuration={0.25}
              autoResumeDelay={3000}
              autoRampDuration={0.6}
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-slate-950/45" />
          </div>

          {/* Fundo LiquidEther fullscreen em mobile */}
          <div className="absolute inset-0 block lg:hidden">
            <LiquidEther
              colors={['#31B0A9', '#0f172a', '#5eead4']}
              mouseForce={20}
              cursorSize={100}
              isViscous
              viscous={30}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.5}
              isBounce={false}
              autoDemo
              autoSpeed={0.5}
              autoIntensity={2.2}
              takeoverDuration={0.25}
              autoResumeDelay={3000}
              autoRampDuration={0.6}
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-slate-950/70" />
          </div>

          {/* Painel direito — Vídeo */}
          <div
            className="absolute inset-0 hidden lg:block"
            style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 46% 100%)' }}
          >
            <video
              src="/videos/video.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center center' }}
            />
            {/* Fade na borda diagonal — mais suave para não sufocar o vídeo */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, rgba(2,12,21,0.55) 0%, transparent 22%)',
              }}
            />
            {/* Vinheta sutil nas bordas para integrar com o fundo escuro */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, rgba(2,12,21,0.35) 0%, transparent 15%, transparent 85%, rgba(2,12,21,0.5) 100%)',
              }}
            />
          </div>

          {/* Linha diagonal brilhante — alinhada ao novo corte */}
          <div
            className="absolute inset-0 hidden lg:block pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(45,212,191,0.22) 50%, transparent 100%)',
              clipPath: 'polygon(48% 0, 50% 0, 46% 100%, 44% 100%)',
            }}
          />

          {/* Conteúdo — alinhado à esquerda, respeitando regra dos terços */}
          <div className="relative z-20 min-h-[calc(100vh-4rem)] flex items-center px-8 sm:px-12 lg:px-16 xl:px-24">
            <div className="max-w-md lg:max-w-lg text-left">
              <p className="inline-flex items-center rounded-full bg-white/10 text-white px-4 py-2 text-sm font-semibold backdrop-blur">
                Moldz3D • Impressao 3D • Geek
              </p>

              <div className="mt-6 space-y-1">
                <BlurText
                  text="BEM-VINDO"
                  delay={130}
                  animateBy="words"
                  direction="top"
                  className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white font-['Montserrat'] leading-[1.05]"
                />
                <BlurText
                  text="A MOLDZ3D"
                  delay={130}
                  animateBy="words"
                  direction="top"
                  className="text-5xl sm:text-6xl font-extrabold tracking-tight text-primary font-['Montserrat'] leading-[1.05]"
                />
              </div>

              <BlurText
                text="Suportes, quadros e miniaturas com acabamento limpo e estetica tech. Perfeito pra setup, decoracao e presentes."
                delay={60}
                animateBy="words"
                direction="top"
                className="mt-5 text-lg sm:text-xl text-white/85 leading-relaxed"
              />

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
                <h2 className="text-3xl font-extrabold text-white font-['Montserrat']">
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

            {/* Composição editorial da vitrine: um destaque principal, um card lateral
                e dois cards inferiores só para definir o visual da seção. */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
              <TiltedCard
                className="lg:col-span-7 rounded-3xl"
                captionText={topProducts[0]?.name || topProducts[0]?.title || 'Produto em destaque'}
                scaleOnHover={1.018}
                rotateAmplitude={6}
                showTooltip
              >
                <Link
                  to={topProducts[0]?.id ? `/product/${topProducts[0].id}` : '/shop'}
                  className="group relative flex min-h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/18 backdrop-blur-[2px]"
                >
                  <div className="absolute inset-0">
                    <img
                      src={imgOf(topProducts[0])}
                      alt={topProducts[0]?.name || topProducts[0]?.title || 'Produto em destaque'}
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/58 via-slate-950/18 to-transparent" />
                  </div>

                  <div className="relative flex w-full flex-col justify-between p-7 sm:p-9">
                    <div>
                      <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                        Mais pedido
                      </div>

                      <h3 className="mt-5 max-w-xl text-4xl sm:text-5xl font-extrabold text-white font-['Montserrat'] leading-tight">
                        {topProducts[0]?.name || topProducts[0]?.title || 'Produto em destaque'}
                      </h3>

                      <p className="mt-3 max-w-lg text-xl text-white/82 leading-8">
                        {topProducts[0]?.description || 'Boneco Pokemon Gengar suporte para o seu controle'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <ShineButton size="sm">
                        Ver produto <ArrowRight className="w-4 h-4 ml-2" />
                      </ShineButton>

                      <span className="text-3xl font-bold text-white">
                        {priceOf(topProducts[0]) || 'R$ 59,90'}
                      </span>
                    </div>
                  </div>
                </Link>
              </TiltedCard>

              <TiltedCard
                className="lg:col-span-5 rounded-3xl"
                captionText={topProducts[1]?.name || topProducts[1]?.title || 'Novidade da semana'}
                scaleOnHover={1.018}
                rotateAmplitude={6}
                showTooltip
              >
                <Link
                  to={topProducts[1]?.id ? `/product/${topProducts[1].id}` : '/shop'}
                  className="group flex min-h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/18 backdrop-blur-[2px]"
                >
                  <div className="relative flex w-full flex-col justify-between p-7 sm:p-9">
                    <div>
                      <span className="text-base font-semibold text-primary">
                        Em alta
                      </span>
                      <h3 className="mt-2 text-4xl font-extrabold text-white font-['Montserrat'] leading-tight">
                        {topProducts[1]?.name || topProducts[1]?.title || 'Novidade da semana'}
                      </h3>
                      <p className="mt-4 text-xl text-white/80 leading-8">
                        {topProducts[1]?.description || 'Uma peça perfeita pra setup e decoracao.'}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <ShineButton variant="outline" size="sm" className="bg-white text-slate-900 hover:bg-white/90">
                        Ver detalhes <ArrowRight className="w-4 h-4 ml-2" />
                      </ShineButton>
                    </div>
                  </div>
                </Link>
              </TiltedCard>

              <TiltedCard
                className="lg:col-span-4 rounded-3xl"
                captionText={topProducts[2]?.name || topProducts[2]?.title || 'Produto'}
                scaleOnHover={1.016}
                rotateAmplitude={5}
                showTooltip
              >
                <Link
                  to={topProducts[2]?.id ? `/product/${topProducts[2].id}` : '/shop'}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-950/12 backdrop-blur-[2px]"
                >
                  <div className="p-6">
                    <h3 className="text-2xl font-extrabold text-white font-['Montserrat']">
                      {topProducts[2]?.name || topProducts[2]?.title || 'Produto'}
                    </h3>
                    <p className="mt-2 text-white/78 text-lg leading-7">
                      {topProducts[2]?.description || 'Detalhe rapido do produto.'}
                    </p>
                  </div>

                  <div className="px-6 pb-6">
                    <img
                      src={imgOf(topProducts[2])}
                      alt={topProducts[2]?.name || topProducts[2]?.title || 'Produto'}
                      className="h-40 w-full rounded-2xl border border-white/15 object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                </Link>
              </TiltedCard>

              <TiltedCard
                className="lg:col-span-8 rounded-3xl"
                captionText={topProducts[3]?.name || topProducts[3]?.title || 'Produto'}
                scaleOnHover={1.016}
                rotateAmplitude={5}
                showTooltip
              >
                <Link
                  to={topProducts[3]?.id ? `/product/${topProducts[3].id}` : '/shop'}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-950/12 backdrop-blur-[2px]"
                >
                  <div className="p-6">
                    <h3 className="text-2xl font-extrabold text-white font-['Montserrat']">
                      {topProducts[3]?.name || topProducts[3]?.title || 'Produto'}
                    </h3>
                    <p className="mt-2 text-white/78 text-lg leading-7">
                      {topProducts[3]?.description || 'Descricao curta do produto.'}
                    </p>
                  </div>

                  <div className="px-6 pb-6">
                    <img
                      src={imgOf(topProducts[3])}
                      alt={topProducts[3]?.name || topProducts[3]?.title || 'Produto'}
                      className="h-40 w-full rounded-2xl border border-white/15 object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                </Link>
              </TiltedCard>
            </div>
          </div>
        </section>

        <section className="relative border-y border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-extrabold text-white font-['Montserrat']">
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
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} tilted />
              ))}
            </div>
          </div>
        </section>

        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-white font-['Montserrat']">
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
            {categories.map((category) => (
              <CategoryCard key={category.title} category={category} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
