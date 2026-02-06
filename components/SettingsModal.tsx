
import React, { useState, useEffect } from 'react';
import { 
  X as XIcon, Key, Cloud, Copy, Check, Code, 
  AlertCircle, Globe, Zap 
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, lang, onLanguageChange }) => {
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const t = getTranslation(lang);

  useEffect(() => {
    const savedUrl = localStorage.getItem('minutas_apps_script_url');
    const savedWebhook = localStorage.getItem('minutas_external_webhook_url');
    if (savedUrl) setAppsScriptUrl(savedUrl);
    if (savedWebhook) setWebhookUrl(savedWebhook);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('minutas_apps_script_url', appsScriptUrl);
    localStorage.setItem('minutas_external_webhook_url', webhookUrl);
    setIsSaved(true);
    setTimeout(() => {
        setIsSaved(false);
        onClose();
    }, 1000);
  };

  const copyScriptCode = () => {
    const code = `// Google Apps Script code for integration...`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-750 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            {t.settings}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    {t.language}
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onLanguageChange('es')} className={`py-3 px-4 rounded-xl border-2 transition-all font-semibold text-sm ${lang === 'es' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-200'}`}>Español</button>
                    <button onClick={() => onLanguageChange('en')} className={`py-3 px-4 rounded-xl border-2 transition-all font-semibold text-sm ${lang === 'en' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-200'}`}>English</button>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Integración Externa (API Webhook)
                </p>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.webhookLabel}</label>
                    <input 
                        type="text"
                        className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400"
                        placeholder={t.webhookPlaceholder}
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-400 italic">Usaremos esta URL para enviar un POST JSON con los resultados de la reunión.</p>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-500" />
                    Google Apps Script URL
                </label>
                <input 
                    type="text"
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={appsScriptUrl}
                    onChange={(e) => setAppsScriptUrl(e.target.value)}
                />
            </div>

            <div className="pt-4">
                <button
                    onClick={handleSave}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${isSaved ? 'bg-emerald-600 text-white' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90'}`}
                >
                    {isSaved ? <Check className="w-5 h-5" /> : null}
                    {isSaved ? t.saved : t.save}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
