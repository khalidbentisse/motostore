import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Icons } from './ui/Icons';
import { Product } from '../types';

interface ProductDetailsProps {
    product: Product;
    products: Product[]; // Full list for related items
    onClose: () => void;
    onAddToCart: (p: Product) => void;
    onSelectProduct: (p: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, products, onClose, onAddToCart, onSelectProduct }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isSpecsOpen, setIsSpecsOpen] = useState(true);

    // Filter related products (same category, exclude current)
    const relatedProducts = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    useEffect(() => {
        // Entrance Animation
        const tl = gsap.timeline();
        tl.fromTo(modalRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.4 }
        )
            .fromTo(contentRef.current,
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
                "-=0.2"
            )
            .fromTo(".animate-up",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out" },
                "-=0.4"
            );

        // Lock Body Scroll
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleClose = () => {
        gsap.to(contentRef.current, { y: 100, opacity: 0, duration: 0.4, ease: "power3.in" });
        gsap.to(modalRef.current, {
            opacity: 0,
            duration: 0.4,
            delay: 0.1,
            onComplete: onClose
        });
    };

    // Parallax Effect
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!heroRef.current || !imageRef.current) return;
        const { left, top, width, height } = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        gsap.to(imageRef.current, {
            x: x * 30,
            y: y * 30,
            rotationY: x * 5,
            rotationX: -y * 5,
            duration: 0.5,
            ease: "power2.out"
        });
    };

    const handleMouseLeave = () => {
        if (imageRef.current) {
            gsap.to(imageRef.current, {
                x: 0,
                y: 0,
                rotationY: 0,
                rotationX: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.5)"
            });
        }
    };

    return (
        <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-y-auto">
            <div
                ref={contentRef}
                className="relative w-full max-w-6xl min-h-screen md:min-h-0 md:h-[90vh] bg-[#0a0a0a] md:rounded-3xl overflow-hidden shadow-2xl border border-white/5 flex flex-col md:flex-row"
            >
                {/* Close Button (Mobile Sticky) */}
                <button
                    onClick={handleClose}
                    className="fixed top-4 right-4 z-50 md:absolute md:top-6 md:right-6 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-moto-red transition-colors border border-white/10"
                >
                    <Icons.X className="w-5 h-5" />
                </button>

                {/* Left: Hero Image Section */}
                <div
                    ref={heroRef}
                    className="w-full md:w-3/5 h-[50vh] md:h-full relative overflow-hidden bg-gradient-to-b from-gray-900 to-black group cursor-crosshair"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>

                    {/* Ambient Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-moto-red/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    <img
                        ref={imageRef}
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover scale-110 transform transition-transform duration-100"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90 md:opacity-60"></div>

                    {/* Hero Text Overlay */}
                    <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-10">
                        <span className="inline-block px-3 py-1 bg-moto-red text-white text-[10px] font-bold uppercase tracking-widest rounded mb-4 animate-up">
                            {product.brand}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic leading-none tracking-tighter animate-up">
                            {product.name}
                        </h1>
                    </div>
                </div>

                {/* Right: Details & Specs */}
                <div className="w-full md:w-2/5 h-full overflow-y-auto custom-scrollbar bg-[#0a0a0a] relative">
                    <div className="p-8 md:p-12 pb-32">
                        {/* Price Header */}
                        <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-8 animate-up">
                            <div>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Starting Price</p>
                                <p className="text-3xl font-black text-white tracking-tight">{product.price.toLocaleString()} <span className="text-lg text-moto-red">MAD</span></p>
                            </div>
                            <div className="flex gap-2">
                                {product.condition === 'Used' && <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold uppercase rounded">Pre-Owned</span>}
                                {product.fuelType === 'Electric' && <span className="px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-bold uppercase rounded">Electric</span>}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-10 animate-up">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Icons.Search className="w-4 h-4 text-moto-red" /> Overview
                            </h3>
                            <p className="text-gray-400 leading-relaxed text-sm font-light">
                                {product.description}
                            </p>
                        </div>

                        {/* Expandable Specs Panel */}
                        <div className="mb-10 border border-white/10 rounded-xl overflow-hidden bg-white/5 animate-up">
                            <button
                                onClick={() => setIsSpecsOpen(!isSpecsOpen)}
                                className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <Icons.Sliders className="w-4 h-4 text-moto-red" /> Technical Specs
                                </span>
                                {isSpecsOpen ? <Icons.ChevronUp className="w-4 h-4 text-gray-500" /> : <Icons.ChevronDown className="w-4 h-4 text-gray-500" />}
                            </button>

                            <div
                                className={`grid grid-cols-2 gap-4 p-4 transition-all duration-500 ease-in-out ${isSpecsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden py-0'}`}
                            >
                                <div className="bg-black/40 p-3 rounded border border-white/5">
                                    <div className="flex items-center gap-2 mb-1 text-gray-500">
                                        <Icons.Activity className="w-3 h-3" />
                                        <span className="text-[10px] uppercase font-bold">Engine</span>
                                    </div>
                                    <p className="text-white font-bold text-sm">{product.specs?.engine || 'N/A'}</p>
                                </div>
                                <div className="bg-black/40 p-3 rounded border border-white/5">
                                    <div className="flex items-center gap-2 mb-1 text-gray-500">
                                        <Icons.Zap className="w-3 h-3" />
                                        <span className="text-[10px] uppercase font-bold">Power</span>
                                    </div>
                                    <p className="text-white font-bold text-sm">{product.specs?.power || 'N/A'}</p>
                                </div>
                                <div className="bg-black/40 p-3 rounded border border-white/5">
                                    <div className="flex items-center gap-2 mb-1 text-gray-500">
                                        <Icons.Layers className="w-3 h-3" />
                                        <span className="text-[10px] uppercase font-bold">Weight</span>
                                    </div>
                                    <p className="text-white font-bold text-sm">{product.specs?.weight || 'N/A'}</p>
                                </div>
                                <div className="bg-black/40 p-3 rounded border border-white/5">
                                    <div className="flex items-center gap-2 mb-1 text-gray-500">
                                        <Icons.Droplet className="w-3 h-3" />
                                        <span className="text-[10px] uppercase font-bold">Fuel</span>
                                    </div>
                                    <p className="text-white font-bold text-sm">{product.fuelType || 'Petrol'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Related Products Carousel */}
                        {relatedProducts.length > 0 && (
                            <div className="mb-8 animate-up">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">You Might Also Like</h3>
                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                                    {relatedProducts.map(rp => (
                                        <div
                                            key={rp.id}
                                            className="min-w-[140px] w-[140px] snap-start cursor-pointer group/card"
                                            onClick={() => {
                                                onSelectProduct(rp);
                                                if (contentRef.current) contentRef.current.scrollTop = 0;
                                            }}
                                        >
                                            <div className="h-24 rounded-lg overflow-hidden mb-2 relative">
                                                <img src={rp.image} alt={rp.name} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/20 group-hover/card:bg-transparent transition-colors"></div>
                                            </div>
                                            <p className="text-white text-xs font-bold truncate">{rp.name}</p>
                                            <p className="text-moto-red text-[10px] font-bold">{rp.price.toLocaleString()} MAD</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sticky CTA Bar */}
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-[#0a0a0a]/95 backdrop-blur border-t border-white/10 z-20">
                        <button
                            onClick={() => {
                                onAddToCart(product);
                                handleClose();
                            }}
                            className="w-full bg-moto-red text-white font-black py-4 rounded-xl hover:bg-red-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.4)] group"
                        >
                            <Icons.Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            <span>Reserve Machine</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
