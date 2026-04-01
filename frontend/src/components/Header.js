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

  const navLinks = [
    { label: "Home", to: "/" },
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
      className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/8"
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0" data-testid="logo-link">
            <span className="text-xl font-bold text-white font-['Montserrat'] tracking-tight">
              Moldz3D
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  isActive(to)
                    ? "text-teal-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
                {isActive(to) && (
                  <span className="absolute bottom-0 left-3 right-3 h-px bg-teal-400 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center flex-1 max-w-sm"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar peças e acessórios 3D..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-full text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-150"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated() && user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors duration-150"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center font-semibold text-sm">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-500 leading-none">Olá,</p>
                    <p className="text-sm font-semibold text-white leading-tight">{firstName}</p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${accountMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-1.5 z-50">
                    <div className="px-3 py-3 border-b border-white/8 mb-1">
                      <p className="font-semibold text-white text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>

                    {[
                      { label: "Minha Conta", to: "/account" },
                      { label: "Meus Pedidos", to: "/account/orders" },
                      { label: "Meus Endereços", to: "/account/addresses" },
                    ].map(({ label, to }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
                      >
                        {label}
                      </Link>
                    ))}

                    <div className="mt-1 pt-1 border-t border-white/8">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-150"
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
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
              >
                <User className="w-4 h-4" />
                Entrar
              </Link>
            )}

            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-teal-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/8">
            <nav className="flex flex-col gap-1">
              {isAuthenticated() && user && (
                <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-white/8">
                  <div className="w-9 h-9 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center font-semibold text-sm">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
              )}

              {navLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive(to)
                      ? "text-teal-400 bg-teal-500/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
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
                      className="px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="text-left px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-150"
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
                    className="px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-150"
                  >
                    Criar Conta
                  </Link>
                </>
              )}

              <form onSubmit={handleSearch} className="mt-3 pt-3 border-t border-white/8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar peças e acessórios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-full text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors duration-150"
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
