import type { Product } from '../types/product';

interface Props {
  product: Product;
  compact?: boolean;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ProductCard({ product, compact = false }: Props) {
  return (
    <article className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
      {/* Image placeholder */}
      <div className="relative bg-gray-50 flex items-center justify-center" style={{ aspectRatio: compact ? '1/1' : '4/3' }}>
        <svg
          className="w-14 h-14 text-gray-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span className="absolute top-2.5 right-2.5 bg-white text-gray-500 text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-gray-100 shadow-sm">
          {product.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Stars rating={product.rating} />
            <span className="text-[10px] text-gray-400">({product.reviewCount} Avaliações)</span>
          </div>
          <span className="font-bold text-sm text-gray-900 tabular-nums shrink-0">
            R${product.price.toFixed(1)}
          </span>
        </div>
        <div className="flex gap-2 mt-0.5">
          <button
            type="button"
            className="flex-1 border border-gray-200 text-gray-700 text-xs font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Adicionar ao Carrinho
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-900 text-white text-xs font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Comprar
          </button>
        </div>
      </div>
    </article>
  );
}
