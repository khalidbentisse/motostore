import React from 'react';
import { Icons } from './ui/Icons';

export const Contact: React.FC = () => (
    <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Header Section */}
        <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6 uppercase italic leading-none text-white">
                Get in <span className="text-moto-red">Touch</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Ready to ride? Have questions about our stock or need parts for your project?
                Our team of experts is standing by in Casablanca.
            </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-moto-gray p-8 rounded-2xl border border-gray-800 hover:border-moto-red/50 transition-all group text-center">
                <div className="bg-moto-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-moto-red group-hover:scale-110 transition-transform">
                    <Icons.MapPin className="w-8 h-8" />
                </div>
                <h3 className="font-black text-white text-xl uppercase mb-2">Showroom</h3>
                <p className="text-gray-400">Casablanca, Morocco<br />The Motorcycle District</p>
            </div>

            <div className="bg-moto-gray p-8 rounded-2xl border border-gray-800 hover:border-moto-red/50 transition-all group text-center">
                <div className="bg-moto-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-moto-red group-hover:scale-110 transition-transform">
                    <Icons.Phone className="w-8 h-8" />
                </div>
                <h3 className="font-black text-white text-xl uppercase mb-2">Phone</h3>
                <p className="text-gray-400">+212 774 550 604<br />Mon-Sat: 9am - 8pm</p>
            </div>

            <div className="bg-moto-gray p-8 rounded-2xl border border-gray-800 hover:border-moto-red/50 transition-all group text-center">
                <div className="bg-moto-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-moto-red group-hover:scale-110 transition-transform">
                    <Icons.Mail className="w-8 h-8" />
                </div>
                <h3 className="font-black text-white text-xl uppercase mb-2">Email</h3>
                <p className="text-gray-400">khalidbentisse@gmail.com<br />khalidbentisse@gmail.com</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Contact Form - Takes up 7 columns */}
            <div className="lg:col-span-7 bg-moto-gray p-8 md:p-10 rounded-2xl border border-gray-800 shadow-xl">
                <h3 className="text-2xl font-black text-white uppercase italic mb-8">Send us a Message</h3>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-wider">Name</label>
                            <input type="text" className="w-full bg-moto-black/50 border border-gray-700 p-4 text-white rounded-xl focus:border-moto-red outline-none transition-colors" placeholder="Your Name" />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-wider">Email</label>
                            <input type="email" className="w-full bg-moto-black/50 border border-gray-700 p-4 text-white rounded-xl focus:border-moto-red outline-none transition-colors" placeholder="email@example.com" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-wider">Subject</label>
                        <select className="w-full bg-moto-black/50 border border-gray-700 p-4 text-white rounded-xl focus:border-moto-red outline-none transition-colors appearance-none">
                            <option>General Inquiry</option>
                            <option>Test Ride Request</option>
                            <option>Parts & Service</option>
                            <option>Financing</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-wider">Message</label>
                        <textarea rows={5} className="w-full bg-moto-black/50 border border-gray-700 p-4 text-white rounded-xl focus:border-moto-red outline-none transition-colors resize-none" placeholder="How can we help you ride?"></textarea>
                    </div>
                    <button className="w-full bg-moto-red text-white font-black py-4 rounded-xl uppercase tracking-widest hover:bg-red-600 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-red-900/20">
                        Send Message
                    </button>
                </form>
            </div>

            {/* Map & Social - Takes up 5 columns */}
            <div className="lg:col-span-5 flex flex-col gap-8">
                {/* Map Card */}
                <div className="h-[300px] lg:h-auto lg:flex-1 bg-moto-gray rounded-2xl overflow-hidden border border-gray-800 relative shadow-xl group">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106376.72943926233!2d-7.669206532154644!3d33.57224998546496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd4778aa113b%3A0xb12219c7f470275e!2sCasablanca%2C%20Morocco!5e0!3m2!1sen!2sus!4v1715632145632!5m2!1sen!2sus"
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Casablanca Location"
                        className="absolute inset-0 w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    ></iframe>
                    <div className="absolute bottom-4 left-4 bg-moto-black/90 backdrop-blur text-white px-4 py-2 rounded-lg text-xs font-bold uppercase border border-gray-700">
                        <span className="text-moto-red">HQ:</span> Casablanca
                    </div>
                </div>

                {/* Social Links */}
                <div className="bg-moto-gray p-8 rounded-2xl border border-gray-800">
                    <h3 className="text-sm font-black uppercase text-gray-500 mb-6 tracking-widest">Follow the Action</h3>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white p-4 rounded-xl font-bold transition-all group">
                            <span className="flex items-center gap-3"><Icons.Facebook className="w-5 h-5" /> Facebook</span>
                            <Icons.ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                        <button className="w-full flex items-center justify-between bg-[#E4405F]/10 hover:bg-[#E4405F] text-[#E4405F] hover:text-white p-4 rounded-xl font-bold transition-all group">
                            <span className="flex items-center gap-3"><Icons.Instagram className="w-5 h-5" /> Instagram</span>
                            <Icons.ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                        <button className="w-full flex items-center justify-between bg-[#FF0000]/10 hover:bg-[#FF0000] text-[#FF0000] hover:text-white p-4 rounded-xl font-bold transition-all group">
                            <span className="flex items-center gap-3"><Icons.Youtube className="w-5 h-5" /> YouTube</span>
                            <Icons.ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
