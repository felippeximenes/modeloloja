import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} from "../services/api";
import { logoutUser } from "../services/auth";
import { toast } from "sonner";

const initialForm = {
  title: "",
  receiver_name: "",
  receiver_phone: "",
  receiver_document: "",
  receiver_email: "",
  to_cep: "",
  receiver_address: "",
  receiver_number: "",
  receiver_complement: "",
  receiver_district: "",
  receiver_city: "",
  receiver_state: "",
  is_default: false,
};

export default function MyAddresses() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      const data = await getMyAddresses();
      setAddresses(data || []);
    } catch (error) {
      console.error("Erro ao carregar endereços:", error);

      if (
        error.message?.toLowerCase().includes("401") ||
        error.message?.toLowerCase().includes("não autenticado") ||
        error.message?.toLowerCase().includes("unauthorized")
      ) {
        logoutUser();
        navigate("/login");
        return;
      }

      toast.error(error.message || "Erro ao carregar endereços");
    }

    setLoading(false);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleEdit(address) {
    setEditingId(address.id);
    setForm({
      title: address.title || "",
      receiver_name: address.receiver_name || "",
      receiver_phone: address.receiver_phone || "",
      receiver_document: address.receiver_document || "",
      receiver_email: address.receiver_email || "",
      to_cep: address.to_cep || "",
      receiver_address: address.receiver_address || "",
      receiver_number: address.receiver_number || "",
      receiver_complement: address.receiver_complement || "",
      receiver_district: address.receiver_district || "",
      receiver_city: address.receiver_city || "",
      receiver_state: address.receiver_state || "",
      is_default: !!address.is_default,
    });
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        to_cep: form.to_cep.replace(/\D/g, ""),
      };

      if (editingId) {
        await updateAddress(editingId, payload);
        toast.success("Endereço atualizado com sucesso");
      } else {
        await createAddress(payload);
        toast.success("Endereço criado com sucesso");
      }

      resetForm();
      await loadAddresses();
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      toast.error(error.message || "Erro ao salvar endereço");
    }

    setSaving(false);
  }

  async function handleDelete(addressId) {
    const confirmed = window.confirm("Deseja remover este endereço?");
    if (!confirmed) return;

    try {
      await deleteAddress(addressId);
      toast.success("Endereço removido com sucesso");
      await loadAddresses();
    } catch (error) {
      console.error("Erro ao remover endereço:", error);
      toast.error(error.message || "Erro ao remover endereço");
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link
          to="/account"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Voltar para Minha Conta
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mt-3">
          Meus Endereços
        </h1>

        <p className="text-slate-500 mt-2">
          Cadastre e gerencie seus endereços de entrega.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-slate-200 rounded-2xl p-6 bg-white">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Editar Endereço" : "Novo Endereço"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input name="title" placeholder="Título (Casa, Trabalho...)" value={form.title} onChange={handleChange} required className="w-full border p-3 rounded-xl" />
            <input name="receiver_name" placeholder="Nome do recebedor" value={form.receiver_name} onChange={handleChange} required className="w-full border p-3 rounded-xl" />
            <input name="receiver_phone" placeholder="Telefone" value={form.receiver_phone} onChange={handleChange} required className="w-full border p-3 rounded-xl" />
            <input name="receiver_document" placeholder="CPF" value={form.receiver_document} onChange={handleChange} required className="w-full border p-3 rounded-xl" />
            <input name="receiver_email" placeholder="Email" value={form.receiver_email} onChange={handleChange} className="w-full border p-3 rounded-xl" />
            <input name="to_cep" placeholder="CEP" value={form.to_cep} onChange={handleChange} required className="w-full border p-3 rounded-xl" />
            <input name="receiver_address" placeholder="Rua / Avenida" value={form.receiver_address} onChange={handleChange} required className="w-full border p-3 rounded-xl" />
            <input name="receiver_number" placeholder="Número" value={form.receiver_number} onChange={handleChange} required className="w-full border p-3 rounded-xl" />
            <input name="receiver_complement" placeholder="Complemento" value={form.receiver_complement} onChange={handleChange} className="w-full border p-3 rounded-xl" />
            <input name="receiver_district" placeholder="Bairro" value={form.receiver_district} onChange={handleChange} required className="w-full border p-3 rounded-xl" />
            <input name="receiver_city" placeholder="Cidade" value={form.receiver_city} onChange={handleChange} required className="w-full border p-3 rounded-xl" />
            <input name="receiver_state" placeholder="Estado" value={form.receiver_state} onChange={handleChange} required className="w-full border p-3 rounded-xl" />

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="is_default"
                checked={form.is_default}
                onChange={handleChange}
              />
              Definir como endereço padrão
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-3 rounded-full disabled:opacity-50"
              >
                {saving ? "Salvando..." : editingId ? "Atualizar endereço" : "Salvar endereço"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-5 py-3 rounded-full"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="border border-slate-200 rounded-2xl p-6 bg-white">
              <p className="text-slate-500">Carregando endereços...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="border border-slate-200 rounded-2xl p-6 bg-white">
              <p className="text-slate-500">
                Você ainda não cadastrou endereços.
              </p>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className="border border-slate-200 rounded-2xl p-6 bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {address.title}
                      </h3>

                      {address.is_default && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                          Padrão
                        </span>
                      )}
                    </div>

                    <p className="text-slate-700 mt-2">{address.receiver_name}</p>
                    <p className="text-sm text-slate-500">
                      {address.receiver_address}, {address.receiver_number}
                    </p>

                    {address.receiver_complement && (
                      <p className="text-sm text-slate-500">
                        {address.receiver_complement}
                      </p>
                    )}

                    <p className="text-sm text-slate-500">
                      {address.receiver_district} - {address.receiver_city}/{address.receiver_state}
                    </p>

                    <p className="text-sm text-slate-500">
                      CEP: {address.to_cep}
                    </p>

                    <p className="text-sm text-slate-500 mt-2">
                      Telefone: {address.receiver_phone}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-sm bg-slate-900 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-full"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-sm bg-red-100 hover:bg-red-200 text-red-700 font-medium px-4 py-2 rounded-full"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}