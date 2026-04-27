import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, User, ChevronDown } from "lucide-react";
import { getCartCount } from "../utils/cart";
import { getStoredUser, isAuthenticated, logoutUser } from "../services/auth";

export const Header = ({ onSearch }) => {
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser());

  const accountMenuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    updateCartCount();
    updateAuth();

    const handleStorageChange = () => {
      updateCartCount();
      updateAuth();
    };

    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);
    window.addEventListener("authUpdated", handleStorageChange);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
      window.removeEventListener("authUpdated", handleStorageChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const updateCartCount = () => setCartCount(getCartCount());
  const updateAuth = () => setUser(getStoredUser());

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  const handleLogout = () => {
    logoutUser();
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "Minha Conta";

  // "Loja" leva para a vitrine completa, enquanto os demais links
  // continuam atuando como atalhos para categorias específicas.
  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Loja", to: "/shop" },
    { label: "Suportes", to: "/shop?category=suportes" },
    { label: "Quadros", to: "/shop?category=quadros" },
    { label: "Miniaturas", to: "/shop?category=miniaturas" },
  ];

  const isActive = (to) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname + location.search === to || location.pathname === to.split("?")[0];
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92))] shadow-[0_16px_40px_rgba(2,6,23,0.28)] backdrop-blur-xl"
      data-testid="header"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.6rem] items-center justify-between gap-6">
          {/* Wordmark textual refinado: a tipografia e o teal do "3D"
              viram a referência visual para o restante do header. */}
          <Link to="/" className="flex flex-shrink-0 items-center" data-testid="logo-link">
            <div className="leading-none">
              <span className="block font-['Montserrat'] text-[1.22rem] font-black uppercase tracking-[0.08em] text-white">
                Moldz<span className="text-teal-400">3D</span>
              </span>
              <span className="block pt-1 text-[0.62rem] font-medium uppercase tracking-[0.34em] text-slate-500">
                Geek Lab
              </span>
            </div>
          </Link>

          {/* A navegação ganha um trilho discreto para ficar mais premium
              e visualmente coerente com o wordmark. */}
          <nav className="hidden items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] p-1 md:flex">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? "bg-white/8 text-white shadow-[0_10px_30px_rgba(45,212,191,0.08)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {label}
                {isActive(to) && (
                  <span className="absolute inset-x-4 bottom-[0.42rem] h-px rounded-full bg-teal-400" />
                )}
              </Link>
            ))}
          </nav>

          {/* Busca com mais contraste e profundidade para acompanhar
              o novo acabamento do header. */}
          <form onSubmit={handleSearch} className="hidden max-w-md flex-1 items-center lg:flex">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar peças e acessórios 3D..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-white/[0.04] py-3 pl-11 pr-5 text-sm text-white placeholder-slate-500 transition-colors duration-150 focus:border-teal-500/60 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </form>

          {/* Ações da direita passam a usar a mesma linguagem de pills,
              bordas suaves e highlights discretos. */}
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated() && user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 transition-colors duration-150 hover:bg-white/[0.06]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/20 text-sm font-semibold text-teal-400">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs leading-none text-slate-500">Olá,</p>
                    <p className="text-sm font-semibold leading-tight text-white">{firstName}</p>
                  </div>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-150 ${accountMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-white/10 bg-slate-900 p-1.5 shadow-2xl shadow-black/40">
                    <div className="mb-1 border-b border-white/8 px-3 py-3">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
                    </div>

                    {[
                      ...(user?.is_admin ? [{ label: "⚙️ Painel Admin", to: "/admin" }] : []),
                      { label: "Minha Conta", to: "/account" },
                      { label: "Meus Pedidos", to: "/account/orders" },
                      { label: "Meus Endereços", to: "/account/addresses" },
                    ].map(({ label, to }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setAccountMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-slate-300 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                      >
                        {label}
                      </Link>
                    ))}

                    <div className="mt-1 border-t border-white/8 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-400 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-300"
                      >
                        Sair da conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
              >
                <User className="h-4 w-4" />
                Entrar
              </Link>
            )}

            <Link
              to="/cart"
              className="relative rounded-full border border-white/8 bg-white/[0.03] p-2.5 text-slate-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full border border-white/8 bg-white/[0.03] p-2.5 text-slate-400 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/8 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {isAuthenticated() && user && (
                <div className="mb-2 flex items-center gap-3 border-b border-white/8 px-3 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/20 text-sm font-semibold text-teal-400">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
              )}

              {navLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                    isActive(to)
                      ? "bg-teal-500/10 text-teal-300"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              ))}

              {isAuthenticated() && user ? (
                <>
                  <div className="my-2 border-t border-white/8" />
                  {[
                    { label: "Minha Conta", to: "/account" },
                    { label: "Meus Pedidos", to: "/account/orders" },
                    { label: "Meus Endereços", to: "/account/addresses" },
                  ].map(({ label, to }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-2xl px-3 py-2.5 text-sm text-slate-400 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                    >
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="rounded-2xl px-3 py-2.5 text-left text-sm text-red-400 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <div className="my-2 border-t border-white/8" />
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl px-3 py-2.5 text-sm text-slate-400 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl px-3 py-2.5 text-sm text-slate-400 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                  >
                    Criar Conta
                  </Link>
                </>
              )}

              <form onSubmit={handleSearch} className="mt-3 border-t border-white/8 pt-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar peças e acessórios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </form>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
