// Custom Theme Definitions
export const themes = {
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#0891b2',
      background: '#f0f9ff',
      darkBg: '#082f49',
      surface: '#ffffff',
      darkSurface: '#0c4a6e',
      text: '#0c2340',
      darkText: '#f0f9ff',
      success: '#06b6d4',
      warning: '#f59e0b',
      error: '#ef4444',
      gradientStart: '#0ea5e9',
      gradientEnd: '#06b6d4'
    }
  },
  forest: {
    name: 'Forest',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#047857',
      background: '#f0fdf4',
      darkBg: '#064e3b',
      surface: '#ffffff',
      darkSurface: '#065f46',
      text: '#064e3b',
      darkText: '#f0fdf4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      gradientStart: '#10b981',
      gradientEnd: '#059669'
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#c2410c',
      background: '#fff7ed',
      darkBg: '#5a2e0c',
      surface: '#ffffff',
      darkSurface: '#7c2d12',
      text: '#5a2e0c',
      darkText: '#fff7ed',
      success: '#16a34a',
      warning: '#f59e0b',
      error: '#ef4444',
      gradientStart: '#f97316',
      gradientEnd: '#ea580c'
    }
  },
  midnight: {
    name: 'Midnight',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#6d28d9',
      background: '#f3f0ff',
      darkBg: '#2e1065',
      surface: '#ffffff',
      darkSurface: '#4c1d95',
      text: '#2e1065',
      darkText: '#f3f0ff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      gradientStart: '#8b5cf6',
      gradientEnd: '#7c3aed'
    }
  },
  rose: {
    name: 'Rose',
    colors: {
      primary: '#f43f5e',
      secondary: '#e11d48',
      accent: '#be123c',
      background: '#ffe4e6',
      darkBg: '#500724',
      surface: '#ffffff',
      darkSurface: '#831843',
      text: '#500724',
      darkText: '#ffe4e6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      gradientStart: '#f43f5e',
      gradientEnd: '#e11d48'
    }
  },
  lime: {
    name: 'Lime',
    colors: {
      primary: '#84cc16',
      secondary: '#65a30d',
      accent: '#4f46e5',
      background: '#f7fee7',
      darkBg: '#365314',
      surface: '#ffffff',
      darkSurface: '#3f6212',
      text: '#365314',
      darkText: '#f7fee7',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      gradientStart: '#84cc16',
      gradientEnd: '#65a30d'
    }
  }
};

export const defaultTheme = 'ocean';

export const getThemeColors = (themeName, isDark = false) => {
  const theme = themes[themeName] || themes[defaultTheme];
  return isDark ? {
    bg: theme.colors.darkBg,
    surface: theme.colors.darkSurface,
    text: theme.colors.darkText,
    ...theme.colors
  } : {
    bg: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors.text,
    ...theme.colors
  };
};
