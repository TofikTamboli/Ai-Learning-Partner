import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AISettings } from '@/types';
import { STORAGE_KEYS } from '@/constants';

interface AISettingsContextType {
  settings: AISettings;
  updateSettings: (settings: AISettings) => void;
  isLoading: boolean;
}

const defaultSettings: AISettings = {
  primaryProvider: 'gemini',
};

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

export function AISettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        console.error('Failed to parse stored settings');
      }
    }
    setIsLoading(false);
  }, []);

  const updateSettings = (newSettings: AISettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(newSettings));
  };

  return (
    <AISettingsContext.Provider
      value={{ settings: JSON.parse(JSON.stringify(settings)), updateSettings, isLoading }}
    >
      {children}
    </AISettingsContext.Provider>
  );
}

export function useAISettings(): AISettingsContextType {
  const context = useContext(AISettingsContext);
  if (!context) {
    throw new Error('useAISettings must be used within an AISettingsProvider');
  }
  return context;
}
