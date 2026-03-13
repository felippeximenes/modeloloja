import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getProductById } from "../services/api";
import { addToCart } from "../utils/cart";

export default function ProductDetail() {

  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [qty, setQty] = useState(1);

  // LOAD PRODUCT
  useEffect(() => {

    async function loadProduct() {

      try {

        const data = await getProductById(id);

        setProduct(data);

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

    return product.variations.find(v => v.sku === selectedSku);

  }, [product, selectedSku]);


  useEffect(() => {

    if (selectedVariation?.image) {

      setMainImage(selectedVariation.image);

    }

  }, [selectedVariation]);


  if (!product) {

    return <div className="p-10">Carregando...</div>;

  }


  const imageUrl = mainImage || "/placeholder.png";

  const hasStock = selectedVariation?.stock > 0;


  const handleAddToCart = () => {

    if (!selectedVariation) return;

    addToCart({

      id: product.id,
      name: product.name,
      image: imageUrl,
      sku: selectedVariation.sku,
      price: selectedVariation.price,
      model: selectedVariation.model,
      color: selectedVariation.color,
      size: selectedVariation.size,

    }, qty);

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


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-8">


        {/* IMAGE */}

        <div>

          <div className="bg-slate-100 rounded-2xl overflow-hidden group relative">

            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-125"
            />

          </div>


          {/* THUMBNAILS */}

          {product.images?.length > 1 && (

            <div className="flex gap-3 mt-4">

              {product.images.map((img, index) => {

                const active = mainImage === img;

                return (


                <img
                  key={index}
                  src={img}
                  alt={product.name}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition ${
                    active
                      ? "border-emerald-500 scale-105"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                />
                  );
              })}

            </div>

          )}

        </div>


        {/* INFO */}

        <div>

          <span className="text-sm text-emerald-600 font-semibold uppercase">

            {product.category}

          </span>


          <h1 className="text-3xl font-bold mt-2">

            {product.name}

          </h1>


          <p className="mt-4 text-slate-600">

            {product.description}

          </p>


          {/* VARIATIONS */}

          {product.variations?.length > 0 && (

            <div className="mt-6">

              <p className="font-semibold mb-3">

                Escolha uma variação

              </p>


              <div className="flex flex-wrap gap-3">

                {product.variations.map((variation) => (

                  <button
                    key={variation.sku}
                    
                    onClick={() => {
                      setSelectedSku(variation.sku);
                      if (variation.image) {
                        setMainImage(variation.image);
                      }
                    }}
                    className={`px-4 py-3 rounded-xl border text-sm font-semibold transition text-left ${
                      selectedSku === variation.sku
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "border-slate-300 hover:border-emerald-400"
                    }`}
                  >

                    <div>
                      {variation.size} • {variation.color}
                    </div>

                    <div className="text-xs opacity-80">
                      R$ {variation.price.toFixed(2)}
                    </div>

                  </button>

                ))}

              </div>

            </div>

          )}


          {/* PRICE */}

          <div className="mt-6">

            <span className="text-3xl font-bold">

              R$ {selectedVariation?.price?.toFixed(2)}

            </span>

          </div>


          {/* QUANTITY */}

          <div className="mt-6 flex items-center gap-3">

            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="px-4 py-2 border rounded"
            >
              -
            </button>

            <span>{qty}</span>

            <button
              onClick={() => setQty(q => q + 1)}
              className="px-4 py-2 border rounded"
            >
              +
            </button>

          </div>


          {/* ADD TO CART */}

          <button
            onClick={handleAddToCart}
            disabled={!hasStock}
            className={`mt-6 w-full py-3 rounded-full font-semibold ${
              hasStock
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >

            {hasStock ? "Adicionar ao Carrinho" : "Sem Estoque"}

          </button>

        </div>

      </div>

    </main>

  );

}