import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const BrandStrip: React.FC = () => {
    const brands = [
        "HONDA", "YAMAHA", "KTM", "DUCATI", "BMW", "KAWASAKI", "DAYTONA",
        "SUZUKI", "TRIUMPH", "APRILIA", "HARLEY-DAVIDSON", "MV AGUSTA"
    ];

    const firstText = useRef<HTMLDivElement>(null);
    const secondText = useRef<HTMLDivElement>(null);
    const slider = useRef<HTMLDivElement>(null);

    let xPercent = 0;
    let direction = -1;
    let velocity = 0;

    useEffect(() => {
        let animationId: number;

        const animate = () => {
            if (xPercent <= -100) {
                xPercent = 0;
            }
            if (xPercent > 0) {
                xPercent = -100;
            }

            if (firstText.current && secondText.current) {
                gsap.set(firstText.current, { xPercent: xPercent });
                gsap.set(secondText.current, { xPercent: xPercent });
            }

            // Velocity decay for smooth return to base speed
            velocity = velocity * 0.95;

            // Base speed + velocity influence
            const speed = 0.05 + Math.abs(velocity * 0.0005);

            xPercent += speed * direction;
            animationId = requestAnimationFrame(animate);
        };

        // Start animation loop
        animationId = requestAnimationFrame(animate);

        // ScrollTrigger to capture velocity and direction
        const trigger = ScrollTrigger.create({
            trigger: document.documentElement,
            start: 0,
            end: "max",
            onUpdate: (self) => {
                const vel = self.getVelocity();
                if (Math.abs(vel) > 1) { // Threshold to avoid jitter
                    velocity = vel;
                    direction = vel > 0 ? -1 : 1;
                }
            }
        });

        return () => {
            cancelAnimationFrame(animationId);
            trigger.kill();
        };
    }, []);

    return (
        <div className="w-full bg-moto-gray border-y border-gray-800 py-14 overflow-hidden">
            <div className="relative flex whitespace-nowrap overflow-hidden">
                <div ref={slider} className="flex relative">
                    <div ref={firstText} className="flex gap-16 items-center pr-16 will-change-transform">
                        {brands.map((brand, i) => (
                            <h3 key={i} className="text-5xl md:text-7xl font-black text-transparent stroke-text hover:text-moto-red transition-colors cursor-default uppercase italic tracking-tighter opacity-40 hover:opacity-100 duration-300" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
                                {brand}
                            </h3>
                        ))}
                    </div>
                    <div ref={secondText} className="flex gap-16 items-center pr-16 will-change-transform absolute left-full top-0">
                        {brands.map((brand, i) => (
                            <h3 key={`dup-${i}`} className="text-5xl md:text-7xl font-black text-transparent stroke-text hover:text-moto-red transition-colors cursor-default uppercase italic tracking-tighter opacity-40 hover:opacity-100 duration-300" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
                                {brand}
                            </h3>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
