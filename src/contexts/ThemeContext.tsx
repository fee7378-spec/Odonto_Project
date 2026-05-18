import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = 'sky' | 'indigo' | 'emerald' | 'rose';

interface ThemeContextType {
  primaryColor: ThemeColor;
  setPrimaryColor: (color: ThemeColor) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState<ThemeColor>(() => {
    return (localStorage.getItem('theme-color') as ThemeColor) || 'sky';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme-dark') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('theme-color', primaryColor);
    // Update CSS variable or apply class
    const root = document.documentElement;
    const colors = {
      sky: '#0284c7',
      indigo: '#4f46e5',
      emerald: '#059669',
      rose: '#e11d48'
    };
    root.style.setProperty('--primary-color', colors[primaryColor]);
    
    // Also update a general primary class if needed, but CSS variables are better
    root.classList.remove('theme-sky', 'theme-indigo', 'theme-emerald', 'theme-rose');
    root.classList.add(`theme-${primaryColor}`);
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem('theme-dark', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
