import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 font-['Manrope']">
                PolyForge
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Marketplace premium de itens geek impressos em 3D. Criatividade, precisão e imaginação.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all"
                data-testid="social-facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all"
                data-testid="social-twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all"
                data-testid="social-instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all"
                data-testid="social-youtube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-600 hover:text-emerald-500 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-slate-600 hover:text-emerald-500 transition-colors text-sm">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/shop?category=miniaturas" className="text-slate-600 hover:text-emerald-500 transition-colors text-sm">
                  Miniaturas
                </Link>
              </li>
              <li>
                <Link to="/shop?category=cosplay" className="text-slate-600 hover:text-emerald-500 transition-colors text-sm">
                  Cosplay
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Categorias</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop?category=miniaturas" className="text-slate-600 hover:text-emerald-500 transition-colors text-sm">
                  Miniaturas
                </Link>
              </li>
              <li>
                <Link to="/shop?category=cosplay" className="text-slate-600 hover:text-emerald-500 transition-colors text-sm">
                  Cosplay Props
                </Link>
              </li>
              <li>
                <Link to="/shop?category=decoracao" className="text-slate-600 hover:text-emerald-500 transition-colors text-sm">
                  Decoração
                </Link>
              </li>
              <li>
                <Link to="/shop?category=acessorios" className="text-slate-600 hover:text-emerald-500 transition-colors text-sm">
                  Acessórios Tech
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Email: contato@polyforge.com</li>
              <li>WhatsApp: (11) 99999-9999</li>
              <li>Seg-Sex: 9h às 18h</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-slate-500">
              © 2025 PolyForge. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm text-slate-500">
              <a href="#" className="hover:text-emerald-500 transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-emerald-500 transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
