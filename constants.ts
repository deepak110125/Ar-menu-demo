
import { Category, MenuItem, CategoryConfig, SiteSettings } from './types';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroTitle: 'Asian Cuisine',
  heroTagline: 'Experience the Art of Asian Cuisine',
  heroBackgroundUrl: '', 
  logoUrl: 'https://picsum.photos/100/100?random=logo',
  fontLink: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
  primaryFont: 'Roboto',
  itemNameFont: 'Roboto',
  priceFont: 'Roboto',
  buttonFont: 'Roboto',
  supportEmail: '',
  supportPhone: '',
  instagramUrl: '',
  googleReviewUrl: ''
};

export const DEFAULT_CATEGORY_CONFIGS: Record<string, CategoryConfig> = {};

export const MENU_ITEMS: MenuItem[] = [];
