
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Radio, StopCircle, Volume2, Loader2 } from 'lucide-react';
import { connectLiveSession } from '../services/geminiService';
import { Language } from '../types';
import { getTranslation } from '../translations';
import { LiveServerMessage } from '@google/genai';

// Native PCM encoding helper
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Native PCM decoding helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface LiveMeetingProps {
  lang: Language;
}

const LiveMeeting: React.FC<LiveMeetingProps> = ({ lang }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [volume, setVolume] = useState(0);
  const [lastResponse, setLastResponse] = useState('');
  const [transcription, setTranscription] = useState('');
  const t = getTranslation(lang);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setStatus('connecting');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        const sessionPromise = connectLiveSession(
            () => {
                setStatus('connected');
                setIsActive(true);
                
                // Start streaming from mic
                const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                
                scriptProcessor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    
                    // Simple volume visualizer
                    let sum = 0;
                    for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                    setVolume(Math.sqrt(sum / inputData.length) * 100);

                    const int16 = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                    
                    const pcmData = encode(new Uint8Array(int16.buffer));
                    
                    sessionPromise.then(session => {
                        session.sendRealtimeInput({
                            media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' }
                        });
                    });
                };

                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContextRef.current!.destination);
            },
            async (message: LiveServerMessage) => {
                // Handle audio output
                const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData && outputAudioContextRef.current) {
                    const ctx = outputAudioContextRef.current;
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                    
                    const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(ctx.destination);
                    
                    source.addEventListener('ended', () => activeSourcesRef.current.delete(source));
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    activeSourcesRef.current.add(source);
                }

                // Handle transcription
                if (message.serverContent?.outputTranscription) {
                    setTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
                }

                if (message.serverContent?.turnComplete) {
                    setLastResponse(curr => transcription || curr);
                    setTranscription('');
                }

                // Handle interruption
                if (message.serverContent?.interrupted) {
                    activeSourcesRef.current.forEach(s => s.stop());
                    activeSourcesRef.current.clear();
                    nextStartTimeRef.current = 0;
                }
            },
            (err) => {
                console.error("Live session error", err);
                stopSession();
            },
            () => stopSession(),
            lang
        );

        sessionRef.current = await sessionPromise;

    } catch (err) {
        console.error("Failed to start session", err);
        setStatus('disconnected');
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('disconnected');
    if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
    }
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    activeSourcesRef.current.forEach(s => s.stop());
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setTranscription('');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-950 via-gray-900 to-black rounded-3xl text-white relative overflow-hidden shadow-2xl min-h-[500px]">
      
      {isActive && (
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-96 h-96 bg-indigo-500 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
         </div>
      )}

      <div className="z-10 flex flex-col items-center space-y-8 w-full max-w-lg">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 justify-center">
                <Radio className={`w-6 h-6 ${isActive ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
                {t.liveAssistant}
            </h2>
            <p className="text-indigo-400 font-bold uppercase text-[10px] tracking-[0.3em]">Engine: Gemini 2.5 Real-time</p>
        </div>

        <div className="relative flex items-center justify-center">
            <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-all duration-500
                ${status === 'connected' ? 'border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.3)]' : 
                  status === 'connecting' ? 'border-amber-400 animate-spin' : 'border-gray-800'}
            `}>
                <div className="w-32 h-32 rounded-full bg-indigo-600/10 flex items-center justify-center overflow-hidden">
                    {isActive ? (
                        <div className="flex items-end gap-1 h-12">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="w-1.5 bg-indigo-500 rounded-full" style={{ height: `${20 + (volume * Math.random() * 0.8)}%` }}></div>
                            ))}
                        </div>
                    ) : status === 'connecting' ? (
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    ) : (
                        <MicOff className="w-12 h-12 text-gray-700" />
                    )}
                </div>
            </div>
        </div>

        {(lastResponse || transcription) && (
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl w-full animate-fade-in backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2 text-indigo-400">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Live Response</span>
                </div>
                <p className="text-sm font-medium text-gray-300 italic">"{transcription || lastResponse}"</p>
            </div>
        )}

        <button
            onClick={isActive ? stopSession : startSession}
            disabled={status === 'connecting'}
            className={`px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 disabled:opacity-50
                ${isActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20' 
                    : 'bg-white text-indigo-950 hover:bg-gray-100 shadow-xl shadow-white/5'}`}
        >
            {isActive ? <><StopCircle className="w-5 h-5"/> {t.endSession}</> : <><Mic className="w-5 h-5"/> {t.startConversation}</>}
        </button>
      </div>
    </div>
  );
};

export default LiveMeeting;
