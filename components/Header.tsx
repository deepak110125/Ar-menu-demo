
import React from 'react';
import { Settings, User, Search, Globe, X, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  isAdminMode?: boolean;
  onToggleAdmin?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  language: string;
  onToggleLanguage: () => void;
  tableId?: string;
  cartCount: number;
  onOpenCart: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isAdminMode, 
  onToggleAdmin, 
  searchQuery, 
  onSearchChange,
  language,
  onToggleLanguage,
  tableId,
  cartCount,
  onOpenCart
}) => {
  return (
    <div className="bg-white pt-6 pb-4 px-6 sticky top-0 z-30 shadow-sm border-b border-gray-100">
      {/* Top Row: Logo, Title, Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-orange-100 flex-shrink-0 shadow-inner">
                <img 
                    src="https://picsum.photos/100/100?random=logo" 
                    alt="Restaurant Logo" 
                    className="w-full h-full object-cover opacity-90"
                />
            </div>
            <div>
              <h1 className="text-slate-900 text-lg font-bold leading-tight">Jade Dragon</h1>
              <div className="flex items-center gap-2">
                 <p className="text-slate-400 text-xs font-medium">Asian Fusion</p>
                 {tableId && (
                     <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-md border border-red-200">
                        Table {tableId}
                     </span>
                 )}
              </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-3 py-2 rounded-full bg-gray-50 text-slate-600 text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              <Globe size={14} />
              {language}
            </button>

            {onToggleAdmin && (
                <button 
                    onClick={onToggleAdmin}
                    className={`p-2 rounded-full transition-colors ${isAdminMode ? 'bg-red-100 text-red-600' : 'bg-gray-50 text-slate-500 hover:bg-gray-100'}`}
                    aria-label="Toggle Admin Mode"
                >
                    {isAdminMode ? <User size={18} /> : <Settings size={18} />}
                </button>
            )}

            {!isAdminMode && (
                <button
                    onClick={onOpenCart}
                    className="relative p-2 rounded-xl bg-[#4B8DA8] text-white hover:opacity-90 transition-all shadow-md shadow-gray-200"
                >
                    <ShoppingBag size={18} />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 border-2 border-white rounded-full text-[9px] font-bold flex items-center justify-center">
                            {cartCount}
                        </span>
                    )}
                </button>
            )}
        </div>
      </div>

      {/* Bottom Row: Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 sm:text-sm"
          placeholder={language === 'English' ? "Search for dishes..." : "搜索菜品..."}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
