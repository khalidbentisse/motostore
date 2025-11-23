import React, { useState, useRef } from 'react';

export const LegendaryRide: React.FC = () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current || window.innerWidth < 768) return; // 7bs ftelephone

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -15;
        const rotateY = ((x - centerX) / centerX) * 15;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
        setIsHovered(false);
    };

    return (
        <div className="py-24 bg-moto-black overflow-hidden relative">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-moto-red/10 via-transparent to-transparent pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="flex-1 z-10">
                        <h4 className="text-moto-red font-bold tracking-[0.3em] uppercase mb-4 animate-pulse-slow">Bike of the Month</h4>
                        <h2 className="text-5xl md:text-6xl font-black text-white uppercase italic leading-none mb-6">
                            Legendary <br />Status
                        </h2>
                        <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-md">
                            Experience the pinnacle of supercharged engineering. The Kawasaki Ninja H2 Carbon isn't just a bike; it's a statement of raw power and aerodynamic perfection.
                        </p>

                        <div className="grid grid-cols-3 gap-6 border-t border-gray-800 pt-8">
                            <div>
                                <p className="text-3xl md:text-4xl font-black text-white">228<span className="text-sm align-top text-moto-red ml-1">HP</span></p>
                                <p className="text-xs text-gray-500 uppercase font-bold mt-1">Horsepower</p>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-black text-white">330<span className="text-sm align-top text-moto-red ml-1">KM/H</span></p>
                                <p className="text-xs text-gray-500 uppercase font-bold mt-1">Top Speed</p>
                            </div>
                            <div>
                                <p className="text-3xl md:text-4xl font-black text-white">H2<span className="text-sm align-top text-moto-red ml-1">R</span></p>
                                <p className="text-xs text-gray-500 uppercase font-bold mt-1">Engine</p>
                            </div>
                        </div>
                    </div>

                    {/* 3D Tilt Card */}
                    <div className="flex-1 perspective-1000 w-full flex justify-center">
                        <div
                            ref={cardRef}
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={handleMouseLeave}
                            className="relative w-full max-w-md h-[400px] md:h-[500px] transition-transform duration-100 ease-out preserve-3d cursor-pointer"
                            style={{
                                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1}, 1)`
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black rounded-2xl border border-gray-700 shadow-2xl overflow-hidden preserve-3d group">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>

                                <div className="h-3/4 overflow-hidden preserve-3d">
                                    <img
                                        src="https://wniwqxfeprjcjertvwug.supabase.co/storage/v1/object/public/images/0.45964625825302763.png"
                                        className="w-full h-full object-cover transform translate-z-10 group-hover:scale-110 transition-transform duration-700"
                                        style={{ transform: 'translateZ(20px)' }}
                                        alt="Ninja H2"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                </div>

                                <div className="absolute bottom-8 left-8 preserve-3d" style={{ transform: 'translateZ(60px)' }}>
                                    <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase">Ninja H2 Carbon</h3>
                                    <div className="h-1 w-12 bg-moto-red mt-2"></div>
                                </div>

                                <div
                                    className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none"
                                    style={{
                                        transform: `translateX(${rotation.y * 2}px) translateY(${rotation.x * 2}px)`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};
