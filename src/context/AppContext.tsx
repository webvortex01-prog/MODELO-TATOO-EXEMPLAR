import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, loadState, saveState } from '../store';

const AppContext = createContext<{
  state: AppState;
  updateState: React.Dispatch<React.SetStateAction<AppState>>;
} | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  return <AppContext.Provider value={{ state, updateState: setState }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('Missing AppProvider');
  return ctx;
};
