import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, SiteSettings } from '../types';
import { Box, ExternalLink, Plus, Minus } from 'lucide-react';

interface DishDetailsProps {
  item: MenuItem;
  triggerAnimation?: boolean;
  onAddToCart?: (item: MenuItem) => void;
  onUpdateQuantity?: (delta: number) => void;
  cartQuantity?: number;
  fontSettings?: SiteSettings;
  translations?: Record<string, string>;
}

enum InfoTab {
  Info = 'Info',
  Ingredients = 'Ingredients',
  Allergens = 'Allergens',
  Nutrition = 'Nutrition',
}

const DishDetails: React.FC<DishDetailsProps> = ({ 
  item, 
  triggerAnimation = false, 
  onAddToCart, 
  onUpdateQuantity,
  cartQuantity = 0,
  fontSettings,
  translations
}) => {
  const [activeTab, setActiveTab] = useState<InfoTab>(InfoTab.Info);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  const t = (txt: string) => translations?.[txt] || txt;
  const tabs = Object.values(InfoTab);
  const activeIndex = tabs.indexOf(activeTab);

  // Staggered Block Reveal Animation logic
  useEffect(() => {
    const win = window as any;
    if (triggerAnimation && win.gsap && win.SplitType) {
      const gsap = win.gsap;
      if (nameRef.current) nameRef.current.innerHTML = item.name;
      if (descRef.current) descRef.current.innerHTML = item.description;

      const splitName = new win.SplitType(nameRef.current, { types: 'lines' });
      const splitDesc = new win.SplitType(descRef.current, { types: 'lines' });

      const allLines = [...(splitName.lines || []), ...(splitDesc.lines || [])];

      allLines.forEach((line: HTMLElement, index: number) => {
        const originalContent = line.innerHTML;
        const delay = index * 0.12;
        line.style.overflow = 'visible';
        line.style.display = 'block';
        line.innerHTML = `
          <div class="block-reveal-container w-full reveal-active">
            <div class="block-reveal-block" style="animation-delay: ${delay}s"></div>
            <div class="block-reveal-content" style="animation-delay: ${delay}s">${originalContent}</div>
          </div>
        `;
      });
    }
  }, [triggerAnimation, item.name, item.description]);

  const handleARClick = () => {
    if (item.arModelUrl) {
        window.open(item.arModelUrl, '_blank');
    } else {
        alert('AR View not configured for this item. Please ask the admin to add an AR Link.');
    }
  };

  const isSoldOut = item.isAvailable === false;

  return (
    <div className="mt-4 animate-fadeIn font-normal pill">
      {/* Image Container */}
      <div className="w-full flex justify-center mb-6">
        <div className="relative w-48 h-64 rounded-lg overflow-hidden group">
            <img 
                src={item.image} 
                alt={item.name} 
                className={`w-full h-full object-cover rounded-lg drop-shadow-xl transition-all duration-300 ${isSoldOut ? 'grayscale' : ''}`}
                style={{ width: '100%', height: '100%' }}
            />
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                <span className="bg-white/90 text-red-600 px-4 py-2 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg transform -rotate-12 border-2 border-red-600">
                  Sold Out
                </span>
              </div>
            )}
        </div>
      </div>

      {/* Name and Price Row */}
      <div className="flex justify-between items-start mb-4 px-1">
        <div className="flex-1 pr-4">
          <h3 
            ref={nameRef}
            className="text-xl font-normal text-slate-900 leading-tight"
          >
            {item.name}
          </h3>
        </div>
        <div className="flex items-baseline gap-[1px] whitespace-nowrap">
            <span 
                className="text-sm font-normal text-slate-900" 
                style={{ fontFamily: fontSettings?.priceFont }}
            >
                ₹
            </span>
            <span 
                className="text-2xl font-normal text-slate-900" 
                style={{ fontFamily: fontSettings?.priceFont }}
            >
                {Math.round(item.price)}
            </span>
        </div>
      </div>

      {/* Buttons Row */}
      <div className="flex gap-3 mb-6 h-11">
        <button 
            className={`button flex-[2] font-normal h-full px-2 rounded-xl shadow-md transition-colors duration-300 flex items-center justify-center gap-2 text-sm ${
                item.arModelUrl 
                ? 'bg-red-600 text-white active:bg-red-700 hover:bg-red-700' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleARClick}
        >
            <Box size={18} />
            {item.arModelUrl ? t('View in AR') : t('No AR')}
            {item.arModelUrl && <ExternalLink size={14} className="opacity-70" />}
        </button>

        {isSoldOut ? (
            <div className="flex-[1] bg-gray-100 text-gray-400 font-bold h-full rounded-xl flex items-center justify-center text-xs uppercase tracking-tight border border-gray-200">
                Unavailable
            </div>
        ) : cartQuantity > 0 ? (
            <div className="flex-[1] bg-yellow-400 text-slate-900 font-normal h-full rounded-xl shadow-md transition-all duration-300 flex items-center justify-between text-sm overflow-hidden">
                <button 
                    onClick={() => onUpdateQuantity && onUpdateQuantity(-1)}
                    className="h-full flex-1 flex items-center justify-center transition-colors"
                >
                    <Minus size={14} strokeWidth={2} />
                </button>
                <span className="font-bold text-base px-1" style={{ fontFamily: fontSettings?.buttonFont }}>{cartQuantity}</span>
                <button 
                    onClick={() => onUpdateQuantity && onUpdateQuantity(1)}
                    className="h-full flex-1 flex items-center justify-center transition-colors"
                >
                    <Plus size={14} strokeWidth={2} />
                </button>
            </div>
        ) : (
            <button 
                onClick={() => onAddToCart && onAddToCart(item)}
                className="button flex-[1] bg-yellow-400 text-slate-900 font-normal h-full px-2 rounded-xl shadow-md transition-all duration-300 hover:bg-yellow-500 flex items-center justify-center gap-1 text-sm whitespace-nowrap"
                style={{ fontFamily: fontSettings?.buttonFont }}
            >
                ADD +
            </button>
        )}
      </div>

      {/* Info Tabs */}
      <div className="flex justify-between mb-4 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-base font-medium transition-colors duration-300 relative whitespace-nowrap ${
              activeTab === tab ? 'text-red-600' : 'text-slate-500'
            }`}
          >
            {t(tab)}
            {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-full animate-fadeIn" />
            )}
          </button>
        ))}
      </div>

      {/* Content Container with Carousel for smooth transitions */}
      <div className="relative overflow-hidden min-h-[160px]">
        <div className="w-full">
          <div className="flex transition-transform duration-500 ease-out will-change-transform" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
              {/* Info Section */}
              <div className="w-full flex-shrink-0 text-slate-700 text-base leading-relaxed pr-4">
                  <div ref={descRef}>
                    {item.description}
                  </div>
              </div>

              {/* Ingredients Section */}
              <div className="w-full flex-shrink-0 text-slate-700 text-base leading-relaxed pr-4">
                  <ul className="list-disc pl-5 space-y-1.5">
                      {item.ingredients && item.ingredients.length > 0 ? (
                          item.ingredients.map((ing, idx) => <li key={idx}>{ing}</li>)
                      ) : (
                          <p>{t("Ingredients not listed.")}</p>
                      )}
                  </ul>
              </div>

              {/* Allergens Section */}
              <div className="w-full flex-shrink-0 text-slate-700 text-base leading-relaxed pr-4">
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700">
                      <span className="font-bold">{t("Contains")}: </span>
                      {item.allergens && item.allergens.length > 0 ? item.allergens.join(', ') : t('None listed.')}
                  </div>
              </div>

              {/* Nutrition Section */}
              <div className="w-full flex-shrink-0 text-slate-700 text-base leading-relaxed pr-4">
                  {item.nutrition ? (
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-tight mb-1">{t("Calories")}</p>
                              <p className="font-black text-slate-800 text-lg">{item.nutrition.calories}</p>
                          </div>
                          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-tight mb-1">{t("Protein")}</p>
                              <p className="font-black text-slate-800 text-lg">{item.nutrition.protein}</p>
                          </div>
                          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-tight mb-1">{t("Carbs")}</p>
                              <p className="font-black text-slate-800 text-lg">{item.nutrition.carbs}</p>
                          </div>
                          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                              <p className="text-xs text-gray-500 uppercase font-bold tracking-tight mb-1">{t("Fat")}</p>
                              <p className="font-black text-slate-800 text-lg">{item.nutrition.fat}</p>
                          </div>
                      </div>
                  ) : (
                      <p>{t("Nutritional info not available.")}</p>
                  )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishDetails;