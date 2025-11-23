import React from 'react';

export const About: React.FC = () => {
    return (
        <div className="bg-moto-black py-24 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute w-96 h-96 bg-moto-red rounded-full blur-[150px] -top-20 -left-20"></div>
                <div className="absolute w-96 h-96 bg-blue-900 rounded-full blur-[150px] bottom-0 right-0"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1">
                        <h4 className="text-moto-red font-bold tracking-[0.3em] uppercase mb-4">Who We Are</h4>
                        <h2 className="text-5xl font-black text-white uppercase italic leading-none mb-8">
                            Born in the <br /><span className="text-gray-600">Dust & Speed</span>
                        </h2>
                        <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
                            <p>
                                MotoVerse started with a simple obsession: the perfect ride. Founded in the heart of Casablanca, we realized that the thrill of two wheels wasn't just about transportation—it was about freedom, mechanics, and the community that rides together.
                            </p>
                            <p>
                                We aren't just a dealership. We are a sanctuary for petrol-heads. Whether you are looking for a reliable Boxer 150X for the daily commute or a track-ready Ducati Panigale V4, our mission is to connect man and machine.
                            </p>
                            <p>
                                Our team consists of dedicated enthusiasts and master mechanics who live and breathe motorcycles, ensuring that you get not just a bike, but an experience backed by real expertise.
                            </p>
                        </div>

                        <div className="mt-10 flex gap-8">
                            <div>
                                <p className="text-4xl font-black text-white">15+</p>
                                <p className="text-sm text-gray-500 uppercase font-bold">Years Experience</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-white">5k+</p>
                                <p className="text-sm text-gray-500 uppercase font-bold">Bikes Sold</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        <div className="absolute -inset-4 border-2 border-moto-red/30 rounded-xl transform translate-x-4 translate-y-4 z-0"></div>
                        <img
                            src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1200&auto=format&fit=crop"
                            className="w-full rounded-xl grayscale hover:grayscale-0 transition-all duration-700 relative z-10 shadow-2xl"
                            alt="MotoVerse Showroom"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
