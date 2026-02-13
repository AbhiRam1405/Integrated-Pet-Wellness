import { useEffect, useState } from 'react';
import { marketplaceApi } from '../api/marketplaceApi';
import { ProductCategory } from '../types/marketplace';
import type { ProductResponse } from '../types/marketplace';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/Button';
import { ShoppingCart, Search, Filter, Loader2, PackageX, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Marketplace() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
    }, [selectedCategory]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            if (selectedCategory === 'ALL') {
                const data = await marketplaceApi.getAllProducts();
                setProducts(data);
            } else {
                const data = await marketplaceApi.getProductsByCategory(selectedCategory);
                setProducts(data);
            }
        } catch (err) {
            console.error('Failed to load products', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            loadProducts();
            return;
        }
        try {
            setLoading(true);
            const data = await marketplaceApi.searchProducts(searchQuery);
            setProducts(data);
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product: ProductResponse) => {
        try {
            setActionLoading(product.id);
            await marketplaceApi.addToCart({ productId: product.id, quantity: 1 });
            alert(`${product.name} added to cart!`);
        } catch (err) {
            alert('Failed to add to cart.');
        } finally {
            setActionLoading(null);
        }
    };

    const categories = ['ALL', ...Object.values(ProductCategory)];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Header & Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                <div className="max-w-xl">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Pet Marketplace</h1>
                    <p className="mt-3 text-lg text-slate-500 font-medium leading-relaxed italic">
                        High-quality nutrition, wellness products, and accessories curated for your pet's healthy lifestyle.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <Link to="/marketplace/cart">
                        <Button variant="outline" size="lg" className="relative group overflow-hidden border-2 border-slate-200">
                            <span className="relative z-10 flex items-center gap-2 font-bold px-2">
                                <ShoppingCart size={20} className="text-indigo-600 transition-transform group-hover:-rotate-12" />
                                View Shopping Cart
                            </span>
                            <div className="absolute inset-0 bg-slate-50 group-hover:scale-x-105 transition-transform origin-left" />
                        </Button>
                    </Link>
                    <Link to="/marketplace/orders">
                        <Button variant="ghost" size="lg" className="font-bold flex items-center gap-2">
                            Order History
                            <ChevronRight size={20} />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="mb-10 flex flex-col md:flex-row gap-6">
                <form onSubmit={handleSearch} className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search products by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-slate-900"
                    />
                </form>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    <Filter size={20} className="text-slate-400 shrink-0 ml-2" />
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat as ProductCategory | 'ALL')}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                                : 'bg-white text-slate-500 border-2 border-slate-100 hover:border-slate-300 hover:text-slate-900'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex min-h-[40vh] flex-col items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Curating catalog...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
                    <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
                        <PackageX size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">No products found</h2>
                    <p className="mt-2 text-slate-500 font-medium italic">Try adjusting your filters or search terms.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product: ProductResponse) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                            loading={actionLoading === product.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
