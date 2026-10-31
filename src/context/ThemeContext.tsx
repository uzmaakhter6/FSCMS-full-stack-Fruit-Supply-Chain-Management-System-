import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('fscms_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      // fallback
    }
    return 'dark'; // default to dark theme as requested
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('fscms_theme', newTheme);
    } catch (e) {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light', 'theme-light');
      document.body.classList.remove('bg-stone-950', 'text-stone-100');
      document.body.classList.add('bg-stone-100', 'text-stone-900');
    } else {
      root.classList.remove('light', 'theme-light');
      root.classList.add('dark');
      document.body.classList.remove('bg-stone-100', 'text-stone-900');
      document.body.classList.add('bg-stone-950', 'text-stone-100');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
