
import React, { useState, useEffect } from 'react';
import { 
    Mic, Clock, FileText, Moon, Sun, LogOut, 
    Settings, Search, Trash2, Edit3, Sparkles, Trophy
} from 'lucide-react';
import InputZone from './components/InputZone';
import AnalysisDashboard from './components/AnalysisDashboard';
import LiveMeeting from './components/LiveMeeting';
import ChatAssistant from './components/ChatAssistant';
import LoginScreen from './components/LoginScreen';
import SettingsModal from './components/SettingsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { transcribeAudio, generateMeetingAnalysis } from './services/geminiService';
import { MeetingRecord, ProcessingStatus, Language, Theme, User } from './types';
import { getTranslation } from './translations';
import { supabase } from './supabaseClient';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'live' | 'history'>('create');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [currentRecord, setCurrentRecord] = useState<MeetingRecord | null>(null);
  const [history, setHistory] = useState<MeetingRecord[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [lang, setLang] = useState<Language>('es');
  const [theme, setTheme] = useState<Theme>('light');
  const [searchQuery, setSearchQuery] = useState('');

  const t = getTranslation(lang);

  // Inicialización y carga de datos
  useEffect(() => {
    const savedUser = localStorage.getItem('minutas_user');
    if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        fetchHistory(u.name);
    }
    
    const savedTheme = localStorage.getItem('minutas_theme') as Theme;
    if (savedTheme) setTheme(savedTheme || 'light');
    const savedLang = localStorage.getItem('minutas_lang') as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  const fetchHistory = async (userName: string) => {
    let localHistory: MeetingRecord[] = [];
    try {
      const savedHistory = localStorage.getItem(`minutas_history_${userName}`);
      if (savedHistory) localHistory = JSON.parse(savedHistory);
    } catch (e) {
      console.error("Error loading local history", e);
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
            .from('meetings')
            .select('*')
            .eq('user_id', userName)
            .order('created_at', { ascending: false });
        
        if (data && !error) {
            setHistory(data as any);
            // Sync local backup
            localStorage.setItem(`minutas_history_${userName}`, JSON.stringify(data));
            return;
        }
      } catch (e) {
        console.error("Supabase fetch failed, using local history", e);
      }
    }
    
    // Fallback to local history
    setHistory(localHistory);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('minutas_theme', theme);
  }, [theme]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('minutas_user', JSON.stringify(u));
    fetchHistory(u.name);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('minutas_user');
  };

  const handleDeleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t.confirmDelete)) {
        if (supabase) {
          try {
            const { error } = await supabase.from('meetings').delete().eq('id', id);
            if (error) console.error("Error deleting from Supabase", error);
          } catch (e) {
            console.error("Supabase delete failed", e);
          }
        }
        
        const newHistory = history.filter(rec => rec.id !== id);
        setHistory(newHistory);
        if (user) {
          localStorage.setItem(`minutas_history_${user.name}`, JSON.stringify(newHistory));
        }

        if (currentRecord?.id === id) {
            setCurrentRecord(null);
            setProcessingStatus(ProcessingStatus.IDLE);
        }
    }
  };

  const handleProcess = async (audioFile: File | null, text: string, imageFile: File | null, targetLang: Language, manualTitle: string) => {
    setProcessingStatus(ProcessingStatus.TRANSCRIBING);
    try {
      let fullText = text;
      if (audioFile) {
        const reader = new FileReader();
        reader.readAsDataURL(audioFile);
        await new Promise<void>((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64 = (reader.result as string).split(',')[1];
              const mimeType = audioFile.type || 'audio/mp3';
              fullText = await transcribeAudio(base64, mimeType, targetLang);
              resolve();
            } catch (e) { reject(e); }
          }
          reader.onerror = reject;
        });
      }
      
      setProcessingStatus(ProcessingStatus.ANALYZING);
      let imageBase64, imageMime;
      if (imageFile) {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          await new Promise<void>((resolve, reject) => {
              reader.onload = () => {
                  imageBase64 = (reader.result as string).split(',')[1];
                  imageMime = imageFile.type;
                  resolve();
              }
              reader.onerror = reject;
          });
      }
      const analysis = await generateMeetingAnalysis(fullText, targetLang, imageBase64, imageMime);
      
      const newRecord: MeetingRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        title: manualTitle,
        transcript: fullText,
        analysis: analysis
      };

      // Guardar en Supabase si está disponible
      if (supabase && user) {
        try {
          const { error } = await supabase.from('meetings').insert([{
              id: newRecord.id,
              title: newRecord.title,
              transcript: newRecord.transcript,
              analysis: newRecord.analysis,
              user_id: user.name,
              date: newRecord.date
          }]);
          if (error) console.error("Error saving to Supabase", error);
        } catch (e) {
          console.error("Supabase insert failed", e);
        }
      }
      
      const updatedHistory = [newRecord, ...history];
      setHistory(updatedHistory);
      if (user) {
        localStorage.setItem(`minutas_history_${user.name}`, JSON.stringify(updatedHistory));
      }

      setCurrentRecord(newRecord);
      setProcessingStatus(ProcessingStatus.COMPLETED);
    } catch (error) {
      setProcessingStatus(ProcessingStatus.ERROR);
      alert(lang === 'es' ? "Error procesando la reunión. Revisa tu API Key." : "Error processing meeting. Check your API Key.");
    }
  };

  if (!user) return <LoginScreen onLogin={handleLogin} lang={lang} />;

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col lg:flex-row transition-colors selection:bg-indigo-100 dark:selection:bg-indigo-900">
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} lang={lang} onLanguageChange={setLang} />
      {currentRecord && <ChatAssistant context={currentRecord.transcript} meetingId={currentRecord.id} lang={lang} />}

      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col no-print">
        <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <Sparkles className="w-6 h-6" />
            </div>
            <div>
                <h1 className="font-black text-xl tracking-tight leading-none text-gray-900 dark:text-white">Minutas IA</h1>
                <p className="text-[10px] font-black uppercase text-indigo-500 mt-1 tracking-widest">Enterprise Cloud</p>
            </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
            {[
                { id: 'create', label: t.newMinuta, icon: <FileText className="w-5 h-5" /> },
                { id: 'live', label: t.liveAssistant, icon: <Mic className="w-5 h-5" /> },
                { id: 'history', label: t.history, icon: <Clock className="w-5 h-5" /> }
            ].map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    {item.icon} <span>{item.label}</span>
                </button>
            ))}
        </nav>

        <div className="p-6 border-t border-gray-50 dark:border-gray-800 space-y-4">
            <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-4 px-6 py-4 text-gray-400 hover:text-indigo-600 font-bold transition-all"><Settings className="w-5 h-5" /><span>{t.settings}</span></button>
            <div className="flex items-center justify-between px-2">
                <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500">{theme === 'light' ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}</button>
                <button onClick={handleLogout} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-500"><LogOut className="w-5 h-5"/></button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto print:p-0">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {activeTab === 'create' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {processingStatus !== ProcessingStatus.COMPLETED && !currentRecord ? (
                <div className="space-y-12">
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">{lang === 'es' ? 'Crear Nuevo Reporte' : 'Create New Report'}</h2>
                        <p className="text-gray-500 font-medium">{lang === 'es' ? 'Transforma tus reuniones en documentos de alto valor estratégico.' : 'Transform your meetings into high-value strategic documents.'}</p>
                    </div>
                    <InputZone onProcess={handleProcess} status={processingStatus} lang={lang} />
                </div>
              ) : (
                <div className="space-y-6">
                    <button onClick={() => { setCurrentRecord(null); setProcessingStatus(ProcessingStatus.IDLE); }} className="no-print flex items-center gap-2 text-indigo-600 font-bold hover:translate-x-[-4px] transition-transform">← {t.startNew}</button>
                    {currentRecord && <AnalysisDashboard data={currentRecord} onUpdate={setCurrentRecord as any} lang={lang} />}
                </div>
              )}
            </div>
          )}

          {activeTab === 'live' && <LiveMeeting lang={lang} />}

          {activeTab === 'history' && (
            <div className="space-y-8">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                   <h2 className="text-3xl font-black">{t.history}</h2>
                   <div className="relative w-full md:w-80">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input type="text" placeholder={lang === 'es' ? "Buscar por título..." : "Search by title..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 dark:text-white" />
                   </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).map(record => (
                      <div key={record.id} onClick={() => { setCurrentRecord(record); setActiveTab('create'); setProcessingStatus(ProcessingStatus.COMPLETED); }} className="group bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-50 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button onClick={(e) => handleDeleteRecord(record.id, e)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                              <FileText className="w-5 h-5" />
                          </div>
                          <h3 className="font-black text-xl mb-2 line-clamp-2 leading-tight text-gray-900 dark:text-white">{record.title}</h3>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{new Date(record.date).toLocaleDateString()}</p>
                          <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${record.analysis.sentiment.type === 'Positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-600'}`}>
                                  {record.analysis.sentiment.type}
                              </span>
                              <div className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                                <Trophy className="w-3 h-3" /> {record.analysis.productivityScore}%
                              </div>
                          </div>
                      </div>
                  ))}
                  {history.length === 0 && <div className="col-span-full py-40 text-center text-gray-400 font-bold italic">{t.noHistory}</div>}
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
}

export default App;
