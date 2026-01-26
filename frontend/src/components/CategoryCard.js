import { Link } from 'react-router-dom';

export const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/shop?category=${category.slug}`}
      className="relative overflow-hidden rounded-2xl aspect-[4/5] group cursor-pointer"
      data-testid={`category-card-${category.slug}`}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={category.image} 
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 text-white">
        <h3 
          className="text-2xl font-bold mb-2 font-['Manrope']"
          data-testid="category-name"
        >
          {category.name}
        </h3>
        <p 
          className="text-sm text-white/80"
          data-testid="category-count"
        >
          {category.count} produtos
        </p>
        
        {/* Hover Arrow */}
        <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <span className="inline-flex items-center text-sm font-semibold">
            Ver todos
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};
