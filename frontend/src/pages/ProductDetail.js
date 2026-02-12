import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Heart, Share2, Star, Truck } from 'lucide-react';

import { products } from '../data/products';
import { addToCart } from '../utils/cart';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function formatBRL(value) {
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  if (typeof value === 'string') return value;
  return null;
}

function getImages(product) {
  const fromImages = Array.isArray(product?.images) ? product.images : [];
  const fromSingle =
    product?.image || product?.imageUrl ? [product.image || product.imageUrl] : [];

  let arr = [...fromImages, ...fromSingle].filter(Boolean);

  if (!arr.length) {
    arr = [
      'https://images.unsplash.com/photo-1585079542156-2755d9c8a094?auto=format&fit=crop&w=1600&q=75',
    ];
  }

  while (arr.length < 3) arr.push(arr[0]);
  return arr;
}

function getName(product) {
  return product?.name || product?.title || 'Produto';
}

function getCategory(product) {
  return product?.category || product?.tag || 'Produto';
}

function getRating(product) {
  const r = product?.rating ?? product?.stars;
  return typeof r === 'number' ? r : 4.8;
}

function getReviewsCount(product) {
  const c = product?.reviewsCount ?? product?.reviews ?? product?.reviews_count;
  return typeof c === 'number' ? c : 127;
}

function getDescription(product) {
  return (
    product?.description ||
    'Peça geek em impressão 3D com acabamento limpo e estética tech. Perfeito para setup, decoração e presentes.'
  );
}

// ✅ descrição “longa” (mock) — se depois você quiser, pode criar product.longDescription no products.js
function getLongDescription(product) {
  return (
    product?.longDescription ||
    `Feito pra dar aquele toque de personalidade no seu setup. 
Impressão 3D com acabamento caprichado, pensado pra ficar bonito em foto e melhor ainda ao vivo.
Ideal pra presentear ou completar a sua coleção.`
  );
}

function getDiscountPercent(price, oldPrice) {
  const p = typeof price === 'number' ? price : null;
  const o = typeof oldPrice === 'number' ? oldPrice : null;
  if (!p || !o || o <= p) return null;
  return Math.round(((o - p) / o) * 100);
}

