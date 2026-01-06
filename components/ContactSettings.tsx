
import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { Save, Phone, Mail, X, ShieldCheck, Instagram, Search, Loader2, Check } from 'lucide-react';

interface ContactSettingsProps {
  settings: SiteSettings;
  onSave: (settings: Partial<SiteSettings>) => Promise<void>;
  onCancel: () => void;
}

const ContactSettings: React.FC<ContactSettingsProps> = ({ settings, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    supportEmail: settings.supportEmail || '',
    supportPhone: settings.supportPhone || '',
    instagramUrl: settings.instagramUrl || '',
    googleReviewUrl: settings.googleReviewUrl || ''
  });
  
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
          <Phone className="text-green-600" />
          Cart Contact & Social Details
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-medium text-sm transition-colors">
          {isSaved ? 'Close' : 'Cancel'}
        </button>
      </div>

      <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100 flex gap-3 items-start">
        <ShieldCheck className="text-green-600 shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm font-bold text-green-800">Support & Social Links</p>
          <p className="text-xs text-green-700 mt-1 opacity-80">
            These details will be displayed in the customer's cart summary and the bottom "Loved it!" section.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="block text-xs font-black text-slate-500 mb-2 uppercase flex items-center gap-1.5 tracking-wider">
              <Mail size={14} className="text-slate-400" /> Support Email Address
            </label>
            <input
              type="email"
              name="supportEmail"
              value={formData.supportEmail}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium transition-all text-slate-900"
              placeholder="e.g. support@jadedragon.com"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 mb-2 uppercase flex items-center gap-1.5 tracking-wider">
              <Phone size={14} className="text-slate-400" /> Support Phone Number
            </label>
            <input
              type="tel"
              name="supportPhone"
              value={formData.supportPhone}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium transition-all text-slate-900"
              placeholder="e.g. +1 987 654 3210"
            />
          </div>
          <div className="h-[1px] bg-gray-100 my-1" />
          <div>
            <label className="block text-xs font-black text-slate-500 mb-2 uppercase flex items-center gap-1.5 tracking-wider">
              <Instagram size={14} className="text-slate-400" /> Instagram Link
            </label>
            <input
              type="url"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium transition-all text-slate-900"
              placeholder="e.g. https://instagram.com/yourhandle"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 mb-2 uppercase flex items-center gap-1.5 tracking-wider">
              <img src="https://www.google.com/favicon.ico" className="w-3.5 h-3.5 opacity-60" alt="" /> Google Review Link
            </label>
            <input
              type="url"
              name="googleReviewUrl"
              value={formData.googleReviewUrl}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium transition-all text-slate-900"
              placeholder="e.g. https://g.page/review/yourplace"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving || isSaved}
            className={`flex-1 font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${isSaved ? 'bg-green-100 text-green-700 shadow-none' : 'bg-green-600 text-white hover:bg-green-700 shadow-green-100'}`}
          >
            {isSaving ? (
                <>
                    <Loader2 size={18} className="animate-spin" /> Saving...
                </>
            ) : isSaved ? (
                <>
                    <Check size={18} /> Settings Saved!
                </>
            ) : (
                <>
                    <Save size={18} /> Update Details
                </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactSettings;
