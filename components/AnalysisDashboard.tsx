
import React, { useState } from 'react';
import { MeetingRecord, SentimentType, Language } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip } from 'recharts';
import { 
    FileDown, Bolt, BarChart2, Zap, ListTodo, Map as MapIcon, 
    ChevronRight, Calendar, ShieldCheck, Share2, Eye,
    Target, AlertTriangle, Users, TrendingUp, Sparkles,
    Lightbulb, ShieldAlert, Award, FileText, CheckCircle2,
    Briefcase, Activity, ClipboardList
} from 'lucide-react';
import { getTranslation } from '../translations';

interface AnalysisDashboardProps {
  data: MeetingRecord;
  onUpdate: (record: MeetingRecord) => void;
  lang: Language;
}

const COLORS = {
  [SentimentType.POSITIVE]: '#10B981',
  [SentimentType.NEUTRAL]: '#6B7280',
  [SentimentType.NEGATIVE]: '#EF4444',
  [SentimentType.TENSE]: '#F59E0B'
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, onUpdate, lang }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'advisors' | 'preview'>('analysis');
  const t = getTranslation(lang);
  
  const handlePrint = () => {
    setActiveTab('preview');
    setTimeout(() => window.print(), 500);
  };

  const taskMatrixData = data.analysis.nextSteps.map(step => ({
    x: step.effort,
    y: step.impact,
    name: step.action,
    owner: step.owner
  }));

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Header Premium (No Print) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 bg-indigo-600/10 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-200 uppercase tracking-widest">IA Strategic Suite</div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{data.title}</h2>
          </div>
          <div className="flex items-center gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500"/> {new Date(data.date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-500"/> {data.analysis.alignmentScore}% Alineación</span>
          </div>
        </div>
        
        <div className="flex gap-3">
           <button onClick={handlePrint} className="flex items-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95">
             <FileDown className="w-4 h-4 mr-2" /> {t.exportPdf}
           </button>
        </div>
      </div>

      {/* Tabs (No Print) */}
      <div className="flex p-1.5 bg-gray-100 dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl w-fit no-print">
         {[
           { id: 'analysis', label: 'Dashboard Ejecutivo', icon: Target },
           { id: 'advisors', label: 'Auditoría IA', icon: Sparkles },
           { id: 'preview', label: 'Vista de Impresión', icon: FileText }
         ].map(tab => (
           <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-gray-700 shadow-xl text-indigo-600 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
           </button>
         ))}
      </div>

      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print animate-fade-in">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-indigo-500/5">
                <h3 className="text-sm font-black text-indigo-600 mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Resumen Estratégico
                </h3>
                <p className="text-2xl font-medium text-gray-800 dark:text-gray-100 leading-snug italic mb-10 border-l-8 border-indigo-600 pl-8 py-2">
                  "{data.analysis.executiveSummary}"
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100/50 dark:border-gray-800 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Productividad</p>
                        <p className="text-3xl font-black text-indigo-600">{data.analysis.productivityScore}%</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100/50 dark:border-gray-800 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Alineación</p>
                        <p className="text-3xl font-black text-emerald-500">{data.analysis.alignmentScore}%</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100/50 dark:border-gray-800 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Decisiones</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{data.analysis.conclusions.length}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100/50 dark:border-gray-800 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Impacto</p>
                        <p className="text-3xl font-black text-indigo-600">A+</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-indigo-500/5">
                <h3 className="text-sm font-black text-indigo-600 mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Acciones de Próxima Fase
                </h3>
                <div className="space-y-4">
                  {data.analysis.nextSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-6 p-5 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-transparent hover:border-indigo-500/30 transition-all group">
                      <div className={`w-3 h-3 rounded-full ${step.priority === 'High' ? 'bg-red-500' : 'bg-indigo-500'}`} />
                      <div className="flex-1">
                        <p className="font-black text-gray-900 dark:text-white text-sm">{step.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{step.owner} • {step.date}</p>
                      </div>
                      <div className="flex gap-2">
                         <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-[10px] font-black uppercase tracking-tighter text-indigo-600 border border-gray-100">Impacto {step.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <h3 className="text-xs font-black mb-8 uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Mitigación de Riesgos
                </h3>
                <div className="space-y-4">
                  {data.analysis.detectedRisks.map((risk, i) => (
                    <p key={i} className="text-sm font-bold leading-tight flex items-start gap-2">
                      <span className="text-indigo-300">•</span> {risk}
                    </p>
                  ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-indigo-500/5">
                <h3 className="text-xs font-black text-gray-400 mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Acuerdos & Consenso
                </h3>
                <div className="space-y-6">
                  {data.analysis.conclusions.map((conc, i) => (
                    <div key={i} className="flex gap-4 items-start">
                        <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 className="w-3 h-3"/></div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{conc}</p>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'advisors' && (
        <div className="animate-fade-in space-y-10 no-print">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {data.analysis.advisors.map((adv, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-indigo-500/5">
                   <h4 className="text-xs font-black text-indigo-600 mb-6 uppercase tracking-[0.3em]">{adv.role}</h4>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Feedback Crítico</p>
                        <p className="text-lg font-bold text-gray-800 dark:text-white leading-tight">"{adv.critique}"</p>
                      </div>
                      <div className="p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                        <p className="text-sm font-black text-indigo-700 dark:text-indigo-300 italic">"{adv.advice}"</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
        </div>
      )}

      {/* DOCUMENTO PROFESIONAL (ESTILO IMAGEN SOLICITADA) */}
      {activeTab === 'preview' && (
        <div className="animate-fade-in py-10">
          <div className="document-page shadow-2xl mx-auto">
              {/* Header de Documento */}
              <div className="flex justify-between items-end mb-20 border-b-4 border-black pb-8">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">Corporate Strategic Intelligence</p>
                    <h1 className="text-5xl font-black uppercase tracking-tighter leading-none">{data.title}</h1>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest">{new Date(data.date).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Report ID: {data.id.substring(0,10)}</p>
                </div>
              </div>
              
              <div className="space-y-16">
                {/* 01. Resumen Estratégico */}
                <section>
                    <h2 className="text-xl font-black uppercase mb-6 border-b-4 border-black pb-2">01. RESUMEN ESTRATÉGICO</h2>
                    <p className="text-2xl leading-snug font-medium italic text-gray-900">"{data.analysis.executiveSummary}"</p>
                </section>
                
                {/* 02. KPIs de Sesión (Estilo de la imagen) */}
                <section>
                    <h2 className="text-xl font-black uppercase mb-8 border-b-4 border-black pb-2">02. KPI'S DE LA SESIÓN</h2>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="p-8 border-2 border-black text-center flex flex-col justify-center">
                            <p className="text-[10px] font-black uppercase mb-3 tracking-widest">PRODUCTIVIDAD</p>
                            <p className="text-5xl font-black">{data.analysis.productivityScore}%</p>
                        </div>
                        <div className="p-8 border-2 border-black text-center flex flex-col justify-center">
                            <p className="text-[10px] font-black uppercase mb-3 tracking-widest">ALINEACIÓN</p>
                            <p className="text-5xl font-black">{data.analysis.alignmentScore}%</p>
                        </div>
                        <div className="p-8 border-2 border-black text-center flex flex-col justify-center">
                            <p className="text-[10px] font-black uppercase mb-3 tracking-widest">SENTIMIENTO</p>
                            <p className="text-4xl font-black uppercase">{data.analysis.sentiment.type}</p>
                        </div>
                    </div>
                </section>

                {/* 03. Puntos Clave & Acuerdos */}
                <section>
                    <h2 className="text-xl font-black uppercase mb-8 border-b-4 border-black pb-2">03. ACUERDOS Y PUNTOS CLAVE</h2>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                        {data.analysis.conclusions.map((conc, i) => (
                            <div key={i} className="flex gap-4">
                                <span className="font-black text-xl">/</span>
                                <p className="text-sm font-bold uppercase leading-tight">{conc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 04. Matriz de Ejecución (Estilo tabla de la imagen) */}
                <section>
                    <h2 className="text-xl font-black uppercase mb-8 border-b-4 border-black pb-2">04. MATRIZ DE EJECUCIÓN & PRIORIDADES</h2>
                    <table className="w-full border-4 border-black">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-6 border-2 border-black text-[10px] uppercase font-black tracking-widest text-left">ACCIÓN</th>
                                <th className="p-6 border-2 border-black text-[10px] uppercase font-black tracking-widest text-center">OWNER</th>
                                <th className="p-6 border-2 border-black text-[10px] uppercase font-black tracking-widest text-center">PRIORIDAD</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.analysis.nextSteps.map((step, i) => (
                                <tr key={i}>
                                    <td className="p-6 border-2 border-black font-black text-sm uppercase leading-tight">{step.action}</td>
                                    <td className="p-6 border-2 border-black text-center font-bold text-xs uppercase">{step.owner}</td>
                                    <td className="p-6 border-2 border-black text-center font-black text-xs uppercase">
                                        <span className={step.priority === 'High' ? 'underline' : ''}>{step.priority}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* 05. Análisis de Evaluación Crítica */}
                <section className="pt-10">
                    <h2 className="text-xl font-black uppercase mb-8 border-b-4 border-black pb-2">05. ANÁLISIS DE EVALUACIÓN</h2>
                    <div className="space-y-8">
                        {data.analysis.advisors.map((adv, i) => (
                            <div key={i} className="flex gap-10 items-start">
                                <div className="w-32 flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-gray-400">PERSPECTIVA {adv.role}</div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold leading-relaxed mb-2 uppercase">{adv.critique}</p>
                                    <p className="text-xs font-medium italic text-gray-500">Acción sugerida: {adv.advice}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
              </div>
              
              <div className="mt-32 pt-10 border-t border-black/10 text-[8px] text-gray-400 text-center font-bold uppercase tracking-[0.5em]">Este informe estratégico ha sido generado automáticamente mediante el motor de inteligencia de la organización. Confidencialidad Nivel A.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDashboard;