// --------- FRETE (placeholder/fake) ----------
function formatCep(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
function isValidCep(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 8;
}
// ------------------------------------------------

export default function ProductDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const product = products.find((p) => String(p.id) === String(id));

  // ✅ Variants (só existe se o produto tiver product.variants)
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const hasVariants = variants.length > 0;

  const variantFromUrl = searchParams.get('variant');

  const initialVariantId = hasVariants
    ? (variants.find((v) => v.id === variantFromUrl)?.id ?? variants[0].id)
    : null;

  const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId);

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find((v) => v.id === selectedVariantId) || variants[0];
  }, [hasVariants, variants, selectedVariantId]);

  // dados finais (variant tem prioridade)
  const effectivePrice =
    typeof selectedVariant?.price === 'number' ? selectedVariant.price : product?.price;

  const effectiveOldPrice =
    typeof selectedVariant?.originalPrice === 'number'
      ? selectedVariant.originalPrice
      : typeof product?.originalPrice === 'number'
      ? product.originalPrice
      : null;

  const effectiveInStock =
    typeof selectedVariant?.inStock === 'boolean'
      ? selectedVariant.inStock
      : typeof product?.inStock === 'boolean'
      ? product.inStock
      : true;

  // imagens: variant.images se existir, senão product.images/image
  const images = useMemo(() => {
    const vImgs = Array.isArray(selectedVariant?.images) ? selectedVariant.images : [];
    if (vImgs.length) {
      const arr = [...vImgs].filter(Boolean);
      while (arr.length < 3) arr.push(arr[0]);
      return arr;
    }
    return getImages(product);
  }, [product, selectedVariant]);

  // ✅ galeria “imersão” (usa mais imagens, sem travar em 3)
  const immersionGallery = useMemo(() => {
    const vImgs = Array.isArray(selectedVariant?.images) ? selectedVariant.images : [];
    const pImgs = Array.isArray(product?.images) ? product.images : [];
    const single = product?.image || product?.imageUrl ? [product.image || product.imageUrl] : [];

    // junta tudo e remove duplicadas mantendo ordem
    const all = [...vImgs, ...pImgs, ...single].filter(Boolean);
    const unique = [];
    const seen = new Set();
    for (const src of all) {
      const key = String(src);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(src);
      }
    }

    // se ainda tiver pouco, reaproveita as já existentes
    const base = unique.length ? unique : getImages(product);
    const out = [...base];
    while (out.length < 4) out.push(out[0]);

    return out.slice(0, 6); // até 6 imagens nessa seção
  }, [product, selectedVariant]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImg = images[activeIndex] || images[0];

  const [qty, setQty] = useState(1);

  // frete fake
  const [cep, setCep] = useState('');
  const [freightMsg, setFreightMsg] = useState('');
  const [freightErr, setFreightErr] = useState('');
  const [freightQuote, setFreightQuote] = useState(null);

  // ✅ opções de UI (sem hooks)
  const modelOptions = hasVariants
    ? Array.from(new Set(variants.map((v) => String(v.model || 'Padrão'))))
    : [];
  const colorOptions = hasVariants
    ? Array.from(new Set(variants.map((v) => String(v.color || 'Padrão'))))
    : [];

  const selectedModel = selectedVariant?.model || 'Padrão';
  const selectedColor = selectedVariant?.color || 'Padrão';

  const selectVariant = (nextModel, nextColor) => {
    if (!hasVariants) return;

    const found =
      variants.find(
        (v) =>
          String(v.model || 'Padrão') === String(nextModel || 'Padrão') &&
          String(v.color || 'Padrão') === String(nextColor || 'Padrão')
      ) ||
      variants.find((v) => String(v.model || 'Padrão') === String(nextModel || 'Padrão')) ||
      variants.find((v) => String(v.color || 'Padrão') === String(nextColor || 'Padrão')) ||
      variants[0];

    setSelectedVariantId(found.id);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('variant', found.id);
      return p;
    });
  };

  // reset ao trocar /product/:id
  useEffect(() => {
    setQty(1);

    if (hasVariants) {
      const vParam = searchParams.get('variant');
      const next = variants.find((v) => v.id === vParam)?.id ?? variants[0]?.id ?? null;
      setSelectedVariantId(next);
    } else {
      setSelectedVariantId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // reset imagem e frete ao trocar imagens/variant
  useEffect(() => {
    setActiveIndex(0);
    setCep('');
    setFreightMsg('');
    setFreightErr('');
    setFreightQuote(null);
  }, [images]);

  const related = useMemo(() => {
    if (!product) return [];
    const cat = String(product?.category ?? '').toLowerCase();
    return products
      .filter((p) => p.id !== product.id)
      .filter((p) => (cat ? String(p?.category ?? '').toLowerCase() === cat : true))
      .slice(0, 4);
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    const payload =
      hasVariants && selectedVariant
        ? {
            ...product,
            variantId: selectedVariant.id,
            variantLabel:
              selectedVariant.label ||
              `${selectedVariant.model || 'Modelo'} • ${selectedVariant.color || 'Cor'}`,
            price: typeof selectedVariant.price === 'number' ? selectedVariant.price : product.price,
            images: Array.isArray(selectedVariant.images) ? selectedVariant.images : product.images,
          }
        : product;

    addToCart(payload, qty);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleCheckFreight = (e) => {
    e.preventDefault();
    setFreightMsg('');
    setFreightErr('');

    if (!isValidCep(cep)) {
      setFreightQuote(null);
      setFreightErr('Digite um CEP válido (8 números).');
      return;
    }

    const seed = Number(String(cep).replace(/\D/g, '').slice(-2)) || 10;
    const pacDays = 5 + (seed % 4);
    const sedexDays = 2 + (seed % 2);
    const pacPriceNum = 18 + (seed % 10);
    const sedexPriceNum = 29 + (seed % 15);

    setFreightQuote({
      pac: { days: pacDays, price: formatBRL(pacPriceNum) },
      sedex: { days: sedexDays, price: formatBRL(sedexPriceNum) },
    });

    setFreightMsg('Simulação gerada. Em breve teremos cálculo real (token/API).');
  };

  // ✅ return condicional só aqui (depois dos hooks)
  if (!product) {
    return (
      <main className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-slate-600">Produto não encontrado.</p>
          <Link to="/shop" className="text-primary font-semibold hover:underline">
            Voltar para a loja
          </Link>
        </div>
      </main>
    );
  }

  const name = getName(product);
  const category = getCategory(product);
  const rating = getRating(product);
  const reviewsCount = getReviewsCount(product);

  const priceLabel = formatBRL(effectivePrice ?? 45);
  const oldPriceLabel = formatBRL(effectiveOldPrice);
  const discount = getDiscountPercent(effectivePrice, effectiveOldPrice);

  return (
    <main className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para a loja
        </Link>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* GALERIA (altura fixa) */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl bg-slate-100 border border-slate-200 h-[520px] sm:h-[560px] lg:h-[720px]">
              {discount != null && (
                <div className="absolute top-5 left-5 z-30">
                  <div className="rounded-full bg-emerald-500 text-white font-extrabold text-sm px-4 py-2 shadow-sm">
                    -{discount}% OFF
                  </div>
                </div>
              )}

              <img
                src={activeImg}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/35 via-black/10 to-transparent z-10 pointer-events-none" />

              <div className="absolute left-0 right-0 bottom-0 p-4 sm:p-5 z-20">
                <div className="mx-auto w-full max-w-md">
                  <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white/70 backdrop-blur border border-white/60 shadow-sm p-3">
                    {images.slice(0, 3).map((src, idx) => (
                      <button
                        key={`${src}-${idx}`}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        className={cn(
                          'relative overflow-hidden rounded-xl border bg-white',
                          activeIndex === idx
                            ? 'border-slate-900'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <img src={src} alt="thumb" className="w-full h-20 object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-4 py-2 text-xs font-bold">
                {category}
              </span>

              {!effectiveInStock && (
                <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-extrabold">
                  Sem estoque
                </span>
              )}
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 font-['Manrope']">
              {name}
            </h1>

            <div className="mt-3 flex items-center gap-3 text-slate-600">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
              <span className="text-sm">({reviewsCount} avaliações)</span>
            </div>

            <div className="mt-4 flex items-end gap-4">
              <div className="text-4xl font-extrabold text-slate-900">{priceLabel}</div>
              {oldPriceLabel && (
                <div className="text-lg text-slate-400 line-through pb-1">{oldPriceLabel}</div>
              )}
            </div>

            <p className="mt-5 text-slate-600 leading-relaxed">{getDescription(product)}</p>

            {/* ✅ VARIAÇÕES: só aparece se existir product.variants */}
            {hasVariants && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <p className="font-extrabold text-slate-900">Variações</p>

                {modelOptions.length > 1 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-700">Modelo</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {modelOptions.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => selectVariant(m, selectedColor)}
                          className={cn(
                            'px-4 py-2 rounded-full border text-sm font-extrabold transition',
                            String(m) === String(selectedModel)
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {colorOptions.length > 1 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-slate-700">Cor</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {colorOptions.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => selectVariant(selectedModel, c)}
                          className={cn(
                            'px-4 py-2 rounded-full border text-sm font-extrabold transition',
                            String(c) === String(selectedColor)
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-4 text-sm text-slate-600">
                  Selecionado:{' '}
                  <span className="font-semibold text-slate-900">
                    {selectedVariant?.label ||
                      `${selectedVariant?.model || 'Modelo'} • ${selectedVariant?.color || 'Cor'}`}
                  </span>
                </p>
              </div>
            )}

            {/* FRETE FAKE */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <p className="font-extrabold text-slate-900">Consulte o frete</p>
              </div>

              <form onSubmit={handleCheckFreight} className="mt-4">
                <label className="text-sm font-semibold text-slate-700">CEP</label>

                <div className="mt-2 flex gap-2">
                  <input
                    value={cep}
                    onChange={(e) => {
                      setFreightErr('');
                      setFreightMsg('');
                      setFreightQuote(null);
                      setCep(formatCep(e.target.value));
                    }}
                    placeholder="00000-000"
                    inputMode="numeric"
                    className="h-12 flex-1 rounded-full border border-slate-200 px-4 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="submit"
                    className="h-12 px-5 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition"
                  >
                    Calcular
                  </button>
                </div>

                {freightErr && <p className="mt-2 text-sm text-red-600 font-semibold">{freightErr}</p>}
                {freightMsg && <p className="mt-2 text-sm text-slate-600">{freightMsg}</p>}

                {freightQuote && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">Resultado (placeholder)</p>

                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 p-3">
                        <div>
                          <p className="font-extrabold text-slate-900">PAC</p>
                          <p className="text-sm text-slate-600">
                            Entrega em {freightQuote.pac.days} dias úteis
                          </p>
                        </div>
                        <p className="font-extrabold text-slate-900">{freightQuote.pac.price}</p>
                      </div>

                      <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 p-3">
                        <div>
                          <p className="font-extrabold text-slate-900">SEDEX</p>
                          <p className="text-sm text-slate-600">
                            Entrega em {freightQuote.sedex.days} dias úteis
                          </p>
                        </div>
                        <p className="font-extrabold text-slate-900">{freightQuote.sedex.price}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      * Valores simulados. Em breve vamos integrar o cálculo real via token/API.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* quantidade + ações */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-slate-200 bg-white h-12">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 grid place-items-center text-slate-700 hover:bg-slate-50 rounded-l-full"
                >
                  –
                </button>
                <div className="w-12 text-center font-semibold">{qty}</div>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="w-12 h-12 grid place-items-center text-slate-700 hover:bg-slate-50 rounded-r-full"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!effectiveInStock}
                className={cn(
                  'h-12 rounded-full font-extrabold transition inline-flex items-center justify-center gap-2',
                  effectiveInStock
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                )}
              >
                Adicionar ao Carrinho
              </button>

              <Link
                to="/checkout"
                className="h-12 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition inline-flex items-center justify-center"
              >
                Comprar Agora
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-11 rounded-full border border-slate-200 bg-white font-semibold text-slate-800 hover:bg-slate-50 transition inline-flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Favoritar
              </button>
              <button
                type="button"
                className="h-11 rounded-full border border-slate-200 bg-white font-semibold text-slate-800 hover:bg-slate-50 transition inline-flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ DESCRIÇÃO + IMERSÃO (NOVA SEÇÃO) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Sobre este produto</h2>
              <p className="mt-1 text-sm text-slate-600">
                Mais detalhes + imagens para dar imersão (demo).
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-extrabold">
              Moldz3D
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* TEXTO */}
            <div className="lg:col-span-5">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {getLongDescription(product)}
              </p>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-extrabold text-slate-900">Destaques</p>
                <ul className="mt-3 space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-slate-900" />
                    Acabamento limpo e estética tech (perfeito pra setup).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-slate-900" />
                    Feito em impressão 3D com material {product?.material || 'PLA'}.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-slate-900" />
                    Ótimo pra presente e decoração.
                  </li>
                </ul>

                {hasVariants && (
                  <p className="mt-4 text-sm text-slate-600">
                    Dica: teste as variações pra ver imagens/modelos diferentes.
                  </p>
                )}
              </div>
            </div>

            {/* IMAGENS (GRADE) */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* imagem grande */}
                <div className="sm:col-span-2 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                  <img
                    src={immersionGallery[0]}
                    alt="Imagem imersiva 1"
                    className="h-64 sm:h-72 w-full object-cover"
                  />
                </div>

                {/* 3 imagens menores */}
                {immersionGallery.slice(1, 4).map((src, idx) => (
                  <div
                    key={`${src}-${idx}`}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100"
                  >
                    <img
                      src={src}
                      alt={`Imagem imersiva ${idx + 2}`}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-slate-500">
                * Essa seção é demonstrativa. Depois podemos puxar textos/imagens reais do
                <span className="font-semibold text-slate-700"> products.js</span> (ex:
                <span className="font-semibold text-slate-700"> longDescription</span> e
                <span className="font-semibold text-slate-700"> gallery</span>).
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ RATING & REVIEWS (MOCK) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Rating & Reviews</h2>
              <p className="mt-1 text-sm text-slate-600">Avaliações mockadas (demo).</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ESQUERDA: resumo */}
            <div className="lg:col-span-5">
              <div className="flex items-end gap-3">
                <div className="text-6xl font-extrabold text-slate-900 leading-none">4.5</div>
                <div className="pb-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-5 h-5',
                          i < 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">(59 new reviews)</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { stars: 5, pct: 68 },
                  { stars: 4, pct: 20 },
                  { stars: 3, pct: 8 },
                  { stars: 2, pct: 3 },
                  { stars: 1, pct: 1 },
                ].map((row) => (
                  <div key={row.stars} className="flex items-center gap-3">
                    <div className="w-10 text-sm font-semibold text-slate-700">{row.stars}</div>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-900"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <div className="w-10 text-sm text-slate-500 text-right">{row.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DIREITA: comentários */}
            <div className="lg:col-span-7">
              <div className="space-y-4">
                {[
                  {
                    name: 'Alex Matinho',
                    date: '13 Oct 2024',
                    text: 'Excelente acabamento e ficou perfeito no setup. Bem firme e bonito!',
                  },
                  {
                    name: 'Marina C.',
                    date: '02 Sep 2024',
                    text: 'Chegou rápido e a qualidade surpreendeu. Compraria de novo.',
                  },
                ].map((r, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-900 text-white grid place-items-center font-extrabold">
                          {r.name
                            .split(' ')
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{r.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{r.date}</p>
                    </div>

                    <p className="mt-4 text-slate-700 leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  className="h-11 px-5 rounded-full bg-slate-900 text-white font-extrabold hover:bg-slate-800 transition"
                >
                  Ver mais reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recomendações */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mt-14">
          <h2 className="text-4xl font-extrabold text-slate-900 font-['Manrope'] text-center">
            Você também pode gostar
          </h2>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => {
              const img = getImages(p)[0];
              return (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group rounded-3xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 transition"
                >
                  <div className="bg-slate-100">
                    <img
                      src={img}
                      alt={getName(p)}
                      className="w-full h-48 object-cover group-hover:scale-[1.02] transition"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-extrabold text-slate-900 line-clamp-1">{getName(p)}</p>
                    <p className="mt-1 text-slate-600 text-sm line-clamp-1">{getCategory(p)}</p>
                    <p className="mt-3 font-extrabold text-slate-900">{formatBRL(p.price) || '—'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
