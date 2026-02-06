
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MeetingAnalysis, Language, ChatMessage } from '../types';

/**
 * Transcribes audio using Gemini 3 Flash.
 * @param audioBase64 Base64 encoded audio string.
 * @param mimeType Mime type of the audio.
 * @param lang Target language.
 */
export const transcribeAudio = async (audioBase64: string, mimeType: string, lang: Language): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: audioBase64
                }
            },
            { text: `Transcribe the audio provided. Provide only the transcription in ${lang}.` }
        ]
    });
    return response.text || "";
};

/**
 * Generates a structured meeting analysis using Gemini 3 Pro with JSON response schema.
 */
export const generateMeetingAnalysis = async (transcript: string, lang: Language, imageBase64?: string, imageMime?: string): Promise<MeetingAnalysis> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [{ text: transcript }];
    if (imageBase64 && imageMime) {
        parts.push({
            inlineData: {
                mimeType: imageMime,
                data: imageBase64
            }
        });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: parts,
        config: {
            systemInstruction: `You are a World-Class Strategy Consultant. Analyze the transcript and provide a professional strategic report. Language: ${lang === 'es' ? 'Español' : 'English'}.`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    executiveSummary: { type: Type.STRING },
                    conclusions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    nextSteps: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                action: { type: Type.STRING },
                                owner: { type: Type.STRING },
                                date: { type: Type.STRING },
                                context: { type: Type.STRING },
                                priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                                effort: { type: Type.NUMBER },
                                impact: { type: Type.NUMBER }
                            },
                            required: ['action', 'owner', 'date', 'context', 'priority', 'effort', 'impact']
                        }
                    },
                    topics: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                duration_estimate: { type: Type.STRING },
                                key_takeaway: { type: Type.STRING }
                            },
                            required: ['title', 'key_takeaway']
                        }
                    },
                    mindMap: {
                        type: Type.OBJECT,
                        properties: {
                            center: { type: Type.STRING },
                            branches: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        label: { type: Type.STRING },
                                        items: { type: Type.ARRAY, items: { type: Type.STRING } }
                                    },
                                    required: ['label', 'items']
                                }
                            }
                        },
                        required: ['center', 'branches']
                    },
                    sentiment: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative', 'Tense'] },
                            score: { type: Type.NUMBER },
                            interpretation: { type: Type.STRING }
                        },
                        required: ['type', 'score', 'interpretation']
                    },
                    productivityScore: { type: Type.NUMBER },
                    alignmentScore: { type: Type.NUMBER },
                    detectedRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    advisors: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                role: { type: Type.STRING },
                                critique: { type: Type.STRING },
                                advice: { type: Type.STRING }
                            },
                            required: ['role', 'critique', 'advice']
                        }
                    }
                },
                required: [
                    'executiveSummary', 'conclusions', 'nextSteps', 'topics', 
                    'mindMap', 'sentiment', 'productivityScore', 'alignmentScore', 
                    'detectedRisks', 'advisors'
                ]
            }
        }
    });

    return JSON.parse(response.text || "{}") as MeetingAnalysis;
};

/**
 * Chat with Gemini 3 Pro, supporting optional Google Search grounding.
 */
export const chatWithAssistant = async (history: ChatMessage[], newMessage: string, context: string, useSearch: boolean, lang: Language) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
            ...history.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            })),
            { role: 'user', parts: [{ text: newMessage }] }
        ],
        config: {
            systemInstruction: `Eres el 'Cerebro Corporativo'. Usa este [CONTEXTO] de la reunión: ${context.substring(0, 20000)}. Responde como un consultor senior. Idioma: ${lang === 'es' ? 'Español' : 'Inglés'}.`,
            tools: useSearch ? [{ googleSearch: {} }] : undefined
        }
    });

    const groundingUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web?.uri)
        .filter(Boolean);

    return { 
        text: response.text || "No response generated.", 
        groundingUrls 
    };
};

/**
 * Connects to Gemini Live API for real-time audio interaction.
 */
export const connectLiveSession = (
    onOpen: () => void,
    onMessage: (message: any) => void,
    onError: (e: any) => void,
    onClose: (e: any) => void,
    lang: Language
) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: `You are the 'Cerebro Corporativo' (Corporate Brain). You are a senior strategy consultant. Respond concisely and professionally. Language: ${lang === 'es' ? 'Español' : 'English'}.`,
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
            },
            outputAudioTranscription: {}
        },
        callbacks: {
            onopen: onOpen,
            onmessage: onMessage,
            onerror: onError,
            onclose: onClose
        }
    });
};
