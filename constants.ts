import { EmotionalState } from './types';

export const EMOTIONAL_STATES = [
  { value: EmotionalState.Calm, label: 'Calm' },
  { value: EmotionalState.Confident, label: 'Confident' },
  { value: EmotionalState.Relieved, label: 'Relieved' },
  { value: EmotionalState.Anxious, label: 'Anxious' },
  { value: EmotionalState.Overwhelmed, label: 'Overwhelmed' },
  { value: EmotionalState.Other, label: 'Other' },
];

export const MAX_FREE_DECISIONS = 3;
export const STORAGE_KEY = 'mydecision-v1-data';

export const DEFAULT_CATEGORIES = [
  'Career',
  'Family',
  'Habit',
  'Dream',
  'Health',
  'Money'
];

// Returns a tailwind color class for the background blob based on category
export const getCategoryTheme = (category: string) => {
  const normalized = category.toLowerCase().trim();
  switch (normalized) {
    case 'career': return 'bg-blue-600';
    case 'family': return 'bg-amber-600';
    case 'habit': return 'bg-emerald-600';
    case 'dream': return 'bg-purple-600';
    case 'health': return 'bg-rose-600';
    case 'money':
    case 'finance': return 'bg-yellow-600';
    default: return 'bg-zinc-500'; // Fallback for custom tags
  }
};