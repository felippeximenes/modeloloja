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
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 font-['Manrope']">
                Moldz3D
              </span>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Peças e acessórios geek feitos em impressão 3D. Personalização, qualidade e criatividade em cada detalhe.
            </p>

            {/* Social Links (placeholders for now) */}
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
                data-testid="social-facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
                data-testid="social-twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
                data-testid="social-instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
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
                <Link to="/" className="text-slate-600 hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop?category=suportes" className="text-slate-600 hover:text-primary transition-colors text-sm">
                  Suportes
                </Link>
              </li>
              <li>
                <Link to="/shop?category=quadros" className="text-slate-600 hover:text-primary transition-colors text-sm">
                  Quadros
                </Link>
              </li>
              <li>
                <Link to="/shop?category=miniaturas" className="text-slate-600 hover:text-primary transition-colors text-sm">
                  Miniaturas
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Categorias</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop?category=suportes" className="text-slate-600 hover:text-primary transition-colors text-sm">
                  Suportes
                </Link>
              </li>
              <li>
                <Link to="/shop?category=quadros" className="text-slate-600 hover:text-primary transition-colors text-sm">
                  Quadros
                </Link>
              </li>
              <li>
                <Link to="/shop?category=miniaturas" className="text-slate-600 hover:text-primary transition-colors text-sm">
                  Miniaturas
                </Link>
              </li>
              <li>
                <Link to="/shop?category=acessorios" className="text-slate-600 hover:text-primary transition-colors text-sm">
                  Acessórios
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Email: contato@moldz3d.com</li>
              <li>WhatsApp: (11) 99999-9999</li>
              <li>Seg-Sex: 9h às 18h</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-slate-500">
              © 2025 Moldz3D. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm text-slate-500">
              <a href="#" className="hover:text-primary transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
