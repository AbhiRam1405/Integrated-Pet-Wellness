import { useEffect, useState } from 'react';
import { marketplaceApi } from '../api/marketplaceApi';
import type { CartResponse } from '../types/marketplace';
import { Button } from '../components/Button';
import { Loader2, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Cart() {
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [address, setAddress] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const data = await marketplaceApi.getCart();
            setCart(data);
        } catch (err) {
            console.error('Failed to load cart', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        try {
            const updatedCart = await marketplaceApi.updateCartItem(itemId, { quantity });
            setCart(updatedCart);
        } catch (err) {
            toast.error('Failed to update quantity.');
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        try {
            const updatedCart = await marketplaceApi.removeFromCart(itemId);
            setCart(updatedCart);
            toast.success('Item removed from cart');
        } catch (err) {
            toast.error('Failed to remove item.');
        }
    };

    const handleClearCart = () => {
        toast((t) => (
            <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                    <Trash2 size={18} />
                    <span className="font-bold">Empty Cart?</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to remove all items from your cart?
                </p>
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await processClearCart();
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                        Empty Cart
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const processClearCart = async () => {
        try {
            await marketplaceApi.clearCart();
            setCart({ items: [], totalAmount: 0 });
            toast.success('Cart cleared');
        } catch (err) {
            toast.error('Failed to clear cart.');
        }
    };

    const handleCheckout = async () => {
        if (!address.trim()) {
            toast.error('Please enter a shipping address.');
            return;
        }
        try {
            setCheckoutLoading(true);
            await marketplaceApi.placeOrder({ shippingAddress: address });
            toast.success('Order placed successfully!');
            navigate('/marketplace/orders');
        } catch (err) {
            toast.error('Failed to place order.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
                <div className="h-24 w-24 bg-slate-50 text-slate-300 flex items-center justify-center rounded-3xl mx-auto mb-8">
                    <ShoppingBag size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Your cart is empty</h2>
                <p className="text-slate-500 font-medium italic mb-10">Seems like you haven't added anything to your cart yet.</p>
                <Link to="/marketplace">
                    <Button size="lg" className="flex items-center gap-2 mx-auto">
                        <ArrowLeft size={18} />
                        Back to Marketplace
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
                    <p className="mt-1 text-slate-500 font-medium italic">You have {cart.items.length} items in your basket.</p>
                </div>
                <Button variant="ghost" onClick={handleClearCart} className="text-red-500 font-bold hover:bg-red-50">
                    Clear All
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cart.items.map((item: any) => (
                        <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-slate-100 flex gap-6 items-center">
                            <div className="h-24 w-24 bg-slate-50 rounded-2xl overflow-hidden shrink-0 ring-1 ring-slate-100">
                                {item.productImageUrl ? (
                                    <img src={item.productImageUrl} alt={item.productName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-300"><ShoppingBag size={32} /></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 truncate">{item.productName}</h3>
                                <p className="text-slate-500 font-bold text-sm mt-1">${item.productPrice.toFixed(2)} each</p>
                                <div className="mt-4 flex items-center gap-4">
                                    <div className="flex items-center bg-slate-100 rounded-xl p-1 shrink-0">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="w-10 text-center font-black text-slate-900">{item.quantity}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-900">₹{item.productPrice.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Checkout Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-100 ring-1 ring-slate-100 sticky top-28">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-slate-500 font-bold">
                                <span>Subtotal</span>
                                <span>₹{cart.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-bold">
                                <span>Shipping</span>
                                <span className="text-green-600">FREE</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-slate-900">
                                <span className="text-lg font-bold">Total Amount</span>
                                <span className="text-xl font-black text-indigo-600">₹{cart.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                    <MapPin size={14} className="text-indigo-600" />
                                    Shipping Address
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Enter your full delivery address..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 p-4 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all resize-none"
                                />
                            </div>

                            <Button
                                className="w-full h-14 text-lg shadow-xl shadow-indigo-100"
                                size="lg"
                                onClick={handleCheckout}
                                isLoading={checkoutLoading}
                            >
                                <CreditCard size={20} className="mr-3" />
                                Checkout Now
                            </Button>

                            <Link to="/marketplace" className="block text-center text-sm font-bold text-slate-400 hover:text-indigo-600 p-2 transition-colors">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
