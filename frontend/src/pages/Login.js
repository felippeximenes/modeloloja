import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await loginUser(form);
      toast.success("Login realizado com sucesso");
      navigate("/account");
    } catch (error) {
      toast.error(error.message || "Erro ao fazer login");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Entrar
        </h1>

        <p className="text-slate-500 mb-6">
          Acesse sua conta para acompanhar pedidos e compras.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-full transition disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          Não tem conta?{" "}
          <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}