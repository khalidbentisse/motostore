import React, { useState } from 'react';
import { Icons } from './ui/Icons';

interface NavbarProps {
    cartCount: number;
    onNavigate: (page: string) => void;
    currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
    cartCount,
    onNavigate,
    currentPage
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNav = (page: string) => {
        onNavigate(page);
        setIsMenuOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 bg-black/80 border-b border-moto-red/20 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24">
                    {/* Logo */}
                    <div className="flex-shrink-0 cursor-pointer group flex items-center gap-4 relative">
                        <div className="absolute -inset-2 bg-moto-red/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        {/* Mobile Menu Button */}
                        <div className="md:hidden relative z-10">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-white p-2 hover:text-moto-red transition-colors"
                            >
                                {isMenuOpen ? <Icons.X /> : <Icons.Menu />}
                            </button>
                        </div>
                        <div onClick={() => handleNav('home')} className="flex flex-col relative z-10">
                            <h1 className="text-3xl font-display font-black tracking-widest uppercase italic transition-transform group-hover:skew-x-[-10deg] text-white drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                                Moto<span className="text-moto-red">Verse</span>
                            </h1>
                            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-moto-red to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-1">
                            {['home', 'shop', 'about', 'contact'].map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handleNav(page)}
                                    className={`relative px-6 py-2 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 group overflow-hidden ${currentPage === page ? 'text-moto-red' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <span className="relative z-10 font-display">{page}</span>
                                    {/* Hover Glitch Effect */}
                                    <div className={`absolute inset-0 bg-moto-red/10 transform skew-x-[-20deg] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${currentPage === page ? 'translate-y-0 bg-moto-red/5' : ''}`}></div>
                                    <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-moto-red transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${currentPage === page ? 'scale-x-100' : ''}`}></div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cart Icon */}
                    <div className="flex items-center">
                        <button
                            onClick={() => handleNav('cart')}
                            className="relative p-3 text-gray-400 hover:text-white transition-colors group border border-transparent hover:border-moto-red/30 rounded-lg hover:bg-moto-red/5"
                        >
                            <div className="group-hover:scale-110 transition-transform">
                                <Icons.ShoppingBag />
                            </div>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold leading-none text-white bg-moto-red rounded-none transform rotate-45 shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                                    <span className="transform -rotate-45">{cartCount}</span>
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-black/95 border-b border-moto-red/20 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {['home', 'shop', 'about', 'contact'].map((page) => (
                            <button
                                key={page}
                                onClick={() => handleNav(page)}
                                className={`block w-full text-left px-4 py-4 text-lg font-display font-black uppercase tracking-widest border-l-4 transition-all ${currentPage === page ? 'text-moto-red border-moto-red bg-moto-red/5' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5 hover:border-gray-600'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};
