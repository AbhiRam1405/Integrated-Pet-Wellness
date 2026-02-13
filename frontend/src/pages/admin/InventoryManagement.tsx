import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { marketplaceApi } from '../../api/marketplaceApi';
import type { ProductResponse } from '../../types/marketplace';
import { ProductCategory } from '../../types/marketplace';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Loader2, Package, Plus, Trash2, Edit3, Save, X, AlertCircle } from 'lucide-react';

export default function InventoryManagement() {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form states for adding/editing
    const [formData, setFormData] = useState<any>({
        name: '',
        description: '',
        price: 0,
        category: 'FOOD',
        stockQuantity: 0,
        imageUrl: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await marketplaceApi.getAllProducts();
            setProducts(data);
        } catch (err) {
            console.error('Failed to load products', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingId) {
                await adminApi.updateProduct(editingId, formData);
                alert('Product updated!');
            } else {
                await adminApi.createProduct(formData);
                alert('Product created!');
            }
            setIsAdding(false);
            setEditingId(null);
            loadProducts();
            setFormData({ name: '', description: '', price: 0, category: 'FOOD', stockQuantity: 0, imageUrl: '' });
        } catch (err) {
            alert('Operation failed.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this product?')) {
            try {
                await adminApi.deleteProduct(id);
                setProducts(products.filter(p => p.id !== id));
            } catch (err) {
                alert('Delete failed.');
            }
        }
    };

    const startEdit = (product: ProductResponse) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stockQuantity: product.stockQuantity,
            imageUrl: product.imageUrl
        });
        setIsAdding(true);
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Package className="text-indigo-600" />
                        Inventory Control
                    </h1>
                    <p className="mt-1 text-slate-500 font-medium italic">Manage marketplace products, pricing, and stock levels.</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
                    <Plus size={20} />
                    New Product
                </Button>
            </div>

            {isAdding && (
                <div className="bg-white rounded-3xl p-8 shadow-2xl ring-1 ring-slate-100 mb-10 border-2 border-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                            {editingId ? 'Edit Product Details' : 'Add New Marketplace Item'}
                        </h2>
                        <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Product Name</label>
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Premium Dog Kibble" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Price ($)</label>
                            <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Stock Quantity</label>
                            <Input type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })} />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Image URL</label>
                            <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://example.com/product.jpg" />
                        </div>
                        <div className="space-y-1.5 md:col-span-full">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Description</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                                placeholder="Enter detailed product information..."
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end gap-3">
                        <Button variant="ghost" className="font-bold" onClick={() => { setIsAdding(false); setEditingId(null); }}>Discard Changes</Button>
                        <Button onClick={handleSave} className="px-10 shadow-lg shadow-indigo-100">
                            <Save size={18} className="mr-2" />
                            {editingId ? 'Update Item' : 'Create Product'}
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-sm font-black text-slate-500 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-5 text-sm font-black text-slate-500 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-5 text-sm font-black text-slate-500 uppercase tracking-widest">Price</th>
                                <th className="px-6 py-5 text-sm font-black text-slate-500 uppercase tracking-widest">Stock</th>
                                <th className="px-6 py-5 text-sm font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center text-slate-400">
                                                {product.imageUrl ? <img src={product.imageUrl} className="h-full w-full object-cover" /> : <Package size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 line-clamp-1">{product.name}</p>
                                                <p className="text-xs font-medium text-slate-400 italic">ID: {product.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-black text-slate-900">${product.price.toFixed(2)}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            {product.stockQuantity < 5 ? <AlertCircle size={14} className="text-red-500" /> : null}
                                            <span className={`font-bold ${product.stockQuantity < 5 ? 'text-red-500' : 'text-slate-600'}`}>
                                                {product.stockQuantity} units
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right space-x-2">
                                        <button onClick={() => startEdit(product)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 size={20} /></button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
