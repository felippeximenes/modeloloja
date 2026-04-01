import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export const Footer = () => {
  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'Loja', to: '/shop' },
    { label: 'Suportes', to: '/shop?category=suportes' },
    { label: 'Quadros', to: '/shop?category=quadros' },
    { label: 'Miniaturas', to: '/shop?category=miniaturas' },
  ];

  const categoryLinks = [
    { label: 'Suportes', to: '/shop?category=suportes' },
    { label: 'Quadros', to: '/shop?category=quadros' },
    { label: 'Miniaturas', to: '/shop?category=miniaturas' },
    { label: 'Acessórios', to: '/shop?category=acessorios' },
  ];

  return (
    <footer className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(2,10,18,0.98),rgba(2,6,23,1))]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.35fr_1fr_1fr_1fr]">
          {/* O bloco da marca replica a linguagem do header:
              wordmark forte, subtítulo técnico e superfície premium. */}
          <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.22)]">
            <Link to="/" className="inline-flex items-center">
              <div className="leading-none">
                <span className="block font-['Montserrat'] text-[1.4rem] font-black uppercase tracking-[0.08em] text-white">
                  Moldz<span className="text-teal-400">3D</span>
                </span>
                <span className="block pt-1 text-[0.62rem] font-medium uppercase tracking-[0.34em] text-slate-500">
                  Geek Lab
                </span>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Peças e acessórios geek feitos em impressão 3D. Personalização,
              qualidade e criatividade em cada detalhe.
            </p>

            {/* Ícones sociais refinados para a mesma linguagem de pills do header. */}
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { icon: <Facebook className="h-4 w-4" />, href: '#', testid: 'social-facebook' },
                { icon: <Twitter className="h-4 w-4" />, href: '#', testid: 'social-twitter' },
                { icon: <Instagram className="h-4 w-4" />, href: '#', testid: 'social-instagram' },
                { icon: <Youtube className="h-4 w-4" />, href: '#', testid: 'social-youtube' },
              ].map(({ icon, href, testid }) => (
                <a
                  key={testid}
                  href={href}
                  data-testid={testid}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-400 transition-all duration-150 hover:border-teal-500/40 hover:bg-teal-500/10 hover:text-teal-300"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Cada coluna lateral vira um cartão discreto para manter coerência
              com o acabamento premium do header e da marca. */}
          <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.02] p-6">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              Links Rápidos
            </h4>
            <ul className="space-y-2">
              {quickLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="inline-flex rounded-full px-3 py-2 text-sm text-slate-400 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.02] p-6">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              Categorias
            </h4>
            <ul className="space-y-2">
              {categoryLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="inline-flex rounded-full px-3 py-2 text-sm text-slate-400 transition-colors duration-150 hover:bg-white/5 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.02] p-6">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
              Contato
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>Email: contato@moldz3d.com</li>
              <li>WhatsApp: (11) 99999-9999</li>
              <li>Seg-Sex: 9h às 18h</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/8 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} Moldz3D. Todos os direitos reservados.
              </p>
              <a
                href="https://www.linkedin.com/in/felippe-ximenes-90848a106/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-600 transition-colors duration-150 hover:text-teal-400"
              >
                Desenvolvido por Felippe Ximenes
              </a>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <a
                href="#"
                className="rounded-full border border-white/8 px-4 py-2 text-slate-500 transition-colors duration-150 hover:bg-white/5 hover:text-slate-300"
              >
                Política de Privacidade
              </a>
              <a
                href="#"
                className="rounded-full border border-white/8 px-4 py-2 text-slate-500 transition-colors duration-150 hover:bg-white/5 hover:text-slate-300"
              >
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
