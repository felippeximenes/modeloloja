import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth";
import { toast } from "sonner";
import { ShineButton } from "../components/ui/ShineButton";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(form);
      toast.success("Conta criada com sucesso");
      navigate("/account");
    } catch (error) {
      toast.error(error.message || "Erro ao criar conta");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Criar conta
        </h1>

        <p className="text-slate-500 mb-6">
          Cadastre-se para acompanhar pedidos e finalizar compras mais rápido.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Nome
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
              placeholder="seuemail@exemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Senha
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
              placeholder="Crie uma senha"
              required
            />
          </div>

          <ShineButton
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </ShineButton>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          Já tem conta?{" "}
          <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
