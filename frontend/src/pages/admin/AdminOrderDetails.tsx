import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marketplaceApi } from '../../api/marketplaceApi';
import type { OrderResponse } from '../../types/marketplace';
import { Loader2, ArrowLeft, Package, MapPin, Phone, User } from 'lucide-react';

export default function AdminOrderDetails() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (id) {
            loadOrder(id);
        }
    }, [id]);

    const loadOrder = async (orderId: string) => {
        try {
            setLoading(true);
            const data = await marketplaceApi.getAdminOrderById(orderId);
            setOrder(data);
        } catch (err) {
            console.error('Failed to load order details', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!order || !id) return;

        try {
            setUpdating(true);
            await marketplaceApi.updateOrderStatus(id, newStatus);
            // Reload to get updated state
            await loadOrder(id);
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-900">Order not found</h2>
                <Link to="/admin/orders" className="text-indigo-600 hover:underline mt-4 inline-block">
                    Return to Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <Link to="/admin/orders" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 font-medium">
                <ArrowLeft size={18} className="mr-2" /> Back to Orders
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order #{order.id.substring(0, 8)}</h1>
                    <p className="text-slate-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-500 mr-2">Update Status:</span>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                            <button
                                key={status}
                                disabled={updating}
                                onClick={() => handleStatusUpdate(status)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${order.status === status
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                            <Package size={20} /> Order Items
                        </div>
                        <div className="divide-y divide-slate-100">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                                            IMG
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{item.productName}</h4>
                                            <p className="text-sm text-slate-500">Product ID: {item.productId}</p>
                                            <p className="text-sm font-medium text-slate-600 mt-1">
                                                {item.quantity} x ₹{item.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">₹{item.subtotal.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                            <span className="font-bold text-slate-600">Total Amount</span>
                            <span className="text-xl font-black text-indigo-600">₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column - Customer & Shipping Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                            <User size={20} /> Customer Details
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">User ID</label>
                                <p className="text-sm font-mono bg-slate-50 p-2 rounded border border-slate-200 overflow-hidden text-ellipsis">{order.userId}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                            <MapPin size={20} /> Shipping Information
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Address</label>
                                <p className="font-medium text-slate-800">{order.shippingAddress}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                                <p className="font-medium text-slate-800 flex items-center gap-2">
                                    <Phone size={16} className="text-slate-400" />
                                    {order.phoneNumber || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
