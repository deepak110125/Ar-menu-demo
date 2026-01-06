
import React, { useState, useEffect } from 'react';
import { CategoryConfig, ParallaxSpeed } from '../types';
import { Video, ImageIcon, Save, LayoutTemplate, Trash2, Plus, X } from 'lucide-react';

interface CategoryManagerProps {
  categories: string[];
  configs: Record<string, CategoryConfig>;
  onSaveConfig: (category: string, config: CategoryConfig) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (name: string) => void;
  onClose: () => void;
  activeCategory: string;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, 
  configs, 
  onSaveConfig, 
  onAddCategory, 
  onDeleteCategory, 
  onClose,
  activeCategory: initialActive
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialActive || categories[0]);
  const [editConfig, setEditConfig] = useState<CategoryConfig | null>(null);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (configs[selectedCategory]) {
      setEditConfig({ ...configs[selectedCategory] });
    }
  }, [selectedCategory, configs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editConfig) return;
    const { name, value } = e.target;
    if (name === 'overlayOpacity') {
      setEditConfig(prev => prev ? ({ ...prev, [name]: parseFloat(value) }) : null);
    } else {
      setEditConfig(prev => prev ? ({ ...prev, [name]: value }) : null);
    }
  };

  const handleSave = () => {
    if (editConfig) {
      onSaveConfig(selectedCategory, editConfig);
      alert(`Configuration saved for ${selectedCategory}`);
    }
  };

  const handleAdd = () => {
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden animate-fadeIn">
      <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <LayoutTemplate className="text-purple-600" size={20} />
          Category Settings & Media
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-slate-400 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row h-full">
        {/* Left Sidebar: Category List */}
        <div className="w-full md:w-64 border-r border-gray-100 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-100 bg-slate-50/50">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New..."
                className="flex-1 min-w-0 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
              />
              <button 
                onClick={handleAdd}
                disabled={!newCatName.trim()}
                className="p-1.5 bg-purple-600 text-white rounded-lg disabled:bg-gray-300"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[250px] md:max-h-none p-2 space-y-1">
            {categories.map((cat) => (
              <div 
                key={cat}
                className={`flex items-center group rounded-xl transition-all ${
                  selectedCategory === cat ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-100' : 'text-slate-600 hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className="flex-1 text-left px-4 py-2.5 text-sm font-bold truncate"
                >
                  {cat}
                </button>
                <button 
                  onClick={() => onDeleteCategory(cat)}
                  className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content: Config Editor */}
        <div className="flex-1 p-6 space-y-6">
          {editConfig ? (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                  Settings for: <span className="text-purple-600">{selectedCategory}</span>
                </h3>
              </div>

              <div className="space-y-4">
                {/* Video URL Input - Per Category */}
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase flex items-center gap-1.5 tracking-wider">
                    <Video size={14} className="text-slate-400" /> Category Hero Video (link)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="videoUrl"
                      value={editConfig.videoUrl || ''}
                      onChange={handleChange}
                      className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium transition-all text-slate-900"
                      placeholder="Paste .mp4 link for this category"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    This video will play as the background ONLY when this category is active.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase flex items-center gap-1.5 tracking-wider">
                    <ImageIcon size={14} className="text-slate-400" /> Fallback Image (link)
                  </label>
                  <input
                    type="url"
                    name="fallbackImage"
                    value={editConfig.fallbackImage || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium transition-all text-slate-900"
                    placeholder="Image used if video fails to load"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Overlay Opacity ({editConfig.overlayOpacity})
                    </label>
                    <input
                      type="range"
                      name="overlayOpacity"
                      min="0"
                      max="0.9"
                      step="0.1"
                      value={editConfig.overlayOpacity}
                      onChange={handleChange}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                      Parallax Speed
                    </label>
                    <select
                      name="parallaxSpeed"
                      value={editConfig.parallaxSpeed}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium text-slate-900"
                    >
                      <option value="slow">Slow</option>
                      <option value="medium">Medium</option>
                      <option value="fast">Fast</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-100 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Save size={18} /> Save {selectedCategory} Config
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
              <LayoutTemplate size={40} className="opacity-20 mb-2" />
              <p className="text-sm font-medium">Select a category to edit its media</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
