import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Facebook,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getProductById, getProducts } from "../services/api";
import { addToCart } from "../utils/cart";
import ShippingCalculator from "../components/ShippingCalculator";
import { ShineButton } from "../components/ui/ShineButton";

// Helpers da vitrine de relacionados.
// A seção usa imagem e preço normalizados para funcionar tanto com
// produtos vindos da API atual quanto com eventuais variações do shape.
function getRelatedImage(product) {
  return (
    (Array.isArray(product.images) && product.images[0]) ||
    product.image ||
    product.variations?.[0]?.image ||
    "/placeholder.png"
  );
}

function getRelatedPrice(product) {
  if (Array.isArray(product.variations) && product.variations.length > 0) {
    return Math.min(...product.variations.map((variation) => Number(variation.price || 0)));
  }

  return Number(product.price || 0);
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(id);

        setProduct(data);
        setSelectedShipping(null);

        if (data.variations?.length > 0) {
          setSelectedSku(data.variations[0].sku);

          if (data.variations[0].image) {
            setMainImage(data.variations[0].image);
          } else if (data.images?.length > 0) {
            setMainImage(data.images[0]);
          }
        } else if (data.images?.length > 0) {
          setMainImage(data.images[0]);
        }
      } catch (error) {
        console.error("Error loading product:", error);
      }
    }

    loadProduct();
  }, [id]);

  const selectedVariation = useMemo(() => {
    if (!product || !selectedSku) return null;
    return product.variations.find((variation) => variation.sku === selectedSku);
  }, [product, selectedSku]);

  useEffect(() => {
    if (selectedVariation?.image) {
      setMainImage(selectedVariation.image);
    }
  }, [selectedVariation]);

  useEffect(() => {
    async function loadRelated() {
      try {
        const products = await getProducts();
        const currentProductId = String(product?.id || product?._id || "");
        const currentCategory = normalizeText(product?.category);

        // Primeiro priorizamos itens da mesma categoria para manter
        // a proposta de "produtos parecidos".
        const sameCategory = products.filter((item) => {
          const itemId = String(item.id || item._id || "");
          return itemId !== currentProductId && normalizeText(item.category) === currentCategory;
        });

        // Se não houver itens suficientes na categoria, completamos
        // com outros produtos ativos da loja para a vitrine sempre aparecer.
        const fallback = products.filter((item) => {
          const itemId = String(item.id || item._id || "");
          return itemId !== currentProductId && normalizeText(item.category) !== currentCategory;
        });

        setRelatedProducts([...sameCategory, ...fallback].slice(0, 6));
      } catch (error) {
        console.error("Error loading related products:", error);
      }
    }

    if (product) {
      loadRelated();
    }
  }, [product]);

  if (!product) {
    return <div className="p-10">Carregando...</div>;
  }

  const imageUrl = mainImage || "/placeholder.png";
  const hasStock = selectedVariation?.stock > 0;
  const currentPrice = Number(selectedVariation?.price || 0);
  const compareAtPrice =
    Number(
      selectedVariation?.compare_at_price ||
      selectedVariation?.list_price ||
      product?.compare_at_price ||
      currentPrice * 1.12
    ) || 0;
  const discountPercent =
    compareAtPrice > currentPrice
      ? Math.round((1 - currentPrice / compareAtPrice) * 100)
      : 0;
  const productCode = selectedVariation?.sku || product?.sku || `MDZ-${id}`;

  const handleAddToCart = () => {
    if (!selectedVariation) return;

    if (!selectedShipping) {
      alert("Selecione uma opção de frete antes de adicionar ao carrinho.");
      return;
    }

    addToCart(
      {
        id: product.id,
        name: product.name,
        image: imageUrl,
        sku: selectedVariation.sku,
        price: selectedVariation.price,
        model: selectedVariation.model,
        color: selectedVariation.color,
        size: selectedVariation.size,
        selectedShipping,
      },
      qty
    );

    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-slate-900">Início</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to={`/shop?category=${product.category || ""}`} className="hover:text-slate-900">
          {product.category || "Loja"}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 mt-8">
        <div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-100 shadow-[0_25px_80px_rgba(15,23,42,0.08)] group relative">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-[520px] object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {product.images.map((img, index) => {
                const active = mainImage === img;

                return (
                  <img
                    key={index}
                    src={img}
                    alt={product.name}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition ${
                      active
                        ? "border-[#31B0A9] scale-105 shadow-[0_0_0_4px_rgba(49,176,169,0.12)]"
                        : "border-slate-200 hover:border-[#31B0A9]/50"
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
          <span className="text-sm text-emerald-600 font-semibold uppercase tracking-[0.18em]">
            {product.category}
          </span>

          <h1 className="mt-2 text-4xl font-bold font-['Montserrat'] leading-tight text-slate-950">
            {product.name}
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Código {productCode}
          </p>

          <div className="mt-6 rounded-[1.6rem] border border-slate-200/80 bg-slate-50/80 p-5">
            {compareAtPrice > currentPrice && (
              <div className="flex items-center gap-3">
                <span className="text-3xl text-slate-500 line-through">
                  R${compareAtPrice.toFixed(2)}
                </span>
                {discountPercent > 0 && (
                  <span className="text-emerald-500 text-2xl font-medium">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            )}

            <div className="mt-1 flex items-end gap-3">
              <span className="text-5xl font-bold text-slate-950">
                R${currentPrice.toFixed(2)}
              </span>
            </div>

            <a href="#descricao-produto" className="mt-4 inline-flex items-center gap-2 text-slate-700 hover:text-slate-950">
              <CircleHelp className="w-4 h-4" />
              Ver mais detalhes
            </a>
          </div>

          {product.variations?.length > 0 && (
            <div className="mt-8">
              <p className="font-semibold mb-3 text-slate-900">
                Escolha uma variação
              </p>

              <div className="flex flex-wrap gap-3">
                {product.variations.map((variation) => (
                  <button
                    type="button"
                    key={variation.sku}
                    onClick={() => {
                      setSelectedSku(variation.sku);
                      if (variation.image) {
                        setMainImage(variation.image);
                      }
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      selectedSku === variation.sku
                        ? "border-[#31B0A9] bg-[linear-gradient(180deg,rgba(49,176,169,0.12),rgba(49,176,169,0.04))] text-[#0f766e] shadow-[0_10px_30px_rgba(49,176,169,0.12)]"
                        : "border-slate-300 bg-white hover:border-[#31B0A9]/50 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold">
                      {variation.size} • {variation.color}
                    </div>
                    <div className="text-sm opacity-75">
                      R${variation.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 shadow-sm">
              <button
                type="button"
                onClick={() => setQty((value) => Math.max(1, value - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-slate-700 hover:bg-slate-100"
              >
                -
              </button>

              <span className="min-w-[2rem] text-center text-lg font-medium text-slate-900">
                {qty}
              </span>

              <button
                type="button"
                onClick={() => setQty((value) => value + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-slate-700 hover:bg-slate-100"
              >
                +
              </button>
            </div>

            <ShineButton
              onClick={handleAddToCart}
              disabled={!hasStock}
              className="flex-1 min-h-[3.8rem] shadow-[0_20px_40px_rgba(49,176,169,0.20)]"
              variant={hasStock ? "primary" : "subtle"}
            >
              {hasStock ? "Incluir no Carrinho" : "Sem Estoque"}
            </ShineButton>
          </div>

          <ShippingCalculator
            product={product}
            onSelectShipping={setSelectedShipping}
          />

          {selectedShipping && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">
                Frete selecionado
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {selectedShipping.company || "Transportadora"} - {selectedShipping.service || selectedShipping.name}
              </p>
              <p className="text-sm text-slate-700">
                R${Number(selectedShipping.price).toFixed(2)} • {selectedShipping.delivery_time} dias
              </p>
            </div>
          )}

          <div className="mt-10 rounded-[1.6rem] border border-slate-200/80 bg-slate-50/80 p-5 space-y-5">
            <div className="flex items-start gap-3">
              <Truck className="w-6 h-6 text-[#31B0A9] mt-1" />
              <div>
                <p className="font-semibold text-slate-950">Envio</p>
                <p className="text-slate-600">Enviamos seu pedido em até 48hrs úteis.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PackageCheck className="w-6 h-6 text-[#31B0A9] mt-1" />
              <div>
                <p className="font-semibold text-slate-950">Rastreamento</p>
                <p className="text-slate-600">Acompanhe seu pedido do envio à entrega.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-[#31B0A9] mt-1" />
              <div>
                <p className="font-semibold text-slate-950">Compra garantida</p>
                <p className="text-slate-600">Trocas e devoluções com suporte da nossa equipe.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 text-slate-500">
            <span className="font-semibold text-slate-900">Compartilhar</span>
            <Facebook className="w-4 h-4" />
            <span className="text-lg">X</span>
            <span className="text-lg font-semibold">P</span>
          </div>
        </div>
      </div>

      <div id="descricao-produto" className="mt-16 border-t pt-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Descrição do Produto
        </h2>

        <div className="max-w-3xl text-slate-600 leading-relaxed space-y-4">
          <p>{product.description}</p>
        </div>
      </div>

      {/* Vitrine comercial posicionada logo abaixo da descrição do produto. */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200/80 px-6 py-8 text-center sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#31B0A9]">
              Produtos Parecidos
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              Quem viu este produto também gostou
            </h2>
            <p className="mt-3 text-base text-slate-500">
              Seleção de itens da loja com estilo parecido para complementar sua coleção.
            </p>
          </div>

          <div className="px-4 py-8 sm:px-6">
            <div className="flex gap-5 overflow-x-auto pb-3">
              {relatedProducts.map((item) => {
                const relatedPrice = getRelatedPrice(item);
                const relatedComparePrice = Number(
                  item.compare_at_price || item.list_price || relatedPrice * 1.12
                );
                const relatedDiscount =
                  relatedComparePrice > relatedPrice
                    ? Math.round((1 - relatedPrice / relatedComparePrice) * 100)
                    : 0;

                return (
                  <article
                    key={item.id}
                    className="min-w-[280px] max-w-[280px] flex-shrink-0 rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1"
                  >
                    <Link to={`/product/${item.id}`} className="block">
                      <div className="relative overflow-hidden rounded-[1.4rem] bg-slate-50">
                        {relatedDiscount > 0 && (
                          <span className="absolute right-3 top-3 z-10 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                            {relatedDiscount}% OFF
                          </span>
                        )}

                        <img
                          src={getRelatedImage(item)}
                          alt={item.name}
                          className="h-[240px] w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </Link>

                    <div className="mt-4">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="min-h-[3.8rem] text-xl font-medium leading-tight text-slate-900 transition-colors hover:text-[#31B0A9]">
                          {item.name}
                        </h3>
                      </Link>

                      <div className="mt-4 border-t border-slate-200 pt-4">
                        {relatedComparePrice > relatedPrice && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="line-through">
                              R${relatedComparePrice.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <p className="mt-1 text-3xl font-bold text-slate-950">
                          R${relatedPrice.toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center gap-3">
                        <ShineButton
                          asChild
                          className="flex-1"
                        >
                          <Link to={`/product/${item.id}`}>
                            Comprar
                          </Link>
                        </ShineButton>

                        <ShineButton
                          asChild
                          variant="outline"
                          className="min-w-[3.2rem] px-0"
                        >
                          <Link to={`/product/${item.id}`}>
                            +
                          </Link>
                        </ShineButton>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
