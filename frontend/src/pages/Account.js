import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMe, getStoredUser, logoutUser } from "../services/auth";
import { toast } from "sonner";
import { ShineButton } from "../components/ui/ShineButton";

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

            <Link
              to="/account/addresses"
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Meus Endereços
            </Link>

            <ShineButton
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="justify-start px-0 text-red-600 hover:bg-transparent hover:text-red-700"
            >
              Sair da conta
            </ShineButton>
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

          <div className="mt-8 flex flex-wrap gap-3">
            <ShineButton asChild>
              <Link to="/account/orders">Ver meus pedidos</Link>
            </ShineButton>

            <Link
              to="/account/addresses"
              className="inline-flex bg-slate-900 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-full"
            >
              Gerenciar endereços
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
