import React, { useState, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Icons } from './ui/Icons';
import { Product, Order, Category, Brand } from '../types';
import { supabaseService } from '../services/supabaseService';
import {
    getDashboardMetrics,
    getRevenueTrend,
    getSalesByCategory,
    getTopProducts,
    getRevenueSplit
} from '../utils/analytics';

interface DashboardProps {
    orders: Order[];
    products: Product[];
    onAddProduct: (p: Product) => Promise<Product | null>;
    onUpdateProduct: (p: Product) => void;
    onDeleteProduct: (id: string) => void;
    onUpdateOrder: (id: string, status: any) => Promise<boolean>;
    onDeleteOrder: (id: string) => Promise<boolean>;
    onLogout: () => void;
}

const COLORS = ['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

export const Dashboard: React.FC<DashboardProps> = ({
    orders,
    products,
    onAddProduct,
    onUpdateProduct,
    onDeleteProduct,
    onUpdateOrder,
    onDeleteOrder,
    onLogout
}) => {
    console.log('Dashboard component mounting');
    const [tab, setTab] = useState<'overview' | 'analytics' | 'orders' | 'inventory'>('overview');
    const [inventoryView, setInventoryView] = useState<'list' | 'add' | 'edit'>('list');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [brandInput, setBrandInput] = useState('');
    const [imageInputType, setImageInputType] = useState<'url' | 'file'>('url');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);

    const [formState, setFormState] = useState<Partial<Product>>({
        category: Category.BIKES,
        brand: Brand.HONDA
    });

    const availableBrands = Array.from(new Set([
        ...Object.values(Brand),
        ...products.map(p => p.brand)
    ])).sort();

    // Calculate analytics data
    const metrics = useMemo(() => getDashboardMetrics(orders, products), [orders, products]);
    const revenueTrend = useMemo(() => getRevenueTrend(orders, dateRange), [orders, dateRange]);
    const salesByCategory = useMemo(() => getSalesByCategory(orders, products), [orders, products]);
    const topProducts = useMemo(() => getTopProducts(orders, 5), [orders]);
    const revenueSplit = useMemo(() => getRevenueSplit(orders), [orders]);

    // Handlers
    const handleEditClick = (product: Product) => {
        setEditingId(product.id);
        setFormState(product);
        setBrandInput(product.brand);
        setImageInputType('url');
        setInventoryView('edit');
    };

    const handleAddClick = () => {
        setEditingId(null);
        setFormState({ category: Category.BIKES, brand: Brand.HONDA, name: '', price: 0, image: '', description: '', stock: 0 });
        setBrandInput('');
        setImageInputType('url');
        setSelectedFile(null);
        setInventoryView('add');
    };

    const handleCancel = () => {
        setInventoryView('list');
        setEditingId(null);
        setFormState({ category: Category.BIKES, brand: Brand.HONDA, name: '', price: 0, image: '', description: '', stock: 0 });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormState({ ...formState, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formState.name && formState.price && formState.image) {
            let finalImageUrl = formState.image;

            if (selectedFile) {
                const { url, error } = await supabaseService.uploadImage(selectedFile);
                if (url) {
                    finalImageUrl = url;
                } else {
                    alert(`Failed to upload image: ${error}`);
                    return;
                }
            }

            const productData: Product = {
                id: editingId || crypto.randomUUID(),
                name: formState.name!,
                brand: brandInput || Brand.GENERIC,
                category: formState.category || Category.ACCESSORIES,
                price: Number(formState.price),
                image: finalImageUrl!,
                description: formState.description || '',
                stock: Number(formState.stock) || 0,
                specs: formState.specs || { engine: 'N/A', power: 'N/A', weight: 'N/A' }
            };

            if (editingId) {
                onUpdateProduct(productData);
                setInventoryView('list');
            } else {
                try {
                    const result = await onAddProduct(productData);
                    if (result) {
                        setInventoryView('list');
                    } else {
                        alert('Failed to add product. Please check your permissions or try again.');
                    }
                } catch (error) {
                    console.error('Error adding product:', error);
                    alert('An unexpected error occurred while adding the product.');
                }
            }
        }
    };

    // Metric Card Component
    const MetricCard = ({ icon: Icon, label, value, trend, trendValue, color }: any) => (
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 hover:border-moto-red/30 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${color === 'green' ? 'bg-green-500/10' : color === 'blue' ? 'bg-blue-500/10' : color === 'purple' ? 'bg-purple-500/10' : 'bg-amber-500/10'}`}>
                    <Icon className={`w-6 h-6 ${color === 'green' ? 'text-green-500' : color === 'blue' ? 'text-blue-500' : color === 'purple' ? 'text-purple-500' : 'text-amber-500'}`} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                    </div>
                )}
            </div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{label}</h3>
            <p className="text-4xl font-black text-white font-mono">{value}</p>
            {trendValue && (
                <p className="text-xs text-gray-500 mt-2">{trendValue}</p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase italic text-white mb-2">Analytics Dashboard</h1>
                    <p className="text-gray-500 text-sm">Real-time insights for MotoVerse</p>
                </div>
                <button
                    onClick={onLogout}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold uppercase text-sm transition-all flex items-center gap-2"
                >
                    <Icons.LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-800 mb-8 overflow-x-auto">
                {['overview', 'analytics', 'orders', 'inventory'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t as any)}
                        className={`pb-4 px-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${tab === t ? 'border-moto-red text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {tab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard
                            icon={Icons.DollarSign}
                            label="Total Revenue"
                            value={`${metrics.totalRevenue.toLocaleString()} MAD`}
                            trend={metrics.revenueGrowth}
                            color="green"
                        />
                        <MetricCard
                            icon={Icons.ShoppingBag}
                            label="Total Orders"
                            value={metrics.totalOrders}
                            trend={metrics.ordersGrowth}
                            color="blue"
                        />
                        <MetricCard
                            icon={Icons.TrendingUp}
                            label="Avg Order Value"
                            value={`${Math.round(metrics.averageOrderValue).toLocaleString()} MAD`}
                            color="purple"
                        />
                        <MetricCard
                            icon={Icons.Package}
                            label="Products in Stock"
                            value={metrics.productsInStock}
                            trendValue={metrics.lowStockCount > 0 ? `${metrics.lowStockCount} low stock` : 'All good'}
                            color="amber"
                        />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue Trend */}
                        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black uppercase text-white">Revenue Trend</h3>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(Number(e.target.value) as 7 | 30 | 90)}
                                    className="bg-black border border-gray-700 text-white px-3 py-1 rounded text-sm"
                                >
                                    <option value={7}>Last 7 days</option>
                                    <option value={30}>Last 30 days</option>
                                    <option value={90}>Last 90 days</option>
                                </select>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={revenueTrend}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#DC2626" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Sales by Category */}
                        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                            <h3 className="text-xl font-black uppercase text-white mb-6">Sales by Category</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={salesByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={(entry) => `${entry.category}: ${entry.percentage.toFixed(0)}%`}
                                    >
                                        {salesByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Products & Recent Orders */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Products */}
                        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                            <h3 className="text-xl font-black uppercase text-white mb-6">Top Selling Products</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topProducts} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis type="number" stroke="#666" style={{ fontSize: '12px' }} />
                                    <YAxis dataKey="name" type="category" stroke="#666" style={{ fontSize: '12px' }} width={150} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="revenue" fill="#DC2626" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                            <h3 className="text-xl font-black uppercase text-white mb-6">Recent Orders</h3>
                            <div className="space-y-3">
                                {orders.slice(0, 5).map(order => (
                                    <div key={order.id} className="flex justify-between items-center p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-colors">
                                        <div>
                                            <p className="text-white font-bold text-sm">{order.customerName}</p>
                                            <p className="text-gray-500 text-xs">{new Date(order.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold font-mono">{order.total.toLocaleString()} MAD</p>
                                            <span className={`text-xs font-bold uppercase ${order.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {tab === 'analytics' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    {/* Revenue Split */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                            <h3 className="text-xl font-black uppercase text-white mb-6">Revenue by Channel</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={[
                                    { name: 'Online', value: revenueSplit.online },
                                    { name: 'In-Store', value: revenueSplit.instore }
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis dataKey="name" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" fill="#DC2626" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
                            <h3 className="text-xl font-black uppercase text-white mb-6">Key Metrics</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-black/30 rounded-lg">
                                    <span className="text-gray-400 text-sm uppercase">Pending Orders</span>
                                    <span className="text-2xl font-black text-yellow-500">{metrics.pendingOrders}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-black/30 rounded-lg">
                                    <span className="text-gray-400 text-sm uppercase">Low Stock Items</span>
                                    <span className="text-2xl font-black text-red-500">{metrics.lowStockCount}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-black/30 rounded-lg">
                                    <span className="text-gray-400 text-sm uppercase">Revenue Growth</span>
                                    <span className={`text-2xl font-black ${metrics.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {metrics.revenueGrowth >= 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Tab */}
            {tab === 'orders' && (
                <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden shadow-2xl animate-in fade-in duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-black/40 text-xs uppercase font-bold text-white tracking-wider">
                                <tr>
                                    <th className="px-6 py-5">ID</th>
                                    <th className="px-6 py-5">Customer</th>
                                    <th className="px-6 py-5">Items</th>
                                    <th className="px-6 py-5">Total</th>
                                    <th className="px-6 py-5">Status & Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-moto-red">{order.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{order.customerName}</div>
                                            <div className="text-xs opacity-70">{order.customerPhone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.items.map(i => (
                                                <div key={i.id} className="flex items-center gap-2">
                                                    <span className="text-white font-bold">{i.quantity}x</span> {i.name}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white font-mono">{order.total.toLocaleString()} MAD</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative group">
                                                    <select
                                                        value={order.status}
                                                        onChange={async (e) => {
                                                            const newStatus = e.target.value as any;
                                                            const success = await onUpdateOrder(order.id, newStatus);
                                                            if (!success) alert('Failed to update status');
                                                        }}
                                                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold uppercase border bg-black/50 outline-none cursor-pointer transition-all w-32 ${order.status === 'completed' ? 'text-green-500 border-green-500/30 hover:bg-green-500/10' :
                                                                order.status === 'processing' ? 'text-blue-500 border-blue-500/30 hover:bg-blue-500/10' :
                                                                    order.status === 'shipped' ? 'text-purple-500 border-purple-500/30 hover:bg-purple-500/10' :
                                                                        order.status === 'cancelled' ? 'text-red-500 border-red-500/30 hover:bg-red-500/10' :
                                                                            'text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10'
                                                            }`}
                                                    >
                                                        <option value="pending" className="bg-gray-900 text-yellow-500">Pending</option>
                                                        <option value="processing" className="bg-gray-900 text-blue-500">Processing</option>
                                                        <option value="shipped" className="bg-gray-900 text-purple-500">Shipped</option>
                                                        <option value="completed" className="bg-gray-900 text-green-500">Completed</option>
                                                        <option value="cancelled" className="bg-gray-900 text-red-500">Cancelled</option>
                                                    </select>
                                                    <Icons.ChevronDown className={`w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${order.status === 'completed' ? 'text-green-500' :
                                                            order.status === 'processing' ? 'text-blue-500' :
                                                                order.status === 'shipped' ? 'text-purple-500' :
                                                                    order.status === 'cancelled' ? 'text-red-500' :
                                                                        'text-yellow-500'
                                                        }`} />
                                                </div>

                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Are you sure you want to delete this order?')) {
                                                            const success = await onDeleteOrder(order.id);
                                                            if (!success) alert('Failed to delete order');
                                                        }
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/50 text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-all group"
                                                    title="Delete Order"
                                                >
                                                    <Icons.Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && <p className="p-12 text-center text-gray-500 uppercase tracking-widest">No active orders.</p>}
                    </div>
                </div>
            )}

            {/* Inventory Tab - Keeping existing functionality */}
            {tab === 'inventory' && (
                <>
                    {inventoryView === 'list' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{products.length} Items in Stock</p>
                                <button
                                    onClick={handleAddClick}
                                    className="bg-moto-red hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold uppercase text-sm transition-all flex items-center gap-2"
                                >
                                    <Icons.Plus className="w-4 h-4" />
                                    Add Product
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map(p => (
                                    <div key={p.id} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden group hover:border-moto-red/50 transition-all">
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                                <div className="flex gap-2">
                                                    <span className="text-xs font-bold uppercase bg-moto-red text-white px-2 py-1 rounded">{p.brand}</span>
                                                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${!p.stock || p.stock < 5 ? 'bg-red-600 text-white animate-pulse' : 'bg-green-600 text-white'}`}>
                                                        {p.stock || 0} in Stock
                                                    </span>
                                                </div>
                                                <span className="text-white font-bold font-mono">{p.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-black text-white text-lg mb-2">{p.name}</h3>
                                            <p className="text-gray-500 text-xs mb-4 line-clamp-2">{p.description}</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditClick(p)}
                                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded font-bold text-xs uppercase transition-all"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this product?')) {
                                                            onDeleteProduct(p.id);
                                                        }
                                                    }}
                                                    className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white py-2 rounded font-bold text-xs uppercase transition-all"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(inventoryView === 'add' || inventoryView === 'edit') && (
                        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-white uppercase italic">
                                    {inventoryView === 'edit' ? 'Edit Machine Config' : 'Initialize New Machine'}
                                </h3>
                            </div>

                            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 shadow-2xl">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Image Section */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Machine Visuals</label>
                                        <div className="flex gap-4 mb-4">
                                            <button
                                                type="button"
                                                onClick={() => setImageInputType('url')}
                                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded flex items-center justify-center gap-2 border ${imageInputType === 'url' ? 'bg-moto-red/20 text-moto-red border-moto-red' : 'bg-transparent text-gray-500 border-gray-700'}`}
                                            >
                                                <Icons.Link className="w-4 h-4" /> Image URL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setImageInputType('file')}
                                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded flex items-center justify-center gap-2 border ${imageInputType === 'file' ? 'bg-moto-red/20 text-moto-red border-moto-red' : 'bg-transparent text-gray-500 border-gray-700'}`}
                                            >
                                                <Icons.Upload className="w-4 h-4" /> Upload File
                                            </button>
                                        </div>

                                        {imageInputType === 'url' ? (
                                            <input
                                                className="w-full bg-black/50 border border-gray-700 p-4 rounded-lg text-white text-sm focus:border-moto-red outline-none transition-all font-mono"
                                                placeholder="https://..."
                                                value={formState.image || ''}
                                                onChange={e => setFormState({ ...formState, image: e.target.value })}
                                            />
                                        ) : (
                                            <div className="relative group w-full h-32 bg-black/50 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center hover:border-moto-red transition-colors">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="text-center">
                                                    <Icons.Image className="mx-auto text-gray-500 mb-2" />
                                                    <span className="text-xs text-gray-400 uppercase font-bold">Click to Upload Local File</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Preview */}
                                        {formState.image && (
                                            <div className="mt-4 w-full h-64 rounded-xl overflow-hidden border border-gray-800 bg-black relative">
                                                <img src={formState.image} alt="Preview" className="w-full h-full object-contain" />
                                                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-[10px] text-white uppercase font-bold">Live Preview</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Model Name</label>
                                            <input
                                                className="w-full bg-black/50 border border-gray-700 p-4 rounded-lg text-white text-sm focus:border-moto-red outline-none"
                                                placeholder="e.g. Ducati Panigale V4"
                                                value={formState.name || ''}
                                                onChange={e => setFormState({ ...formState, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Price (MAD)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-black/50 border border-gray-700 p-4 rounded-lg text-white text-sm focus:border-moto-red outline-none"
                                                placeholder="0.00"
                                                value={formState.price || ''}
                                                onChange={e => setFormState({ ...formState, price: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Stock Level</label>
                                        <input
                                            type="number"
                                            className="w-full bg-black/50 border border-gray-700 p-4 rounded-lg text-white text-sm focus:border-moto-red outline-none"
                                            placeholder="0"
                                            value={formState.stock || ''}
                                            onChange={e => setFormState({ ...formState, stock: Number(e.target.value) })}
                                            min="0"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Manufacturer</label>
                                            <input
                                                type="text"
                                                className="w-full bg-black/50 border border-gray-700 p-4 rounded-lg text-white text-sm focus:border-moto-red outline-none"
                                                placeholder="Type Brand..."
                                                value={brandInput}
                                                onChange={e => setBrandInput(e.target.value)}
                                                required
                                            />
                                            {/* Chips */}
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {availableBrands.map(b => (
                                                    <button
                                                        key={b}
                                                        type="button"
                                                        onClick={() => setBrandInput(b)}
                                                        className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${brandInput === b ? 'bg-moto-red text-white border-moto-red' : 'bg-transparent text-gray-500 border-gray-700 hover:border-gray-500'}`}
                                                    >
                                                        {b}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Category</label>
                                            <select
                                                className="w-full bg-black/50 border border-gray-700 p-4 rounded-lg text-white text-sm focus:border-moto-red outline-none appearance-none"
                                                value={formState.category}
                                                onChange={e => setFormState({ ...formState, category: e.target.value as Category })}
                                            >
                                                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Description</label>
                                        <textarea
                                            className="w-full bg-black/50 border border-gray-700 p-4 rounded-lg text-white text-sm focus:border-moto-red outline-none"
                                            rows={4}
                                            placeholder="Technical details and features..."
                                            value={formState.description || ''}
                                            onChange={e => setFormState({ ...formState, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Specs Section */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Technical Specifications</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <input
                                                    className="w-full bg-black/50 border border-gray-700 p-4 rounded-lg text-white text-sm focus:border-moto-red outline-none"
                                                    placeholder="Engine (e.g. 998cc)"
                                                    value={formState.specs?.engine || ''}
                                                    onChange={e => setFormState({
                                                        ...formState,
                                                        specs: { ...formState.specs, engine: e.target.value, power: formState.specs?.power || '', weight: formState.specs?.weight || '' }
                                                    })}
                                                />
                                                <span className="text-[10px] text-gray-500 uppercase font-bold mt-1 block">Engine</span>
                                            </div>
                                            <div>
                                                <input
                                                    className="w-full bg-black/50 border border-gray-700 p-4 rounded-lg text-white text-sm focus:border-moto-red outline-none"
                                                    placeholder="Power (e.g. 200 HP)"
                                                    value={formState.specs?.power || ''}
                                                    onChange={e => setFormState({
                                                        ...formState,
                                                        specs: { ...formState.specs, power: e.target.value, engine: formState.specs?.engine || '', weight: formState.specs?.weight || '' }
                                                    })}
                                                />
                                                <span className="text-[10px] text-gray-500 uppercase font-bold mt-1 block">Power</span>
                                            </div>
                                            <div>
                                                <input
                                                    className="w-full bg-black/50 border border-gray-700 p-4 rounded-lg text-white text-sm focus:border-moto-red outline-none"
                                                    placeholder="Weight (e.g. 180 kg)"
                                                    value={formState.specs?.weight || ''}
                                                    onChange={e => setFormState({
                                                        ...formState,
                                                        specs: { ...formState.specs, weight: e.target.value, engine: formState.specs?.engine || '', power: formState.specs?.power || '' }
                                                    })}
                                                />
                                                <span className="text-[10px] text-gray-500 uppercase font-bold mt-1 block">Weight</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="flex-1 py-4 rounded-lg font-black uppercase tracking-widest bg-gray-800 hover:bg-gray-700 text-white transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] py-4 rounded-lg font-black uppercase tracking-widest bg-moto-red hover:bg-red-600 text-white transition-all"
                                        >
                                            {inventoryView === 'edit' ? 'Update Configuration' : 'Launch to Showroom'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
