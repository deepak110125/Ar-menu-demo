
import React from 'react';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  translations?: Record<string, string>;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategory, onSelectCategory, translations }) => {
  return (
    <div className="flex overflow-x-auto no-scrollbar items-center gap-1.5 h-full py-1.5 pl-[2px] pr-0">
      {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const displayLabel = translations?.[cat] || cat;
          return (
              <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2.5 text-sm font-bold transition-all duration-300 relative whitespace-nowrap rounded-full ${
                      isActive 
                        ? 'text-white bg-red-600 shadow-md scale-105' 
                        : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
                  }`}
              >
                  {displayLabel}
              </button>
          );
      })}
    </div>
  );
};

export default CategoryTabs;
