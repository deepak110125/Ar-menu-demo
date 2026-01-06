
export enum Category {
  Beverage = 'Beverage',
  Starter = 'Starter',
  MainCourse = 'Main Course',
  Dessert = 'Dessert'
}

export type ParallaxSpeed = 'slow' | 'medium' | 'fast';

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface Size {
  id: string;
  name: string;
  price: number;
}

export interface CategoryConfig {
  category: string;
  videoUrl: string;
  fallbackImage: string;
  parallaxSpeed: ParallaxSpeed;
  overlayOpacity: number; // 0.1 to 0.9
  heroTitleX: number;
  heroTitleY: number;
  heroTaglineX: number;
  heroTaglineY: number;
  order?: number; // Added for Firestore sorting
}

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  price: number;
  description: string;
  image: string;
  arModelUrl?: string; // URL to the 3D model or AR viewer
  isSpicy: boolean;
  isVeg: boolean;
  isAvailable?: boolean;
  isBestSeller?: boolean;
  isChefsFav?: boolean;
  addons?: AddOn[];
  sizes?: Size[];
  nutrition?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  ingredients?: string[];
  allergens?: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedAddons?: string[]; // IDs of selected add-ons
  selectedSize?: string; // ID of selected size
}

export interface OrderItem {
  name: string;
  quantity: number;
  size: string;
  basePrice: number;
  addons: { name: string; price: number }[];
  totalPrice: number;
}

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  status: 'Live' | 'Completed' | 'Cancelled';
  createdAt: any; // Firestore Timestamp
  totalAmount?: number;
}

export interface SiteSettings {
  heroTitle: string;
  heroTagline: string;
  heroBackgroundUrl: string;
  logoUrl?: string;
  heroVideoUrl?: string; // Global background video URL
  fontLink: string;
  primaryFont: string;
  itemNameFont: string;
  priceFont: string;
  buttonFont: string;
  supportEmail?: string;
  supportPhone?: string;
  instagramUrl?: string;
  googleReviewUrl?: string;
}
