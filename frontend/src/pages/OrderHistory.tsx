import { useEffect, useState, Fragment } from 'react';
import { marketplaceApi } from '../api/marketplaceApi';
import type { OrderResponse } from '../types/marketplace';
import { OrderStatus } from '../types/marketplace';
import { Button } from '../components/Button';
import {
    Loader2, Package, ShoppingBag, CheckCircle2,
    Truck, Clock, XCircle, Eye, Search,
    Filter, Calendar, MapPin, Phone, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';

const STATUS_CONFIG = {
    [OrderStatus.PENDING]: {
        label: 'Pending',
        icon: Clock,
        className: 'bg-amber-100 text-amber-700 ring-amber-600/20',
    },
    [OrderStatus.PROCESSING]: {
        label: 'Processing',
        icon: Loader2,
        className: 'bg-indigo-100 text-indigo-700 ring-indigo-600/20',
    },
    [OrderStatus.SHIPPED]: {
        label: 'Shipped',
        icon: Truck,
        className: 'bg-blue-100 text-blue-700 ring-blue-600/20',
    },
    [OrderStatus.DELIVERED]: {
        label: 'Delivered',
        icon: CheckCircle2,
        className: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    },
    [OrderStatus.CANCELLED]: {
        label: 'Cancelled',
        icon: XCircle,
        className: 'bg-red-100 text-red-700 ring-red-600/20',
    },
};

export default function OrderHistory() {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

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
            toast.error('Failed to load order history');
        } finally {
            setLoading(false);
        }
    };

    const processCancelOrder = async (id: string) => {
        try {
            await marketplaceApi.cancelOrder(id);
            setOrders(prev => prev.map(order =>
                order.id === id ? { ...order, status: OrderStatus.CANCELLED } : order
            ));
            if (selectedOrder?.id === id) {
                setSelectedOrder(prev => prev ? { ...prev, status: OrderStatus.CANCELLED } : null);
            }
            toast.success('Order cancelled successfully');
        } catch (err) {
            toast.error('Failed to cancel order.');
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
                    Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg transition-colors"
                    >
                        Keep Order
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await processCancelOrder(id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                        Confirm Cancellation
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const filteredOrders = orders
        .filter(order => activeFilter === 'ALL' || order.status === activeFilter)
        .filter(order =>
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    const statuses = ['ALL', ...Object.values(OrderStatus)];

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
                    <Loader2 className="absolute inset-0 m-auto h-6 w-6 text-indigo-600 animate-pulse" />
                </div>
                <p className="mt-4 text-slate-500 font-bold animate-pulse">Fetching your orders...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <ShoppingBag className="text-indigo-600" size={36} />
                        Order History
                    </h1>
                    <p className="mt-2 text-lg text-slate-500 font-medium italic">Track, manage and review your pet supplies.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/marketplace">
                        <Button variant="outline" className="font-bold border-2 rounded-2xl">Continue Shopping</Button>
                    </Link>
                </div>
            </div>

            {/* Filters & Search Bar */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm ring-1 ring-slate-100 mb-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => setActiveFilter(status)}
                                className={`px-5 py-2.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${activeFilter === status
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            {filteredOrders.length === 0 ? (
                <div className="rounded-[3rem] bg-white p-20 text-center shadow-sm ring-1 ring-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="h-24 w-24 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-[2rem] mx-auto mb-8 transform rotate-12">
                        <Package size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">No orders found</h2>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium italic mb-10 text-lg">
                        {orders.length === 0
                            ? "Looks like you haven't made any purchases yet. Your pets are waiting!"
                            : "No orders match your current filter or search criteria."}
                    </p>
                    <Link to="/marketplace">
                        <Button size="lg" className="rounded-2xl px-10 shadow-xl shadow-indigo-100">Browse Products</Button>
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-sm ring-1 ring-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Order</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total Amount</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredOrders.map((order) => {
                                    const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[OrderStatus.PENDING];
                                    const StatusIcon = status.icon;

                                    return (
                                        <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 font-mono tracking-tight">
                                                            #{order.id.substring(0, 8).toUpperCase()}...
                                                        </p>
                                                        <p className="text-[11px] font-bold text-slate-400">
                                                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <p className="text-sm font-bold text-slate-600">
                                                    {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                </p>
                                                <p className="text-[11px] font-medium text-slate-400">
                                                    {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-lg">
                                                    ₹{order.totalAmount.toFixed(2)}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${status.className}`}>
                                                    <StatusIcon size={12} />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={20} />
                                                    </button>
                                                    {order.status === OrderStatus.PENDING && (
                                                        <button
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Cancel Order"
                                                        >
                                                            <XCircle size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            <Transition show={!!selectedOrder} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setSelectedOrder(null)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-[3rem] bg-white text-left align-middle shadow-2xl transition-all ring-1 ring-slate-100">
                                    {selectedOrder && (
                                        <>
                                            {/* Modal Header */}
                                            <div className="border-b border-slate-50 bg-slate-50/30 p-8 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600">
                                                        <ShoppingBag size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order Details</h3>
                                                        <p className="text-sm font-bold text-slate-400 font-mono">#{selectedOrder.id.toUpperCase()}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedOrder(null)}
                                                    className="p-3 bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm transition-all"
                                                >
                                                    <XCircle size={24} />
                                                </button>
                                            </div>

                                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                                                {/* Top Info Bar */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <Calendar size={12} /> Ordered On
                                                        </p>
                                                        <p className="text-sm font-black text-slate-800">
                                                            {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                                        </p>
                                                    </div>
                                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <Filter size={12} /> Status
                                                        </p>
                                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${STATUS_CONFIG[selectedOrder.status as keyof typeof STATUS_CONFIG]?.className
                                                            }`}>
                                                            {selectedOrder.status}
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <MapPin size={12} /> Shipping To
                                                        </p>
                                                        <p className="text-sm font-black text-slate-800 truncate" title={selectedOrder.shippingAddress}>
                                                            {selectedOrder.shippingAddress}
                                                        </p>
                                                    </div>
                                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <Phone size={12} /> Contact
                                                        </p>
                                                        <p className="text-sm font-black text-slate-800">
                                                            {selectedOrder.phoneNumber || 'Not provided'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Items Table */}
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                                        Items Summary
                                                        <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-lg">
                                                            {selectedOrder.items.length}
                                                        </span>
                                                    </h4>
                                                    <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="bg-slate-50/50">
                                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-50">
                                                                {selectedOrder.items.map((item, idx) => (
                                                                    <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                                                        <td className="px-6 py-4">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 border border-slate-100">
                                                                                    <Package size={16} />
                                                                                </div>
                                                                                <p className="text-sm font-bold text-slate-800">{item.productName}</p>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-center">
                                                                            <span className="text-sm font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                                                                                {item.quantity}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-right">
                                                                            <p className="text-sm font-medium text-slate-500">₹{item.price.toFixed(2)}</p>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-right">
                                                                            <p className="text-sm font-black text-slate-800">₹{item.subtotal.toFixed(2)}</p>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr className="bg-indigo-50/30">
                                                                    <td colSpan={3} className="px-6 py-5 text-right">
                                                                        <p className="text-sm font-bold text-slate-500 italic">Order Grand Total</p>
                                                                    </td>
                                                                    <td className="px-6 py-5 text-right">
                                                                        <p className="text-xl font-black text-indigo-600">₹{selectedOrder.totalAmount.toFixed(2)}</p>
                                                                    </td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Quick Actions */}
                                                <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                                                    <div className="flex items-center gap-3">
                                                        <Button variant="ghost" className="rounded-2xl gap-2 font-black text-indigo-600 hover:bg-indigo-50">
                                                            <ArrowUpRight size={18} /> Track Package
                                                        </Button>
                                                        <Link to="/marketplace" onClick={() => setSelectedOrder(null)}>
                                                            <Button variant="ghost" className="rounded-2xl gap-2 font-black text-slate-500">
                                                                Buy Again
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                    {selectedOrder.status === OrderStatus.PENDING && (
                                                        <Button
                                                            variant="outline"
                                                            className="rounded-2xl text-red-600 border-red-100 hover:bg-red-50 font-black"
                                                            onClick={() => handleCancelOrder(selectedOrder.id)}
                                                        >
                                                            Cancel This Order
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Modal Footer */}
                                            <div className="border-t border-slate-50 p-8 flex justify-end gap-4 bg-slate-50/10">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => setSelectedOrder(null)}
                                                    className="px-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black"
                                                >
                                                    Close
                                                </Button>
                                                <Button
                                                    onClick={() => window.print()}
                                                    className="px-10 rounded-2xl shadow-lg shadow-indigo-100 font-black"
                                                >
                                                    Print Invoice
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
