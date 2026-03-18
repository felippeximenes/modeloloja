import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMe, getStoredUser, logoutUser } from "../services/auth";
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
      <main className="max-w-5xl mx-auto px-4 py-10">
        Carregando...
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-slate-200 rounded-2xl p-6 bg-white">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Minha Conta
          </h2>

          <nav className="flex flex-col gap-3">
            <Link
              to="/account"
              className="text-slate-900 font-medium"
            >
              Dados da conta
            </Link>

            <Link
              to="/account/orders"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Meus Pedidos
            </Link>

            <button
              onClick={handleLogout}
              className="text-left text-red-600 hover:text-red-700 font-medium"
            >
              Sair da conta
            </button>
          </nav>
        </div>

        <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-8 bg-white">
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
              <p className="text-lg font-semibold text-slate-900">
                {user?.provider || "local"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              to="/account/orders"
              className="inline-flex bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-full"
            >
              Ver meus pedidos
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}