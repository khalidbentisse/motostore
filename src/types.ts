
export enum Category {
  BIKES = 'Motorcycles',
  PARTS = 'Parts',
  ACCESSORIES = 'Accessories'
}

// Helper object for default brands, but type is string
export const Brand = {
  HONDA: 'Honda',
  YAMAHA: 'Yamaha',
  KTM: 'KTM',
  DUCATI: 'Ducati',
  BMW: 'BMW',
  KAWASAKI: 'Kawasaki',
  DAYTONA: 'Daytona',
  BOXER: 'Boxer',
  GENERIC: 'Aftermarket'
} as const;

export interface Product {
  id: string;
  name: string;
  brand: string; // Changed from enum to string for flexibility
  category: Category | string;
  price: number;
  image: string;
  description: string;
  specs?: {
    engine?: string;
    power?: string;
    weight?: string;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  total: number;
  date: number;
  status: 'pending' | 'completed';
}
