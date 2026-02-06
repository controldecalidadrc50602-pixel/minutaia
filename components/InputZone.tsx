
import React, { useState, useEffect } from 'react';
import { Upload, FileAudio, Image as ImageIcon, FileText, Loader2, Globe, Edit3, Sparkles, CheckCircle2 } from 'lucide-react';
import { Language, ProcessingStatus } from '../types';
import { getTranslation } from '../translations';

interface InputZoneProps {
  onProcess: (audioFile: File | null, text: string, imageFile: File | null, targetLang: Language, manualTitle: string) => void;
  status: ProcessingStatus;
  lang: Language;
}

const InputZone: React.FC<InputZoneProps> = ({ onProcess, status, lang }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState<Language>(lang);
  const [progress, setProgress] = useState(0);
  
  const t = getTranslation(lang);
  const isProcessing = status !== ProcessingStatus.IDLE && status !== ProcessingStatus.COMPLETED && status !== ProcessingStatus.ERROR;

  // Simulación suave de progreso basado en el estado real
  useEffect(() => {
    let interval: any;
    if (status === ProcessingStatus.TRANSCRIBING) {
      setProgress(10);
      interval = setInterval(() => {
        setProgress(prev => (prev < 45 ? prev + 1 : prev));
      }, 200);
    } else if (status === ProcessingStatus.ANALYZING) {
      setProgress(50);
      interval = setInterval(() => {
        setProgress(prev => (prev < 95 ? prev + 1 : prev));
      }, 300);
    } else if (status === ProcessingStatus.COMPLETED) {
      setProgress(100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const getStatusMessage = () => {
    switch (status) {
      case ProcessingStatus.TRANSCRIBING:
        return lang === 'es' ? 'Transcribiendo Audio (Whisper V3)...' : 'Transcribing Audio (Whisper V3)...';
      case ProcessingStatus.ANALYZING:
        return lang === 'es' ? 'Cerebro Corporativo Analizando...' : 'Corporate Brain Analyzing...';
      case ProcessingStatus.COMPLETED:
        return lang === 'es' ? '¡Minuta Lista!' : 'Minutes Ready!';
      default:
        return t.processing;
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
        alert(lang === 'es' ? 'Por favor ingresa un título para la minuta' : 'Please enter a title for the minutes');
        return;
    }
    onProcess(audioFile, text, imageFile, targetLang, title.trim());
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-gray-100 dark:border-gray-700 p-8 md:p-12 transition-all relative overflow-hidden">
      
      {/* Overlay de Progreso */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-12 animate-fade-in">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="relative inline-block">
                <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 animate-bounce">
                    {status === ProcessingStatus.TRANSCRIBING ? <FileAudio className="w-10 h-10" /> : <Sparkles className="w-10 h-10" />}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                </div>
            </div>
            
            <div className="space-y-3">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">{getStatusMessage()}</h3>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Paso {status === ProcessingStatus.TRANSCRIBING ? '1 de 2' : '2 de 2'}</p>
            </div>

            {/* Barra de Progreso Estilizada */}
            <div className="space-y-2">
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 transition-all duration-500 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <span>Iniciando</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{progress}%</span>
                    <span>Finalizando</span>
                </div>
            </div>

            <div className="flex justify-center gap-8 pt-4">
                <div className={`flex flex-col items-center gap-2 ${status === ProcessingStatus.TRANSCRIBING ? 'text-indigo-600' : 'text-emerald-500'}`}>
                    <div className={`w-3 h-3 rounded-full ${status === ProcessingStatus.TRANSCRIBING ? 'bg-indigo-600 animate-pulse' : 'bg-emerald-500'}`}></div>
                    <span className="text-[9px] font-black uppercase">Transcripción</span>
                </div>
                <div className={`flex flex-col items-center gap-2 ${status === ProcessingStatus.ANALYZING ? 'text-indigo-600' : 'text-gray-300'}`}>
                    <div className={`w-3 h-3 rounded-full ${status === ProcessingStatus.ANALYZING ? 'bg-indigo-600 animate-pulse' : (status === ProcessingStatus.TRANSCRIBING ? 'bg-gray-200' : 'bg-emerald-500')}`}></div>
                    <span className="text-[9px] font-black uppercase">Análisis</span>
                </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-10">
        {/* Step 1: Manual Title */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Edit3 className="w-4 h-4" />
                </div>
                <label className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    {t.meetingTitleLabel}
                </label>
            </div>
            <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.meetingTitlePlaceholder}
                className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none transition-all text-gray-900 dark:text-white font-bold text-xl placeholder-gray-300 dark:placeholder-gray-600"
            />
        </div>

        {/* Step 2: Content Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <label className={`relative group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${audioFile ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50/30'}`}>
                {audioFile ? (
                    <div className="text-center animate-in fade-in zoom-in">
                        <FileAudio className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 max-w-[180px] truncate">{audioFile.name}</p>
                    </div>
                ) : (
                    <div className="text-center group-hover:scale-105 transition-transform">
                        <Upload className="w-12 h-12 text-gray-300 mb-3 group-hover:text-indigo-500" />
                        <p className="text-sm font-bold text-gray-500">{t.uploadAudio}</p>
                    </div>
                )}
                <input type="file" className="hidden" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
            </label>

            <label className={`relative group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${imageFile ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50/30'}`}>
                {imageFile ? (
                    <div className="text-center animate-in fade-in zoom-in">
                        <ImageIcon className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
                        <p className="text-sm font-black text-indigo-700 dark:text-indigo-400 max-w-[180px] truncate">{imageFile.name}</p>
                    </div>
                ) : (
                    <div className="text-center group-hover:scale-105 transition-transform">
                        <ImageIcon className="w-12 h-12 text-gray-300 mb-3 group-hover:text-indigo-500" />
                        <p className="text-sm font-bold text-gray-500">{t.addImage}</p>
                    </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </label>
        </div>

        <div className="relative">
            <textarea
                className="w-full p-8 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none transition-all text-gray-700 dark:text-gray-200 font-medium text-lg min-h-[150px] resize-none"
                placeholder={t.pastePlaceholder}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <FileText className="absolute top-8 right-8 w-6 h-6 text-gray-200 dark:text-gray-700" />
        </div>

        {/* Footer & CTA */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6">
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 px-6 py-3 rounded-2xl">
                <Globe className="w-5 h-5 text-indigo-500" />
                <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.outputLanguage}</p>
                    <select 
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value as Language)}
                        className="bg-transparent font-bold text-sm outline-none cursor-pointer"
                    >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isProcessing || (!audioFile && !text && !imageFile)}
                className={`w-full md:w-auto px-16 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3
                    ${isProcessing || (!audioFile && !text && !imageFile) 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'}`}
            >
                <Sparkles className="w-5 h-5" />
                <span>{t.generateButton}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default InputZone;
