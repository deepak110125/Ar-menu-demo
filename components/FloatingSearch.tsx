import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface FloatingSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  language: string;
}

const FloatingSearch: React.FC<FloatingSearchProps> = ({ searchQuery, onSearchChange, language }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isExpanded]);

  // Collapse if clicked outside (optional, but good UX) or if query is cleared
  const handleToggle = () => {
    if (isExpanded && searchQuery) {
        // If searching, just close visual but keep query? Or clear? 
        // Usually clicking the main FAB again closes it.
        setIsExpanded(false);
    } else {
        setIsExpanded(!isExpanded);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSearchChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center justify-end transition-all duration-300 ${isExpanded ? 'w-full max-w-[calc(100vw-3rem)]' : 'w-auto'}`}>
      <div 
        className={`flex items-center bg-white shadow-2xl rounded-full overflow-hidden transition-all duration-300 ease-in-out border border-gray-100 ${
            isExpanded ? 'w-full pl-4 pr-1 py-1' : 'w-14 h-14 justify-center cursor-pointer hover:scale-105 active:scale-95 bg-red-600 border-none'
        }`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        {isExpanded ? (
            <>
                <Search size={18} className="text-slate-400 flex-shrink-0 mr-2" />
                <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={language === 'EN' ? "Search dishes..." : "搜索菜品..."}
                    className="flex-1 bg-transparent outline-none text-slate-800 text-sm placeholder-slate-400 h-10"
                />
                <button 
                    onClick={handleClear}
                    className={`p-2 rounded-full hover:bg-gray-100 text-slate-400 transition-opacity ${searchQuery ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    <X size={16} />
                </button>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                    }}
                    className="ml-1 p-2 bg-gray-100 rounded-full text-slate-600 hover:bg-gray-200"
                >
                    <X size={18} />
                </button>
            </>
        ) : (
            <Search size={24} className="text-white" />
        )}
      </div>
    </div>
  );
};

export default FloatingSearch;