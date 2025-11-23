import React, { useState } from 'react';
import { Icons } from './ui/Icons';
import { CartItem } from '../types';

interface CheckoutViewProps {
    items: CartItem[];
    onConfirm: (name: string, phone: string, address: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
    items,
    onConfirm
}) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && phone && address) {
            onConfirm(name, phone, address);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-black mb-8 uppercase italic">Final <span className="text-moto-red">Pit Stop</span></h2>

            <div className="bg-moto-gray p-8 rounded-2xl border border-gray-800 shadow-xl">
                <div className="mb-8 pb-8 border-b border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
                    {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center mb-2 text-gray-400 text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{(item.price * item.quantity).toLocaleString()} MAD</span>
                        </div>
                    ))}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700 text-lg font-bold text-white">
                        <span>Total</span>
                        <span>{total.toLocaleString()} MAD</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-wider">Full Name</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-moto-dark border border-gray-700 p-4 text-white rounded-lg focus:border-moto-red outline-none transition-colors"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-wider">Phone Number</label>
                        <input
                            required
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-moto-dark border border-gray-700 p-4 text-white rounded-lg focus:border-moto-red outline-none transition-colors"
                            placeholder="+1 234 567 8900"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-wider">Delivery Address</label>
                        <textarea
                            required
                            rows={3}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-moto-dark border border-gray-700 p-4 text-white rounded-lg focus:border-moto-red outline-none transition-colors"
                            placeholder="Street, City, Zip Code"
                        />
                    </div>
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-lg font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                        <Icons.MessageCircle /> Confirm & Send to WhatsApp
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-4">
                        Clicking this will open WhatsApp with your order details pre-filled.
                    </p>
                </form>
            </div>
        </div>
    );
}
