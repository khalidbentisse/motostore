import React from 'react';
import { Icons } from './ui/Icons';
import { Category } from '../types';

interface CategoryShowcaseProps {
    onSelectCategory: (c: string) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ onSelectCategory }) => {
    return (
        <div className="py-20 max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-black mb-12 uppercase italic">
                Shop By <span className="text-moto-red">Category</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:h-[500px]">
                {/* Bikes */}
                <div
                    onClick={() => onSelectCategory(Category.BIKES)}
                    className="relative h-64 md:h-auto md:col-span-2 rounded-2xl overflow-hidden cursor-pointer group border border-gray-800"
                >
                    <img
                        src="https://images.pexels.com/photos/1191109/pexels-photo-1191109.jpeg"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-100"
                        alt="Motorcycles"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
                        <h3 className="text-3xl font-black uppercase italic">Motorcycles</h3>
                        <p className="text-gray-300 mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                            Browse Inventory <Icons.ArrowRight />
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Parts */}
                    <div
                        onClick={() => onSelectCategory(Category.PARTS)}
                        className="relative h-48 md:h-auto flex-1 rounded-2xl overflow-hidden cursor-pointer group border border-gray-800"
                    >
                        <img
                            src="https://www.cyclesolutions.com/wp-content/uploads/2021/07/diamond-cut-image.jpg"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-100"
                            alt="Parts"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-6 flex flex-col justify-end">
                            <h3 className="text-2xl font-black uppercase italic">Performance Parts</h3>
                        </div>
                    </div>

                    {/* Gear */}
                    <div
                        onClick={() => onSelectCategory(Category.ACCESSORIES)}
                        className="relative h-48 md:h-auto flex-1 rounded-2xl overflow-hidden cursor-pointer group border border-gray-800"
                    >
                        <img
                            src="https://cdn.partzilla.com/media/ATGATT-motorcycle-riding-gear.jpg"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70 group-hover:opacity-100"
                            alt="Accessories"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-6 flex flex-col justify-end">
                            <h3 className="text-2xl font-black uppercase italic">Riding Gear</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};
