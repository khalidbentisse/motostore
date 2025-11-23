import React, { useState } from 'react';
import { Icons } from './ui/Icons';
import { Product, Order, Category, Brand } from '../types';
import { supabaseService } from '../services/supabaseService';

interface DashboardProps {
    orders: Order[];
    products: Product[];
    onAddProduct: (p: Product) => void;
    onUpdateProduct: (p: Product) => void;
    onDeleteProduct: (id: string) => void;
    onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    orders,
    products,
    onAddProduct,
    onUpdateProduct,
    onDeleteProduct,
    onLogout
}) => {
    const [tab, setTab] = useState<'orders' | 'inventory'>('orders');
    const [inventoryView, setInventoryView] = useState<'list' | 'add' | 'edit'>('list');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [brandInput, setBrandInput] = useState('');
    const [imageInputType, setImageInputType] = useState<'url' | 'file'>('url');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formState, setFormState] = useState<Partial<Product>>({
        category: Category.BIKES,
        brand: Brand.HONDA
    });

    const availableBrands = Array.from(new Set([
        ...Object.values(Brand),
        ...products.map(p => p.brand)
    ])).sort();

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    const handleEditClick = (product: Product) => {
        setEditingId(product.id);
        setFormState(product);
        setBrandInput(product.brand);
        setImageInputType('url'); // Default to URL edit, or could check if it's data:image
        setInventoryView('edit');
    };

    const handleAddClick = () => {
        setEditingId(null);
        setFormState({ category: Category.BIKES, brand: Brand.HONDA, name: '', price: 0, image: '', description: '' });
        setBrandInput('');
        setImageInputType('url');
        setSelectedFile(null);
        setInventoryView('add');
    };

    const handleCancel = () => {
        setInventoryView('list');
        setEditingId(null);
        setFormState({ category: Category.BIKES, brand: Brand.HONDA, name: '', price: 0, image: '', description: '' });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File is too large. Please choose an image under 5MB.");
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormState(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Test Storage Connection on Mount
    React.useEffect(() => {
        supabaseService.testStorageConnection().then(connected => {
            if (!connected) console.warn("Supabase Storage seems inaccessible.");
        });
    }, []);

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

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                <h2 className="text-4xl font-black uppercase text-white tracking-tighter italic">
                    Command <span className="text-moto-red">Center</span>
                </h2>
                <div className="flex gap-2">
                    <button onClick={async () => alert(await supabaseService.runDiagnostics())} className="text-sm font-bold uppercase tracking-widest text-blue-500 hover:text-white border border-blue-700 px-6 py-3 rounded hover:bg-blue-600 transition-all">
                        Run Diagnostics
                    </button>
                    <button onClick={onLogout} className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-white border border-gray-700 px-6 py-3 rounded hover:border-moto-red transition-all">
                        Log Out
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-moto-red/10 rounded-bl-full group-hover:bg-moto-red/20 transition-colors"></div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Live Orders</h3>
                    <p className="text-5xl font-black text-white">{orders.length}</p>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full group-hover:bg-green-500/20 transition-colors"></div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Revenue</h3>
                    <p className="text-5xl font-black text-moto-red">{totalRevenue.toLocaleString()} <span className="text-sm text-gray-500">MAD</span></p>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full group-hover:bg-blue-500/20 transition-colors"></div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Fleet Size</h3>
                    <p className="text-5xl font-black text-white">{products.length}</p>
                </div>
            </div>

            {/* Dashboard Tabs */}
            <div className="flex gap-4 border-b border-gray-800 mb-8">
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
                    Inventory Management
                </button>
            </div>

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
                                    <th className="px-6 py-5">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-moto-red">{order.id}</td>
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
                                            <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase border border-yellow-500/20">{order.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && <p className="p-12 text-center text-gray-500 uppercase tracking-widest">No active orders.</p>}
                    </div>
                </div>
            )}

            {tab === 'inventory' && (
                <>
                    {inventoryView === 'list' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{products.length} Items in Stock</p>
                                <button
                                    onClick={handleAddClick}
                                    className="bg-moto-red hover:bg-red-600 text-white px-6 py-3 rounded-lg font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105"
                                >
                                    <Icons.Plus /> Add New Machine
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {products.map(p => (
                                    <div key={p.id} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden group hover:border-moto-red/50 transition-all flex flex-col">
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                                <span className="text-xs font-bold uppercase bg-moto-red text-white px-2 py-1 rounded">{p.brand}</span>
                                                <span className="text-white font-bold font-mono">{p.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h4 className="font-bold text-white mb-1 line-clamp-1">{p.name}</h4>
                                            <p className="text-gray-500 text-xs mb-4 line-clamp-2 flex-1">{p.description}</p>
                                            <div className="flex gap-2 mt-auto">
                                                <button
                                                    onClick={() => handleEditClick(p)}
                                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded text-xs font-bold uppercase tracking-wide transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => onDeleteProduct(p.id)}
                                                    className="px-3 bg-gray-800 hover:bg-red-900/30 text-gray-400 hover:text-red-500 rounded transition-colors"
                                                >
                                                    <Icons.Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(inventoryView === 'add' || inventoryView === 'edit') && (
                        <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={handleCancel} className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors">
                                    <Icons.ArrowLeft />
                                </button>
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
