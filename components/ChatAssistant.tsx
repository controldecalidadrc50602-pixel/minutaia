
import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Sparkles, User, Bot, Loader2, Trash2, X, MessageSquareText } from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { chatWithAssistant } from '../services/geminiService';
import { getTranslation } from '../translations';

interface ChatAssistantProps {
  context: string;
  meetingId: string;
  lang: Language;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ context, meetingId, lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Widget state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(lang);

  // Load history from localStorage on meetingId change
  useEffect(() => {
    const savedChat = localStorage.getItem(`chat_${meetingId}`);
    if (savedChat) {
        setMessages(JSON.parse(savedChat));
    } else {
        setMessages([
            { id: '1', role: 'model', text: lang === 'es' ? '¡Hola! ¿En qué puedo ayudarte con esta minuta?' : 'Hi! How can I help you with this meeting?' }
        ]);
    }
  }, [meetingId, lang]);

  // Save history to localStorage on message update
  useEffect(() => {
     if (messages.length > 0) {
         localStorage.setItem(`chat_${meetingId}`, JSON.stringify(messages));
     }
  }, [messages, meetingId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
      if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the current messages as history
      const response = await chatWithAssistant(messages, userMsg.text, context, useSearch, lang);
      
      const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: response.text || "I couldn't generate a response.",
          groundingUrls: response.groundingUrls
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: 'Sorry, I encountered an error.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
      if(window.confirm("Are you sure you want to clear this chat history?")) {
        setMessages([{ id: Date.now().toString(), role: 'model', text: 'Chat cleared.' }]);
        localStorage.removeItem(`chat_${meetingId}`);
      }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-4 no-print">
        
        {/* Chat Window */}
        {isOpen && (
            <div className="w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-fade-in-up origin-bottom-right">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex justify-between items-center rounded-t-2xl">
                    <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        AI Assistant
                    </h3>
                    <div className="flex gap-2 items-center">
                        <button 
                            onClick={() => setUseSearch(!useSearch)}
                            className={`p-1.5 rounded-md transition-colors ${useSearch ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            title={useSearch ? t.webSearchOn : t.webSearchOff}
                        >
                            <Globe className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={clearChat}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title={t.clearHistory}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-emerald-100 dark:bg-emerald-900'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-indigo-600 dark:text-indigo-300" /> : <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />}
                            </div>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-tl-none shadow-sm'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-600">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Sources:</p>
                                        <ul className="space-y-1">
                                            {msg.groundingUrls.map((url, i) => (
                                                <li key={i}>
                                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-[200px]">
                                                        {new URL(url).hostname}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                            </div>
                            <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 rounded-2xl rounded-tl-none">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t.thinking}</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={useSearch ? t.chatWebPlaceholder : t.chatPlaceholder}
                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white dark:placeholder-gray-400"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Floating Toggle Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center
                ${isOpen ? 'bg-gray-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
            `}
            title={isOpen ? t.closeChat : t.openChat}
        >
            {isOpen ? <X className="w-6 h-6" /> : <MessageSquareText className="w-6 h-6" />}
        </button>
    </div>
  );
};

export default ChatAssistant;
