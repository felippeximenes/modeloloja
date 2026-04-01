import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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

  const updateCartCount = () => {
    setCartCount(getCartCount());
  };

  const updateAuth = () => {
    setUser(getStoredUser());
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "Minha Conta";

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200"
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center space-x-2"
            data-testid="logo-link"
          >
            <span className="text-2xl font-bold text-slate-900 font-['Montserrat']">
              Moldz3D
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop?category=suportes"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Suportes
            </Link>
            <Link
              to="/shop?category=quadros"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Quadros
            </Link>
            <Link
              to="/shop?category=miniaturas"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Miniaturas
            </Link>
          </nav>

          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar peças e acessórios 3D..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated() && user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm">
                    {firstName.charAt(0).toUpperCase()}
                  </div>

                  <div className="text-left">
                    <p className="text-xs text-slate-500 leading-none">
                      Olá,
                    </p>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">
                      {firstName}
                    </p>
                  </div>

                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-lg p-2 z-50">
                    <div className="px-3 py-3 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50"
                      >
                        Minha Conta
                      </Link>

                      <Link
                        to="/account/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50"
                      >
                        Meus Pedidos
                      </Link>

                      <Link
                        to="/account/addresses"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50"
                      >
                        Meus Endereços
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <User className="w-5 h-5 text-slate-700" />
                <span className="text-sm font-medium text-slate-700">
                  Entrar
                </span>
              </Link>
            )}

            <Link
              to="/cart"
              className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col space-y-4">
              {isAuthenticated() && user && (
                <div className="pb-4 border-b border-slate-200">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              )}

              <Link
                to="/"
                className="text-slate-600 hover:text-slate-900 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/shop?category=suportes"
                className="text-slate-600 hover:text-slate-900 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Suportes
              </Link>
              <Link
                to="/shop?category=quadros"
                className="text-slate-600 hover:text-slate-900 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Quadros
              </Link>
              <Link
                to="/shop?category=miniaturas"
                className="text-slate-600 hover:text-slate-900 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Miniaturas
              </Link>

              {isAuthenticated() && user ? (
                <>
                  <Link
                    to="/account"
                    className="text-slate-600 hover:text-slate-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Minha Conta
                  </Link>

                  <Link
                    to="/account/orders"
                    className="text-slate-600 hover:text-slate-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Meus Pedidos
                  </Link>

                  <Link
                    to="/account/addresses"
                    className="text-slate-600 hover:text-slate-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Meus Endereços
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-left text-red-600 hover:text-red-700 font-medium"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-600 hover:text-slate-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="text-slate-600 hover:text-slate-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Criar Conta
                  </Link>
                </>
              )}

              <form onSubmit={handleSearch} className="pt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar peças e acessórios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-900"
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