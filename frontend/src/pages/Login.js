import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, saveAuth } from "../services/auth";
import { toast } from "sonner";

const API_URL = "http://localhost:8000";
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("REACT_APP_GOOGLE_CLIENT_ID não configurado.");
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    const initializeGoogle = () => {
      if (!window.google || !document.getElementById("google-signin-button")) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 360,
          text: "signin_with"
        }
      );
    };

    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;

    document.body.appendChild(script);
  }, []);

  async function handleGoogleResponse(response) {
    if (!response?.credential) {
      toast.error("Google não retornou credencial de login.");
      return;
    }

    setGoogleLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          credential: response.credential
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Erro ao fazer login com Google");
      }

      saveAuth(data);
      toast.success("Login com Google realizado com sucesso");
      navigate("/account");
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(error.message || "Erro ao fazer login com Google");
    }

    setGoogleLoading(false);
  }

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

        <div className="my-6 flex items-center gap-3">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-sm text-slate-400">ou</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <div className="flex justify-center">
          <div id="google-signin-button"></div>
        </div>

        {googleLoading && (
          <p className="text-sm text-slate-500 text-center mt-4">
            Entrando com Google...
          </p>
        )}

        {!GOOGLE_CLIENT_ID && (
          <p className="text-sm text-red-500 text-center mt-4">
            Configure o REACT_APP_GOOGLE_CLIENT_ID no frontend.
          </p>
        )}

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