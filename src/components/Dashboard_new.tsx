import React, { useState, useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
    onAddProduct: (p: Product) => void;
    onUpdateProduct: (p: Product) => void;
    onDeleteProduct: (id: string) => void;
    onLogout: () => void;
}

const COLORS = ['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

export const Dashboard: React.FC<DashboardProps> = ({
    orders,
    products,
    onAddProduct,
    onUpdateProduct,
    onDeleteProduct,
    onLogout
}) => {
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
            } else {
                onAddProduct(productData);
            }
            setInventoryView('list');
        }
    };

    // Metric Card Component
    const MetricCard = ({ icon: Icon, label, value, trend, trendValue, color }: any) => (
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 hover:border-moto-red/30 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${color}-500/10`}>
                    <Icon className={`w-6 h-6 text-${color}-500`} />
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
            <div className="flex gap-4 border-b border-gray-800 mb-8">
                <button
                    onClick={() => setTab('overview')}
                    className={`pb-4 px-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${tab === 'overview' ? 'border-moto-red text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setTab('analytics')}
                    className={`pb-4 px-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${tab === 'analytics' ? 'border-moto-red text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Analytics
                </button>
                <button
                    onClick={() => setTab('orders')}
                    className={`pb-4 px-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${tab === 'orders' ? 'border-moto-red text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Orders
                </button>
                <button
                    onClick={() => setTab('inventory')}
                    className={`pb-4 px-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${tab === 'inventory' ? 'border-moto-red text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Inventory
                </button>
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
                                    <div key={order.id} className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
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

            {/* Analytics Tab - Continuing in next message due to length */}
        </div>
    );
};
