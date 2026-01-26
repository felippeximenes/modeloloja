import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { products, materials } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { addToCart } from '../utils/cart';
import { toast } from 'sonner';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [, setCartUpdate] = useState(0);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, selectedMaterials, priceRange, sortBy]);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => 
        p.category.toLowerCase() === selectedCategory.toLowerCase() ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by materials
    if (selectedMaterials.length > 0) {
      filtered = filtered.filter(p => selectedMaterials.includes(p.material));
    }

    // Filter by price range
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Keep original order (newest first)
        break;
      default:
        // Featured: prioritize featured products
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
    }

    setFilteredProducts(filtered);
  };

  const handleMaterialToggle = (material) => {
    setSelectedMaterials(prev => 
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedMaterials([]);
    setPriceRange([0, 300]);
    setSortBy('featured');
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setCartUpdate(prev => prev + 1);
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) + 
    selectedMaterials.length + 
    (priceRange[0] > 0 || priceRange[1] < 300 ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 font-['Manrope'] mb-2">
            Loja
          </h1>
          <p className="text-slate-600">
            {filteredProducts.length} produtos encontrados
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0" data-testid="filters-sidebar">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-900">Filtros</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    data-testid="clear-filters"
                  >
                    Limpar ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-slate-900 mb-3">Categoria</h4>
                <div className="space-y-2">
                  {['Miniaturas', 'Cosplay', 'Decoração', 'Acessórios'].map((category) => (
                    <label key={category} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory.toLowerCase() === category.toLowerCase()}
                        onChange={() => setSelectedCategory(category)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        data-testid={`filter-category-${category.toLowerCase()}`}
                      />
                      <span className="ml-3 text-sm text-slate-700">{category}</span>
                    </label>
                  ))}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-3 text-sm text-slate-700">Todas</span>
                  </label>
                </div>
              </div>

              {/* Material Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-slate-900 mb-3">Material</h4>
                <div className="space-y-2">
                  {materials.map((material) => (
                    <label key={material} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMaterials.includes(material)}
                        onChange={() => handleMaterialToggle(material)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        data-testid={`filter-material-${material.toLowerCase()}`}
                      />
                      <span className="ml-3 text-sm text-slate-700">{material}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-slate-900 mb-3">Faixa de Preço</h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                    data-testid="price-range-slider"
                  />
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden fixed bottom-6 right-6 z-40 bg-emerald-500 text-white p-4 rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
            data-testid="mobile-filter-button"
          >
            <Filter className="w-6 h-6" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
              <div 
                className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-900">Filtros</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-6 h-6 text-slate-600" />
                  </button>
                </div>

                {/* Same filters as desktop */}
                <div className="space-y-6">
                  {/* Category */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Categoria</h4>
                    <div className="space-y-2">
                      {['Miniaturas', 'Cosplay', 'Decoração', 'Acessórios'].map((category) => (
                        <label key={category} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="category-mobile"
                            checked={selectedCategory.toLowerCase() === category.toLowerCase()}
                            onChange={() => setSelectedCategory(category)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="ml-3 text-sm text-slate-700">{category}</span>
                        </label>
                      ))}
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category-mobile"
                          checked={selectedCategory === ''}
                          onChange={() => setSelectedCategory('')}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="ml-3 text-sm text-slate-700">Todas</span>
                      </label>
                    </div>
                  </div>

                  {/* Material */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Material</h4>
                    <div className="space-y-2">
                      {materials.map((material) => (
                        <label key={material} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMaterials.includes(material)}
                            onChange={() => handleMaterialToggle(material)}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                          />
                          <span className="ml-3 text-sm text-slate-700">{material}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={clearFilters}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2.5 px-4 rounded-full transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6 bg-slate-50 px-4 py-3 rounded-xl">
              <span className="text-sm text-slate-600">
                {filteredProducts.length} produtos
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border-none bg-transparent focus:outline-none focus:ring-0 text-slate-700 font-medium cursor-pointer"
                data-testid="sort-select"
              >
                <option value="featured">Destaque</option>
                <option value="newest">Mais Novos</option>
                <option value="price-low">Menor Preço</option>
                <option value="price-high">Maior Preço</option>
                <option value="rating">Melhor Avaliação</option>
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" data-testid="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16" data-testid="no-products">
                <div className="text-slate-400 mb-4">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-slate-600 mb-6">
                  Tente ajustar seus filtros ou explorar outras categorias
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-full transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
