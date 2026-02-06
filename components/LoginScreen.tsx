import React, { useState } from 'react';
import { Bot, ArrowRight } from 'lucide-react';
import { Language, User } from '../types';
import { getTranslation } from '../translations';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  lang: Language;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, lang }) => {
  const [name, setName] = useState('');
  const t = getTranslation(lang);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin({ name });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-8 sm:p-12">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg shadow-indigo-500/30">
            <Bot className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            {t.loginTitle}
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            {t.loginSubtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="sr-only">Name</label>
              <input
                type="text"
                id="name"
                required
                className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
            >
              <span>{t.enterButton}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;