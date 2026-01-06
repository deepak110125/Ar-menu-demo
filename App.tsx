
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DEFAULT_SITE_SETTINGS } from './constants';
import { Category, MenuItem, CategoryConfig, CartItem, Order, SiteSettings } from './types';
import Hero from './components/Hero';
import CategoryTabs from './components/CategoryTabs';
import MenuItemCard from './components/MenuItemCard';
import AdminForm from './components/AdminForm';
import AppearanceSettings from './components/AppearanceSettings';
import ContactSettings from './components/ContactSettings';
import VegToggle from './components/VegToggle';
import NonVegToggle from './components/NonVegToggle';
import CartDrawer from './components/CartDrawer';
import Header from './components/Header';
import OrdersDashboard from './components/OrdersDashboard';
import ScrollLineAnimation from './components/ScrollLineAnimation';
import CustomizationBottomSheet from './components/CustomizationBottomSheet';
import CategoryManager from './components/CategoryManager';
import { ShoppingBag, ChevronRight, Palette, Plus, Trash2, Edit2, X, Check, MoreVertical, Star, Heart, Ban, CheckCircle, Video, ListPlus, FolderPlus, Lock, Key, LogOut, Phone, Sparkles, Layout, Instagram } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, where, setDoc } from 'firebase/firestore';

// Decorative Divider Component matching the reference image
const DecorativeDivider = () => (
  <div className="w-full flex justify-center items-center py-0 my-6 opacity-80 relative z-0">
    <svg width="300" height="16" viewBox="0 0 300 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px] text-black">
      <line x1="10" y1="12" x2="120" y2="12" stroke="currentColor" strokeWidth="1" />
      <circle cx="10" cy="12" r="2.5" fill="currentColor" />
      <g transform="translate(150, 12)">
        <path d="M0 -8 C1 -1, 1 -1, 8 0 C1 1, 1 1, 0 8 C-1 1, -1 1, -8 0 C-1 -1, -1 -1, 0 -8" fill="currentColor" />
        <path d="M-12 -4 C-11.5 -0.5, -11.5 -0.5, -8 0 C-11.5 0.5, -11.5 0.5, -12 4 C-12.5 0.5, -12.5 0.5, -16 0 C-12.5 -0.5, -12.5 -0.5, -12 -4" fill="currentColor" />
        <path d="12 -4 C12.5 -0.5, 12.5 -0.5, 16 0 C12.5 0.5, 12.5 0.5, 12 4 C11.5 0.5, 11.5 0.5, 8 0 C11.5 -0.5, 11.5 -0.5, 12 -4" fill="currentColor" />
      </g>
      <line x1="180" y1="12" x2="290" y2="12" stroke="currentColor" strokeWidth="1" />
      <circle cx="290" cy="12" r="2.5" fill="currentColor" />
    </svg>
  </div>
);

const App: React.FC = () => {
  // Initial state for categories and configs (will be populated by Firestore)
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryConfigs, setCategoryConfigs] = useState<Record<string, CategoryConfig>>({});
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null); 
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminTab, setAdminTab] = useState<'items' | 'orders'>('items');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAppearanceSettings, setShowAppearanceSettings] = useState(false);
  const [showContactSettings, setShowContactSettings] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('English');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isNonVegOnly, setIsNonVegOnly] = useState(false);
  const [tableId, setTableId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [openAdminMenuId, setOpenAdminMenuId] = useState<string | null>(null);
  const [apiKeyVersion, setApiKeyVersion] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  // Translation State
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<{
    ui: Record<string, string>;
    items: Record<string, any>;
    categories: Record<string, string>;
  } | null>(null);

  // Customization State
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      setTableId(tableParam);
      sessionStorage.setItem('tableId', tableParam);
    } else {
      const stored = sessionStorage.getItem('tableId');
      if (stored) setTableId(stored);
    }

    // URL Logic for Admin Access: Check path, search, or hash
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.endsWith('/admin') || hash === '#admin' || params.has('admin')) {
      setShowAdminLogin(true);
    }
  }, []);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } catch (e) {
        console.debug("API key check not available");
      }
    };
    checkKey();
  }, [apiKeyVersion]);

  // Firestore Real-time Listeners
  useEffect(() => {
    if (db) {
      // 1. Listen for Category Settings
      const catsQuery = query(collection(db, "category_settings"), orderBy("order"));
      const unsubscribeCats = onSnapshot(catsQuery, (snapshot) => {
        const newConfigs: Record<string, CategoryConfig> = {};
        const newCategories: string[] = [];

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const catName = data.name;
          newCategories.push(catName);
          
          // Map Firestore fields to our app's internal CategoryConfig structure
          newConfigs[catName] = {
            category: catName,
            videoUrl: data.heroVideoUrl || '',
            fallbackImage: data.fallbackImageUrl || `https://picsum.photos/800/600?random=${doc.id}`,
            overlayOpacity: data.overlayOpacity ?? 0.6,
            parallaxSpeed: data.parallaxSpeed || 'medium',
            // Preserve visual position defaults since they aren't in Firestore schema yet
            heroTitleX: 24,
            heroTitleY: 140,
            heroTaglineX: 24,
            heroTaglineY: 80,
            order: data.order
          };
        });

        if (newCategories.length > 0) {
          setCategories(newCategories);
          setCategoryConfigs(prev => ({ ...prev, ...newConfigs })); // Merge to keep defaults for non-existent ones if needed
          
          // Ensure active category is valid
          setActiveCategory(prev => {
            if (newCategories.includes(prev)) return prev;
            return newCategories[0];
          });
        } else {
            setCategories([]);
            setCategoryConfigs({});
        }
      }, (error) => {
        console.error("Error fetching categories:", error);
      });

      // 2. Listen for Menu Items
      const itemsQuery = collection(db, "menu_item");
      const unsubscribeItems = onSnapshot(itemsQuery, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[];
        
        setMenuItems(items); // Always set items, even if empty
      }, (error) => {
        console.error("Error fetching menu items:", error);
      });

      // 3. Listen for Live Orders
      const ordersQuery = query(
        collection(db, "orders"), 
        where("status", "==", "Live"),
        orderBy("createdAt", "desc")
      );

      const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
        const newOrders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(newOrders);
      }, (error) => {
        console.error("Error fetching orders:", error);
      });

      // 4. Listen for Cart Contact & Social Settings
      const contactQuery = doc(db, "cart_settings", "contact_social");
      const unsubscribeContact = onSnapshot(contactQuery, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setSiteSettings(prev => ({
            ...prev,
            supportEmail: data.supportEmail || prev.supportEmail,
            supportPhone: data.supportPhone || prev.supportPhone,
            instagramUrl: data.instagramUrl || prev.instagramUrl,
            googleReviewUrl: data.googleReviewUrl || prev.googleReviewUrl
          }));
        }
      }, (error) => {
        console.error("Error fetching contact settings:", error);
      });

      // 5. Listen for Main Menu Settings (Logo, Hero Text, Tagline)
      const menuSettingsQuery = doc(db, "menu_settings", "main");
      const unsubscribeMenuSettings = onSnapshot(menuSettingsQuery, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setSiteSettings(prev => ({
            ...prev,
            logoUrl: data.logoUrl || prev.logoUrl,
            heroTitle: data.heroText || prev.heroTitle, // Map Firestore 'heroText' to 'heroTitle'
            heroTagline: data.heroTagline || prev.heroTagline,
            heroVideoUrl: data.heroVideoUrl || prev.heroVideoUrl
          }));
        }
      }, (error) => {
        console.error("Error fetching menu settings:", error);
      });
      
      return () => {
        unsubscribeCats();
        unsubscribeItems();
        unsubscribeOrders();
        unsubscribeContact();
        unsubscribeMenuSettings();
      };
    }
  }, []);

  useEffect(() => {
    if (siteSettings.fontLink) {
      const linkId = 'dynamic-font-link';
      let link = document.getElementById(linkId) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = siteSettings.fontLink;
    }
  }, [siteSettings.fontLink]);

  // Translation Effect
  useEffect(() => {
    const translatePage = async () => {
      if (language === 'English') {
        setTranslations(null);
        return;
      }

      setIsTranslating(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const uiKeys = [
          "Veg Only", "Non-Veg Only", "Your Order", "Table", "Total", "Subtotal", 
          "Place Order", "Customize", "Ingredients", "Allergens", "Nutrition", 
          "Calories", "Protein", "Carbs", "Fat", "Search dishes...",
          "Found", "results for", "Experience the Art of Asian Cuisine", "Asian Cuisine",
          "Asian Fusion", "Walk-in", "Info", "Ingredients not listed.", 
          "Nutritional info not available.", "None listed.", "Contains", "View in AR", "No AR",
          "Confirm Order?", "Are you sure?", "Order placed successfully!", 
          "Live Orders", "Live", "Completed", "Cancelled"
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Translate the following restaurant menu data into ${language}. 
          STRICT RULES:
          1. TRANSLATE EVERY SINGLE ITEM WITHOUT EXCEPTION. Use the provided ID for mapping.
          2. Translate descriptions fully - this is what appears in the "Info" tab.
          3. Do not translate prices, currency, or technical IDs.
          4. Maintain the exact JSON structure.
          5. Only translate the fields provided.
          
          Data:
          UI Labels: ${JSON.stringify(uiKeys)}
          Categories: ${JSON.stringify(categories)}
          Items: ${JSON.stringify(menuItems.map(item => ({
            id: String(item.id),
            name: item.name,
            description: item.description,
            ingredients: item.ingredients,
            allergens: item.allergens,
            addons: item.addons?.map(a => ({ id: String(a.id), name: a.name }))
          })))}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                ui: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING },
                      translated: { type: Type.STRING }
                    },
                    required: ['original', 'translated']
                  }
                },
                categories: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING },
                      translated: { type: Type.STRING }
                    },
                    required: ['original', 'translated']
                  }
                },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                      allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
                      addons: { 
                        type: Type.ARRAY, 
                        items: { 
                          type: Type.OBJECT, 
                          properties: { 
                            id: { type: Type.STRING }, 
                            name: { type: Type.STRING } 
                          } 
                        } 
                      }
                    },
                    required: ['id', 'name', 'description']
                  }
                }
              },
              required: ['ui', 'categories', 'items']
            }
          }
        });

        const result = JSON.parse(response.text);
        
        // Convert arrays to maps for easy lookup
        const uiMap = (result.ui || []).reduce((acc: any, entry: any) => {
          acc[entry.original] = entry.translated;
          return acc;
        }, {});

        const categoriesMap = (result.categories || []).reduce((acc: any, entry: any) => {
          acc[entry.original] = entry.translated;
          return acc;
        }, {});

        const itemsMap = (result.items || []).reduce((acc: any, item: any) => {
          acc[String(item.id)] = item;
          return acc;
        }, {});

        setTranslations({
          ui: uiMap,
          categories: categoriesMap,
          items: itemsMap
        });
      } catch (error) {
        console.error("Translation failed:", error);
      } finally {
        setIsTranslating(false);
      }
    };

    translatePage();
  }, [language, menuItems, categories, apiKeyVersion]);

  // Utility to get translated string - only for frontend
  const t = (text: string, type: 'ui' | 'category' = 'ui') => {
    if (!translations) return text;
    if (type === 'category') return translations.categories[text] || text;
    return translations.ui[text] || text;
  };

  // Memoized translated menu items for display
  const displayMenuItems = useMemo(() => {
    if (!translations) return menuItems;
    return menuItems.map(item => {
      const trans = translations.items[String(item.id)];
      if (!trans) return item;
      return {
        ...item,
        name: trans.name || item.name,
        description: trans.description || item.description,
        ingredients: trans.ingredients || item.ingredients,
        allergens: trans.allergens || item.allergens,
        addons: item.addons?.map(addon => {
          const transAddon = trans.addons?.find((a: any) => String(a.id) === String(addon.id));
          return transAddon ? { ...addon, name: transAddon.name } : addon;
        })
      };
    });
  }, [menuItems, translations]);

  const getFilteredItems = (category?: string) => {
    let items = isAdminMode ? menuItems : displayMenuItems;
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        items = items.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query)
        );
    } 
    if (!searchQuery.trim() || !isAdminMode) {
        const targetCat = category || activeCategory;
        items = items.filter(item => item.category === targetCat);
    }
    if (!isAdminMode) {
        if (isVegOnly) items = items.filter(item => item.isVeg);
        if (isNonVegOnly) items = items.filter(item => !item.isVeg);
    }
    return items;
  };

  const handleVegToggle = () => {
    if (!isVegOnly) setIsNonVegOnly(false);
    setIsVegOnly(!isVegOnly);
  };

  const handleNonVegToggle = () => {
    if (!isNonVegOnly) setIsVegOnly(false);
    setIsNonVegOnly(!isNonVegOnly);
  };

  const filteredItems = getFilteredItems();

  const handleAddToCart = (item: MenuItem, selectedAddons: string[] = [], selectedSize?: string) => {
    // If item has options (addons or sizes) and none were passed in, open customization
    const hasOptions = (item.addons && item.addons.length > 0) || (item.sizes && item.sizes.length > 0);
    if (hasOptions && selectedAddons.length === 0 && !selectedSize && !customizingItem) {
        setCustomizingItem(item);
        return;
    }

    setCart(prev => {
        // Items are the same if ID, selected addons, AND selected size match
        const existing = prev.find(i => 
          i.id === item.id && 
          i.selectedSize === selectedSize &&
          JSON.stringify(i.selectedAddons?.sort()) === JSON.stringify(selectedAddons.sort())
        );
        
        if (existing) {
            return prev.map(i => (
              i.id === item.id && 
              i.selectedSize === selectedSize && 
              JSON.stringify(i.selectedAddons?.sort()) === JSON.stringify(selectedAddons.sort())
            ) ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { ...item, quantity: 1, selectedAddons, selectedSize }];
    });
    setCustomizingItem(null);
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map((item, idx) => {
        if (item.id === cartItemId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      });
      return updated.filter(item => item.quantity > 0);
    });
  };

  const handleToggleAddon = (itemId: string, addonId: string, selectedSize?: string, currentAddons: string[] = []) => {
    setCart(prev => prev.map(item => {
        if (item.id === itemId && item.selectedSize === selectedSize && JSON.stringify(item.selectedAddons) === JSON.stringify(currentAddons)) {
            const addons = item.selectedAddons || [];
            const newAddons = addons.includes(addonId)
                ? addons.filter(id => id !== addonId)
                : [...addons, addonId];
            return { ...item, selectedAddons: newAddons };
        }
        return item;
    }));
  };

  const handleRemoveFromCart = (id: string, selectedSize?: string, selectedAddons: string[] = []) => {
    setCart(prev => prev.filter(item => !(
      item.id === id && 
      item.selectedSize === selectedSize && 
      JSON.stringify(item.selectedAddons) === JSON.stringify(selectedAddons)
    )));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
        const basePrice = item.sizes?.find(s => s.id === item.selectedSize)?.price || item.price;
        const addonsPrice = (item.addons || [])
            .filter(a => item.selectedAddons?.includes(a.id))
            .reduce((total, a) => total + a.price, 0);
        return sum + (basePrice + addonsPrice) * item.quantity;
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    // Structure order items as requested
    const formattedItems = cart.map(item => {
        const sizeObj = item.sizes?.find(s => s.id === item.selectedSize);
        const addonsObjs = item.addons?.filter(a => item.selectedAddons?.includes(a.id)) || [];

        const basePrice = sizeObj ? sizeObj.price : item.price;
        const addonsTotal = addonsObjs.reduce((acc, a) => acc + a.price, 0);

        return {
            name: item.name,
            quantity: item.quantity,
            size: sizeObj ? sizeObj.name : 'Regular',
            basePrice: basePrice,
            addons: addonsObjs.map(a => ({ name: a.name, price: a.price })),
            totalPrice: (basePrice + addonsTotal) * item.quantity
        };
    });

    const newOrderData = {
        tableNumber: tableId || 'Walk-in',
        status: "Live",
        createdAt: db ? serverTimestamp() : new Date(),
        items: formattedItems
    };

    if (db) {
        try {
            await addDoc(collection(db, "orders"), newOrderData);
            setCart([]);
            setIsCartOpen(false);
            alert(t('Order placed successfully!'));
        } catch (e) {
            console.error("Error adding document: ", e);
            alert(t('Failed to place order. Please try again.'));
        }
    } else {
        // Local State Fallback for demo without DB
        const localOrder: Order = { 
            id: Date.now().toString(), 
            ...newOrderData, 
            createdAt: { toMillis: () => Date.now() }, // Mock timestamp
            status: 'Live'
        } as unknown as Order;
        
        setOrders(prev => [localOrder, ...prev]);
        setCart([]);
        setIsCartOpen(false);
        alert(t('Order placed successfully! (Offline Mode)'));
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    if (db) {
      try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status: 'Completed' });
        // Removed deleteDoc to persist history as completed
      } catch (e) {
        console.error("Error completing order:", e);
      }
    } else {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirm = window.confirm("Cancel this order?");
    if (confirm) {
      if (db) {
        try {
          const orderRef = doc(db, "orders", orderId);
          await updateDoc(orderRef, { status: 'Cancelled' });
        } catch (e) {
          console.error("Error cancelling order:", e);
        }
      } else {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      }
    }
  };

  const handleToggleItem = (id: string) => {
    setExpandedItemId(prevId => (prevId === id ? null : id));
  };

  const handleAddItem = async (newItem: MenuItem) => {
    if (db) {
      try {
        if (editingItem && newItem.id) {
           // Editing existing item
           const { id, ...itemData } = newItem;
           await updateDoc(doc(db, "menu_item", id), itemData);
        } else {
           // Adding new item
           const { id, ...itemData } = newItem;
           await addDoc(collection(db, "menu_item"), itemData);
        }
        
        setActiveCategory(newItem.category);
        setShowAddForm(false);
        setEditingItem(null);
      } catch (error) {
        console.error("Error adding/updating item:", error);
        throw error; // Re-throw so AdminForm can handle error state
      }
    } else {
        // Local Fallback
        setMenuItems(prev => {
          const exists = prev.find(i => i.id === newItem.id);
          if (exists) {
            return prev.map(i => i.id === newItem.id ? newItem : i);
          }
          return [...prev, { ...newItem, isAvailable: true, isBestSeller: false, isChefsFav: false }];
        });
        setActiveCategory(newItem.category);
        setShowAddForm(false);
        setEditingItem(null);
        setExpandedItemId(newItem.id);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const confirmDelete = window.confirm("Do you want to delete this item? This action cannot be undone.");
    if (confirmDelete) {
        if (db) {
            try {
                await deleteDoc(doc(db, "menu_item", id));
            } catch (error) {
                console.error("Error deleting item:", error);
            }
        } else {
            setMenuItems(prev => prev.filter(item => item.id !== id));
            setCart(prev => prev.filter(item => item.id !== id));
            if (expandedItemId === id) setExpandedItemId(null);
        }
    }
  };

  const handleToggleItemFlag = async (id: string, flag: 'isAvailable' | 'isBestSeller' | 'isChefsFav') => {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;

    if (db) {
        try {
            await updateDoc(doc(db, "menu_item", id), {
                [flag]: !item[flag]
            });
        } catch (error) {
            console.error("Error updating toggle:", error);
        }
    } else {
        setMenuItems(prev => prev.map(item => 
          item.id === id ? { ...item, [flag]: !item[flag] } : item
        ));
    }
    setOpenAdminMenuId(null);
  };

  const handleAddCategory = async (name: string) => {
    if (categories.includes(name)) {
        alert('Category already exists.');
        return;
    }
    
    // Create new category document in Firestore
    if (db) {
      try {
        await setDoc(doc(db, "category_settings", name), {
          name: name,
          order: categories.length + 1,
          heroVideoUrl: '',
          fallbackImageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
          overlayOpacity: 0.6,
          parallaxSpeed: 'medium'
        });
        setActiveCategory(name);
      } catch (e) {
        console.error("Error creating category:", e);
      }
    } else {
      // Offline fallback
      setCategories(prev => [...prev, name]);
      setCategoryConfigs(prev => ({
        ...prev,
        [name]: {
          category: name,
          videoUrl: '',
          fallbackImage: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
          parallaxSpeed: 'medium',
          overlayOpacity: 0.6,
          heroTitleX: 24,
          heroTitleY: 140,
          heroTaglineX: 24,
          heroTaglineY: 80
        }
      }));
      setActiveCategory(name);
    }
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    const confirmDelete = window.confirm(`Delete "${catToDelete}" and all its items?`);
    if (confirmDelete) {
        if (db) {
           try {
             await deleteDoc(doc(db, "category_settings", catToDelete));
             // Optionally delete items in this category if needed, but keeping simple for now
           } catch (e) {
             console.error("Error deleting category:", e);
           }
        } else {
            const nextCategories = categories.filter(c => c !== catToDelete);
            setCategories(nextCategories);
            setMenuItems(prev => prev.filter(item => item.category !== catToDelete));
            setCart(prev => prev.filter(item => item.category !== catToDelete));
            setCategoryConfigs(prev => {
                const next = { ...prev };
                delete next[catToDelete];
                return next;
            });
            if (activeCategory === catToDelete) {
                setActiveCategory(nextCategories.length > 0 ? nextCategories[0] : '');
            }
        }
    }
  };

  const handleUpdateSettings = (newSettings: Partial<SiteSettings>) => {
    setSiteSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Handler for contact settings
  const handleSaveContactSettings = async (updates: Partial<SiteSettings>) => {
    if (db) {
        try {
            const contactRef = doc(db, "cart_settings", "contact_social");
            await setDoc(contactRef, {
                supportEmail: updates.supportEmail || '',
                supportPhone: updates.supportPhone || '',
                instagramUrl: updates.instagramUrl || '',
                googleReviewUrl: updates.googleReviewUrl || ''
            }, { merge: true });
        } catch (e) {
            console.error("Error saving contact settings:", e);
        }
    }
    setSiteSettings(prev => ({ ...prev, ...updates }));
  };

  // Handler for menu appearance settings
  const handleSaveMenuSettings = async (newSettings: SiteSettings) => {
    if (db) {
      try {
        const menuRef = doc(db, "menu_settings", "main");
        await setDoc(menuRef, {
          logoUrl: newSettings.logoUrl,
          heroText: newSettings.heroTitle, // Map app's heroTitle to Firestore's heroText
          heroTagline: newSettings.heroTagline,
          heroVideoUrl: newSettings.heroVideoUrl // Include video if edited
        }, { merge: true });
      } catch (e) {
        console.error("Error saving menu settings:", e);
      }
    }
    // Optimistic local update
    setSiteSettings(newSettings);
  };

  const handleUpdateConfig = async (category: string, updates: CategoryConfig) => {
    if (db) {
      try {
        // Map back to Firestore fields
        await setDoc(doc(db, "category_settings", category), {
          name: category,
          heroVideoUrl: updates.videoUrl,
          fallbackImageUrl: updates.fallbackImage,
          overlayOpacity: updates.overlayOpacity,
          parallaxSpeed: updates.parallaxSpeed,
          order: updates.order ?? categories.indexOf(category)
        }, { merge: true });
      } catch (e) {
        console.error("Error updating category config:", e);
      }
    } else {
      setCategoryConfigs(prev => ({
        ...prev,
        [category]: updates
      }));
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin8291') {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminPasswordInput('');
    } else {
      alert('Incorrect password!');
      setAdminPasswordInput('');
    }
  };

  const handleExitAdmin = () => {
    setIsAdminMode(false);
    setShowAddForm(false);
    setShowAppearanceSettings(false);
    setShowContactSettings(false);
    setEditingItem(null);
    setShowCategoryEditor(false);
    // Remove the admin identifier from URL hash if present
    if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
  };

  const cartTotal = calculateTotal();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F7F9F9] pb-24 font-sans relative">
      <ScrollLineAnimation />
      <Hero 
        isAdminMode={isAdminMode} 
        onToggleAdmin={() => {
            if (isAdminMode) {
              handleExitAdmin();
            } else {
              setShowAdminLogin(true);
            }
        }}
        language={language}
        onLanguageChange={(lang) => setLanguage(lang)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        config={categoryConfigs[activeCategory]}
        settings={{
          ...siteSettings,
          heroTitle: translations ? (translations.ui[siteSettings.heroTitle] || siteSettings.heroTitle) : siteSettings.heroTitle,
          heroTagline: translations ? (translations.ui[siteSettings.heroTagline] || siteSettings.heroTagline) : siteSettings.heroTagline
        }}
        onUpdateSettings={handleUpdateSettings}
        onUpdateConfig={(updates) => handleUpdateConfig(activeCategory, { ...categoryConfigs[activeCategory], ...updates })}
        translations={translations?.ui}
      />
      
      {/* Admin Password Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-[#1A3E5D]/80 backdrop-blur-sm" onClick={() => setShowAdminLogin(false)} />
          <div className="relative w-full max-sm:max-w-full bg-white rounded-[32px] shadow-2xl overflow-hidden animate-slideUp p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-2">
                <Lock size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Admin Authentication</h3>
              <p className="text-slate-500 text-sm">Please enter the password to access administrative features.</p>
              
              <form onSubmit={handleAdminLogin} className="w-full space-y-4 mt-4">
                <div className="relative">
                  <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password" 
                    autoFocus
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-slate-800 outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => { setShowAdminLogin(false); setAdminPasswordInput(''); }}
                    className="flex-1 px-6 py-4 bg-gray-100 text-slate-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isTranslating && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Translating...</span>
        </div>
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={(id, delta) => handleUpdateCartQuantity(id, delta)}
        onToggleAddon={(id, addonId) => {
           const item = cart.find(i => i.id === id);
           if (item) handleToggleAddon(id, addonId, item.selectedSize, item.selectedAddons);
        }}
        onRemoveItem={(id) => {
          const item = cart.find(i => i.id === id);
          if (item) handleRemoveFromCart(id, item.selectedSize, item.selectedAddons);
        }}
        onPlaceOrder={handlePlaceOrder}
        tableId={tableId}
        translations={translations?.ui}
        supportEmail={siteSettings.supportEmail}
        supportPhone={siteSettings.supportPhone}
      />
      
      {/* Customization Bottom Sheet */}
      <CustomizationBottomSheet 
        item={customizingItem ? displayMenuItems.find(i => i.id === customizingItem.id) || customizingItem : null}
        onClose={() => setCustomizingItem(null)}
        onAdd={(item, addons, size) => handleAddToCart(item, addons, size)}
        fontSettings={siteSettings}
        translations={translations?.ui}
      />

      {isAdminMode ? (
        <div className="max-w-2xl mx-auto animate-fadeIn pt-6 relative z-20 px-4">
            <div className="flex mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar items-center">
              <button onClick={() => { setAdminTab('items'); setShowAppearanceSettings(false); setShowContactSettings(false); setShowCategoryEditor(false); }} className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${adminTab === 'items' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:bg-gray-50'}`}>Items</button>
              <button onClick={() => { setAdminTab('orders'); setShowAppearanceSettings(false); setShowContactSettings(false); setShowCategoryEditor(false); }} className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${adminTab === 'orders' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:bg-gray-50'}`}>Orders ({orders.length})</button>
              <div className="w-[1px] h-6 bg-gray-200 mx-2 flex-shrink-0" />
              <button 
                onClick={handleExitAdmin} 
                className="p-2 text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1.5 font-bold text-xs"
                title="Exit Admin Mode"
              >
                <LogOut size={16} /> <span className="max-sm:hidden">Exit</span>
              </button>
            </div>
            {adminTab === 'items' && (
              <div className="animate-fadeIn">
                {!showAddForm && !editingItem && !showAppearanceSettings && !showContactSettings ? (
                    <>
                        <div className="flex flex-col items-center mb-6">
                            <div className="bg-white p-0 rounded-xl border border-gray-200 shadow-sm w-fit max-w-full overflow-hidden flex items-center">
                                <CategoryTabs 
                                  categories={categories} 
                                  activeCategory={activeCategory} 
                                  onSelectCategory={setActiveCategory}
                                />
                                <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
                                <button onClick={() => setShowCategoryEditor(!showCategoryEditor)} className={`p-2 rounded-lg transition-all ${showCategoryEditor ? 'bg-red-50 text-red-600' : 'text-slate-500 hover:bg-gray-50'}`} title="Edit Categories"><Edit2 size={18} /></button>
                            </div>

                            {/* Enhanced Category Editor Panel */}
                            {showCategoryEditor && (
                                <CategoryManager 
                                    categories={categories}
                                    configs={categoryConfigs}
                                    activeCategory={activeCategory}
                                    onSaveConfig={handleUpdateConfig}
                                    onAddCategory={handleAddCategory}
                                    onDeleteCategory={handleDeleteCategory}
                                    onClose={() => setShowCategoryEditor(false)}
                                />
                            )}
                        </div>

                        {/* Gemini Key Config Box */}
                        <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between animate-fadeIn">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasApiKey ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-slate-400'}`}>
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Gemini Translation API</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            {hasApiKey ? 'Active & Configured' : 'API Key Required'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={async () => {
                                    try {
                                        await (window as any).aistudio.openSelectKey();
                                        setApiKeyVersion(v => v + 1);
                                    } catch (e) {
                                        console.error("Failed to open key selector:", e);
                                    }
                                }} 
                                className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all"
                            >
                                <Key size={14} /> {hasApiKey ? 'Change Key' : 'Add API Key'}
                            </button>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-slate-800">{searchQuery ? `Found ${filteredItems.length} results for "${searchQuery}"` : `Manage Items (${activeCategory})`}</h3>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setShowAppearanceSettings(true); setShowContactSettings(false); }} 
                              className="flex items-center gap-2 bg-blue-600 text-black px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                            >
                              <Edit2 size={16} /> Edit Menu
                            </button>
                            <button 
                              onClick={() => { setShowContactSettings(true); setShowAppearanceSettings(false); }} 
                              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-green-700 active:scale-95 transition-all"
                            >
                              <Phone size={16} /> Contact Info
                            </button>
                            <button 
                              onClick={() => setShowAddForm(true)} 
                              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-red-700 active:scale-95 transition-all"
                            >
                              <Plus size={16} /> Add Item
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3 relative">
                          {filteredItems.length > 0 ? (filteredItems.map(item => (
                            <div 
                              key={item.id} 
                              className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 group animate-fadeIn relative transition-all ${openAdminMenuId === item.id ? 'z-[60] ring-2 ring-red-500/20' : 'z-10'}`}
                            >
                              <div className="relative flex-shrink-0">
                                <button 
                                  onClick={() => setOpenAdminMenuId(openAdminMenuId === item.id ? null : item.id)}
                                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${openAdminMenuId === item.id ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                                >
                                  <MoreVertical size={18} />
                                </button>
                                
                                {openAdminMenuId === item.id && (
                                  <>
                                    <div className="fixed inset-0 z-[100]" onClick={() => setOpenAdminMenuId(null)} />
                                    <div className="absolute left-0 top-12 w-52 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 z-[110] overflow-hidden animate-fadeIn py-1">
                                      <button 
                                        onClick={() => { setEditingItem(item); setOpenAdminMenuId(null); }}
                                        className="w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                      >
                                        <Edit2 size={16} className="text-blue-500" />
                                        Edit Item
                                      </button>
                                      <button 
                                        onClick={() => handleToggleItemFlag(item.id, 'isAvailable')}
                                        className="w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                      >
                                        {item.isAvailable === false ? <CheckCircle size={16} className="text-green-500" /> : <Ban size={16} className="text-red-500" />}
                                        {item.isAvailable === false ? 'Mark as Available' : 'Mark as Sold Out'}
                                      </button>
                                      <button 
                                        onClick={() => handleToggleItemFlag(item.id, 'isBestSeller')}
                                        className="w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                      >
                                        <Star size={16} className={item.isBestSeller ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                                        {item.isBestSeller ? 'Remove Best Seller' : 'Mark as Best Seller'}
                                      </button>
                                      <button 
                                        onClick={() => handleToggleItemFlag(item.id, 'isChefsFav')}
                                        className="w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                      >
                                        <Heart size={16} className={item.isChefsFav ? "text-red-500 fill-red-500" : "text-gray-300"} />
                                        {item.isChefsFav ? 'Remove Chef\'s Fav' : 'Mark as Chef\'s Fav'}
                                      </button>
                                      <div className="h-[1px] bg-gray-100 my-1 mx-2" />
                                      <button 
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 flex items-center gap-3 hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 size={16} />
                                        Delete Item
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>

                              <img src={item.image} className={`w-16 h-16 object-cover rounded-lg shadow-sm transition-opacity flex-shrink-0 ${item.isAvailable === false ? 'opacity-40 grayscale' : 'opacity-100'}`} alt={item.name} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                                  {item.isBestSeller && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                                  {item.isChefsFav && <Heart size={14} className="text-red-500 fill-red-500" />}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-bold text-slate-500">₹{Math.round(item.price)}</span>
                                  <span className="text-[10px] text-slate-400 px-1 border rounded">{item.category}</span>
                                  {item.isVeg && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                                  {item.isAvailable === false && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded uppercase tracking-tighter">Sold Out</span>}
                                </div>
                              </div>
                            </div>
                          ))) : (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-slate-400">
                              {searchQuery ? `No items matching "${searchQuery}"` : "No items in this category yet."}
                            </div>
                          )}
                        </div>
                    </>
                ) : showAppearanceSettings ? (
                    <AppearanceSettings 
                      settings={siteSettings} 
                      onSave={async (settings) => { 
                          await handleSaveMenuSettings(settings);
                          setTimeout(() => setShowAppearanceSettings(false), 1500);
                      }} 
                      onCancel={() => setShowAppearanceSettings(false)} 
                    />
                ) : showContactSettings ? (
                    <ContactSettings 
                      settings={siteSettings} 
                      onSave={async (updates) => { 
                          await handleSaveContactSettings(updates);
                          setTimeout(() => setShowContactSettings(false), 1500);
                      }} 
                      onCancel={() => setShowContactSettings(false)} 
                    />
                ) : (
                    <AdminForm 
                      onAddItem={handleAddItem} 
                      onCancel={() => { setShowAddForm(false); setEditingItem(null); }} 
                      categories={categories} 
                      initialCategory={activeCategory} 
                      itemToEdit={editingItem || undefined}
                    />
                )}
              </div>
            )}
            {adminTab === 'orders' && <OrdersDashboard orders={orders} onCompleteOrder={handleCompleteOrder} onDeleteOrder={handleCancelOrder} />}
        </div>
      ) : (
        <>
            {/* Sticky Category Header - Top position */}
            {!searchQuery && (
                <div className="sticky top-0 z-40 bg-[#F7F9F9]/95 backdrop-blur-md shadow-sm border-b border-gray-200 transition-all duration-300">
                    <div className="max-w-2xl mx-auto p-0 flex items-center justify-between gap-4">
                        <div className="flex-1 overflow-hidden">
                          <CategoryTabs 
                            categories={categories} 
                            activeCategory={activeCategory} 
                            onSelectCategory={setActiveCategory}
                            translations={translations?.categories}
                          />
                        </div>
                        {tableId && (
                            <div className="flex items-center gap-3 pl-2 border-l border-gray-300">
                                <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 whitespace-nowrap">
                                    T-{tableId}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <main className="px-4 pt-4 max-w-2xl mx-auto min-h-[50vh] relative z-10">
                <div className="mb-4 flex justify-between items-center">
                  <VegToggle isVegOnly={isVegOnly} onToggle={handleVegToggle} label={t('Veg Only')} />
                  <NonVegToggle isNonVegOnly={isNonVegOnly} onToggle={handleNonVegToggle} label={t('Non-Veg Only')} />
                </div>
                {searchQuery && filteredItems.length > 0 && (<p className="text-sm text-slate-500 mb-6">{t('Found')} {filteredItems.length} {t('results for')} "{searchQuery}"</p>)}
                {filteredItems.length > 0 ? (
                    <div className="animate-fadeIn">
                        {filteredItems.map((item, index) => (
                          <React.Fragment key={item.id}>
                            <MenuItemCard 
                              item={item} 
                              isExpanded={expandedItemId === item.id} 
                              onToggle={() => handleToggleItem(item.id)} 
                              onAddToCart={handleAddToCart} 
                              onUpdateQuantity={(delta) => handleUpdateCartQuantity(item.id, delta)} 
                              cartQuantity={cart.filter(ci => ci.id === item.id).reduce((sum, ci) => sum + ci.quantity, 0)} 
                              fontSettings={siteSettings} 
                              translations={translations?.ui} 
                            />
                            {index < filteredItems.length - 1 && (<DecorativeDivider />)}
                          </React.Fragment>
                        ))}
                        
                        {/* Minimalist Loved It Section - Single Line Slightly Bigger - Uses siteSettings URLs */}
                        <div className="mt-10 mb-12 flex items-center justify-center gap-6 animate-fadeIn opacity-90 hover:opacity-100 transition-opacity">
                          <span 
                            className="text-lg font-bold text-red-600 italic select-none lowercase tracking-tight" 
                            style={{ fontFamily: siteSettings.primaryFont }}
                          >
                            loved it!
                          </span>
                          <div className="flex items-center gap-6">
                            <a 
                              href={siteSettings.instagramUrl || "https://instagram.com"} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#E4405F] transition-transform transform hover:scale-110 active:scale-90"
                              aria-label="Follow us on Instagram"
                            >
                              <Instagram size={22} />
                            </a>
                            <a 
                              href={siteSettings.googleReviewUrl || "https://g.page/review"} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="transition-transform transform hover:scale-110 active:scale-90"
                              aria-label="Review us on Google"
                            >
                              <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google Logo" />
                            </a>
                          </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-400 flex flex-col items-center animate-fadeIn">{searchQuery ? (<><p>No items found matching "{searchQuery}"</p><button onClick={() => setSearchQuery('')} className="mt-2 text-red-500 font-medium text-sm hover:underline">Clear Search</button></>) : (<><p>No items found in this category.</p><p className="text-sm mt-2">Switch to Admin mode to add items.</p></>)}</div>
                )}
            </main>

            <div className="fixed bottom-8 right-6 z-50 pointer-events-none">
                <button 
                  onClick={() => setIsCartOpen(true)} 
                  className={`pointer-events-auto bg-[#4B8DA8] text-white shadow-2xl hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center gap-3 overflow-hidden rounded-xl h-14 px-6 min-w-[75px] justify-center`}
                >
                    <div className="relative flex-shrink-0">
                      <ShoppingBag className="w-6 h-6 text-white" />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border border-black animate-bounce">
                          {cartCount}
                        </span>
                      )}
                    </div>
                    {cartCount > 0 && (
                      <div className="flex flex-col items-start leading-none whitespace-nowrap animate-fadeIn pl-1 border-l border-white/20 ml-1">
                        <span className="text-[9px] text-gray-200 font-bold uppercase tracking-wider mb-0.5">{t('Total')}</span>
                        <span className="text-sm font-bold flex items-center gap-1">₹{Math.round(cartTotal)}<ChevronRight size={12} className="text-gray-300" /></span>
                      </div>
                    )}
                </button>
            </div>
        </>
      )}
    </div>
  );
};

export default App;
