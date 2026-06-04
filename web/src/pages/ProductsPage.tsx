import { useState, useMemo, useRef } from 'react';
import {
  PawPrint,
  Search,
  ShoppingCart,
  LayoutGrid,
  Glasses,
  ToyBrick,
  Bone,
  HeartPlus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { mockProducts, sidebarCategories } from '../services/products';
import { ProductCard } from '../components/ProductCard';
import heroImg from '../assets/images/background.png';
import type { Product } from '../types/product';

const ITEMS_PER_PAGE = 6;

function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

const categoryIcons: Record<string, React.ReactNode> = {
  all:     <LayoutGrid className="w-4 h-4" strokeWidth={1.8} />,
  glasses:    <Glasses className="w-4 h-4" strokeWidth={1.8} />,
  toy:   <ToyBrick className="w-4 h-4" strokeWidth={1.8} />,
  bone:   <Bone className="w-4 h-4" strokeWidth={1.8} />,
  heart: <HeartPlus className="w-4 h-4" strokeWidth={1.8} />,
};

export function ProductsPage({ onBuy }: { onBuy?: (product: Product) => void }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [email, setEmail] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      activeCategory === 'all'
        ? mockProducts
        : mockProducts.filter((p) => p.categoryKey === activeCategory),
    [activeCategory],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const scrollCarousel = (dir: 'left' | 'right') => {
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -292 : 292, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 font-sans">

      {/* ───────── Navbar ───────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-2 font-bold text-base text-gray-900">
              <PawPrint className="w-5 h-5" strokeWidth={2.2} />
              E-pets
            </a>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {[
                { href: '/home', label: 'Home' },
                { href: '/shop', label: 'Loja' },
              ].map(({ href, label }) => {
                const isActive = window.location.pathname === href;
                return (
                  <a
                    key={href}
                    href={href}
                    className={`relative font-semibold text-gray-900 pb-0.5 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-gray-900 after:transition-[width] after:duration-300 ${
                      isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
                    }`}
                  >
                    {label}
                  </a>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Buscar"
              className="p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-lg cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Carrinho (3 itens)"
              className="relative p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-lg cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-400 rounded-full text-[9px] font-bold flex items-center justify-center text-white leading-none">
                3
              </span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 ml-1 overflow-hidden shrink-0" />
          </div>
        </div>
      </header>

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden h-[320px] sm:h-[480px] md:h-[650px]">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/15" aria-hidden="true" />
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <span
              className="font-black text-white leading-none tracking-tighter select-none"
              style={{ fontSize: 'clamp(60px, 18vw, 190px)' }}
              aria-hidden="true"
            >
              Loja
            </span>
          </div>
          <div className="bg-white px-4 md:px-8 py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-sm md:text-base font-semibold text-gray-900 shrink-0">Tudo para o seu pet</span>
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 gap-2 flex-1 sm:w-72 sm:flex-none">
                <Search className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Buscar em E-pets"
                  className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400 min-w-0"
                />
              </div>
              <button
                type="button"
                className="bg-gray-900 text-white text-sm font-medium px-5 md:px-6 py-2 rounded-full hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Main content ───────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">

        {/* Mobile category pills */}
        <div
          className="md:hidden flex gap-2 overflow-x-auto pb-1 w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {sidebarCategories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => { setActiveCategory(cat.key); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                <span>{categoryIcons[cat.key]}</span>
                <span>{cat.label}</span>
                {cat.key === 'all' && (
                  <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${isActive ? 'bg-white/20' : 'bg-amber-400 text-white'}`}>
                    {mockProducts.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-44 shrink-0 sticky top-20">
          <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Categoria</p>
          <div className="space-y-0.5">
            {sidebarCategories.map((cat) => {
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => { setActiveCategory(cat.key); setCurrentPage(1); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <span className={isActive ? 'text-gray-700' : 'text-gray-400'}>
                    {categoryIcons[cat.key]}
                  </span>
                  <span>{cat.label}</span>
                  {cat.key === 'all' && (
                    <span className="ml-auto bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {mockProducts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0 w-full">
          {paginated.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} onBuy={() => onBuy?.(product)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Search className="w-12 h-12 text-gray-200 mb-4" strokeWidth={1.5} />
              <p className="text-gray-400 text-sm">Nenhum produto encontrado.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('all'); setCurrentPage(1); }}
                className="mt-3 text-gray-600 hover:text-gray-900 text-sm underline underline-offset-2 transition-colors cursor-pointer"
              >
                Ver todos os produtos
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-default"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers(currentPage, totalPages).map((p, i) =>
                typeof p === 'number' ? (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToPage(p)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === p
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span key={i} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
                    {p}
                  </span>
                )
              )}
            </div>

            <span className="sm:hidden text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-default"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ───────── Recommendations ───────── */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Explore nossas recomendações</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              aria-label="Anterior"
              className="w-8 h-8 border border-gray-200 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              aria-label="Próximo"
              className="w-8 h-8 border border-gray-200 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {mockProducts.map((product) => (
            <div key={product.id} className="w-52 shrink-0">
              <ProductCard product={product} compact onBuy={() => onBuy?.(product)} />
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Newsletter CTA ───────── */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 mb-10">
        <div className="bg-gray-900 text-white rounded-2xl px-6 md:px-10 py-8 md:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 md:gap-10">
          <div className="shrink-0 w-full sm:w-auto">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-5">
              Pronto para as<br />Novidades?
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-full px-5 py-2.5 text-sm outline-none focus:border-white/40 transition-colors flex-1 sm:w-52 sm:flex-none min-w-0"
              />
              <button
                type="button"
                className="bg-white text-gray-900 font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
              >
                Enviar
              </button>
            </div>
          </div>
          <div className="max-w-xs sm:text-right">
            <p className="font-semibold text-sm mb-2">E-pets — Cuidado e amor para seu pet</p>
            <p className="text-white/60 text-xs leading-relaxed">
              Receba em primeira mão as novidades, promoções exclusivas e dicas de cuidados para o seu animal de estimação.
            </p>
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0">
            <div className="flex gap-10 md:gap-14">
              <div>
                <p className="font-semibold text-sm text-gray-900 mb-4">Sobre</p>
                <ul className="space-y-2.5 text-sm text-gray-500">
                  {['E-pets', 'Conheça o Time'].map((l) => (
                    <li key={l}><a href="#" className="hover:text-gray-900 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 mb-4">Suporte</p>
                <ul className="space-y-2.5 text-sm text-gray-500">
                  {['Fale Conosco', 'Trocas e Devoluções', 'Perguntas Frequentes'].map((l) => (
                    <li key={l}><a href="#" className="hover:text-gray-900 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Redes Sociais</p>
              <div className="flex gap-2">
                {/* Instagram */}
                <a href="#" aria-label="Instagram" className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" aria-label="LinkedIn" className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-gray-400">
            <span>Direitos Autorais © 2026 E-pets. Todos os Direitos Reservados.</span>
            <div className="flex gap-5">
              <a href="#" className="hover:text-gray-600 transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Política de Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
