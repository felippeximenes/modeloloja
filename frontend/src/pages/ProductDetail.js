import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Heart,
  Share2,
  Star,
  Truck,
  ShieldCheck,
  Package,
  ChevronDown,
} from 'lucide-react';

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

  // ✅ garante 3 imagens pra miniaturas lado a lado (repete a primeira se precisar)
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

function getSpecs(product) {
  const s = product?.specs;
  if (s && typeof s === 'object' && !Array.isArray(s)) {
    return Object.entries(s).map(([k, v]) => ({ label: String(k), value: String(v) }));
  }
  if (Array.isArray(s)) {
    return s.map((item, idx) => ({
      label: item?.label ?? `Spec ${idx + 1}`,
      value: item?.value ?? String(item),
    }));
  }
  return [
    { label: 'Layer Height', value: '0.12mm' },
    { label: 'Infill', value: '20%' },
    { label: 'Print Time', value: '24 horas' },
    { label: 'Material', value: 'PLA' },
    { label: 'Weight', value: '85g' },
  ];
}

function getDiscountPercent(product) {
  const price = typeof product?.price === 'number' ? product.price : null;
  const oldPrice = typeof product?.oldPrice === 'number' ? product.oldPrice : null;
  if (!price || !oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-semibold text-slate-900">{title}</span>
        <ChevronDown className={cn('w-5 h-5 text-slate-500 transition', open && 'rotate-180')} />
      </button>
      {open && <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed">{children}</div>}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => String(p.id) === String(id));

  const [qty, setQty] = useState(1);

  const images = useMemo(() => getImages(product), [product]);

  // ✅ usa índice (funciona mesmo com imagens repetidas)
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImg = images[activeIndex] || images[0];

  useEffect(() => {
    setQty(1);
  }, [id]);

  useEffect(() => {
    setActiveIndex(0);
  }, [images, id]);

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
    addToCart(product, qty);
    window.dispatchEvent(new Event('cartUpdated'));
  };

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
  const price = formatBRL(product?.price ?? 45);
  const oldPrice = formatBRL(product?.oldPrice ?? 65);
  const discount = getDiscountPercent(product);
  const specs = getSpecs(product);

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
          {/* GALERIA (igual print) */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl bg-slate-100 border border-slate-200">
              {discount != null && (
                <div className="absolute top-5 left-5 z-10">
                  <div className="rounded-full bg-emerald-500 text-white font-extrabold text-sm px-4 py-2 shadow-sm">
                    -{discount}% OFF
                  </div>
                </div>
              )}

              {/* imagem principal */}
              <img src={activeImg} alt={name} className="w-full h-[520px] object-cover" />

              {/* 3 miniaturas embaixo (lado a lado) */}
              <div className="absolute left-0 right-0 bottom-0 p-4 sm:p-5">
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
              <div className="text-4xl font-extrabold text-slate-900">{price}</div>
              {oldPrice && <div className="text-lg text-slate-400 line-through pb-1">{oldPrice}</div>}
            </div>

            <p className="mt-5 text-slate-600 leading-relaxed">{getDescription(product)}</p>

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
                className="h-12 rounded-full bg-emerald-500 text-white font-extrabold hover:bg-emerald-600 transition inline-flex items-center justify-center gap-2"
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

            <div className="mt-6 space-y-3">
              <Accordion title="Descrição & detalhes" defaultOpen>
                {getDescription(product)}
              </Accordion>

              <Accordion title="Envio">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Entrega</p>
                      <p className="text-slate-600 text-sm">Prazo estimado: 3–7 dias úteis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Embalagem</p>
                      <p className="text-slate-600 text-sm">Protegida para transporte</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 sm:col-span-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Garantia</p>
                      <p className="text-slate-600 text-sm">Qualidade e suporte pós-compra</p>
                    </div>
                  </div>
                </div>
              </Accordion>

              <Accordion title="Especificações técnicas">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    {specs.map((s) => (
                      <div key={s.label} className="flex justify-between gap-3">
                        <span className="text-slate-600">{s.label}</span>
                        <span className="font-semibold text-slate-900">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Accordion>
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
