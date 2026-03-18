import { useEffect, useState } from "react";
import { getMe, getStoredUser, logoutUser } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getMe();
        setUser(data);
      } catch (error) {
        logoutUser();
        toast.error("Sua sessão expirou. Faça login novamente.");
        navigate("/login");
      }

      setLoading(false);
    }

    loadUser();
  }, [navigate]);

  function handleLogout() {
    logoutUser();
    toast.success("Logout realizado com sucesso");
    navigate("/login");
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10">
        Carregando...
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="border border-slate-200 rounded-2xl p-8 bg-white">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Minha Conta
        </h1>

        <p className="text-slate-500 mb-8">
          Área do cliente Moldz3D
        </p>

        <div className="space-y-4">
          <div>
            <span className="text-sm text-slate-500">Nome</span>
            <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
          </div>

          <div>
            <span className="text-sm text-slate-500">Email</span>
            <p className="text-lg font-semibold text-slate-900">{user?.email}</p>
          </div>

          <div>
            <span className="text-sm text-slate-500">Tipo de conta</span>
            <p className="text-lg font-semibold text-slate-900">{user?.provider || "local"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 bg-slate-900 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-full"
        >
          Sair da conta
        </button>
      </div>
    </main>
  );
}