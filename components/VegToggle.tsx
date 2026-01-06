
import React from 'react';

interface VegToggleProps {
  isVegOnly: boolean;
  onToggle: () => void;
  label?: string;
}

const VegToggle: React.FC<VegToggleProps> = ({ isVegOnly, onToggle, label = "Veg Only" }) => {
  return (
    <label className="flex items-center cursor-pointer select-none group">
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={isVegOnly} 
          onChange={onToggle} 
        />
        <div className="block bg-gray-300 w-10 h-6 rounded-full peer-checked:bg-green-500 transition-colors duration-300 shadow-inner"></div>
        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-4 shadow-sm"></div>
      </div>
      <span className={`ml-2 text-sm font-bold transition-colors duration-300 ${isVegOnly ? 'text-green-600' : 'text-slate-500'}`}>
        {label}
      </span>
    </label>
  );
};

export default VegToggle;
