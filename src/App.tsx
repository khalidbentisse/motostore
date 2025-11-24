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

  // Search Bar State
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);

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

    // Real-time subscriptions
    const ordersSubscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        console.log('Orders updated, refreshing...');
        supabaseService.getOrders().then(setOrders);
      })
      .subscribe();

    const productsSubscription = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        console.log('Products updated, refreshing...');
        supabaseService.getProducts().then(setAllProducts);
      })
      .subscribe();

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
    setIsSearchCollapsed(false); // Reset search state on nav
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
    const { data: savedOrder, error } = await supabaseService.addOrder(newOrder);
    if (savedOrder) {
      setOrders(prev => [savedOrder, ...prev]);
    } else {
      alert(`Failed to save order to database: ${error}. Proceeding to WhatsApp anyway.`);
    }

    // 2. Create WhatsApp Link
    const itemSummary = cart.map(i => `- ${i.quantity}x ${i.name}`).join('%0a');
    const waMessage = `*New Order from MotoVerse!* 🏍️%0a%0a*Customer Details:*%0aName: ${name}%0aPhone: ${phone}%0aAddress: ${address}%0a%0a*Order Summary:*%0a${itemSummary}%0a%0a*Total Amount:* ${newOrder.total.toLocaleString()} MAD`;
    const waLink = `https://wa.me/212770370033?text=${waMessage}`;

    // 3. Clear Cart & Redirect
    setCart([]);
    setView('home');

    // Use location.href to avoid popup blockers
    window.location.href = waLink;
  };

  const addProduct = async (p: Product) => {
    const saved = await supabaseService.addProduct(p);
    if (saved) {
      setAllProducts(prev => [...prev, saved]);
      return saved;
    }
    return null;
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

  const updateOrder = async (id: string, status: any) => {
    const success = await supabaseService.updateOrderStatus(id, status);
    if (success) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
    return success;
  };

  const deleteOrder = async (id: string) => {
    const success = await supabaseService.deleteOrder(id);
    if (success) {
      setOrders(prev => prev.filter(o => o.id !== id));
    }
    return success;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting login with:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      alert(error.message);
    } else {
      console.log('Login successful:', data);
      // The onAuthStateChange listener should handle the view switch, 
      // but we can force it here to be sure if the listener is slow
      if (data.session) {
        setSession(data.session);
        setView('dashboard');
      }
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
    console.log('Rendering Dashboard view. Session:', session);
    if (!session) {
      console.log('No session, redirecting to login');
      setView('login');
      return null;
    }
    return <Dashboard
      orders={orders}
      products={allProducts}
      onAddProduct={addProduct}
      onUpdateProduct={updateProduct}
      onDeleteProduct={deleteProduct}
      onUpdateOrder={updateOrder}
      onDeleteOrder={deleteOrder}
      onLogout={async () => {
        await supabase.auth.signOut();
        setView('home');
      }}
    />;
  }

  return (
    <div className="min-h-screen bg-moto-black text-white font-sans selection:bg-moto-red selection:text-white">
      <Navbar cartCount={cartCount} onNavigate={handleNavigate} currentPage={view} showSearchIcon={isSearchCollapsed && view === 'shop'} />

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

        {view === 'shop' && <Shop products={allProducts} onAddToCart={addToCart} initialCategory={selectedCategory} onSearchCollapse={setIsSearchCollapsed} />}
        {view === 'cart' && <CartView items={cart} onUpdateQty={updateQty} onRemove={removeFromCart} onCheckout={() => setView('checkout')} />}
        {view === 'checkout' && <CheckoutView items={cart} onConfirm={processCheckout} />}
        {view === 'contact' && <Contact />}
        {view === 'about' && <About />}
      </main>

      <footer className="bg-moto-black border-t border-white/5 py-20 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-moto-red/50 to-transparent blur-sm"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          {/* Brand Mark */}
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white/10 mb-10 select-none">
            Moto<span className="text-moto-red/20">Verse</span>
          </h1>

          {/* Main Footer Text */}
          <div className="flex flex-col md:flex-row items-center gap-y-4 gap-x-8 text-[10px] md:text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
            <span className="hover:text-white transition-colors duration-500 cursor-default">© 2024 MotoVerse</span>

            {/* Separator */}
            <span className="hidden md:block w-1 h-1 bg-moto-red rounded-full shadow-[0_0_10px_var(--color-moto-red)]"></span>

            {/* Manifesto / Motto */}
            <span className="text-gray-400 italic tracking-widest">"Adrenaline in Every Gear"</span>

            {/* Separator */}
            <span className="hidden md:block w-1 h-1 bg-moto-red rounded-full shadow-[0_0_10px_var(--color-moto-red)]"></span>

            <span className="hover:text-white transition-colors duration-500 cursor-default">All Rights Reserved</span>
          </div>

          {/* Designer Credit - Cinematic/Tech feel */}
          <div className="mt-12 flex items-center gap-3 text-[9px] tracking-[0.3em] text-gray-700 uppercase group">
            <span className="group-hover:text-gray-500 transition-colors duration-300">Architected by</span>
            <a
              href="https://khalidbentisse.42web.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-moto-red hover:text-white transition-colors duration-300 font-black border-b border-transparent hover:border-moto-red pb-0.5"
            >
              Khalid Bentisse
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
