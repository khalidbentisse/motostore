import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Icons } from './ui/Icons';

interface HeroProps {
    onShopNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Text Reveal
            gsap.fromTo(".hero-line",
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.2 }
            );

            // HUD Animation
            const rpmObj = { val: 0 };
            gsap.to(rpmObj, {
                val: 14500,
                duration: 2,
                ease: "power2.out",
                delay: 1,
                onUpdate: () => {
                    const el = document.getElementById("rpm-counter");
                    if (el) el.innerText = Math.floor(rpmObj.val).toString();
                }
            });

            gsap.fromTo(".hud-panel",
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 1.2 }
            );

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-moto-black">
            {/* Video Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-black/30 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-moto-black/90 via-moto-black/40 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-moto-black via-transparent to-transparent z-10"></div>
                <video
                    className="w-full h-full object-cover scale-x-[-1] opacity-80"
                    autoPlay
                    muted
                    loop
                    playsInline
                >
                    <source src="https://res.cloudinary.com/dwk9hwmci/video/upload/v1763792766/mixkit-motorcyclist-crossing-a-desert-surrounded-by-mountains-39926-hd-ready_omfn3s.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Content */}
            <div className="relative z-20 h-full max-w-7xl mx-auto px-4 flex flex-col justify-center">
                <div className="max-w-5xl">
                    <div className="overflow-hidden mb-2">
                        <p className="hero-line text-moto-red font-bold tracking-[0.5em] text-sm uppercase">Authorized Dealer</p>
                    </div>
                    <div className="overflow-hidden -mb-4 md:-mb-8">
                        <h1 className="hero-line text-[12vw] md:text-[140px] font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-600 leading-none tracking-tighter italic uppercase">
                            PURE
                        </h1>
                    </div>
                    <div className="overflow-hidden mb-8">
                        <h1 className="hero-line text-[12vw] md:text-[140px] font-black text-white leading-none tracking-tighter italic uppercase mix-blend-overlay">
                            SPEED
                        </h1>
                    </div>

                    <div className="overflow-hidden max-w-xl mb-10">
                        <p className="hero-line text-gray-400 text-lg md:text-xl border-l-2 border-moto-red pl-6">
                            The world's finest gasoline machines from Honda, Yamaha, KTM, and Ducati.
                            No batteries. Just adrenaline.
                        </p>
                    </div>

                    <div className="hero-line">
                        <button
                            onClick={onShopNow}
                            className="group bg-moto-red hover:bg-white hover:text-moto-red text-white px-10 py-5 text-lg font-black uppercase tracking-widest transition-all transform -skew-x-12 hover:skew-x-0"
                        >
                            <div className="flex items-center gap-3 skew-x-12 group-hover:skew-x-0 transition-transform">
                                View Showroom <Icons.ArrowRight />
                            </div>
                        </button>
                    </div>
                </div>

                {/* HUD Elements */}
                <div className="hud-panel absolute right-4 bottom-32 md:bottom-1/2 md:translate-y-1/2 hidden md:flex flex-col gap-4 items-end">
                    <div className="bg-black/40 backdrop-blur-lg border border-white/10 p-6 rounded-xl w-72 skew-x-[-10deg] hover:skew-x-0 transition-transform duration-500">
                        <div className="flex justify-between items-baseline border-b border-white/10 pb-2 mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Engine Load</span>
                            <span className="text-moto-red font-black text-lg animate-pulse">98%</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">RPM</span>
                            <span id="rpm-counter" className="text-5xl font-mono font-black text-white tracking-tighter">0</span>
                        </div>
                    </div>

                    <div className="bg-moto-red p-6 w-64 skew-x-[-10deg] shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">New Arrival</p>
                        <p className="text-white text-2xl font-black italic uppercase">H2 Carbon</p>
                    </div>
                </div>
            </div>

            {/* Scroll Hint */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-gray-500">
                <Icons.ArrowRight className="rotate-90 w-6 h-6" />
            </div>
        </div>
    );
};
