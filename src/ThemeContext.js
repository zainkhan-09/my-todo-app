import { createContext, useContext, useState, useEffect } from 'react';
import { themes, defaultTheme, getThemeColors } from './themes';
import './App.css';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const savedTheme = localStorage.getItem('customTheme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setIsDark(saved ? saved === 'dark' : systemDark);
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('customTheme', themeName);
      applyThemeToDOM(themeName, isDark);
    }
  };

  const applyThemeToDOM = (themeName, dark) => {
    const colors = getThemeColors(themeName, dark);
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyThemeToDOM(currentTheme, isDark);
  }, [currentTheme, isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, currentTheme, setTheme, availableThemes: Object.keys(themes) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
