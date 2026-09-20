import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'pearl',
    name: 'Pure Crystal Glass',
    subtitle: 'Luminous Frost White & Diamond Slate',
    primary: '#0f172a',
    primaryHover: '#1e293b',
    secondary: '#475569',
    accent: '#64748b',
    glow: 'rgba(15, 23, 42, 0.12)',
    bgMain: '#f8fafc',
    bgCard: 'rgba(255, 255, 255, 0.82)',
    dotColor: '#0f172a',
    previewGradient: 'from-slate-100 via-white to-slate-300',
  },
  {
    id: 'emerald',
    name: 'Emerald Breeze Glass',
    subtitle: 'Mint Frost & Fresh Revenue Growth',
    primary: '#059669',
    primaryHover: '#047857',
    secondary: '#10b981',
    accent: '#34d399',
    glow: 'rgba(16, 185, 129, 0.22)',
    bgMain: '#f8fafc',
    bgCard: 'rgba(255, 255, 255, 0.85)',
    dotColor: '#10b981',
    previewGradient: 'from-emerald-100 via-emerald-300 to-teal-500',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Sky Glass',
    subtitle: 'Crisp Azure & Daylight Air',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    secondary: '#0284c7',
    accent: '#38bdf8',
    glow: 'rgba(37, 99, 235, 0.2)',
    bgMain: '#f8fafc',
    bgCard: 'rgba(255, 255, 255, 0.85)',
    dotColor: '#2563eb',
    previewGradient: 'from-blue-100 via-sky-300 to-blue-500',
  },
  {
    id: 'amber',
    name: 'Sunset Amber Glass',
    subtitle: 'Warm Radiant Honey & Golden Glow',
    primary: '#d97706',
    primaryHover: '#b45309',
    secondary: '#f59e0b',
    accent: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.22)',
    bgMain: '#f8fafc',
    bgCard: 'rgba(255, 255, 255, 0.85)',
    dotColor: '#f59e0b',
    previewGradient: 'from-amber-100 via-amber-300 to-orange-400',
  },
  {
    id: 'rose',
    name: 'Rose Crystal Glass',
    subtitle: 'Luminous Quartz & Magenta Light',
    primary: '#e11d48',
    primaryHover: '#be123c',
    secondary: '#f43f5e',
    accent: '#fb7185',
    glow: 'rgba(225, 29, 72, 0.2)',
    bgMain: '#f8fafc',
    bgCard: 'rgba(255, 255, 255, 0.85)',
    dotColor: '#e11d48',
    previewGradient: 'from-rose-100 via-pink-300 to-rose-400',
  },
  {
    id: 'forest',
    name: 'Forest Jade Glass',
    subtitle: 'Deep Jade & Translucent Alpine',
    primary: '#047857',
    primaryHover: '#065f46',
    secondary: '#059669',
    accent: '#10b981',
    glow: 'rgba(4, 120, 87, 0.22)',
    bgMain: '#f8fafc',
    bgCard: 'rgba(255, 255, 255, 0.85)',
    dotColor: '#047857',
    previewGradient: 'from-emerald-100 via-emerald-400 to-green-600',
  },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    const saved = localStorage.getItem('recoverai_theme');
    if (!saved || saved === 'razorpay' || saved === 'indigo' || saved === 'cyan' || saved === 'titanium') {
      return 'pearl';
    }
    return saved;
  });

  const activeTheme = THEMES.find((t) => t.id === currentThemeId) || THEMES[0];

  useEffect(() => {
    localStorage.setItem('recoverai_theme', currentThemeId);
    
    // Apply CSS variables to root
    const root = document.documentElement;
    root.style.setProperty('--color-primary', activeTheme.primary);
    root.style.setProperty('--color-primary-hover', activeTheme.primaryHover);
    root.style.setProperty('--color-secondary', activeTheme.secondary);
    root.style.setProperty('--color-accent', activeTheme.accent);
    root.style.setProperty('--color-glow', activeTheme.glow);
    root.style.setProperty('--color-bg-main', activeTheme.bgMain);
    root.style.setProperty('--color-bg-card', activeTheme.bgCard);

    // Apply class on body/root
    THEMES.forEach((t) => root.classList.remove(`theme-${t.id}`));
    root.classList.remove('theme-razorpay', 'theme-indigo', 'theme-cyan', 'theme-titanium');
    root.classList.add(`theme-${currentThemeId}`);
  }, [currentThemeId, activeTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        currentThemeId,
        setTheme: setCurrentThemeId,
        availableThemes: THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
