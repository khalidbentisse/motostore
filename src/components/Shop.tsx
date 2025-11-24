import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { Icons } from './ui/Icons';
import { Product, Category } from '../types';
import { ProductDetails } from './ProductDetails';

interface ShopProps {
    products: Product[];
    onAddToCart: (p: Product) => void;
    initialCategory?: string;
    onSearchCollapse?: (collapsed: boolean) => void;
}

// --- Custom Dual Range Slider Component ---
const DualRangeSlider: React.FC<{
    min: number;
    max: number;
    onChange: (range: [number, number]) => void;
    value: [number, number];
}> = ({ min, max, onChange, value }) => {
    const [minVal, setMinVal] = useState(value[0]);
    const [maxVal, setMaxVal] = useState(value[1]);
    const minValRef = useRef(value[0]);
    const maxValRef = useRef(value[1]);
    const range = useRef<HTMLDivElement>(null);

    // Convert to percentage
    const getPercent = (value: number) => Math.round(((value - min) / (max - min)) * 100);

    // Update range width and position
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, min, max]);

    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, min, max]);

    // Sync with props
    useEffect(() => {
        setMinVal(value[0]);
        setMaxVal(value[1]);
        minValRef.current = value[0];
        maxValRef.current = value[1];
    }, [value]);

    return (
        <div className="relative w-full h-12 flex items-center">
            <input
                type="range"
                min={min}
                max={max}
                value={minVal}
                onChange={(event) => {
                    const value = Math.min(Number(event.target.value), maxVal - 1);
                    setMinVal(value);
                    minValRef.current = value;
                    onChange([value, maxVal]);
                }}
                className="thumb thumb--left z-30 absolute w-full h-0 outline-none pointer-events-none"
                style={{ zIndex: minVal > max - 100 ? 5 : undefined }}
            />
            <input
                type="range"
                min={min}
                max={max}
                value={maxVal}
                onChange={(event) => {
                    const value = Math.max(Number(event.target.value), minVal + 1);
                    setMaxVal(value);
                    maxValRef.current = value;
                    onChange([minVal, value]);
                }}
                className="thumb thumb--right z-40 absolute w-full h-0 outline-none pointer-events-none"
            />

            <div className="relative w-full">
                <div className="absolute w-full h-1 bg-gray-800 rounded-full z-10"></div>
                <div ref={range} className="absolute h-1 bg-moto-red rounded-full z-20 shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>

                <div className="absolute left-0 top-4 text-[10px] font-bold text-gray-500 tracking-wider">{minVal.toLocaleString()} MAD</div>
                <div className="absolute right-0 top-4 text-[10px] font-bold text-gray-500 tracking-wider">{maxVal.toLocaleString()} MAD</div>
            </div>

            <style>{`
            .thumb::-webkit-slider-thumb {
                -webkit-appearance: none;
                -webkit-tap-highlight-color: transparent;
                pointer-events: auto;
                height: 16px;
                width: 16px;
                border-radius: 50%;
                background-color: #DC2626;
                border: 2px solid #fff;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
                margin-top: 1px;
            }
            .thumb::-moz-range-thumb {
                -webkit-appearance: none;
                pointer-events: auto;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background-color: #DC2626;
                border: 2px solid #fff;
                cursor: pointer;
                box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
            }
        `}</style>
        </div>
    );
};

