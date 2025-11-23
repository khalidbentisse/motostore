
import { Brand, Category, Product } from './types';

export const PRODUCTS: Product[] = [
  // BIKES
  {
    id: 'b1',
    name: 'CBR1000RR-R Fireblade SP',
    brand: Brand.HONDA,
    category: Category.BIKES,
    price: 295000,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop',
    description: 'Born from the racetrack technology, delivering pure performance.',
    specs: { engine: '999cc Inline-4', power: '215 HP', weight: '201 kg' }
  },
  {
    id: 'b2',
    name: 'YZF-R1M',
    brand: Brand.YAMAHA,
    category: Category.BIKES,
    price: 275000,
    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=800&auto=format&fit=crop',
    description: 'MotoGP technology for the street. The ultimate supersport machine.',
    specs: { engine: '998cc Crossplane 4', power: '197 HP', weight: '202 kg' }
  },
  {
    id: 'b3',
    name: '1290 Super Duke R',
    brand: Brand.KTM,
    category: Category.BIKES,
    price: 198000,
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=800&auto=format&fit=crop',
    description: 'The Beast. Naked agility with raw V-Twin power.',
    specs: { engine: '1301cc V-Twin', power: '180 HP', weight: '189 kg' }
  },
  {
    id: 'b4',
    name: 'Panigale V4 S',
    brand: Brand.DUCATI,
    category: Category.BIKES,
    price: 335000,
    image: 'https://images.unsplash.com/photo-1615172282427-9a5752d64a57?q=80&w=800&auto=format&fit=crop',
    description: 'A symphony of Italian design and engineering excellence.',
    specs: { engine: '1103cc Desmosedici', power: '210 HP', weight: '195 kg' }
  },
  {
    id: 'b5',
    name: 'Ninja H2 Carbon',
    brand: Brand.KAWASAKI,
    category: Category.BIKES,
    price: 360000,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c3d?q=80&w=800&auto=format&fit=crop',
    description: 'Supercharged engineering marvel.',
    specs: { engine: '998cc Supercharged', power: '228 HP', weight: '238 kg' }
  },
  {
    id: 'b6',
    name: 'Daytona Moto 2 765',
    brand: Brand.DAYTONA,
    category: Category.BIKES,
    price: 158000,
    image: 'https://images.unsplash.com/photo-1626847037657-fd3622613ce3?q=80&w=800&auto=format&fit=crop',
    description: 'The ultimate middleweight sports bike with precision handling.',
    specs: { engine: '765cc Triple', power: '128 HP', weight: '166 kg' }
  },
  {
    id: 'b7',
    name: 'Boxer 150X',
    brand: Brand.BOXER,
    category: Category.BIKES,
    price: 14500,
    image: 'https://images.unsplash.com/photo-1480106083854-f9cbdf06e29c?q=80&w=800&auto=format&fit=crop',
    description: 'Built to last. The most reliable commuter for rough terrain.',
    specs: { engine: '150cc Single', power: '12 HP', weight: '125 kg' }
  },

  // PARTS
  {
    id: 'p1',
    name: 'Akrapovič Titanium Exhaust',
    brand: Brand.GENERIC,
    category: Category.PARTS,
    price: 12500,
    image: 'https://images.unsplash.com/photo-1563824643776-0834d6088248?q=80&w=800&auto=format&fit=crop',
    description: 'Lightweight slip-on line exhaust for enhanced sound and performance.'
  },
  {
    id: 'p2',
    name: 'Brembo RCS 19 Corsa Corta',
    brand: Brand.GENERIC,
    category: Category.PARTS,
    price: 3800,
    image: 'https://images.unsplash.com/photo-1626439233724-6f054b54354c?q=80&w=800&auto=format&fit=crop',
    description: 'Adjustable brake master cylinder for track-ready stopping power.'
  },

  // ACCESSORIES
  {
    id: 'a1',
    name: 'AGV Pista GP RR Helmet',
    brand: Brand.GENERIC,
    category: Category.ACCESSORIES,
    price: 14500,
    image: 'https://images.unsplash.com/photo-1590421249276-89c3f0787d61?q=80&w=800&auto=format&fit=crop',
    description: 'The helmet of MotoGP champions. Full carbon fiber shell.'
  },
  {
    id: 'a2',
    name: 'Alpinestars GP Tech v3 Suit',
    brand: Brand.GENERIC,
    category: Category.ACCESSORIES,
    price: 12500,
    image: 'https://images.unsplash.com/photo-1545544198-893249207d55?q=80&w=800&auto=format&fit=crop',
    description: 'Professional grade racing leather suit with airbag compatibility.'
  }
];
