import React from 'react';
import { Icons } from './ui/Icons';

export const Features: React.FC = () => {
    const features = [
        {
            icon: <Icons.Award />,
            title: "Certified Excellence",
            desc: "Every bike is inspected by master technicians."
        },
        {
            icon: <Icons.Zap />,
            title: "Expert Support",
            desc: "Professional guidance to find your perfect machine."
        },
        {
            icon: <Icons.Shield />,
            title: "Global Warranty",
            desc: "Comprehensive coverage on all new models."
        }
    ];

    return (
        <div className="py-20 bg-gradient-to-b from-moto-black to-moto-dark">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {features.map((f, i) => (
                        <div key={i} className="bg-moto-gray/20 p-8 rounded-2xl border border-gray-800 hover:border-moto-red/50 transition-all duration-300 hover:-translate-y-2 group">
                            <div className="bg-moto-dark w-16 h-16 rounded-full flex items-center justify-center text-moto-red mb-6 group-hover:scale-110 transition-transform border border-gray-700 group-hover:border-moto-red">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
