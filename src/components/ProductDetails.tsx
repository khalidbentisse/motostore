import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Icons } from './ui/Icons';
import { Product } from '../types';

interface ProductDetailsProps {
    product: Product;
    onClose: () => void;
    onAddToCart: (p: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose, onAddToCart }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(modalRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
        )
            .fromTo(contentRef.current,
                { y: 50, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
                "-=0.2"
            );

        // m7bos
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleClose = () => {
        gsap.to(contentRef.current, { y: 50, opacity: 0, scale: 0.95, duration: 0.3 });
        gsap.to(modalRef.current, {
            opacity: 0,
            duration: 0.3,
            onComplete: onClose
        });
    };

    return (
        <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                ref={contentRef}
                className="bg-moto-gray w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-gray-700 flex flex-col md:flex-row max-h-[90vh]"
            >
                {/* Image  */}
                <div className="w-full md:w-1/2 relative h-64 md:h-auto bg-black">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={handleClose}
                        className="absolute top-4 left-4 md:hidden bg-black/50 p-2 rounded-full text-white hover:bg-moto-red transition-colors"
                    >
                        <Icons.X />
                    </button>
                </div>

                {/* lm3lomat */}
                <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-moto-red font-bold uppercase tracking-wider text-sm">{product.brand}</span>
                            <h2 className="text-3xl font-black text-white mt-1">{product.name}</h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="hidden md:block text-gray-500 hover:text-white transition-colors"
                        >
                            <Icons.X />
                        </button>
                    </div>

                    <div className="text-3xl font-black text-moto-red mb-6">
                        {product.price.toLocaleString()} MAD
                    </div>

                    <div className="prose prose-invert mb-8 text-gray-300 leading-relaxed">
                        <p>{product.description}</p>
                    </div>

                    {product.specs && (
                        <div className="bg-moto-black/30 rounded-xl p-6 mb-8 border border-gray-800">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Technical Specifications</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase">Engine</span>
                                    <span className="text-white font-bold">{product.specs.engine || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase">Power</span>
                                    <span className="text-white font-bold">{product.specs.power || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase">Weight</span>
                                    <span className="text-white font-bold">{product.specs.weight || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-auto pt-6 border-t border-gray-800 flex gap-4">
                        <button
                            onClick={() => {
                                onAddToCart(product);
                                handleClose();
                            }}
                            className="flex-1 bg-moto-red text-white font-black py-4 rounded-xl hover:bg-red-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                        >
                            <Icons.Plus /> Add to Garage
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
