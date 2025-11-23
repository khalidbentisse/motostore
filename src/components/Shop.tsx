import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Icons } from './ui/Icons';
import { Product, Category } from '../types';
import { ProductDetails } from './ProductDetails';

interface ShopProps {
    products: Product[];
    onAddToCart: (p: Product) => void;
    initialCategory?: string;
}

export const Shop: React.FC<ShopProps> = ({
    products,
    onAddToCart,
    initialCategory
}) => {
    const [selectedBrand, setSelectedBrand] = useState<string>('All');
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);

    // Derive unique brands from the actual inventory for the filter list
    const availableBrands = ['All', ...Array.from(new Set(products.map(p => p.brand))).sort()];

    useEffect(() => {
        if (initialCategory) setSelectedCategory(initialCategory);
    }, [initialCategory]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < 50) {
                setShowFilters(true);
            } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setShowFilters(false);
            } else if (currentScrollY < lastScrollY.current) {
                setShowFilters(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current.children,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power2.out' }
            );
        }
    }, [selectedBrand, selectedCategory, searchQuery]);

    const filteredProducts = products.filter(product => {
        const brandMatch = selectedBrand === 'All' || product.brand === selectedBrand;
        const catMatch = selectedCategory === 'All' || product.category === selectedCategory;
        const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return brandMatch && catMatch && searchMatch;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <h2 className="text-4xl font-black mb-8 uppercase italic text-white">
                Current <span className="text-moto-red">Inventory</span>
            </h2>

            <div className={`
        mb-12 bg-moto-gray/20 backdrop-blur-md border border-white/5 rounded-2xl p-6 
        sticky top-24 z-40 shadow-2xl
        transform transition-all duration-500 ease-in-out
        ${showFilters ? 'translate-y-0 opacity-100' : '-translate-y-[200%] opacity-0 pointer-events-none'}
      `}>
                <div className="relative mb-8 group">
                    <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-moto-red transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH INVENTORY (e.g., Yamaha R1, Exhaust...)"
                        className="w-full bg-moto-black/50 border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:border-moto-red focus:ring-1 focus:ring-moto-red outline-none transition-all font-mono uppercase tracking-wider"
                    />
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Category</p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setSelectedCategory('All')}
                                className={`px-6 py-2 rounded-lg font-black uppercase text-sm tracking-wider transition-all clip-path-slant ${selectedCategory === 'All' ? 'bg-white text-moto-black scale-105' : 'bg-moto-black text-gray-400 hover:bg-gray-800'}`}
                            >
                                All
                            </button>
                            {Object.values(Category).map(c => (
                                <button
                                    key={c}
                                    onClick={() => setSelectedCategory(c)}
                                    className={`px-6 py-2 rounded-lg font-black uppercase text-sm tracking-wider transition-all ${selectedCategory === c ? 'bg-moto-red text-white scale-105 shadow-lg shadow-red-900/50' : 'bg-moto-black text-gray-400 hover:bg-gray-800'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-widest">Manufacturer</p>
                        <div className="flex flex-wrap gap-2">
                            {availableBrands.map(b => (
                                <button
                                    key={b}
                                    onClick={() => setSelectedBrand(b)}
                                    className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide border transition-all ${selectedBrand === b ? 'border-moto-red text-moto-red bg-moto-red/10' : 'border-transparent text-gray-600 hover:text-gray-300'}`}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                    <div
                        key={product.id}
                        className="bg-moto-gray rounded-xl overflow-hidden hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all duration-300 group border border-gray-800 flex flex-col h-full relative cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                    >
                        <div className="relative h-64 overflow-hidden">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-4 right-4 bg-moto-black/80 backdrop-blur px-3 py-1 rounded text-xs font-bold uppercase text-moto-red border border-moto-red/30">
                                {product.brand}
                            </div>

                            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="w-full h-[2px] bg-moto-red shadow-[0_0_15px_#DC2626] animate-scan opacity-80"></div>
                                <div className="absolute inset-0 bg-moto-red/10 mix-blend-overlay"></div>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col flex-1 relative z-10 bg-moto-gray">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-white leading-tight">{product.name}</h3>
                            </div>
                            <span className="text-2xl font-black text-moto-red mb-4 block">{product.price.toLocaleString()} MAD</span>

                            <p className="text-gray-400 text-sm mb-6 line-clamp-2 flex-1">{product.description}</p>

                            {product.specs && (
                                <div className="grid grid-cols-3 gap-2 mb-6 text-xs text-gray-500 border-t border-gray-700 pt-4">
                                    <div>
                                        <span className="block text-gray-300 font-bold">Engine</span>
                                        {product.specs.engine}
                                    </div>
                                    <div>
                                        <span className="block text-gray-300 font-bold">Power</span>
                                        {product.specs.power}
                                    </div>
                                    <div>
                                        <span className="block text-gray-300 font-bold">Weight</span>
                                        {product.specs.weight}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProduct(product);
                                }}
                                className="w-full bg-white hover:bg-gray-200 text-moto-black font-bold py-4 rounded-lg transition-all uppercase text-sm tracking-wider flex items-center justify-center gap-2 group-hover:bg-moto-red group-hover:text-white active:scale-95"
                            >
                                <Icons.Search className="w-4 h-4" /> View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {filteredProducts.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <h3 className="text-2xl font-bold mb-2">No matches found</h3>
                    <p>Try adjusting your filters or search query.</p>
                </div>
            )}

            {selectedProduct && (
                <ProductDetails
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={onAddToCart}
                />
            )}
        </div>
    );
};
