import type { ProductResponse } from '../types/marketplace';
import { Button } from './Button';
import { ShoppingCart, Package } from 'lucide-react';

interface ProductCardProps {
    product: ProductResponse;
    onAddToCart: (product: ProductResponse) => void;
    loading?: boolean;
}

export function ProductCard({ product, onAddToCart, loading }: ProductCardProps) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-xl hover:shadow-slate-200">
            <div className="aspect-square w-full overflow-hidden bg-slate-50 relative">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <Package size={64} strokeWidth={1} />
                    </div>
                )}
                <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-black text-indigo-600 shadow-sm ring-1 ring-slate-100">
                        {product.category}
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
                <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {product.name}
                        </h3>
                        <span className="text-xl font-bold text-slate-900">₹{product.price.toFixed(2)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2 font-medium italic">
                        {product.description}
                    </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                    <div className="text-xs font-bold text-slate-400">
                        {product.stockQuantity > 0 ? (
                            <span className="text-green-600">{product.stockQuantity} in stock</span>
                        ) : (
                            <span className="text-red-500">Out of stock</span>
                        )}
                    </div>
                    <Button
                        size="sm"
                        className="flex items-center gap-2 px-4"
                        disabled={product.stockQuantity === 0 || loading}
                        onClick={() => onAddToCart(product)}
                        isLoading={loading}
                    >
                        <ShoppingCart size={16} />
                        Add
                    </Button>
                </div>
            </div>
        </div>
    );
}
