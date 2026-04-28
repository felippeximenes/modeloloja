import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Upload, X, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "./AdminLayout";
import {
  adminGetProduct, adminCreateProduct, adminUpdateProduct, uploadImage,
} from "../../services/adminApi";

const EMPTY_VARIATION = {
  sku: "", model: "", color: "", size: "Único",
  price: "", weight_kg: "", width_cm: "", height_cm: "", length_cm: "",
  stock: 0, active: true, image: "",
};

function ImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  async function handleFile(file) {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50 cursor-pointer hover:border-emerald-400 transition"
      style={{ width: 120, height: 120 }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {value ? (
        <>
          <img src={value} alt="" className="w-full h-full object-contain p-1" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
          {uploading ? (
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span className="text-xs text-center px-1">Upload</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MultiImageUploader({ images, onChange }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  async function handleFiles(files) {
    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map((f) => uploadImage(f).then((r) => r.url))
      );
      onChange([...images, ...urls]);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }

  function remove(idx) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((url, idx) => (
          <div key={url + idx} className="relative" style={{ width: 100, height: 100 }}>
            <img
              src={url}
              alt=""
              className="w-full h-full object-contain rounded-xl border border-slate-200 bg-slate-50 p-1"
            />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <div
          className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:border-emerald-400 transition flex flex-col items-center justify-center gap-1 text-slate-400"
          style={{ width: 100, height: 100 }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span className="text-xs">Adicionar</span>
            </>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2">A primeira imagem será a capa do produto.</p>
    </div>
  );
}

function VariationCard({ variation, idx, onChange, onRemove, total }) {
  const [open, setOpen] = useState(idx === 0);

  function field(key) {
    return {
      value: variation[key] ?? "",
      onChange: (e) => onChange(idx, key, e.target.value),
      className: "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400",
    };
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-sm font-medium text-slate-700"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-400" />
          <span>
            Variação {idx + 1}
            {variation.color && ` — ${variation.color}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {total > 1 && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
              className="p-1 text-red-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-full">
            <label className="block text-xs font-medium text-slate-500 mb-1">Foto da variação</label>
            <ImageUploader
              value={variation.image}
              onChange={(url) => onChange(idx, "image", url)}
            />
          </div>

          {[
            ["sku", "SKU"],
            ["model", "Modelo"],
            ["color", "Cor / Variação"],
            ["size", "Tamanho"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
              <input type="text" {...field(key)} />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Preço (R$)</label>
            <input type="number" step="0.01" min="0" {...field("price")} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Estoque</label>
            <input type="number" min="0" {...field("stock")} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Peso (kg)</label>
            <input type="number" step="0.01" min="0" {...field("weight_kg")} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Largura (cm)</label>
            <input type="number" step="0.1" min="0" {...field("width_cm")} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Altura (cm)</label>
            <input type="number" step="0.1" min="0" {...field("height_cm")} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Comprimento (cm)</label>
            <input type="number" step="0.1" min="0" {...field("length_cm")} />
          </div>

          <div className="flex items-center gap-2 col-span-full">
            <input
              type="checkbox"
              id={`active-${idx}`}
              checked={variation.active}
              onChange={(e) => onChange(idx, "active", e.target.checked)}
              className="accent-emerald-500"
            />
            <label htmlFor={`active-${idx}`} className="text-sm text-slate-600">
              Variação ativa
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(isEdit);
  const [name, setName]             = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState("");
  const [images, setImages]         = useState([]);
  const [active, setActive]         = useState(true);
  const [variations, setVariations] = useState([{ ...EMPTY_VARIATION }]);

  useEffect(() => {
    if (!isEdit) return;
    adminGetProduct(id)
      .then((p) => {
        setName(p.name || "");
        setDescription(p.description || "");
        setCategories((p.categories || []).join(", "));
        setImages(p.images || []);
        setActive(p.active !== false);
        setVariations(p.variations?.length ? p.variations : [{ ...EMPTY_VARIATION }]);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleVariationChange(idx, key, value) {
    setVariations((prev) =>
      prev.map((v, i) => i === idx ? { ...v, [key]: value } : v)
    );
  }

  function addVariation() {
    setVariations((prev) => [...prev, { ...EMPTY_VARIATION }]);
  }

  function removeVariation(idx) {
    setVariations((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        categories: categories.split(",").map((c) => c.trim()).filter(Boolean),
        images,
        active,
        variations: variations.map((v) => ({
          ...v,
          price: parseFloat(v.price) || 0,
          stock: parseInt(v.stock) || 0,
          weight_kg: parseFloat(v.weight_kg) || 0,
          width_cm: parseFloat(v.width_cm) || 0,
          height_cm: parseFloat(v.height_cm) || 0,
          length_cm: parseFloat(v.length_cm) || 0,
        })),
      };

      if (isEdit) {
        await adminUpdateProduct(id, payload);
        toast.success("Produto atualizado!");
      } else {
        await adminCreateProduct(payload);
        toast.success("Produto criado!");
      }
      navigate("/admin/products");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-10 text-center text-slate-400">Carregando...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEdit ? "Editar produto" : "Novo produto"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isEdit ? `Editando: ${name}` : "Preencha os dados do novo produto"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="text-slate-500 hover:text-slate-800 text-sm transition"
          >
            Cancelar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados básicos */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-800">Informações básicas</h2>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nome do produto *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Ex: Suporte Controle PS5 Gengar"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Descrição *</label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                placeholder="Descrição detalhada do produto..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Categorias <span className="font-normal">(separadas por vírgula)</span>
              </label>
              <input
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Ex: Suporte, Pokemon, Geek"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="accent-emerald-500"
              />
              <label htmlFor="active" className="text-sm text-slate-600">
                Produto ativo (visível na loja)
              </label>
            </div>
          </div>

          {/* Imagens */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-slate-800">Fotos do produto</h2>
            <MultiImageUploader images={images} onChange={setImages} />
          </div>

          {/* Variações */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Variações</h2>
              <button
                type="button"
                onClick={addVariation}
                className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Adicionar variação
              </button>
            </div>

            <div className="space-y-3">
              {variations.map((v, idx) => (
                <VariationCard
                  key={idx}
                  variation={v}
                  idx={idx}
                  total={variations.length}
                  onChange={handleVariationChange}
                  onRemove={removeVariation}
                />
              ))}
            </div>
          </div>

          {/* Salvar */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition disabled:opacity-60"
            >
              {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar produto"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
