import React from 'react';
import { Icons } from './ui/Icons';

export const Newsletter: React.FC = () => (
    <div className="py-24 bg-moto-red relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="text-left">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase italic">Join the <br /> Paddock</h2>
                    <p className="text-red-100 mb-8 text-lg leading-relaxed max-w-md">
                        Get exclusive access to new arrivals, track days, and expert maintenance tips. Join 15,000+ riders in Morocco.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 text-white font-bold">
                            <div className="bg-white/20 p-3 rounded-full"><Icons.Phone className="w-5 h-5" /></div>
                            <span>+212 600 123 456</span>
                        </div>
                        <div className="flex items-center gap-4 text-white font-bold">
                            <div className="bg-white/20 p-3 rounded-full"><Icons.Mail className="w-5 h-5" /></div>
                            <span>contact@motoverse.ma</span>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        {[Icons.Facebook, Icons.Instagram, Icons.Youtube].map((Icon, i) => (
                            <button key={i} className="bg-white text-moto-red p-4 rounded-full hover:bg-moto-black hover:text-white transition-all duration-300 hover:scale-110">
                                <Icon className="w-6 h-6" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-moto-black/30 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
                    <h3 className="text-2xl font-black text-white mb-4 uppercase italic">Quick Subscribe</h3>
                    <div className="flex flex-col gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="px-6 py-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
                        />
                        <button className="px-8 py-4 bg-white text-moto-red font-black rounded-xl hover:bg-gray-100 transition-colors uppercase tracking-wide">
                            Sign Up
                        </button>
                        <p className="text-xs text-white/40 text-center mt-2">No spam. Just l7wa.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
