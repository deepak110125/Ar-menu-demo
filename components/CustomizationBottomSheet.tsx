
import React, { useState, useEffect } from 'react';
import { MenuItem, SiteSettings, AddOn, Size } from '../types';
import { X, Check } from 'lucide-react';

interface CustomizationBottomSheetProps {
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, selectedAddons: string[], selectedSize?: string) => void;
  fontSettings?: SiteSettings;
  translations?: Record<string, string>;
}

const CustomizationBottomSheet: React.FC<CustomizationBottomSheetProps> = ({ 
  item, 
  onClose, 
  onAdd, 
  fontSettings,
  translations
}) => {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const t = (txt: string) => translations?.[txt] || txt;

  useEffect(() => {
    if (item) {
      setIsVisible(true);
      setSelectedAddons([]);
      // Default to Medium size if it exists, else the first size, else null
      if (item.sizes && item.sizes.length > 0) {
        const medium = item.sizes.find(s => s.name.toLowerCase() === 'medium');
        setSelectedSize(medium ? medium.id : item.sizes[0].id);
      } else {
        setSelectedSize(null);
      }
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [item]);

  if (!item) return null;

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId) 
        : [...prev, addonId]
    );
  };

  const calculateTotal = () => {
    const basePrice = item.sizes?.find(s => s.id === selectedSize)?.price || item.price;
    const addonsTotal = (item.addons || [])
      .filter(a => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    return basePrice + addonsTotal;
  };

  const handleAdd = () => {
    onAdd(item, selectedAddons, selectedSize || undefined);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[70] flex items-end justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative w-full max-w-2xl bg-white rounded-t-[32px] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isVisible ? 'translate-y-0' : 'translate-y-full'}`} style={{ fontFamily: fontSettings?.primaryFont }}>
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>
        <div className="px-6 py-4 flex justify-between items-start border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: fontSettings?.itemNameFont }}>
              {t("Customize")} "{item.name}"
            </h3>
            <p className="text-sm text-slate-500 mt-1">Select size and add-ons</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-slate-500 hover:bg-gray-200 transition-colors"><X size={20} /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-6 no-scrollbar">
          <div className="space-y-8">
            
            {/* Size Selection */}
            {item.sizes && item.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Select Size</h4>
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold uppercase">Required</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {item.sizes.map((size: Size) => {
                    const isSelected = selectedSize === size.id;
                    return (
                      <button 
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1 ${
                          isSelected 
                            ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' 
                            : 'border-gray-100 bg-gray-50/50 text-slate-500 hover:border-gray-200'
                        }`}
                      >
                        <span className="text-sm font-black">{size.name}</span>
                        <span className="text-xs font-bold opacity-70">₹{Math.round(size.price)}</span>
                        {isSelected && <div className="mt-1"><Check size={14} className="text-red-500" /></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add-ons Selection */}
            {item.addons && item.addons.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Extra Add-ons</h4>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">Optional</span>
                </div>
                <div className="space-y-3">
                    {item.addons.map((addon: AddOn) => {
                        const isSelected = selectedAddons.includes(addon.id);
                        return (
                            <div key={addon.id} onClick={() => handleToggleAddon(addon.id)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-red-500 bg-red-50/30' : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300 bg-white'}`}>
                                        {isSelected && <Check size={14} className="text-white" />}
                                    </div>
                                    <span className={`font-bold text-base ${isSelected ? 'text-red-700' : 'text-slate-700'}`}>{addon.name}</span>
                                </div>
                                <span className={`font-bold ${isSelected ? 'text-red-600' : 'text-slate-500'}`}>+₹{Math.round(addon.price)}</span>
                            </div>
                        );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 bg-white border-t border-gray-100 rounded-b-[32px] flex items-center justify-between gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
           <div className="flex flex-col">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-tight">{t("Total Amount")}</span>
             <span className="text-xl font-black text-slate-900 leading-none mt-1" style={{ fontFamily: fontSettings?.priceFont }}>₹{Math.round(calculateTotal())}</span>
           </div>
           <button onClick={handleAdd} className="flex-1 bg-yellow-400 text-slate-900 h-11 px-6 rounded-xl font-bold text-sm hover:bg-yellow-500 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1" style={{ fontFamily: fontSettings?.buttonFont }}>ADD +</button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationBottomSheet;
