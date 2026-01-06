import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Plus, Minus, Star, Heart } from 'lucide-react';
import { MenuItem, SiteSettings } from '../types';
import DishDetails from './DishDetails';

interface MenuItemCardProps {
  item: MenuItem;
  isExpanded: boolean;
  onToggle: () => void;
  onAddToCart?: (item: MenuItem) => void;
  onUpdateQuantity?: (delta: number) => void;
  cartQuantity?: number;
  fontSettings?: SiteSettings;
  translations?: Record<string, string>;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, 
  isExpanded, 
  onToggle, 
  onAddToCart, 
  onUpdateQuantity, 
  cartQuantity = 0, 
  fontSettings,
  translations
}) => {
  const [isRevealActive, setIsRevealActive] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      setIsRevealActive(false);
      const timer = setTimeout(() => setIsRevealActive(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsRevealActive(false);
    }
  }, [isExpanded]);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (item.isAvailable !== false && onAddToCart) {
        onAddToCart(item);
    }
  };

  const handleUpdateClick = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    if (onUpdateQuantity) {
      onUpdateQuantity(delta);
    }
  };

  const isSoldOut = item.isAvailable === false;

  return (
    <div className={`menu-item group relative isolate w-full mb-0 mt-0 pb-0 pt-0 transition-opacity duration-300 ${isSoldOut ? 'opacity-70 grayscale-[0.5]' : 'opacity-100'}`}>
      
      {/* Top Row: Name Overlay + Veg Indicator */}
      <div 
        className="relative z-20 ml-1 flex items-end gap-1 -mb-5 select-none pointer-events-none"
      >
        <div 
            className={`flex-1 min-w-0 bg-white px-4 py-2 rounded-2xl cursor-pointer shadow-sm border border-gray-100 pointer-events-auto ml-6 mr-[120px] transition-all duration-300 ${isRevealActive ? 'reveal-active' : ''}`}
            onClick={onToggle}
        >
            <div className="block-reveal-container w-full">
              <div className="block-reveal-block"></div>
              <div className="flex items-center gap-1.5 block-reveal-content">
                <h3 
                    className="font-semibold text-slate-800 text-base leading-tight truncate"
                    style={{ fontFamily: fontSettings?.itemNameFont }}
                >
                    {item.name}
                </h3>
              </div>
            </div>
        </div>

        {/* Badge Area - Shifted slightly right to be near veg indicator */}
        <div className="absolute right-[28px] bottom-[23px] pointer-events-auto z-30 flex items-center gap-1.5">
          {item.isBestSeller && (
            <div className="flex items-center gap-1 bg-yellow-400 text-[10px] font-black uppercase text-yellow-900 px-2 py-1 rounded-lg shadow-sm whitespace-nowrap" title="Best Seller">
              <Star size={10} className="fill-yellow-900" />
              <span>Best Seller</span>
            </div>
          )}
          {item.isChefsFav && (
            <div className="flex items-center gap-1 bg-red-500 text-[10px] font-black uppercase text-white px-2 py-1 rounded-lg shadow-sm whitespace-nowrap" title="Chef's Favorite">
              <Heart size={10} className="fill-white" />
              <span>Chef's Fav</span>
            </div>
          )}
        </div>

        {/* Veg/Non-Veg Indicator */}
        <div className="flex-shrink-0 ml-auto mr-2 mb-6">
            {item.isVeg ? (
                <div className="w-4 h-4 bg-white border border-green-600 p-[1px] flex items-center justify-center rounded-[3px] shadow-sm" title="Vegetarian">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
            ) : (
                <div className="w-4 h-4 bg-white border border-red-600 p-[1px] flex items-center justify-center rounded-[3px] shadow-sm" title="Non-Vegetarian">
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-b-[6px] border-b-red-600 border-r-[4px] border-r-transparent"></div>
                </div>
            )}
        </div>
      </div>

      {/* Main Container */}
      <div 
        className="card relative z-10 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300"
      >
        {/* Header / Trigger Area */}
        <div 
            onClick={onToggle}
            className="h-12 flex items-center justify-between pl-[3px] pr-1.5 cursor-pointer hover:bg-gray-50 transition-colors duration-300"
        >
            {/* Left Group: Arrow */}
            <div className="flex items-center">
                <div className="text-black transition-transform duration-300 flex-shrink-0 pl-[4px] -ml-0.5">
                    {isExpanded ? (
                        <ChevronUp size={14} strokeWidth={2} />
                    ) : (
                        <ChevronDown size={14} strokeWidth={2} />
                    )}
                </div>
            </div>

            {/* Right Side: Price + Button (Visible when NOT expanded) */}
            {!isExpanded && (
                <div className="flex items-center gap-4 animate-fadeIn">
                    <div className="flex items-baseline gap-[1px]">
                        <span 
                            className="font-normal text-slate-800 text-xs"
                            style={{ fontFamily: fontSettings?.priceFont }}
                        >
                            ₹
                        </span>
                        <span 
                            className="font-normal text-slate-800 text-lg"
                            style={{ fontFamily: fontSettings?.priceFont }}
                        >
                            {Math.round(item.price)}
                        </span>
                    </div>

                    {/* Action Button or Quantity Control */}
                    {isSoldOut ? (
                      <div className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl font-bold text-[10px] uppercase tracking-wider border border-gray-200">
                        Sold Out
                      </div>
                    ) : cartQuantity > 0 ? (
                        <div 
                            className="flex items-center justify-between px-0 py-0 rounded-xl font-normal text-xs transition-all duration-300 shadow-sm min-w-[90px] h-8 bg-yellow-400 text-slate-900 overflow-hidden border border-yellow-400"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={(e) => handleUpdateClick(e, -1)}
                                className="w-8 h-full flex items-center justify-center transition-colors"
                            >
                                <Minus size={14} strokeWidth={2} />
                            </button>
                            
                            <div className="w-[1px] h-4 bg-black/10"></div>
                            
                            <span 
                                className="flex-1 text-center font-bold text-sm px-1" 
                                style={{ fontFamily: fontSettings?.buttonFont }}
                            >
                                {cartQuantity}
                            </span>
                            
                            <div className="w-[1px] h-4 bg-black/10"></div>

                            <button 
                                onClick={(e) => handleUpdateClick(e, 1)}
                                className="w-8 h-full flex items-center justify-center transition-colors"
                            >
                                <Plus size={14} strokeWidth={2} />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleAddClick}
                            className="flex items-center justify-center px-6 py-2 rounded-xl font-normal text-xs transition-all duration-300 shadow-sm min-w-[75px] bg-yellow-400 text-slate-900 hover:bg-yellow-500"
                            style={{ fontFamily: fontSettings?.buttonFont }}
                        >
                            ADD +
                        </button>
                    )}
                </div>
            )}
        </div>

        {/* Expandable Content Area */}
        <div 
            className={`grid transition-all duration-500 ease-out ${
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
        >
            <div className="overflow-hidden">
                <div className="px-4 pb-4">
                     <DishDetails 
                        item={item} 
                        triggerAnimation={isExpanded} 
                        onAddToCart={onAddToCart}
                        onUpdateQuantity={onUpdateQuantity}
                        cartQuantity={cartQuantity}
                        fontSettings={fontSettings}
                        translations={translations}
                     />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;