export enum EmotionalState {
  Calm = 'Calm',
  Confident = 'Confident',
  Relieved = 'Relieved',
  Anxious = 'Anxious',
  Overwhelmed = 'Overwhelmed',
  Other = 'Other'
}

export type DecisionStatus = 'active' | 'stage_completed' | 'completed';

export interface Decision {
  id: string;
  decisionText: string;
  whyText: string;
  emotionalState: EmotionalState | string;
  emotionalStateOther?: string;
  createdAt: number; // timestamp
  
  // Optional fields under Step 2
  context?: string;
  assumptions?: string;
  fear?: string;
  reasoning?: string;
  motivation?: string;

  // Optional fields under Step 3
  outcomeSuccess?: string;
  learningSuccess?: string;

  // Refactored Revisit Logic
  revisitDate: string; // ISO date string (YYYY-MM-DD)
  revisitCondition?: string; // Optional context for the revisit
  
  futureSelfMessage?: string;
  category: string;
  isLocked: boolean;
  isArchived?: boolean; 
  lastEditedAt?: number;
  
  // Lifecycle Status
  status?: DecisionStatus;
}

export interface AppState {
  decisions: Decision[];
  isPremium: boolean;
}