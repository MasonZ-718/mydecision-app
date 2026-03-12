import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Decision, AppState } from '../types';
import { STORAGE_KEY } from '../constants';

interface StoreContextType {
  decisions: Decision[];
  isPremium: boolean;
  addDecision: (decision: Decision) => void;
  updateDecision: (id: string, updates: Partial<Decision>) => void;
  deleteDecision: (id: string) => void;
  unlockPremium: () => void;
  getDecision: (id: string) => Decision | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    return {
      decisions: [],
      isPremium: false
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addDecision = (decision: Decision) => {
    setState(prev => ({
      ...prev,
      decisions: [decision, ...prev.decisions]
    }));
  };

  const updateDecision = (id: string, updates: Partial<Decision>) => {
    setState(prev => ({
      ...prev,
      decisions: prev.decisions.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  };

  const deleteDecision = (id: string) => {
    setState(prev => ({
      ...prev,
      decisions: prev.decisions.filter(d => d.id !== id)
    }));
  };

  const unlockPremium = () => {
    setState(prev => ({ ...prev, isPremium: true }));
  };

  const getDecision = (id: string) => state.decisions.find(d => d.id === id);

  return (
    <StoreContext.Provider value={{
      decisions: state.decisions,
      isPremium: state.isPremium,
      addDecision,
      updateDecision,
      deleteDecision,
      unlockPremium,
      getDecision
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};