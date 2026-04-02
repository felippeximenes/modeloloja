import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import TiltedCard from "./TiltedCard";
import { ShineButton } from "./ui/ShineButton";

// O TiltedCard virou o comportamento padrão dos cards de produto.
// A prop "tilted" continua existindo para permitir desligar o efeito
// caso algum contexto futuro precise de um card estático.
export const ProductCard = ({ product, onAddToCart, tilted = true }) => {
  // A Home ainda mistura produtos com shape antigo (`variants`, `inStock`, `image`)
  // e produtos vindos da API (`variations`, `stock`, `images`).
  // Aqui normalizamos os dois formatos para o card funcionar corretamente.
  const variationList = Array.isArray(product.variations)
    ? product.variations
    : Array.isArray(product.variants)
      ? product.variants
      : [];

  const hasVariations = variationList.length > 0;

  const minPrice = hasVariations
    ? Math.min(...variationList.map((variation) => Number(variation.price || 0)))
    : Number(product.price || 0);

  const hasStock = hasVariations
    ? variationList.some((variation) =>
        typeof variation.stock === "number"
          ? variation.stock > 0
          : Boolean(variation.inStock)
      )
    : Boolean(product.inStock);

  const imageUrl =
    (Array.isArray(product.images) && product.images[0]) ||
    (Array.isArray(product.variants) && product.variants[0]?.images?.[0]) ||
    product.image ||
    "/placeholder.png";

  const handleAddToCart = (event) => {
    event.preventDefault();

    if (!hasStock) return;

    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const productId = product._id || product.id;

  // O layout foi isolado para que ele possa ser envolvido pelo TiltedCard
  // sem duplicar o JSX principal do componente.
  const cardContent = (
    <Link
      to={`/product/${productId}`}
      className="group relative block h-full rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:border-emerald-100 hover:-translate-y-1 hover:shadow-lg"
      style={{ backgroundColor: tilted ? "rgb(248, 250, 252)" : "white" }}
    >
      <div
        className="relative aspect-square overflow-hidden"
        style={{ backgroundColor: tilted ? "rgb(248, 250, 252)" : "rgb(248, 250, 252)" }}
      >
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            tilted
              ? "object-center scale-[1.14] group-hover:scale-[1.2]"
              : "object-center group-hover:scale-105"
          }`}
        />
      </div>

      <div
        className="p-4 space-y-3"
        style={{ backgroundColor: tilted ? "rgb(248, 250, 252)" : "white" }}
      >
        <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">
          {product.category}
        </span>

        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">
              A partir de
            </span>

            <span className="text-2xl font-bold text-slate-900">
              R$ {minPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <ShineButton
          onClick={handleAddToCart}
          disabled={!hasStock}
          className="w-full"
          variant={hasStock ? "primary" : "outline"}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>
            {hasStock ? "Adicionar ao Carrinho" : "Fora de Estoque"}
          </span>
        </ShineButton>
      </div>
    </Link>
  );

  // Comportamento original preservado: se "tilted" não for enviado,
  // o card continua sendo renderizado normalmente.
  if (!tilted) return cardContent;

  // O wrapper com TiltedCard agora unifica o comportamento visual
  // dos cards na home, na loja e nas demais vitrines reaproveitáveis.
  return (
    <TiltedCard
      className="rounded-2xl"
      captionText={product.name}
      scaleOnHover={1.025}
      rotateAmplitude={7}
      showTooltip={false}
    >
      {cardContent}
    </TiltedCard>
  );
};
