
import React from 'react';

interface NonVegToggleProps {
  isNonVegOnly: boolean;
  onToggle: () => void;
  label?: string;
}

const NonVegToggle: React.FC<NonVegToggleProps> = ({ isNonVegOnly, onToggle, label = "Non-Veg Only" }) => {
  return (
    <label className="flex items-center cursor-pointer select-none group">
      <span className={`mr-2 text-sm font-bold transition-colors duration-300 ${isNonVegOnly ? 'text-red-600' : 'text-slate-500'}`}>
        {label}
      </span>
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={isNonVegOnly} 
          onChange={onToggle} 
        />
        <div className="block bg-gray-300 w-10 h-6 rounded-full peer-checked:bg-red-600 transition-colors duration-300 shadow-inner"></div>
        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-4 shadow-sm"></div>
      </div>
    </label>
  );
};

export default NonVegToggle;
