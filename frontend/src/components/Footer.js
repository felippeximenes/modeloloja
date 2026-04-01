import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/8" style={{ backgroundColor: '#020c15' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold text-white font-['Montserrat']">
                Moldz3D
              </span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Peças e acessórios geek feitos em impressão 3D. Personalização, qualidade e criatividade em cada detalhe.
            </p>

            {/* Social Links (placeholders for now) */}
            <div className="flex space-x-3">
              {[
                { icon: <Facebook className="w-4 h-4" />, href: '#', testid: 'social-facebook' },
                { icon: <Twitter className="w-4 h-4" />, href: '#', testid: 'social-twitter' },
                { icon: <Instagram className="w-4 h-4" />, href: '#', testid: 'social-instagram' },
                { icon: <Youtube className="w-4 h-4" />, href: '#', testid: 'social-youtube' },
              ].map(({ icon, href, testid }) => (
                <a
                  key={testid}
                  href={href}
                  data-testid={testid}
                  className="w-9 h-9 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:border-teal-500 hover:bg-teal-500/10 transition-all duration-150"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-300 mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', to: '/' },
                { label: 'Suportes', to: '/shop?category=suportes' },
                { label: 'Quadros', to: '/shop?category=quadros' },
                { label: 'Miniaturas', to: '/shop?category=miniaturas' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 hover:text-white transition-colors duration-150 text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-slate-300 mb-4">Categorias</h4>
            <ul className="space-y-2">
              {[
                { label: 'Suportes', to: '/shop?category=suportes' },
                { label: 'Quadros', to: '/shop?category=quadros' },
                { label: 'Miniaturas', to: '/shop?category=miniaturas' },
                { label: 'Acessórios', to: '/shop?category=acessorios' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 hover:text-white transition-colors duration-150 text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-slate-300 mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Email: contato@moldz3d.com</li>
              <li>WhatsApp: (11) 99999-9999</li>
              <li>Seg-Sex: 9h às 18h</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} Moldz3D. Todos os direitos reservados.
              </p>
              <a
                href="https://www.linkedin.com/in/felippe-ximenes-90848a106/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-600 hover:text-teal-400 transition-colors duration-150"
              >
                Desenvolvido por Felippe Ximenes
              </a>
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors duration-150">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors duration-150">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
