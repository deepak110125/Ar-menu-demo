
import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { Save, Layout, ImageIcon, Type, Video, Loader2, Check } from 'lucide-react';

interface AppearanceSettingsProps {
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => Promise<void>;
  onCancel: () => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ settings, onSave, onCancel }) => {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
    setIsSaved(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layout className="text-blue-600" />
          Edit Menu
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors">
          {isSaved ? 'Close' : 'Cancel'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-1.5 tracking-wider">
            <ImageIcon size={14} className="text-slate-400" /> logo (link)
          </label>
          <input
            type="url"
            name="logoUrl"
            value={formData.logoUrl || ''}
            onChange={handleChange}
            disabled={isSaving}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all text-slate-900"
            placeholder="Paste logo image link here"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-1.5 tracking-wider">
            <Type size={14} className="text-slate-400" /> Hero text
          </label>
          <input
            type="text"
            name="heroTitle"
            value={formData.heroTitle}
            onChange={handleChange}
            disabled={isSaving}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all text-slate-900"
            placeholder="Main hero heading"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-1.5 tracking-wider">
            <Type size={14} className="text-slate-400" /> Hero tagline
          </label>
          <input
            type="text"
            name="heroTagline"
            value={formData.heroTagline}
            onChange={handleChange}
            disabled={isSaving}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all text-slate-900"
            placeholder="Small hero tagline text"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-1.5 tracking-wider">
            <Video size={14} className="text-slate-400" /> Hero video (link)
          </label>
          <input
            type="url"
            name="heroVideoUrl"
            value={formData.heroVideoUrl || ''}
            onChange={handleChange}
            disabled={isSaving}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all text-slate-900"
            placeholder="Paste background video link here"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving || isSaved}
          className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 mt-4 ${isSaved ? 'bg-green-100 text-green-700 shadow-none' : 'bg-blue-600 text-black hover:bg-blue-700 shadow-blue-100'}`}
        >
            {isSaving ? (
                <>
                    <Loader2 size={18} className="animate-spin" /> Saving...
                </>
            ) : isSaved ? (
                <>
                    <Check size={18} /> Menu Info Updated!
                </>
            ) : (
                <>
                    <Save size={18} /> Update Menu Info
                </>
            )}
        </button>
      </form>
    </div>
  );
};

export default AppearanceSettings;
