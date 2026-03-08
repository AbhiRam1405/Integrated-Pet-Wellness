import { useEffect, useState } from 'react';
import { marketplaceApi } from '../api/marketplaceApi';
import type { CartResponse, CartItemResponse } from '../types/marketplace';
import { Button } from '../components/Button';
import { Loader2, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { paymentApi } from '../api/paymentApi';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function Cart() {
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [address, setAddress] = useState('');
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const data = await marketplaceApi.getCart();
            setCart(data);
            if (data && data.items.length > 0) {
                // Select all by default
                setSelectedItems(data.items.map(item => item.id));
            }
        } catch (err) {
            console.error('Failed to load cart', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleItemSelection = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const toggleSelectAll = () => {
        if (!cart) return;
        if (selectedItems.length === cart.items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cart.items.map((item: CartItemResponse) => item.id));
        }
    };

    const calculateSelectedTotal = () => {
        if (!cart) return 0;
        return cart.items
            .filter((item: CartItemResponse) => selectedItems.includes(item.id))
            .reduce((total: number, item: CartItemResponse) => total + (item.productPrice * item.quantity), 0);
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
            setSelectedItems(prev => prev.filter(id => id !== itemId));
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
            setSelectedItems([]);
            toast.success('Cart cleared');
        } catch (err) {
            toast.error('Failed to clear cart.');
        }
    };

    const handleCheckout = async (itemIds?: string[]) => {
        const idsToCheckout = itemIds || selectedItems;
        if (idsToCheckout.length === 0) {
            toast.error('Please select at least one item to checkout.');
            return;
        }
        if (!address.trim()) {
            toast.error('Please enter a shipping address.');
            return;
        }

        try {
            setCheckoutLoading(true);

            // 1. Create Order on Backend
            const amount = calculateSelectedTotal();
            const razorpayOrder = await paymentApi.createOrder({ amount });

            // 2. Configure Razorpay Options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID', // Use env var or placeholder
                amount: razorpayOrder.amount * 100,
                currency: razorpayOrder.currency,
                name: 'Pet Wellness Marketplace',
                description: 'Payment for Pet Supplies',
                order_id: razorpayOrder.razorpayOrderId,
                handler: async (response: any) => {
                    try {
                        setCheckoutLoading(true);
                        // 3. Verify Payment and Place Final Order
                        await paymentApi.verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            orderRequest: {
                                shippingAddress: address,
                                cartItemIds: idsToCheckout
                            }
                        });
                        toast.success('Order placed successfully!');
                        navigate('/marketplace/orders');
                    } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Payment verification failed.');
                    } finally {
                        setCheckoutLoading(false);
                    }
                },
                prefill: {
                    name: 'Guest User',
                    email: 'user@example.com',
                },
                theme: {
                    color: '#4f46e5',
                },
                modal: {
                    ondismiss: () => {
                        setCheckoutLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response: any) {
                toast.error(`Payment failed: ${response.error.description}`);
                setCheckoutLoading(false);
            });

            rzp.open();

        } catch (err: any) {
            toast.error('Failed to initiate payment.');
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

    const selectedTotal = calculateSelectedTotal();

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
                    <p className="mt-1 text-slate-500 font-medium italic">You have {cart.items.length} items in your basket.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl ring-1 ring-slate-100 shadow-sm">
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                            checked={cart.items.length > 0 && selectedItems.length === cart.items.length}
                            onChange={toggleSelectAll}
                        />
                        <span className="text-sm font-bold text-slate-600">Select All</span>
                    </div>
                    <Button variant="ghost" onClick={handleClearCart} className="text-red-500 font-bold hover:bg-red-50">
                        Clear All
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cart.items.map((item: CartItemResponse) => (
                        <div key={item.id} className={`bg-white rounded-3xl p-6 shadow-sm ring-1 flex gap-6 items-center transition-all ${selectedItems.includes(item.id) ? 'ring-indigo-200 bg-indigo-50/10' : 'ring-slate-100'}`}>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-6 w-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                    checked={selectedItems.includes(item.id)}
                                    onChange={() => toggleItemSelection(item.id)}
                                />
                            </div>
                            <div className="h-24 w-24 bg-slate-50 rounded-2xl overflow-hidden shrink-0 ring-1 ring-slate-100">
                                {item.productImageUrl ? (
                                    <img src={item.productImageUrl} alt={item.productName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-300"><ShoppingBag size={32} /></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 truncate">{item.productName}</h3>
                                <p className="text-slate-500 font-bold text-sm mt-1">₹{item.productPrice.toFixed(2)} each</p>
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
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="ml-auto text-xs font-bold ring-1 ring-indigo-100 hover:ring-indigo-200"
                                        onClick={() => handleCheckout([item.id])}
                                        isLoading={checkoutLoading}
                                    >
                                        <CreditCard size={14} className="mr-1.5" />
                                        Checkout
                                    </Button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-900">₹{(item.productPrice * item.quantity).toFixed(2)}</p>
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
                                <span>Selected Items ({selectedItems.length})</span>
                                <span>₹{selectedTotal.toFixed(2)}</span>
                            </div>

                            {/* Detailed List of Selected Items */}
                            {selectedItems.length > 0 && (
                                <div className="py-2 px-3 bg-slate-50 rounded-2xl max-h-40 overflow-y-auto space-y-2 border border-slate-100 shadow-inner">
                                    {cart.items
                                        .filter((item: CartItemResponse) => selectedItems.includes(item.id))
                                        .map((item: CartItemResponse) => (
                                            <div key={item.id} className="flex justify-between items-center text-xs">
                                                <span className="text-slate-600 font-medium truncate pr-4">
                                                    {item.quantity}x {item.productName}
                                                </span>
                                                <span className="text-slate-400 shrink-0 font-bold">
                                                    ₹{(item.productPrice * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}
                            <div className="flex justify-between text-slate-500 font-bold">
                                <span>Shipping</span>
                                <span className="text-green-600">FREE</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-slate-900">
                                <span className="text-lg font-bold">Total Amount</span>
                                <span className="text-xl font-black text-indigo-600">₹{selectedTotal.toFixed(2)}</span>
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
                                onClick={() => handleCheckout()}
                                isLoading={checkoutLoading}
                                disabled={selectedItems.length === 0}
                            >
                                <CreditCard size={20} className="mr-3" />
                                {selectedItems.length === cart.items.length ? 'Checkout All' : 'Checkout Selected'}
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
