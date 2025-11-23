import React from 'react';
import { Icons } from './ui/Icons';
import { CartItem } from '../types';

interface CartViewProps {
    items: CartItem[];
    onUpdateQty: (id: string, delta: number) => void;
    onRemove: (id: string) => void;
    onCheckout: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
    items,
    onUpdateQty,
    onRemove,
    onCheckout
}) => {
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <div className="bg-moto-gray p-8 rounded-full mb-6">
                    <Icons.ShoppingBag />
                </div>
                <h2 className="text-3xl font-black uppercase italic text-white">Garage is empty</h2>
                <p className="mt-2 text-lg">Go add some machines.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="text-4xl font-black mb-12 flex items-center gap-3 uppercase italic">
                <span className="text-moto-red">Your</span> Garage
            </h2>
            <div className="bg-moto-gray rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                {items.map(item => (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 border-b border-gray-800 last:border-0 hover:bg-white/5 transition-colors">
                        <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-xl" />
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                            <p className="text-moto-red font-mono font-bold text-lg mt-1">{item.price.toLocaleString()} MAD</p>
                        </div>
                        <div className="flex items-center bg-moto-dark rounded-full border border-gray-700 p-1">
                            <button
                                onClick={() => onUpdateQty(item.id, -1)}
                                className="p-3 hover:text-moto-red transition-colors rounded-full hover:bg-white/10"
                            >
                                <Icons.Minus />
                            </button>
                            <span className="w-12 text-center font-mono font-bold text-lg">{item.quantity}</span>
                            <button
                                onClick={() => onUpdateQty(item.id, 1)}
                                className="p-3 hover:text-moto-red transition-colors rounded-full hover:bg-white/10"
                            >
                                <Icons.Plus />
                            </button>
                        </div>
                        <button
                            onClick={() => onRemove(item.id)}
                            className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                        >
                            <Icons.Trash2 />
                        </button>
                    </div>
                ))}
                <div className="p-8 bg-moto-dark border-t border-gray-800">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-xl text-gray-400 font-medium">Total Estimate</span>
                        <span className="text-4xl font-black text-white tracking-tight">{total.toLocaleString()} MAD</span>
                    </div>
                    <button
                        onClick={onCheckout}
                        className="w-full bg-moto-red hover:bg-red-600 text-white py-5 text-xl font-black uppercase tracking-widest rounded-xl transition-all transform hover:scale-[1.01]"
                    >
                        Direct Checkout (WhatsApp)
                    </button>
                </div>
            </div>
        </div>
    );
};
