import React, { useState, useEffect } from 'react';
import { PRODUCTS } from './constants';
import { Product, CartItem, Order } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BrandStrip } from './components/BrandStrip';
import { LegendaryRide } from './components/LegendaryRide';
import { Features } from './components/Features';
import { CategoryShowcase } from './components/CategoryShowcase';
import { About } from './components/About';
import { Newsletter } from './components/Newsletter';
import { Shop } from './components/Shop';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { Contact } from './components/Contact';
import { Dashboard } from './components/Dashboard';
import { supabaseService } from './services/supabaseService';
import { supabase } from './supabase';

import Lenis from 'lenis';

const App = () => {
  const [view, setView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<any>(null);

  // Products State
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);

  // Persistent Cart State (Keep Cart local for now as it's session based usually, or could be DB)
  // For simplicity and speed, keeping Cart in LocalStorage is fine for guest checkout
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('motoverse_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Effects for Data Fetching ---
  useEffect(() => {
    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [productsData, ordersData] = await Promise.all([
          supabaseService.getProducts(),
          supabaseService.getOrders()
        ]);

        if (productsData.length === 0) {
          // Seed initial data if empty (optional, or just use constant)
          // For now, if empty, we might want to fallback to constants or just show empty
          // But let's assume we want to use the constants if DB is empty to start
          // NOTE: This might duplicate if not careful, but for first run it's okay.
          // Better approach: Just set state. If empty, dashboard will show empty.
          // User can add products via dashboard.
          // OR: We can setAllProducts(PRODUCTS) if we want to fallback to hardcoded
          // But that defeats the purpose of "persistence" if we don't save them back.
          // Let's just load what's there.
          if (productsData.length === 0) {
            // Optional: Auto-seed?
            // await Promise.all(PRODUCTS.map(p => supabaseService.addProduct(p)));
            // const seeded = await supabaseService.getProducts();
            // setAllProducts(seeded);
            setAllProducts(PRODUCTS); // Fallback for display if DB empty, but won't be editable in DB yet
          } else {
            setAllProducts(productsData);
          }
        } else {
          setAllProducts(productsData);
        }

        setOrders(ordersData);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    // Check for admin hash
    if (window.location.hash === '#admin') {
      setView('login');
    }

    // Listen for hash changes
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setView('login');
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    // Auth State Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && window.location.hash === '#admin') {
        setView('dashboard');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && window.location.hash === '#admin') {
        setView('dashboard');
      }
    });

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('motoverse_cart', JSON.stringify(cart));
  }, [cart]);

  // --- Handlers ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleNavigate = (page: string) => {
    setView(page);
    if (page !== 'shop') setSelectedCategory(undefined);
    window.scrollTo(0, 0);
  }

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setView('shop');
    window.scrollTo(0, 0);
  }

  const processCheckout = async (name: string, phone: string, address: string) => {
    const newOrder: Order = {
      id: crypto.randomUUID(),
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      items: [...cart],
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      date: Date.now(),
      status: 'pending'
    };

    // 1. Save Order to Supabase
    const savedOrder = await supabaseService.addOrder(newOrder);
    if (savedOrder) {
      setOrders(prev => [savedOrder, ...prev]);
    } else {
      alert("Failed to save order to database. Proceeding to WhatsApp anyway.");
    }

    // 2. Create WhatsApp Link
    const itemSummary = cart.map(i => `- ${i.quantity}x ${i.name}`).join('%0a');
    const waMessage = `*New Order from MotoVerse!* 🏍️%0a%0a*Customer:* ${name}%0a*Phone:* ${phone}%0a*Address:* ${address}%0a%0a*Order Details:*%0a${itemSummary}%0a%0a*Total:* ${newOrder.total.toLocaleString()} MAD`;
    const waLink = `https://wa.me/1234567890?text=${waMessage}`; // Replace with your number

    // 3. Clear Cart & Redirect
    setCart([]);
    setView('home');
    window.open(waLink, '_blank');
    alert("Order placed! Redirecting to WhatsApp...");
  };

  const addProduct = async (p: Product) => {
    const saved = await supabaseService.addProduct(p);
    if (saved) {
      setAllProducts(prev => [...prev, saved]);
    }
  };

  const updateProduct = async (updated: Product) => {
    const saved = await supabaseService.updateProduct(updated);
    if (saved) {
      setAllProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
    }
  };

  const deleteProduct = async (id: string) => {
    const success = await supabaseService.deleteProduct(id);
    if (success) {
      setAllProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      setView('dashboard');
    }
  };

  // --- Render Logic ---
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-moto-black flex items-center justify-center">
        <div className="bg-moto-gray p-8 rounded-2xl border border-gray-800 w-full max-w-md text-center">
          <h2 className="text-2xl font-black text-white mb-6">Dealer Access</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-moto-dark p-4 rounded text-white border border-gray-700 outline-none focus:border-moto-red"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-moto-dark p-4 rounded text-white border border-gray-700 outline-none focus:border-moto-red"
            />
            <button type="submit" className="bg-moto-red text-white font-bold py-3 rounded hover:bg-red-600 transition-colors uppercase tracking-widest">
              Enter Showroom
            </button>
          </form>
          <button onClick={() => setView('home')} className="text-gray-500 text-xs underline mt-4">Back to Store</button>
        </div>
      </div>
    );
  }

  if (view === 'dashboard') {
    if (!session) {
      setView('login');
      return null;
    }
    return <Dashboard
      orders={orders}
      products={allProducts}
      onAddProduct={addProduct}
      onUpdateProduct={updateProduct}
      onDeleteProduct={deleteProduct}
      onLogout={async () => {
        await supabase.auth.signOut();
        setView('home');
      }}
    />;
  }

  return (
    <div className="min-h-screen bg-moto-black text-white font-sans selection:bg-moto-red selection:text-white">
      <Navbar cartCount={cartCount} onNavigate={handleNavigate} currentPage={view} />

      <main>
        {view === 'home' && (
          <>
            <Hero onShopNow={() => handleNavigate('shop')} />
            <BrandStrip />
            <LegendaryRide />
            <Features />
            <CategoryShowcase onSelectCategory={handleCategorySelect} />
            <About />
            <Newsletter />
          </>
        )}

        {view === 'shop' && <Shop products={allProducts} onAddToCart={addToCart} initialCategory={selectedCategory} />}
        {view === 'cart' && <CartView items={cart} onUpdateQty={updateQty} onRemove={removeFromCart} onCheckout={() => setView('checkout')} />}
        {view === 'checkout' && <CheckoutView items={cart} onConfirm={processCheckout} />}
        {view === 'contact' && <Contact />}
        {view === 'about' && <About />}
      </main>

      <footer className="bg-moto-dark border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-gray-700 mb-6">
            Moto<span className="text-gray-600">Verse</span>
          </h1>
                    <p className="text-gray-600 text-sm mb-8">
            &copy; 2024 MotoVerse. All rights reserved. <br />
            Designed by{" "}
            <a
              href="https://khalidbentisse.42web.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:uppercase hover:underline"
            >
              khalid bentisse
            </a>.
          </p>

        </div>
      </footer>
    </div>
  );
};

export default App;
