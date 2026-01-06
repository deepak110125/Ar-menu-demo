
import React, { useState, useEffect } from 'react';
import { MenuItem, AddOn, Size } from '../types';
import { PlusCircle, X, Image as ImageIcon, Box, ListPlus, Trash2, Plus, Star, Heart, Layers, Save, Loader2 } from 'lucide-react';

interface AdminFormProps {
  onAddItem: (item: MenuItem) => Promise<void>;
  onCancel: () => void;
  categories: string[];
  initialCategory?: string;
  itemToEdit?: MenuItem;
}

type SizeType = 'none' | 'sml' | 'hf';

const AdminForm: React.FC<AdminFormProps> = ({ onAddItem, onCancel, categories, initialCategory, itemToEdit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sizeType, setSizeType] = useState<SizeType>('none');
  const [sizePrices, setSizePrices] = useState({
    small: 0,
    medium: 0,
    large: 0,
    half: 0,
    full: 0
  });

  const defaultFormData = {
    category: initialCategory || (categories.length > 0 ? categories[0] : ''),
    isSpicy: false,
    isVeg: true,
    isAvailable: true,
    isBestSeller: false,
    isChefsFav: false,
    price: 0,
    addons: [],
    name: '',
    description: '',
    image: '',
    arModelUrl: ''
  };

  const [formData, setFormData] = useState<Partial<MenuItem>>(defaultFormData);

  const [ingredientsInput, setIngredientsInput] = useState('');
  const [allergensInput, setAllergensInput] = useState('');
  
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: '0g',
    carbs: '0g',
    fat: '0g'
  });

  // Effect to populate form when editing
  useEffect(() => {
    if (itemToEdit) {
      setFormData(itemToEdit);
      setIngredientsInput(itemToEdit.ingredients?.join(', ') || '');
      setAllergensInput(itemToEdit.allergens?.join(', ') || '');
      if (itemToEdit.nutrition) {
        setNutrition({
          calories: itemToEdit.nutrition.calories,
          protein: itemToEdit.nutrition.protein,
          carbs: itemToEdit.nutrition.carbs,
          fat: itemToEdit.nutrition.fat
        });
      }

      // Detect size type
      if (itemToEdit.sizes && itemToEdit.sizes.length > 0) {
        const hasSmall = itemToEdit.sizes.some(s => s.name === 'Small');
        const hasHalf = itemToEdit.sizes.some(s => s.name === 'Half');
        
        if (hasSmall) {
          setSizeType('sml');
          setSizePrices(prev => ({
            ...prev,
            small: itemToEdit.sizes?.find(s => s.name === 'Small')?.price || 0,
            medium: itemToEdit.sizes?.find(s => s.name === 'Medium')?.price || 0,
            large: itemToEdit.sizes?.find(s => s.name === 'Large')?.price || 0,
          }));
        } else if (hasHalf) {
          setSizeType('hf');
          setSizePrices(prev => ({
            ...prev,
            half: itemToEdit.sizes?.find(s => s.name === 'Half')?.price || 0,
            full: itemToEdit.sizes?.find(s => s.name === 'Full')?.price || 0,
          }));
        }
      } else {
        setSizeType('none');
      }
    }
  }, [itemToEdit]);

  const handleAddAddon = () => {
    const newAddon: AddOn = {
      id: Date.now().toString(),
      name: '',
      price: 0
    };
    setFormData(prev => ({
      ...prev,
      addons: [...(prev.addons || []), newAddon]
    }));
  };

  const handleUpdateAddon = (id: string, field: keyof AddOn, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons?.map(a => a.id === id ? { ...a, [field]: value } : a)
    }));
  };

  const handleRemoveAddon = (id: string) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons?.filter(a => a.id !== id)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price') {
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSizePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSizePrices(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleNutritionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setNutrition(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.image) {
        alert('Please fill in required fields (Name, Description, Image URL)');
        return;
    }

    setIsSubmitting(true);

    try {
        // Process Sizes
        let finalSizes: Size[] | undefined = undefined;
        if (sizeType === 'sml') {
          finalSizes = [
            { id: itemToEdit?.sizes?.find(s => s.name === 'Small')?.id || 's1', name: 'Small', price: sizePrices.small },
            { id: itemToEdit?.sizes?.find(s => s.name === 'Medium')?.id || 's2', name: 'Medium', price: sizePrices.medium },
            { id: itemToEdit?.sizes?.find(s => s.name === 'Large')?.id || 's3', name: 'Large', price: sizePrices.large }
          ];
        } else if (sizeType === 'hf') {
          finalSizes = [
            { id: itemToEdit?.sizes?.find(s => s.name === 'Half')?.id || 'h1', name: 'Half', price: sizePrices.half },
            { id: itemToEdit?.sizes?.find(s => s.name === 'Full')?.id || 'h2', name: 'Full', price: sizePrices.full }
          ];
        }

        // Clean up empty add-ons
        const validAddons = (formData.addons || []).filter(a => a.name.trim() !== '');

        const newItem: MenuItem = {
            ...formData,
            id: itemToEdit?.id || '', // Empty ID tells App to generate/ignore
            name: formData.name!,
            category: formData.category || categories[0],
            price: sizeType === 'none' ? (formData.price || 0) : (sizeType === 'sml' ? sizePrices.medium : sizePrices.full),
            description: formData.description!,
            image: formData.image!,
            arModelUrl: formData.arModelUrl,
            isSpicy: formData.isSpicy || false, 
            isVeg: !!formData.isVeg,
            isAvailable: formData.isAvailable ?? true,
            isBestSeller: !!formData.isBestSeller,
            isChefsFav: !!formData.isChefsFav,
            addons: validAddons.length > 0 ? validAddons : undefined,
            sizes: finalSizes,
            ingredients: ingredientsInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
            allergens: allergensInput.split(',').map(s => s.trim()).filter(s => s.length > 0),
            nutrition: (nutrition.calories > 0 || parseFloat(nutrition.protein) > 0) ? { 
                calories: Number(nutrition.calories), 
                protein: nutrition.protein, 
                carbs: nutrition.carbs, 
                fat: nutrition.fat 
            } : undefined
        };

        await onAddItem(newItem);
        
        if (!itemToEdit) {
            alert("Item added successfully!");
            // Clear form
            setFormData(defaultFormData);
            setIngredientsInput('');
            setAllergensInput('');
            setNutrition({ calories: 0, protein: '0g', carbs: '0g', fat: '0g' });
            setSizeType('none');
            setSizePrices({ small: 0, medium: 0, large: 0, half: 0, full: 0 });
        }
    } catch (error) {
        console.error("Error saving item:", error);
        alert("Failed to save item. See console for details.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {itemToEdit ? <Save className="text-blue-500" /> : <PlusCircle className="text-red-500" />}
                {itemToEdit ? 'Edit Item' : 'Add New Item'}
            </h2>
            <button onClick={onCancel} disabled={isSubmitting} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                    <input 
                        required
                        type="text" 
                        name="name" 
                        value={formData.name || ''} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-slate-900"
                        placeholder="e.g. Dragon Noodles"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                    <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white text-slate-900"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Status Flags */}
            <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        name="isVeg" 
                        checked={!!formData.isVeg} 
                        onChange={handleChange}
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        name="isBestSeller" 
                        checked={!!formData.isBestSeller} 
                        onChange={handleChange}
                        className="w-4 h-4 text-yellow-500 rounded border-gray-300 focus:ring-yellow-400"
                    />
                    <Star size={14} className={formData.isBestSeller ? "text-yellow-500 fill-yellow-500" : "text-slate-400"} />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Best Seller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        name="isChefsFav" 
                        checked={!!formData.isChefsFav} 
                        onChange={handleChange}
                        className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <Heart size={14} className={formData.isChefsFav ? "text-red-500 fill-red-500" : "text-slate-400"} />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Chef's Favorite</span>
                </label>
            </div>

            {/* Sizes & Pricing Section */}
            <div className="space-y-4 border-t border-gray-100 pt-4">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Layers size={16} className="text-red-500" /> Size & Pricing Configuration
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <button 
                  type="button"
                  onClick={() => setSizeType('none')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${sizeType === 'none' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-gray-100 text-slate-400'}`}
                >
                  Single Price
                </button>
                <button 
                  type="button"
                  onClick={() => setSizeType('sml')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${sizeType === 'sml' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-gray-100 text-slate-400'}`}
                >
                  S / M / L
                </button>
                <button 
                  type="button"
                  onClick={() => setSizeType('hf')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${sizeType === 'hf' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-gray-100 text-slate-400'}`}
                >
                  Half / Full
                </button>
              </div>

              {sizeType === 'none' && (
                <div className="animate-fadeIn">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Standard Price (₹) *</label>
                    <input 
                        type="number" 
                        step="1"
                        name="price" 
                        value={formData.price || ''} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900"
                        placeholder="0.00"
                    />
                </div>
              )}

              {sizeType === 'sml' && (
                <div className="grid grid-cols-3 gap-4 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Small Price</label>
                    <input type="number" name="small" value={sizePrices.small || ''} onChange={handleSizePriceChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-slate-900" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Medium Price</label>
                    <input type="number" name="medium" value={sizePrices.medium || ''} onChange={handleSizePriceChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-slate-900" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Large Price</label>
                    <input type="number" name="large" value={sizePrices.large || ''} onChange={handleSizePriceChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-slate-900" placeholder="0" />
                  </div>
                </div>
              )}

              {sizeType === 'hf' && (
                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Half Price</label>
                    <input type="number" name="half" value={sizePrices.half || ''} onChange={handleSizePriceChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-slate-900" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Full Price</label>
                    <input type="number" name="full" value={sizePrices.full || ''} onChange={handleSizePriceChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-slate-900" placeholder="0" />
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea 
                    required
                    name="description" 
                    rows={3}
                    value={formData.description || ''} 
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none text-slate-900"
                    placeholder="Describe the dish..."
                />
            </div>

            {/* Add-ons Management Section */}
            <div className="space-y-4 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <ListPlus size={16} className="text-red-500" /> Manage Add-ons
                    </label>
                    <button 
                        type="button"
                        onClick={handleAddAddon}
                        className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                        <Plus size={12} /> Add Add-on
                    </button>
                </div>
                
                <div className="space-y-2">
                    {formData.addons?.map((addon) => (
                        <div key={addon.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl animate-fadeIn">
                            <input 
                                type="text"
                                placeholder="Name (e.g. Extra Egg)"
                                value={addon.name}
                                onChange={(e) => handleUpdateAddon(addon.id, 'name', e.target.value)}
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-900"
                            />
                            <div className="relative w-24">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                <input 
                                    type="number"
                                    step="1"
                                    placeholder="0"
                                    value={addon.price || ''}
                                    onChange={(e) => handleUpdateAddon(addon.id, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-5 pr-2 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-900"
                                />
                            </div>
                            <button 
                                type="button"
                                onClick={() => handleRemoveAddon(addon.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {(!formData.addons || formData.addons.length === 0) && (
                        <p className="text-xs text-slate-400 text-center py-2 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            No add-ons defined for this item.
                        </p>
                    )}
                </div>
            </div>

            {/* Media */}
            <div className="space-y-4 border-t border-b border-gray-100 py-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                        <ImageIcon size={16} /> Image URL *
                    </label>
                    <input 
                        required
                        type="url" 
                        name="image" 
                        value={formData.image || ''} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm font-mono text-slate-900"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                        <Box size={16} /> AR Model URL (Optional)
                    </label>
                    <input 
                        type="url" 
                        name="arModelUrl" 
                        value={formData.arModelUrl || ''} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm font-mono text-slate-900"
                        placeholder="https://example.com/model.glb"
                    />
                    <p className="text-xs text-slate-400 mt-1">Link to a 3D model or AR viewer page.</p>
                </div>
            </div>

            {/* Advanced Details (Optional) */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-900">Nutrition & Ingredients (Optional)</h3>
                
                <div className="grid grid-cols-2 gap-3">
                    <input type="number" name="calories" value={nutrition.calories || ''} placeholder="Calories" onChange={handleNutritionChange} className="p-2 border rounded text-sm outline-none focus:ring-2 focus:ring-red-500 text-slate-900" />
                    <input type="text" name="protein" value={nutrition.protein || ''} placeholder="Protein (e.g. 10g)" onChange={handleNutritionChange} className="p-2 border rounded text-sm outline-none focus:ring-2 focus:ring-red-500 text-slate-900" />
                    <input type="text" name="carbs" value={nutrition.carbs || ''} placeholder="Carbs (e.g. 20g)" onChange={handleNutritionChange} className="p-2 border rounded text-sm outline-none focus:ring-2 focus:ring-red-500 text-slate-900" />
                    <input type="text" name="fat" value={nutrition.fat || ''} placeholder="Fat (e.g. 5g)" onChange={handleNutritionChange} className="p-2 border rounded text-sm outline-none focus:ring-2 focus:ring-red-500 text-slate-900" />
                </div>

                <input 
                    type="text" 
                    value={ingredientsInput}
                    onChange={(e) => setIngredientsInput(e.target.value)}
                    placeholder="Ingredients (comma separated)" 
                    className="w-full p-2 border rounded text-sm outline-none focus:ring-2 focus:ring-red-500 text-slate-900" 
                />
                <input 
                    type="text" 
                    value={allergensInput}
                    onChange={(e) => setAllergensInput(e.target.value)}
                    placeholder="Allergens (comma separated)" 
                    className="w-full p-2 border rounded text-sm outline-none focus:ring-2 focus:ring-red-500 text-slate-900" 
                />
            </div>

            <div className="pt-2 flex gap-3">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`flex-1 ${itemToEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white font-bold py-3 rounded-xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-2`}
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : (itemToEdit ? 'Update Item' : 'Add Item')}
                </button>
                <button 
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 bg-white text-slate-600 font-bold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
                >
                    Cancel
                </button>
            </div>

        </form>
    </div>
  );
};

export default AdminForm;
