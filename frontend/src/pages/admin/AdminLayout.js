import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { logoutUser } from "../../services/auth";

const NAV = [
  { to: "/admin",          icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/products", icon: Package,          label: "Produtos"             },
];

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`flex flex-col bg-slate-900 text-white ${
        mobile ? "w-64 h-full" : "hidden lg:flex w-64 min-h-screen"
      }`}
    >
      <div className="px-6 py-5 border-b border-slate-700">
        <Link to="/admin" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-emerald-400">MOLDZ3D</span>
          <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 border-t border-slate-700 pt-4 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <ChevronRight className="w-4 h-4" /> Ver loja
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
          <span className="font-bold text-emerald-400">MOLDZ3D Admin</span>
          <button onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