export const Shop: React.FC<ShopProps> = ({
    products,
    onAddToCart,
    initialCategory,
    onSearchCollapse
}) => {
    // --- State ---
    const [selectedBrand, setSelectedBrand] = useState<string>('All');
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
    const [selectedCondition, setSelectedCondition] = useState<string>('All');
    const [selectedFuel, setSelectedFuel] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Price Range State
    const minPrice = 0;
    const maxPrice = 500000; // Assuming max price for now, could be dynamic
    const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

    // Refs
    const filterPanelRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Derived Data
    const availableBrands = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.brand))).sort()], [products]);

    // --- Effects ---

    // Initial Category Sync
    useEffect(() => {
        if (initialCategory) setSelectedCategory(initialCategory);
    }, [initialCategory]);

    // Filter Panel Animation
    useEffect(() => {
        const panel = filterPanelRef.current;
        if (!panel) return;

        if (isFilterOpen) {
            gsap.to(panel, {
                height: 'auto',
                opacity: 1,
                duration: 0.6,
                ease: 'power4.out',
                display: 'block'
            });

            // Stagger children reveal
            gsap.fromTo(panel.children,
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, delay: 0.1 }
            );
        } else {
            gsap.to(panel, {
                height: 0,
                opacity: 0,
                duration: 0.4,
                ease: 'power3.inOut',
                onComplete: () => {
                    if (panel) panel.style.display = 'none';
                }
            });
        }
    }, [isFilterOpen]);

    // Product Grid Animation
    useEffect(() => {
        if (containerRef.current) {
            gsap.fromTo(containerRef.current.children,
                { y: 50, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, stagger: 0.05, duration: 0.6, ease: 'power2.out' }
            );
        }
    }, [selectedBrand, selectedCategory, searchQuery, priceRange, selectedCondition, selectedFuel]); // Re-animate on filter change

    // --- Search Bar Collapse Logic ---
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const threshold = 100; // Collapse threshold

            if (scrollY > threshold) {
                if (onSearchCollapse) onSearchCollapse(true);
                // Animate Search Bar Out
                gsap.to('.shop-search-bar', {
                    y: -50,
                    opacity: 0,
                    pointerEvents: 'none',
                    duration: 0.4,
                    ease: 'power2.in'
                });
            } else {
                if (onSearchCollapse) onSearchCollapse(false);
                // Animate Search Bar In
                gsap.to('.shop-search-bar', {
                    y: 0,
                    opacity: 1,
                    pointerEvents: 'auto',
                    duration: 0.4,
                    ease: 'power2.out'
                });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [onSearchCollapse]);

    // --- Filtering Logic ---
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const brandMatch = selectedBrand === 'All' || product.brand === selectedBrand;
            const catMatch = selectedCategory === 'All' || product.category === selectedCategory;
            const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());
            const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];

            // Default to 'New' and 'Petrol' if fields are missing for backward compatibility
            const condition = product.condition || 'New';
            const fuel = product.fuelType || 'Petrol';

            const conditionMatch = selectedCondition === 'All' || condition === selectedCondition;
            const fuelMatch = selectedFuel === 'All' || fuel === selectedFuel;

            return brandMatch && catMatch && searchMatch && priceMatch && conditionMatch && fuelMatch;
        });
    }, [products, selectedBrand, selectedCategory, searchQuery, priceRange, selectedCondition, selectedFuel]);

    // --- Handlers ---
    const clearFilters = () => {
        setSelectedBrand('All');
        setSelectedCategory('All');
        setSelectedCondition('All');
        setSelectedFuel('All');
        setPriceRange([minPrice, maxPrice]);
        setSearchQuery('');
    };

    const removeTag = (type: string) => {
        if (type === 'brand') setSelectedBrand('All');
        if (type === 'category') setSelectedCategory('All');
        if (type === 'condition') setSelectedCondition('All');
        if (type === 'fuel') setSelectedFuel('All');
        if (type === 'price') setPriceRange([minPrice, maxPrice]);
    };

    const activeTags = [
        selectedCategory !== 'All' && { type: 'category', label: selectedCategory },
        selectedBrand !== 'All' && { type: 'brand', label: selectedBrand },
        selectedCondition !== 'All' && { type: 'condition', label: selectedCondition },
        selectedFuel !== 'All' && { type: 'fuel', label: selectedFuel },
        (priceRange[0] > minPrice || priceRange[1] < maxPrice) && { type: 'price', label: `${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}` }
    ].filter(Boolean) as { type: string, label: string }[];

    // --- Card Tilt Effect ---
    const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5; // Subtle tilt
        const rotateY = ((x - centerX) / centerX) * 5;

        gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            duration: 0.4,
            ease: 'power2.out'
        });
    };

    const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        gsap.to(e.currentTarget, {
            rotationX: 0,
            rotationY: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)'
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h4 className="text-moto-red font-bold tracking-[0.3em] uppercase mb-2 text-xs md:text-sm animate-pulse-slow">Showroom</h4>
                    <h2 className="text-5xl md:text-6xl font-black uppercase italic text-white leading-none tracking-tighter">
                        Current <span className="text-transparent bg-clip-text bg-gradient-to-r from-moto-red to-red-600">Inventory</span>
                    </h2>
                </div>
                <div className="text-gray-500 text-xs font-mono uppercase tracking-widest border-l-2 border-moto-red pl-4">
                    {filteredProducts.length} Premium Machines Available
                </div>
            </div>

            {/* Top Bar */}
            <div className="sticky top-24 z-40 mb-12 shop-search-bar">
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`
                            flex items-center gap-3 px-8 py-4 rounded-xl font-black uppercase tracking-wider transition-all duration-300 border
                            ${isFilterOpen
                                ? 'bg-moto-red text-white border-moto-red shadow-[0_0_30px_rgba(220,38,38,0.4)]'
                                : 'bg-moto-black/80 backdrop-blur text-gray-400 border-white/10 hover:bg-moto-gray hover:text-white hover:border-white/30'}
                        `}
                    >
                        <Icons.Sliders className="w-4 h-4" />
                        <span className="hidden md:inline text-xs">Filter</span>
                        {isFilterOpen ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />}
                    </button>

                    <div className="flex-1 relative group">
                        <Icons.Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-moto-red transition-colors w-4 h-4" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="SEARCH MODEL, SPECS, OR ID..."
                            className="w-full h-full bg-moto-black/80 backdrop-blur border border-white/10 rounded-xl py-4 pl-14 pr-6 text-white placeholder-gray-600 focus:border-moto-red focus:ring-1 focus:ring-moto-red outline-none transition-all font-mono uppercase text-sm tracking-wider shadow-lg focus:shadow-[0_0_30px_rgba(220,38,38,0.1)]"
                        />
                    </div>
                </div>

                {/* Active Tags */}
                {activeTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 animate-fade-in pl-1">
                        {activeTags.map((tag, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-moto-red hover:border-moto-red hover:text-white transition-all group cursor-pointer" onClick={() => removeTag(tag.type)}>
                                <span className="text-gray-500 group-hover:text-white/70">{tag.type}:</span> {tag.label}
                                <Icons.X className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
                            </div>
                        ))}
                        <button onClick={clearFilters} className="text-[10px] text-moto-red hover:text-white uppercase font-bold tracking-widest ml-2 transition-colors">Clear All</button>
                    </div>
                )}
            </div>

            {/* Collapsible Filter Panel */}
            <div
                ref={filterPanelRef}
                className="overflow-hidden mb-12 rounded-2xl bg-[#0a0a0a] border border-white/5 shadow-2xl relative"
                style={{ height: 0, display: 'none', opacity: 0 }}
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-moto-red to-transparent opacity-50"></div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Category */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Category</h3>
                        <div className="flex flex-col gap-2">
                            {['All', ...Object.values(Category)].map(c => (
                                <label key={c} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedCategory === c ? 'bg-moto-red border-moto-red' : 'border-gray-700 group-hover:border-gray-500'}`}>
                                        {selectedCategory === c && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                    </div>
                                    <input type="radio" name="category" className="hidden" checked={selectedCategory === c} onChange={() => setSelectedCategory(c)} />
                                    <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${selectedCategory === c ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>{c}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Manufacturer</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {availableBrands.map(b => (
                                <button
                                    key={b}
                                    onClick={() => setSelectedBrand(b)}
                                    className={`px-3 py-2 rounded text-[10px] font-bold uppercase tracking-wide border transition-all text-left ${selectedBrand === b ? 'border-moto-red text-white bg-moto-red/10' : 'border-gray-800 bg-gray-900/50 text-gray-500 hover:border-gray-600 hover:text-gray-300'}`}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Specs (Condition & Fuel) */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Condition</h3>
                            <div className="flex gap-2 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
                                {['All', 'New', 'Used'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setSelectedCondition(opt)}
                                        className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${selectedCondition === opt ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Fuel Type</h3>
                            <div className="flex gap-2 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
                                {['All', 'Petrol', 'Electric'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setSelectedFuel(opt)}
                                        className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${selectedFuel === opt ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Price Range</h3>
                        <div className="px-2 pt-4">
                            <DualRangeSlider min={minPrice} max={maxPrice} value={priceRange} onChange={setPriceRange} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 perspective-1000">
                {filteredProducts.map(product => (
                    <div
                        key={product.id}
                        className="group relative h-[500px] bg-[#0f0f0f] rounded-2xl border border-white/5 overflow-hidden cursor-pointer transform-style-3d transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-moto-red/30"
                        onMouseMove={handleCardMouseMove}
                        onMouseLeave={handleCardMouseLeave}
                        onClick={() => setSelectedProduct(product)}
                    >
                        {/* Image Layer */}
                        <div className="h-[60%] relative overflow-hidden bg-gradient-to-b from-gray-800 to-[#0f0f0f]">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-90"></div>

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 transform translate-z-20">
                                <span className="bg-white/10 backdrop-blur border border-white/10 text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-widest">
                                    {product.brand}
                                </span>
                                {product.condition === 'Used' && (
                                    <span className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 text-[10px] font-bold px-3 py-1 rounded uppercase tracking-widest w-fit">
                                        Pre-Owned
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content Layer */}
                        <div className="absolute bottom-0 left-0 w-full p-8 transform translate-z-30">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-white uppercase italic leading-none mb-2 group-hover:text-moto-red transition-colors">{product.name}</h3>
                                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{product.description}</p>
                            </div>

                            <div className="flex items-end justify-between border-t border-white/10 pt-6">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Starting At</p>
                                    <p className="text-2xl font-black text-white tracking-tight">{product.price.toLocaleString()} <span className="text-sm text-moto-red">MAD</span></p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-moto-red transition-colors">
                                    <Icons.ArrowRight className="w-4 h-4 text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                </div>
                            </div>
                        </div>

                        {/* Hover Overlay Specs (Quick View) */}
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                            <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                <p className="text-moto-red text-xs font-bold uppercase tracking-[0.3em] mb-4">Quick Specs</p>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-left">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Engine</p>
                                        <p className="text-sm font-bold text-white">{product.specs?.engine || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Power</p>
                                        <p className="text-sm font-bold text-white">{product.specs?.power || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Weight</p>
                                        <p className="text-sm font-bold text-white">{product.specs?.weight || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase">Fuel</p>
                                        <p className="text-sm font-bold text-white">{product.fuelType || 'Petrol'}</p>
                                    </div>
                                </div>
                                <div className="mt-8 text-xs text-white border border-white/20 px-4 py-2 rounded uppercase tracking-widest">
                                    Click for Details
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <Icons.Search className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase italic mb-2">No Machines Found</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">We couldn't find any inventory matching your specific criteria. Try adjusting your filters.</p>
                    <button
                        onClick={clearFilters}
                        className="px-8 py-3 bg-moto-red text-white rounded font-bold uppercase text-xs tracking-widest hover:bg-red-600 transition-colors"
                    >
                        Reset Filters
                    </button>
                </div>
            )}

            {/* Product Details Modal */}
            {selectedProduct && (
                <ProductDetails
                    product={selectedProduct}
                    products={products}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={onAddToCart}
                    onSelectProduct={setSelectedProduct}
                />
            )}

            {/* Mobile Drawer Backdrop */}
            {isFilterOpen && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-30 md:hidden"
                    onClick={() => setIsFilterOpen(false)}
                ></div>
            )}
        </div>
    );
};
