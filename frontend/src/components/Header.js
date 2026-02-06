import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { getCartCount } from '../utils/cart';

export const Header = ({ onSearch }) => {
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    updateCartCount();

    const handleStorageChange = () => {
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const updateCartCount = () => {
    setCartCount(getCartCount());
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200"
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2"
            data-testid="logo-link"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 font-['Manrope']">
              Moldz3D
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-slate-600 hover:text-primary font-medium transition-colors"
              data-testid="nav-home"
            >
              Home
            </Link>
            <Link
              to="/shop?category=suportes"
              className="text-slate-600 hover:text-primary font-medium transition-colors"
              data-testid="nav-suportes"
            >
              Suportes
            </Link>
            <Link
              to="/shop?category=quadros"
              className="text-slate-600 hover:text-primary font-medium transition-colors"
              data-testid="nav-quadros"
            >
              Quadros
            </Link>
            <Link
              to="/shop?category=miniaturas"
              className="text-slate-600 hover:text-primary font-medium transition-colors"
              data-testid="nav-miniaturas"
            >
              Miniaturas
            </Link>
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center flex-1 max-w-md mx-8"
            data-testid="search-form"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar peças e acessórios 3D..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                data-testid="search-input"
              />
            </div>
          </form>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
            data-testid="cart-button"
          >
            <ShoppingCart className="w-6 h-6 text-slate-700" />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                data-testid="cart-count"
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden py-4 border-t border-slate-200"
            data-testid="mobile-menu"
          >
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-slate-600 hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/shop?category=suportes"
                className="text-slate-600 hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Suportes
              </Link>
              <Link
                to="/shop?category=quadros"
                className="text-slate-600 hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Quadros
              </Link>
              <Link
                to="/shop?category=miniaturas"
                className="text-slate-600 hover:text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Miniaturas
              </Link>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="pt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar peças e acessórios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
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
