import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, User } from "lucide-react";
import { getCartCount } from "../utils/cart";
import { getStoredUser, isAuthenticated, logoutUser } from "../services/auth";

export const Header = ({ onSearch }) => {
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    updateCartCount();
    updateAuth();

    const handleStorageChange = () => {
      updateCartCount();
      updateAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);
    window.addEventListener("authUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
      window.removeEventListener("authUpdated", handleStorageChange);
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
  };

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
            <span className="text-2xl font-bold text-slate-900 font-['Manrope']">
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
              <>
                <Link
                  to="/account"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <User className="w-5 h-5 text-slate-700" />
                  <span className="text-sm font-medium text-slate-700">
                    Minha Conta
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                >
                  Sair
                </button>
              </>
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

                  <button
                    onClick={handleLogout}
                    className="text-left text-slate-600 hover:text-slate-900 font-medium"
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