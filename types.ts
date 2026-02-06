
export enum ProcessingStatus {
  IDLE = 'IDLE',
  TRANSCRIBING = 'TRANSCRIBING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum SentimentType {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative',
  TENSE = 'Tense'
}

export interface NextStep {
  action: string;
  owner: string;
  date: string;
  context: string;
  priority: 'High' | 'Medium' | 'Low';
  effort: number; // 1-5
  impact: number; // 1-5
}

export interface AdvisorFeedback {
  role: string;
  critique: string;
  advice: string;
}

export interface MeetingAnalysis {
  executiveSummary: string;
  conclusions: string[];
  nextSteps: NextStep[];
  topics: { title: string; duration_estimate?: string; key_takeaway: string }[];
  mindMap: {
    center: string;
    branches: { label: string; items: string[] }[];
  };
  sentiment: {
    type: SentimentType;
    score: number;
    interpretation: string;
  };
  productivityScore: number;
  advisors: AdvisorFeedback[];
  detectedRisks: string[];
  alignmentScore: number; // 0-100: ¿Qué tan de acuerdo estaban todos?
}

export interface MeetingRecord {
  id: string;
  date: string;
  title: string;
  transcript: string;
  analysis: MeetingAnalysis;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  groundingUrls?: string[]; // Added to fix the error in ChatAssistant
}

export type Language = 'en' | 'es';
export type Theme = 'light' | 'dark';

export interface User {
  name: string;
  email?: string;
  company?: string;
}
