
import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, CheckCircle2, AlertCircle, Mail, Phone, Check, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onToggleAddon: (itemId: string, addonId: string) => void;
  onRemoveItem: (id: string) => void;
  onPlaceOrder: () => void;
  tableId: string;
  translations?: Record<string, string>;
  supportEmail?: string;
  supportPhone?: string;
}

const SerratedDivider = ({ flipped = false, color = "#1A3E5D" }: { flipped?: boolean, color?: string }) => (
  <div className={`w-full h-3 overflow-hidden -mt-0.5 ${flipped ? 'rotate-180 mb-[-2px]' : ''}`}>
    <svg width="100%" height="12" viewBox="0 0 100 12" preserveAspectRatio="none" style={{ fill: color }}>
      <path d="M0 12 L5 0 L10 12 L15 0 L20 12 L25 0 L30 12 L35 0 L40 12 L45 0 L50 12 L55 0 L60 12 L65 0 L70 12 L75 0 L80 12 L85 0 L90 12 L95 0 L100 12 Z" />
    </svg>
  </div>
);

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onToggleAddon,
  onRemoveItem,
  onPlaceOrder,
  tableId,
  translations,
  supportEmail,
  supportPhone
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const t = (txt: string) => translations?.[txt] || txt;

  useEffect(() => {
    if (!isOpen) {
      setShowConfirmation(false);
    }
  }, [isOpen]);

  const calculateItemTotal = (item: CartItem) => {
    const basePrice = item.sizes?.find(s => s.id === item.selectedSize)?.price || item.price;
    const addonsPrice = (item.addons || [])
      .filter(a => item.selectedAddons?.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    return (basePrice + addonsPrice) * item.quantity;
  };

  const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const totalAmount = subtotal;

  const handlePlaceOrderClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmOrder = () => {
    onPlaceOrder();
    setShowConfirmation(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md pointer-events-auto transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="w-full max-md:max-w-full max-w-md bg-[#F7F9F9] h-full shadow-2xl pointer-events-auto flex flex-col animate-slideInRight relative overflow-hidden">
        
        {/* Header Section - Matches Hero Section Blue (#1A3E5D) */}
        <div className="bg-[#1A3E5D] text-white pt-10 pb-4 px-6 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full text-white/80 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center shrink-0 rotate-12 shadow-lg">
              <ShoppingBag className="text-[#1A3E5D]" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black leading-tight tracking-tight">
                {cart.length > 0 ? t("Order Summary") : t("Empty Cart")}
              </h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs font-black uppercase text-white/60 tracking-widest">
                  {t("Table")} #{tableId || 'Walk-in'}
                </span>
                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                <span className="text-xs font-black uppercase text-yellow-400 tracking-widest">Draft</span>
              </div>
            </div>
          </div>
        </div>

        <SerratedDivider color="#1A3E5D" />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar relative">
          {/* Confirmation Widget Overlay */}
          {showConfirmation && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-6 animate-fadeIn">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowConfirmation(false)} />
              <div className="relative w-full max-w-[280px] bg-white rounded-[24px] shadow-2xl p-6 text-center animate-scaleUp border border-gray-100">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{t("Confirm Order?") }</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  We'll start preparing your food once confirmed.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleConfirmOrder}
                    className="w-full py-3.5 bg-red-600 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all"
                  >
                    {t("Yes, Place Order")}
                  </button>
                  <button 
                    onClick={() => setShowConfirmation(false)}
                    className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                  >
                    {t("No, Go Back")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 px-10 text-center">
              <ShoppingBag size={60} className="mb-4 opacity-10" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">Your cart is empty</h3>
              <p className="text-sm">Browse our menu and pick something delicious!</p>
              <button 
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-yellow-400 text-slate-900 font-black rounded-lg text-sm shadow-md active:scale-95 transition-all"
              >
                Go Back
              </button>
            </div>
          ) : (
            <div className="p-5">
              <div className="space-y-6">
                {cart.map((item, idx) => {
                  const selectedAddonsDetails = item.addons?.filter(addon => item.selectedAddons?.includes(addon.id)) || [];
                  
                  return (
                    <div key={`${item.id}-${idx}`} className="flex gap-4 animate-fadeIn">
                      <div className="relative shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 rounded-xl object-cover shadow-sm bg-gray-50 border border-gray-100"
                        />
                        <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                          {item.quantity}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-black text-slate-900 text-base leading-tight truncate">{item.name}</h4>
                          <button 
                              onClick={() => onRemoveItem(item.id)}
                              className="text-gray-300 hover:text-red-600 transition-colors"
                          >
                              <Trash2 size={12} />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {item.selectedSize && (
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                              Size: {item.sizes?.find(s => s.id === item.selectedSize)?.name}
                            </span>
                          )}
                          {selectedAddonsDetails.length > 0 && (
                            <div className="w-full flex flex-wrap gap-1 mt-1">
                              {selectedAddonsDetails.map(addon => (
                                <span key={addon.id} className="text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  + {addon.name} (₹{Math.round(addon.price)})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-red-600 font-black text-base">
                            ₹{Math.round(calculateItemTotal(item))}
                          </span>
                          
                          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 overflow-hidden h-7">
                            <button 
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-slate-900"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-5 text-center text-[11px] font-black text-slate-900">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-slate-900"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Condensed Totals Section */}
              <div className="mt-10 pt-6 border-t border-dashed border-gray-200 space-y-2">
                <div className="flex justify-between text-slate-400 text-sm font-bold">
                  <span>Subtotal</span>
                  <span className="text-slate-900">₹{Math.round(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-sm font-bold">
                  <span>Delivery</span>
                  <span className="text-red-600">FREE</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-2xl pt-2">
                  <span>Total</span>
                  <span>₹{Math.round(totalAmount)}</span>
                </div>
              </div>
              
              {/* Added Tax Disclaimer */}
              <div className="mt-6 text-[10px] text-slate-400 font-bold leading-tight italic text-center px-4">
                {t("This is the price before tax and other charges. The final bill may be different.")}
              </div>
            </div>
          )}
        </div>

        <SerratedDivider flipped color="#A1D6E2" />

        {/* Footer Actions - Matches Line Animation Color (#A1D6E2) */}
        <div className="p-4 bg-[#A1D6E2] space-y-4 shrink-0 pb-8">
          {cart.length > 0 && (
            <button
              onClick={handlePlaceOrderClick}
              disabled={showConfirmation}
              className={`w-[75%] mx-auto py-4 rounded-[16px] font-black text-lg shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${
                showConfirmation 
                  ? 'bg-white/40 text-slate-400 shadow-none cursor-not-allowed' 
                  : 'bg-yellow-400 text-slate-900 hover:bg-yellow-500'
              }`}
            >
              <Check size={20} />
              {t("PLACE ORDER")}
            </button>
          )}

          {/* Help Bar - Styled for the new light blue background */}
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs font-black text-slate-700/60 uppercase tracking-tight">Need help?</span>
            <div className="flex gap-2">
              {supportEmail && (
                <a href={`mailto:${supportEmail}`} className="bg-white/80 p-2 rounded-lg text-slate-700 hover:text-[#1A3E5D] transition-all flex items-center gap-2 shadow-sm">
                  <Mail size={14} />
                  <span className="text-xs font-bold">Email</span>
                </a>
              )}
              {supportPhone && (
                <a href={`tel:${supportPhone}`} className="bg-white/80 p-2 rounded-lg text-slate-700 hover:text-[#1A3E5D] transition-all flex items-center gap-2 shadow-sm">
                  <Phone size={14} />
                  <span className="text-xs font-bold">Call</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleUp {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default CartDrawer;
