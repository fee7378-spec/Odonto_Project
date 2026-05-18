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
    return (localStorage.getItem('theme-color') as ThemeColor) || 'indigo';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme-dark') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('theme-color', primaryColor);
    // Update CSS variable or apply class
    const root = document.documentElement;
    const colors = {
      sky: '#0ea5e9',
      indigo: '#6366f1',
      emerald: '#10b981',
      rose: '#f43f5e'
    };
    root.style.setProperty('--color-primary', colors[primaryColor]);
    root.style.setProperty('--color-primary-hover', colors[primaryColor]); // simplified for now
    
    // Calculate a light version for the variable
    const hexToRgba = (hex: string, opacity: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };
    root.style.setProperty('--color-primary-light', hexToRgba(colors[primaryColor], 0.1));
    
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
