import { useEffect, useState } from 'react';
import { marketplaceApi } from '../api/marketplaceApi';
import type { OrderResponse } from '../types/marketplace';
import { Button } from '../components/Button';
import { Loader2, Package, ShoppingBag, CheckCircle2, Truck, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OrderHistory() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await marketplaceApi.getMyOrders();
            setOrders(data);
        } catch (err) {
            console.error('Failed to load orders', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = (id: string) => {
        toast((t) => (
            <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                    <XCircle size={18} />
                    <span className="font-bold">Cancel Order?</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to cancel this order?
                </p>
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg transition-colors"
                    >
                        No, Keep it
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await processCancelOrder(id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                        Yes, Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const processCancelOrder = async (id: string) => {
        try {
            await marketplaceApi.cancelOrder(id);
            setOrders(prev => prev.map(order =>
                order.id === id ? { ...order, status: 'CANCELLED' } : order
            ));
            toast.success('Order cancelled successfully');
        } catch (err) {
            toast.error('Failed to cancel order.');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order History</h1>
                    <p className="mt-1 text-slate-500 font-medium italic">Monitor your past purchases and delivery statuses.</p>
                </div>
                <Link to="/marketplace">
                    <Button variant="outline" className="font-bold border-2">Back to Shopping</Button>
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-3xl bg-white p-20 text-center shadow-sm ring-1 ring-slate-100">
                    <div className="h-20 w-20 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-3xl mx-auto mb-6">
                        <ShoppingBag size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">No orders yet</h2>
                    <p className="mt-3 text-slate-500 max-w-sm mx-auto font-medium italic mb-8">
                        Your purchase history is empty. Start shopping for your pets today!
                    </p>
                    <Link to="/marketplace">
                        <Button size="lg">Explore Marketplace</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order: OrderResponse) => (
                        <div key={order.id} className="bg-white rounded-3xl overflow-hidden shadow-sm ring-1 ring-slate-100">
                            {/* Order Header */}
                            <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
                                <div className="flex flex-wrap items-center gap-8">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Order Placed</p>
                                        <p className="text-sm font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Amount</p>
                                        <p className="text-sm font-black text-indigo-600">${order.totalAmount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Shipping To</p>
                                        <p className="text-sm font-bold text-slate-700 max-w-[200px] truncate">{order.shippingAddress}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {order.status === 'DELIVERED' ? <CheckCircle2 size={14} /> :
                                            order.status === 'SHIPPED' ? <Truck size={14} /> :
                                                order.status === 'CANCELLED' ? <XCircle size={14} /> : <Clock size={14} />}
                                        {order.status}
                                    </div>
                                    <p className="text-xs font-bold text-slate-400">#{order.id.toUpperCase().substring(0, 12)}</p>
                                </div>
                            </div>

                            {/* Order Content */}
                            <div className="p-8">
                                <div className="divide-y divide-slate-50">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="py-6 first:pt-0 last:pb-0 flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                                                    <Package size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{item.productName}</h4>
                                                    <p className="text-sm font-medium text-slate-600 mt-1">
                                                        {item.quantity} x ₹{item.price.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-slate-900">₹{item.subtotal.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-end gap-4">
                                    {order.status === 'PENDING' && (
                                        <Button
                                            variant="outline"
                                            className="text-red-500 border-red-100 hover:bg-red-50"
                                            onClick={() => handleCancelOrder(order.id)}
                                        >
                                            Cancel Order
                                        </Button>
                                    )}
                                    <Button variant="ghost" className="font-bold">Track Package</Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
