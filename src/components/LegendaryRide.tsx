import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const LegendaryRide: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const glossRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        const container = containerRef.current;
        const gloss = glossRef.current;
        const content = contentRef.current;
        const image = imageRef.current;
        const title = titleRef.current;

        if (!card || !container || !gloss || !content || !image || !title) return;

        // GSAP Context for easy cleanup
        const ctx = gsap.context(() => {
            // Set initial transform perspective
            gsap.set(container, { perspective: 1000 });
            gsap.set(card, { transformStyle: "preserve-3d", transformOrigin: "center center" });
            gsap.set(content, { transformStyle: "preserve-3d" });

            // Mouse move handler
            const onMouseMove = (e: MouseEvent) => {
                if (window.innerWidth < 768) return;

                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;

                // Calculate rotation (Inverted Tilt: move towards cursor)
                // Max rotation ±12deg as requested
                const rotateX = (mouseY / (rect.height / 2)) * -12;
                const rotateY = (mouseX / (rect.width / 2)) * 12;

                // Gloss movement calculation
                // Shift gloss opposite to mouse or tracking mouse for reflection effect
                // We'll track mouse to simulate a light source moving with the cursor
                const glossX = (mouseX / (rect.width / 2)) * 100;
                const glossY = (mouseY / (rect.height / 2)) * 100;

                // Apply transforms with GSAP for performance
                gsap.to(card, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    duration: 0.4,
                    ease: "power2.out",
                    overwrite: "auto"
                });

                // Parallax effects for inner elements
                gsap.to(image, {
                    x: mouseX * 0.05,
                    y: mouseY * 0.05,
                    duration: 0.4,
                    ease: "power2.out"
                });

                gsap.to(title, {
                    x: mouseX * 0.02,
                    y: mouseY * 0.02,
                    duration: 0.4,
                    ease: "power2.out"
                });

                // Gloss effect
                gsap.to(gloss, {
                    x: `${glossX}%`,
                    y: `${glossY}%`,
                    opacity: 0.6, // Reveal gloss on hover
                    duration: 0.4,
                    ease: "power2.out"
                });
            };

            // Mouse leave handler
            const onMouseLeave = () => {
                // Soft Return Animation: Spring physics
                gsap.to(card, {
                    rotationX: 0,
                    rotationY: 0,
                    duration: 1.2,
                    ease: "elastic.out(1, 0.5)", // Low damping, medium tension
                    overwrite: "auto"
                });

                // Reset inner elements
                gsap.to([image, title], {
                    x: 0,
                    y: 0,
                    duration: 1.2,
                    ease: "elastic.out(1, 0.5)"
                });

                // Hide gloss
                gsap.to(gloss, {
                    opacity: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });
            };

            // Mouse enter handler (optional, for initial state setup if needed)
            const onMouseEnter = () => {
                // Scale up slightly on hover for that "active" feel
                gsap.to(card, {
                    scale: 1.02,
                    duration: 0.3,
                    ease: "power2.out"
                });
            };

            // Add event listeners to the container or card
            // Using container for broader hit area if needed, but card is specific
            card.addEventListener('mousemove', onMouseMove);
            card.addEventListener('mouseleave', onMouseLeave);
            card.addEventListener('mouseenter', onMouseEnter);

            // Cleanup function for listeners is handled by return of useEffect, 
            // but we can also remove them here if we wanted to be explicit in context
        }, containerRef); // Scope to container

        return () => ctx.revert(); // Cleanup GSAP context
    }, []);

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

                    {/* 3D Tilt Card Container */}
                    <div ref={containerRef} className="flex-1 w-full flex justify-center perspective-1000">
                        <div
                            ref={cardRef}
                            className="relative w-full max-w-md h-[400px] md:h-[500px] cursor-pointer will-change-transform"
                        >
                            <div ref={contentRef} className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black rounded-2xl border border-gray-700 shadow-2xl overflow-hidden group">
                                {/* Carbon Fiber Texture */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>

                                {/* Image Layer */}
                                <div className="h-3/4 overflow-hidden relative z-10">
                                    <img
                                        ref={imageRef}
                                        src="https://wniwqxfeprjcjertvwug.supabase.co/storage/v1/object/public/images/0.45964625825302763.png"
                                        className="w-full h-full object-cover scale-110" // Initial scale to allow for parallax movement
                                        alt="Ninja H2"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                </div>

                                {/* Text Content Layer */}
                                <div ref={titleRef} className="absolute bottom-8 left-8 z-20">
                                    <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase drop-shadow-lg">Ninja H2 Carbon</h3>
                                    <div className="h-1 w-12 bg-moto-red mt-2 shadow-[0_0_10px_rgba(255,0,0,0.5)]"></div>
                                </div>

                                {/* Gloss Layer */}
                                <div
                                    ref={glossRef}
                                    className="absolute inset-0 pointer-events-none z-30 opacity-0"
                                    style={{
                                        background: 'radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)',
                                        mixBlendMode: 'overlay',
                                        transform: 'translate(-50%, -50%)', // Center the gradient on its coordinate
                                        width: '200%', // Make it large enough to cover
                                        height: '200%',
                                        top: '-50%',
                                        left: '-50%'
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
