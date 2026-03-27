import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import ElectricBorder from "./ElectricBorder";
import { ShineButton } from "./ui/ShineButton";

// A prop "electric" foi adicionada para permitir que o mesmo card
// seja usado com ou sem o efeito visual de borda elétrica.
export const ProductCard = ({ product, onAddToCart, electric = false }) => {
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

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (!hasStock) return;

    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const productId = product._id || product.id;

  // O layout original do card foi isolado nesta variável para que,
  // se necessário, ele possa ser envolvido pelo ElectricBorder sem
  // duplicar o JSX do componente.
  const cardContent = (
    <Link
      to={`/product/${productId}`}
      className="group relative rounded-2xl bg-white border border-slate-100 overflow-hidden hover:border-emerald-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >

      <div className="relative aspect-square overflow-hidden bg-slate-50">

        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

      </div>

      <div className="p-4 space-y-3">

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

  // Comportamento original preservado: se "electric" não for enviado,
  // o card continua sendo renderizado normalmente.
  if (!electric) return cardContent;

  // Nova camada opcional: na home, os cards de destaque podem ser
  // renderizados com a borda animada sem afetar os outros usos do card.
  return (
    <ElectricBorder
      color="#7df9ff"
      speed={0.8}
      chaos={0.08}
      borderRadius={18}
      className="rounded-2xl"
    >
      {cardContent}
    </ElectricBorder>
  );

};
